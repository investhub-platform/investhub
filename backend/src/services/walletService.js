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
export const getTransactionHistory = async (
  userId,
  { type, status, startDate, endDate, paymentId } = {}
) => {
  const filter = {};

  if (type)   filter.type   = type;
  if (status) filter.status = status;
  if (paymentId) filter.paymentId = paymentId;

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
export const initiateDeposit = async (userId, user, amount, options = {}) => {
  const merchantId     = (process.env.PAYHERE_MERCHANT_ID || '').trim();
  const merchantSecret = (process.env.PAYHERE_SECRET || '').trim();
  const currency       = (process.env.PAYHERE_CURRENCY || 'LKR').trim().toUpperCase();

  // Primary sources for frontend/backend URLs are environment variables.
  // For local reproduction you may pass `frontendUrl`/`backendUrl` in the
  // request body and set `PAYHERE_ALLOW_LOCAL=true` in your env to allow
  // developer overrides (safe for testing only).
  const allowLocalOverrides = String(process.env.PAYHERE_ALLOW_LOCAL || '').toLowerCase() === 'true';
  const frontendEnv = (process.env.FRONTEND_URL || '').trim().replace(/\/$/, '');
  const backendEnv = (process.env.BACKEND_URL || '').trim().replace(/\/$/, '');

  const frontendUrlRaw = allowLocalOverrides && options.frontendUrl ? String(options.frontendUrl).trim() : frontendEnv;
  const backendUrlRaw = allowLocalOverrides && options.backendUrl ? String(options.backendUrl).trim() : backendEnv;
  const frontendUrl = frontendUrlRaw ? frontendUrlRaw.replace(/\/$/, '') : '';
  const backendUrl = backendUrlRaw ? backendUrlRaw.replace(/\/$/, '') : '';

  if (!merchantId || !merchantSecret) {
    throw new AppError('Payment gateway not configured', 500);
  }

  if (!frontendUrl || !backendUrl || !/^https?:\/\//i.test(frontendUrl) || !/^https?:\/\//i.test(backendUrl)) {
    throw new AppError('FRONTEND_URL and BACKEND_URL must be valid absolute URLs for PayHere', 500);
  }

  const amt = parseFloat(amount);
  if (Number.isNaN(amt) || amt <= 0) {
    throw new AppError('Invalid amount', 400);
  }

  const frontendHost = (() => {
    try { return new URL(frontendUrl).host; } catch { return 'invalid'; }
  })();
  const backendHost = (() => {
    try { return new URL(backendUrl).host; } catch { return 'invalid'; }
  })();

  const orderId = `ORDER_${Date.now()}_${String(userId).slice(-6)}`;
  // Per PayHere SDK spec:
  // hash = UPPER(MD5(merchant_id + order_id + amount + currency + UPPER(MD5(merchant_secret))))
  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

  if (!/^[A-F0-9]{32}$/.test(hashedSecret)) {
    throw new AppError('Invalid PAYHERE secret/hash configuration', 500);
  }

  const amountFormatted = amt.toFixed(2);
  const hash = crypto
    .createHash('md5')
    .update(merchantId + orderId + amountFormatted + currency + hashedSecret)
    .digest('hex')
    .toUpperCase();

  // Non-sensitive diagnostics to troubleshoot PayHere authorization issues in deployed environments.
  console.info('[PayHere] initiateDeposit payload meta', {
    orderId,
    amount: amountFormatted,
    currency,
    merchantIdPresent: Boolean(merchantId),
    frontendHost,
    backendHost,
    hashSource: 'derived-from-merchant-secret',
  });

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

  const [firstNameRaw = '', ...restName] = String(user?.name || '').trim().split(/\s+/);
  const firstName = firstNameRaw || 'InvestHub';
  const lastName = restName.join(' ') || 'User';
  const phone = String(user?.profile?.phone || process.env.PAYHERE_DEFAULT_PHONE || '0770000000');
  const city = process.env.PAYHERE_DEFAULT_CITY || 'Colombo';
  const address = process.env.PAYHERE_DEFAULT_ADDRESS || 'InvestHub';
  const country = process.env.PAYHERE_DEFAULT_COUNTRY || 'Sri Lanka';

  return {
    merchant_id: merchantId,
    return_url:  `${frontendUrl}/app/wallet`,
    cancel_url:  `${frontendUrl}/app/wallet`,
    notify_url:  `${backendUrl}/api/v1/wallets/notify`,
    order_id:    orderId,
    items:       'Wallet Top-up',
    currency,
    amount:      amountFormatted,
    hash,
    first_name:  firstName,
    last_name:   lastName,
    email:       user.email || '',
    phone,
    address,
    city,
    country,
    custom_1:    String(userId),
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
  if (!merchant_id || !order_id || !payhere_amount || !payhere_currency || !status_code || !md5sig) {
    throw new AppError('Missing payment notification fields', 400);
  }

  const merchantSecret = (process.env.PAYHERE_SECRET || '').trim();
  const expectedMerchantId = (process.env.PAYHERE_MERCHANT_ID || '').trim();
  if (!merchantSecret || !expectedMerchantId) {
    throw new AppError('Payment gateway not configured', 500);
  }

  if (String(merchant_id) !== String(expectedMerchantId)) {
    throw new AppError('Invalid merchant id', 400);
  }

  // Per PayHere notification verification spec:
  // md5sig = UPPER(MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPER(MD5(merchant_secret))))
  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();

  if (!/^[A-F0-9]{32}$/.test(hashedSecret)) {
    throw new AppError('Invalid PAYHERE secret/hash configuration', 500);
  }

  const localMd5sig = crypto
    .createHash('md5')
    .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
    .digest('hex')
    .toUpperCase();

  if (localMd5sig !== (md5sig || '').toUpperCase()) {
    throw new AppError('Invalid Signature', 400);
  }

  const transaction = await txRepo.findByPaymentId(order_id);
  if (!transaction) {
    console.warn('[WalletService] Transaction not found', { order_id });
    return;
  }

  if (transaction.status !== 'Pending') {
    console.warn('[WalletService] Transaction not found or already processed', { order_id });
    return;
  }

  if (status_code !== '2') {
    transaction.status = 'Failed';
    transaction.description = `PayHere payment failed/cancelled (status: ${status_code})`;
    await txRepo.save(transaction);
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

// ─── Deposit Failure + Status ───────────────────────────────────────────────

/**
 * Mark a pending deposit as failed from frontend callback events.
 * This is best-effort and idempotent; completed payments are not altered.
 */
export const markDepositFailed = async (userId, orderId, reason = 'Payment dismissed or failed in popup') => {
  if (!orderId) {
    throw new AppError('orderId is required', 400);
  }

  const transaction = await txRepo.findOneByUserAndPaymentId(userId, orderId);
  if (!transaction) {
    throw new AppError('Deposit transaction not found', 404);
  }

  if (transaction.status === 'Completed') {
    return transaction;
  }

  transaction.status = 'Failed';
  transaction.description = reason;
  return txRepo.save(transaction);
};

/**
 * Return current status of a deposit order for the requesting user.
 */
export const getDepositStatus = async (userId, orderId) => {
  if (!orderId) {
    throw new AppError('orderId is required', 400);
  }

  const transaction = await txRepo.findOneByUserAndPaymentId(userId, orderId);
  if (!transaction) {
    throw new AppError('Deposit transaction not found', 404);
  }

  return {
    orderId,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    completedAt: transaction.completedAt,
    createdAt: transaction.createdAt,
  };
};

/**
 * Local/sandbox fallback: confirm a deposit from client callback when
 * PayHere notify_url is not reachable (e.g., localhost development).
 * Disabled by default and must never be used in production.
 */
export const confirmDepositFromClientCallback = async (userId, orderId) => {
  if (!orderId) {
    throw new AppError('orderId is required', 400);
  }

  const allowClientConfirm = String(process.env.PAYHERE_ALLOW_CLIENT_CONFIRM || '').toLowerCase() === 'true';
  const sandboxMode = String(process.env.PAYHERE_SANDBOX || '').toLowerCase() === 'true';

  if (!allowClientConfirm || !sandboxMode) {
    throw new AppError('Client-side payment confirmation is disabled', 403);
  }

  const transaction = await txRepo.findOneByUserAndPaymentId(userId, orderId);
  if (!transaction) {
    throw new AppError('Deposit transaction not found', 404);
  }

  if (transaction.status === 'Completed') {
    return {
      orderId,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      completedAt: transaction.completedAt,
      createdAt: transaction.createdAt,
    };
  }

  if (transaction.status !== 'Pending') {
    throw new AppError(`Cannot confirm deposit from state: ${transaction.status}`, 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    transaction.status = 'Completed';
    transaction.completedAt = new Date();
    transaction.description = 'Completed via local client callback fallback';
    await txRepo.save(transaction, session);

    const wallet = await walletRepo.findById(transaction.walletId, session);
    wallet.balance += Number(transaction.amount);
    await walletRepo.save(wallet, session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return {
    orderId,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    completedAt: transaction.completedAt,
    createdAt: transaction.createdAt,
  };
};

// ─── Investment (Atomic Transfer) ─────────────────────────────────────────────

/**
 * Atomically deduct funds from the investor's wallet and credit the startup's wallet.
 * Creates two transaction records (debit + credit) in the same Mongo session.
 */
export const executeInvestment = async (investor, amount, startupId, startupOwnerId) => {
  const numericAmount = Number(amount);
  if (!startupId || !startupOwnerId) {
    throw new AppError('startupId and startupOwnerId are required', 400);
  }
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new AppError('Invalid investment amount', 400);
  }
  if (String(investor.id) === String(startupOwnerId)) {
    throw new AppError('You cannot invest in your own startup', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const investorWallet = await walletRepo.findByUser(investor.id, session);
    if (!investorWallet || investorWallet.balance < numericAmount) {
      throw new AppError('Insufficient funds', 400);
    }

    let startupWallet = await walletRepo.findByUser(startupOwnerId, session);
    if (!startupWallet) {
      const [createdWallet] = await walletRepo.create([{ userId: startupOwnerId }], { session });
      startupWallet = createdWallet;
    }

    // Debit investor
    investorWallet.balance -= numericAmount;
    await walletRepo.save(investorWallet, session);

    // Credit startup
    startupWallet.balance += numericAmount;
    await walletRepo.save(startupWallet, session);

    // Record both sides of the transfer
    await txRepo.createMany([
      {
        walletId:         investorWallet._id,
        userId:           investor.id,
        type:             'Investment',
        amount:           -numericAmount,
        status:           'Completed',
        description:      `Investment in Startup ${startupId}`,
        relatedStartupId: startupId,
      },
      {
        walletId:         startupWallet._id,
        userId:           startupOwnerId,
        type:             'Deposit',
        amount:           numericAmount,
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
