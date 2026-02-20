import mongoose from 'mongoose';
import crypto from 'crypto';
import * as walletRepo from '../repositories/walletRepository.js';
import * as txRepo from '../repositories/transactionRepository.js';
import AppError from '../utils/AppError.js';

/**
 * WalletService
 * All business logic for wallet operations.
 * Database operations are delegated to walletRepository / transactionRepository.
 */

// ─── Wallet ──────────────────────────────────────────────────────────────────

/**
 * Return the user's wallet, auto-creating it if this is their first access.
 */
export const getOrCreateWallet = async (userId) => {
  let wallet = await walletRepo.findByUser(userId);
  if (!wallet) wallet = await walletRepo.create({ userId });
  return wallet;
};

// ─── Transaction History ──────────────────────────────────────────────────────

/**
 * Fetch the transaction history for a user with optional filters.
 * Supported query keys: type, status, startDate, endDate.
 */
export const getTransactionHistory = async (userId, { type, status, startDate, endDate } = {}) => {
  const filter = {};

  if (type)   filter.type   = type;
  if (status) filter.status = status;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate)   filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
  }

  return txRepo.findByUser(userId, filter);
};

// ─── Deposit ──────────────────────────────────────────────────────────────────

/**
 * Build the PayHere payment parameters and record a Pending transaction.
 * Returns the payload the frontend needs to open the PayHere popup.
 */
export const initiateDeposit = async (userId, user, amount) => {
  const merchantId     = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_SECRET;
  const currency       = process.env.PAYHERE_CURRENCY || 'LKR';

  if (!merchantId || !merchantSecret) {
    throw new AppError('Payment gateway not configured', 500);
  }

  const amt = parseFloat(amount);
  if (Number.isNaN(amt) || amt <= 0) {
    throw new AppError('Invalid amount', 400);
  }

  const orderId         = `ORDER_${Date.now()}`;
  const hashedSecret    = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const amountFormatted = amt.toFixed(2);
  const hash = crypto
    .createHash('md5')
    .update(merchantId + orderId + amountFormatted + currency + hashedSecret)
    .digest('hex')
    .toUpperCase();

  // Ensure wallet exists before creating the pending transaction
  const wallet = await getOrCreateWallet(userId);

  await txRepo.create({
    walletId:    wallet._id,
    userId,
    type:        'Deposit',
    amount:      amt,
    currency,
    paymentId:   orderId,
    status:      'Pending',
    description: 'Top-up via PayHere',
  });

  return {
    merchant_id: merchantId,
    return_url:  `${process.env.FRONTEND_URL || ''}/wallet`,
    cancel_url:  `${process.env.FRONTEND_URL || ''}/wallet`,
    notify_url:  `${process.env.BACKEND_URL || ''}/api/v1/wallets/notify`,
    order_id:    orderId,
    items:       'Wallet Top-up',
    currency,
    amount:      amountFormatted,
    hash,
    first_name:  user.name  || '',
    email:       user.email || '',
  };
};

// ─── PayHere Webhook ──────────────────────────────────────────────────────────

/**
 * Verify the PayHere server-to-server notification and, on success,
 * atomically update the transaction status and wallet balance.
 * Throws AppError on any failure so the controller can respond accordingly.
 */
export const processPayhereNotify = async ({
  merchant_id,
  order_id,
  payhere_amount,
  payhere_currency,
  status_code,
  md5sig,
}) => {
  const merchantSecret = process.env.PAYHERE_SECRET;
  const hashedSecret   = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

  const localMd5sig = crypto
    .createHash('md5')
    .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
    .digest('hex')
    .toUpperCase();

  if (localMd5sig !== (md5sig || '').toUpperCase()) {
    throw new AppError('Invalid Signature', 400);
  }

  if (status_code !== '2') return; // Not a success notification — nothing to do

  const transaction = await txRepo.findByPaymentId(order_id);
  if (!transaction || transaction.status !== 'Pending') {
    console.warn('[WalletService] Transaction not found or already processed', { order_id });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Guard against tampered amounts
    const expected = parseFloat(transaction.amount).toFixed(2);
    const received  = parseFloat(payhere_amount).toFixed(2);
    if (expected !== received) {
      await session.abortTransaction();
      throw new AppError('Amount mismatch', 400);
    }

    // Mark transaction complete
    transaction.status      = 'Completed';
    transaction.completedAt = new Date();
    await txRepo.save(transaction, session);

    // Credit the wallet
    const wallet = await walletRepo.findById(transaction.walletId, session);
    wallet.balance += parseFloat(payhere_amount);
    await walletRepo.save(wallet, session);

    await session.commitTransaction();
    console.log(`[WalletService] Payment verified: ${order_id}`);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

// ─── Investment (Atomic Transfer) ─────────────────────────────────────────────

/**
 * Atomically deduct funds from the investor's wallet and credit the startup's wallet.
 * Creates two transaction records (debit + credit) in the same Mongo session.
 */
export const executeInvestment = async (investor, amount, startupId, startupOwnerId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const investorWallet = await walletRepo.findByUser(investor.id, session);
    if (!investorWallet || investorWallet.balance < amount) {
      throw new AppError('Insufficient funds', 400);
    }

    const startupWallet = await walletRepo.findByUser(startupOwnerId, session);
    if (!startupWallet) {
      throw new AppError('Startup wallet not initialized', 400);
    }

    // Debit investor
    investorWallet.balance -= amount;
    await walletRepo.save(investorWallet, session);

    // Credit startup
    startupWallet.balance += Number(amount);
    await walletRepo.save(startupWallet, session);

    // Record both sides of the transfer
    await txRepo.createMany([
      {
        walletId:         investorWallet._id,
        userId:           investor.id,
        type:             'Investment',
        amount:           -amount,
        status:           'Completed',
        description:      `Investment in Startup ${startupId}`,
        relatedStartupId: startupId,
      },
      {
        walletId:         startupWallet._id,
        userId:           startupOwnerId,
        type:             'Deposit',
        amount,
        status:           'Completed',
        description:      `Investment received from ${investor.name}`,
        relatedStartupId: startupId,
      },
    ], session);

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
