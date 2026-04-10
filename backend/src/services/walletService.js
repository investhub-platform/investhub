import mongoose from 'mongoose';
import crypto from 'crypto';
import * as walletRepo from '../repositories/walletRepository.js';
import * as txRepo from '../repositories/transactionRepository.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';
import Idea from '../models/Idea.js';
import Request from '../models/Request.js';

/**
 * WalletService
 * All business logic for wallet operations.
 * Database operations are delegated to walletRepository / transactionRepository.
 */

const PLATFORM_FEE_PERCENT = () => Number(process.env.PLATFORM_FEE_PERCENT || 5);
const getAdminUserId = () => process.env.ADMIN_USER_ID;
const INVESTOR_PRO_PRICE = Number(process.env.INVESTOR_PRO_PRICE || 20);
const FOUNDER_PRO_PRICE = Number(process.env.FOUNDER_PRO_PRICE || 49);
const PRO_MAX_PRICE = Number(process.env.PRO_MAX_PRICE || 60);

const encodeMeta = (prefix, meta) => `${prefix}|${JSON.stringify(meta || {})}`;

const decodeMeta = (description = '', prefix) => {
  if (!description || !String(description).startsWith(`${prefix}|`)) return null;
  const json = String(description).slice(prefix.length + 1);
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

// ─── Wallet ──────────────────────────────────────────────────────────────────

export const getOrCreateWallet = async (userId) => {
  let wallet = await walletRepo.findByUser(userId);
  if (!wallet) wallet = await walletRepo.create({ userId });
  return wallet;
};

// ─── Transaction History ──────────────────────────────────────────────────────

export const getTransactionHistory = async (
  userId,
  { type, status, startDate, endDate, paymentId } = {}
) => {
  const filter = {};

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (paymentId) filter.paymentId = paymentId;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      filter.createdAt.$lte = new Date(
        new Date(endDate).setHours(23, 59, 59, 999)
      );
    }
  }

  return txRepo.findByUser(userId, filter);
};

// ─── Deposit ──────────────────────────────────────────────────────────────────

export const initiateDeposit = async (userId, user, amount, options = {}) => {
  const merchantId = (process.env.PAYHERE_MERCHANT_ID || '').trim();
  const merchantSecret = (process.env.PAYHERE_SECRET || '').trim();
  const currency = (process.env.PAYHERE_CURRENCY || 'LKR').trim().toUpperCase();

  const allowLocalOverrides =
    String(process.env.PAYHERE_ALLOW_LOCAL || '').toLowerCase() === 'true';

  const frontendEnv = (process.env.FRONTEND_URL || '').trim().replace(/\/$/, '');
  const backendEnv = (process.env.BACKEND_URL || '').trim().replace(/\/$/, '');
    const useBackendRedirects = String(process.env.PAYHERE_USE_BACKEND_REDIRECTS || 'true').toLowerCase() === 'true';

  const frontendUrlRaw =
    allowLocalOverrides && options.frontendUrl
      ? String(options.frontendUrl).trim()
      : frontendEnv;

  const backendUrlRaw =
    allowLocalOverrides && options.backendUrl
      ? String(options.backendUrl).trim()
      : backendEnv;

  const frontendUrl = frontendUrlRaw ? frontendUrlRaw.replace(/\/$/, '') : '';
  const backendUrl = backendUrlRaw ? backendUrlRaw.replace(/\/$/, '') : '';

  if (!merchantId || !merchantSecret) {
    throw new AppError('Payment gateway not configured', 500);
  }

  if (
    !frontendUrl ||
    !backendUrl ||
    !/^https?:\/\//i.test(frontendUrl) ||
    !/^https?:\/\//i.test(backendUrl)
  ) {
    throw new AppError(
      'FRONTEND_URL and BACKEND_URL must be valid absolute URLs for PayHere',
      500
    );
  }

  const amt = parseFloat(amount);
  if (Number.isNaN(amt) || amt <= 0) {
    throw new AppError('Invalid amount', 400);
  }

  const frontendHost = (() => {
    try {
      return new URL(frontendUrl).host;
    } catch {
      return 'invalid';
    }
  })();

  const backendHost = (() => {
    try {
      return new URL(backendUrl).host;
    } catch {
      return 'invalid';
    }
  })();

  const orderId = `ORDER_${Date.now()}_${String(userId).slice(-6)}`;

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  if (!/^[A-F0-9]{32}$/.test(hashedSecret)) {
    throw new AppError('Invalid PAYHERE secret/hash configuration', 500);
  }

  const amountFormatted = amt.toFixed(2);
  const hash = crypto
    .createHash('md5')
    .update(merchantId + orderId + amountFormatted + currency + hashedSecret)
    .digest('hex')
    .toUpperCase();

  console.info('[PayHere] initiateDeposit payload meta', {
    orderId,
    amount: amountFormatted,
    currency,
    merchantIdPresent: Boolean(merchantId),
    frontendHost,
    backendHost,
    hashSource: 'derived-from-merchant-secret',
  });

  const wallet = await getOrCreateWallet(userId);

  await txRepo.create({
    walletId: wallet._id,
    userId,
    type: 'Deposit',
    amount: amt,
    currency,
    paymentId: orderId,
    status: 'Pending',
    description: 'Top-up via PayHere',
  });

  const [firstNameRaw = '', ...restName] = String(user?.name || '')
    .trim()
    .split(/\s+/);

  const firstName = firstNameRaw || 'InvestHub';
  const lastName = restName.join(' ') || 'User';
  const phone = String(
    user?.profile?.phone || process.env.PAYHERE_DEFAULT_PHONE || '0770000000'
  );
  const city = process.env.PAYHERE_DEFAULT_CITY || 'Colombo';
  const address = process.env.PAYHERE_DEFAULT_ADDRESS || 'InvestHub';
  const country = process.env.PAYHERE_DEFAULT_COUNTRY || 'Sri Lanka';

  const depositReturn = useBackendRedirects
    ? `${backendUrl}/api/v1/payhere/return?target=${encodeURIComponent('/app/wallet')}`
    : `${frontendUrl}/app/wallet`;
  const depositCancel = useBackendRedirects
    ? `${backendUrl}/api/v1/payhere/cancel?target=${encodeURIComponent('/app/wallet')}`
    : `${frontendUrl}/app/wallet`;

  return {
    merchant_id: merchantId,
    return_url: depositReturn,
    cancel_url: depositCancel,
    notify_url: `${backendUrl}/api/v1/wallets/notify`,
    order_id: orderId,
    items: 'Wallet Top-up',
    currency,
    amount: amountFormatted,
    hash,
    first_name: firstName,
    last_name: lastName,
    email: user.email || '',
    phone,
    address,
    city,
    country,
    custom_1: String(userId),
  };
};

export const purchaseSubscriptionFromWallet = async (userId, packageType) => {
  const normalizedPackage = String(packageType || '').toLowerCase();
  const pricing = {
    investor_pro: INVESTOR_PRO_PRICE,
    founder_pro: FOUNDER_PRO_PRICE,
    pro_max: PRO_MAX_PRICE,
  };

  const amount = pricing[normalizedPackage];
  if (!amount) {
    throw new AppError('Invalid subscription package. Use investor_pro, founder_pro, or pro_max.', 400);
  }

  const adminUserId = getAdminUserId();
  if (!adminUserId) {
    throw new AppError('ADMIN_USER_ID is not configured', 500);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userWallet = await walletRepo.findByUser(userId, session);
    if (!userWallet || userWallet.balance < amount) {
      throw new AppError('Insufficient wallet balance for subscription purchase', 400);
    }

    let adminWallet = await walletRepo.findByUser(adminUserId, session);
    if (!adminWallet) {
      const [createdAdminWallet] = await walletRepo.create([{ userId: adminUserId }], { session });
      adminWallet = createdAdminWallet;
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    userWallet.balance -= amount;
    adminWallet.balance += amount;

    await walletRepo.save(userWallet, session);
    await walletRepo.save(adminWallet, session);

    const now = new Date();
    const currentInvestorExpiry = user.subscription?.investorProExpiresAt ? new Date(user.subscription.investorProExpiresAt) : null;
    const currentFounderExpiry = user.subscription?.founderProExpiresAt ? new Date(user.subscription.founderProExpiresAt) : null;

    const subscription = { ...(user.subscription || {}) };
    if (normalizedPackage === 'investor_pro' || normalizedPackage === 'pro_max') {
      const baseline = currentInvestorExpiry && currentInvestorExpiry > now ? currentInvestorExpiry : now;
      subscription.investorProExpiresAt = addDays(baseline, 30);
    }
    if (normalizedPackage === 'founder_pro' || normalizedPackage === 'pro_max') {
      const baseline = currentFounderExpiry && currentFounderExpiry > now ? currentFounderExpiry : now;
      subscription.founderProExpiresAt = addDays(baseline, 30);
      await Idea.updateMany(
        { createdBy: user._id, deletedUtc: null },
        { $set: { promotedUntil: subscription.founderProExpiresAt } },
        { session }
      );
    }

    user.subscription = subscription;
    user.updatedUtc = new Date();
    await user.save({ session });

    await txRepo.createMany(
      [
        {
          walletId: userWallet._id,
          userId,
          type: 'Withdrawal',
          amount: -amount,
          currency: userWallet.currency || 'LKR',
          status: 'Completed',
          completedAt: new Date(),
          description: `Subscription purchased from wallet: ${normalizedPackage}`,
        },
        {
          walletId: adminWallet._id,
          userId: adminUserId,
          type: 'PlatformFee',
          amount,
          currency: adminWallet.currency || 'LKR',
          status: 'Completed',
          completedAt: new Date(),
          description: `Subscription revenue: ${normalizedPackage}`,
        },
      ],
      session
    );

    await session.commitTransaction();

    return {
      message: 'Subscription upgraded successfully',
      packageType: normalizedPackage,
      amount,
      subscription,
      walletBalance: userWallet.balance,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const deactivateSubscriptionPackage = async (userId, packageType) => {
  const normalizedPackage = String(packageType || '').toLowerCase();
  if (!['investor_pro', 'founder_pro', 'pro_max'].includes(normalizedPackage)) {
    throw new AppError('Invalid packageType. Use investor_pro, founder_pro, or pro_max.', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const subscription = { ...(user.subscription || {}) };
    if (normalizedPackage === 'investor_pro' || normalizedPackage === 'pro_max') {
      subscription.investorProExpiresAt = null;
    }
    if (normalizedPackage === 'founder_pro' || normalizedPackage === 'pro_max') {
      subscription.founderProExpiresAt = null;
      await Idea.updateMany(
        { createdBy: user._id, deletedUtc: null },
        { $set: { promotedUntil: null } },
        { session }
      );
    }

    user.subscription = subscription;
    user.updatedUtc = new Date();
    await user.save({ session });

    await session.commitTransaction();

    return {
      message: 'Subscription deactivated successfully',
      packageType: normalizedPackage,
      subscription,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const initiateInvestmentCheckout = async (
  investor,
  { amount, startupId, startupOwnerId, requestId },
  options = {}
) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new AppError('Invalid investment amount', 400);
  }
  if (!startupId || !startupOwnerId) {
    throw new AppError('startupId and startupOwnerId are required', 400);
  }

  const merchantId = (process.env.PAYHERE_MERCHANT_ID || '').trim();
  const merchantSecret = (process.env.PAYHERE_SECRET || '').trim();
  const currency = (process.env.PAYHERE_CURRENCY || 'USD').trim().toUpperCase();
  const allowLocalOverrides =
    String(process.env.PAYHERE_ALLOW_LOCAL || '').toLowerCase() === 'true';

  const frontendEnv = (process.env.FRONTEND_URL || '').trim().replace(/\/$/, '');
  const backendEnv = (process.env.BACKEND_URL || '').trim().replace(/\/$/, '');

  const frontendUrlRaw =
    allowLocalOverrides && options.frontendUrl
      ? String(options.frontendUrl).trim()
      : frontendEnv;

  const backendUrlRaw =
    allowLocalOverrides && options.backendUrl
      ? String(options.backendUrl).trim()
      : backendEnv;

  const frontendUrl = frontendUrlRaw ? frontendUrlRaw.replace(/\/$/, '') : '';
  const backendUrl = backendUrlRaw ? backendUrlRaw.replace(/\/$/, '') : '';

  if (!merchantId || !merchantSecret) {
    throw new AppError('Payment gateway not configured', 500);
  }
  if (!frontendUrl || !backendUrl || !/^https?:\/\//i.test(frontendUrl) || !/^https?:\/\//i.test(backendUrl)) {
    throw new AppError('FRONTEND_URL and BACKEND_URL must be valid absolute URLs for PayHere', 500);
  }

  const orderId = `INVEST_${Date.now()}_${String(investor.id).slice(-6)}`;
  const amountFormatted = numericAmount.toFixed(2);
  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  const hash = crypto
    .createHash('md5')
    .update(merchantId + orderId + amountFormatted + currency + hashedSecret)
    .digest('hex')
    .toUpperCase();

  const investorWallet = await getOrCreateWallet(investor.id);

  await txRepo.create({
    walletId: investorWallet._id,
    userId: investor.id,
    type: 'Investment',
    amount: -numericAmount,
    currency,
    paymentId: orderId,
    status: 'Pending',
    description: encodeMeta('INVESTMENT_CHECKOUT', {
      requestId: requestId || null,
      startupId: String(startupId),
      startupOwnerId: String(startupOwnerId),
      investorId: String(investor.id),
    }),
  });

  const [firstNameRaw = '', ...restName] = String(investor?.name || '').trim().split(/\s+/);
  const firstName = firstNameRaw || 'InvestHub';
  const lastName = restName.join(' ') || 'Investor';

  return {
    merchant_id: merchantId,
    return_url: useBackendRedirects
      ? `${backendUrl}/api/v1/payhere/return?target=${encodeURIComponent('/app/deals')}`
      : `${frontendUrl}/app/deals`,
    cancel_url: useBackendRedirects
      ? `${backendUrl}/api/v1/payhere/cancel?target=${encodeURIComponent('/app/deals')}`
      : `${frontendUrl}/app/deals`,
    notify_url: `${backendUrl}/api/v1/wallets/notify`,
    order_id: orderId,
    items: `Startup Investment ${startupId}`,
    currency,
    amount: amountFormatted,
    hash,
    first_name: firstName,
    last_name: lastName,
    email: investor?.email || '',
    phone: String(investor?.profile?.phone || process.env.PAYHERE_DEFAULT_PHONE || '0770000000'),
    address: process.env.PAYHERE_DEFAULT_ADDRESS || 'InvestHub',
    city: process.env.PAYHERE_DEFAULT_CITY || 'Colombo',
    country: process.env.PAYHERE_DEFAULT_COUNTRY || 'Sri Lanka',
    custom_1: String(investor.id),
    custom_2: String(requestId || ''),
  };
};

// ─── PayHere Webhook ──────────────────────────────────────────────────────────

export const processPayhereNotify = async ({
  merchant_id,
  order_id,
  payhere_amount,
  payhere_currency,
  status_code,
  md5sig,
}) => {
  if (
    !merchant_id ||
    !order_id ||
    !payhere_amount ||
    !payhere_currency ||
    !status_code ||
    !md5sig
  ) {
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

  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  if (!/^[A-F0-9]{32}$/.test(hashedSecret)) {
    throw new AppError('Invalid PAYHERE secret/hash configuration', 500);
  }

  const localMd5sig = crypto
    .createHash('md5')
    .update(
      merchant_id +
        order_id +
        payhere_amount +
        payhere_currency +
        status_code +
        hashedSecret
    )
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
    console.warn('[WalletService] Transaction not found or already processed', {
      order_id,
    });
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
    const expected = Math.abs(parseFloat(transaction.amount)).toFixed(2);
    const received = parseFloat(payhere_amount).toFixed(2);

    if (expected !== received) {
      await session.abortTransaction();
      throw new AppError('Amount mismatch', 400);
    }

    const amount = parseFloat(payhere_amount);
    const adminUserId = getAdminUserId();

    if (transaction.type === 'Deposit') {
      transaction.status = 'Completed';
      transaction.completedAt = new Date();
      await txRepo.save(transaction, session);

      const wallet = await walletRepo.findById(transaction.walletId, session);
      wallet.balance += amount;
      await walletRepo.save(wallet, session);
    } else if (transaction.type === 'Investment') {
      const meta = decodeMeta(transaction.description, 'INVESTMENT_CHECKOUT') || {};
      const startupOwnerId = meta.startupOwnerId;
      const startupId = meta.startupId;
      const requestId = meta.requestId;

      if (!startupOwnerId || !startupId) {
        throw new AppError('Invalid pending investment metadata', 400);
      }

      if (!adminUserId) {
        throw new AppError('ADMIN_USER_ID is not configured', 500);
      }

      const platformFee = Number(((amount * PLATFORM_FEE_PERCENT()) / 100).toFixed(2));
      const startupNetAmount = Number((amount - platformFee).toFixed(2));

      const investorWallet = await walletRepo.findById(transaction.walletId, session);
      if (!investorWallet) {
        throw new AppError('Investor wallet not found for pending transaction', 404);
      }

      let startupWallet = await walletRepo.findByUser(startupOwnerId, session);
      if (!startupWallet) {
        const [createdStartupWallet] = await walletRepo.create([{ userId: startupOwnerId }], { session });
        startupWallet = createdStartupWallet;
      }

      let adminWallet = await walletRepo.findByUser(adminUserId, session);
      if (!adminWallet) {
        const [createdAdminWallet] = await walletRepo.create([{ userId: adminUserId }], { session });
        adminWallet = createdAdminWallet;
      }

      investorWallet.balance -= amount;
      startupWallet.balance += startupNetAmount;
      adminWallet.balance += platformFee;

      await walletRepo.save(investorWallet, session);
      await walletRepo.save(startupWallet, session);
      await walletRepo.save(adminWallet, session);

      transaction.status = 'Completed';
      transaction.completedAt = new Date();
      transaction.description = `Investment settled from PayHere checkout for startup ${startupId}`;
      await txRepo.save(transaction, session);

      await txRepo.createMany(
        [
          {
            walletId: startupWallet._id,
            userId: startupOwnerId,
            type: 'Deposit',
            amount: startupNetAmount,
            status: 'Completed',
            completedAt: new Date(),
            description: `Investment received after ${PLATFORM_FEE_PERCENT()}% platform fee`,
            relatedStartupId: startupId,
          },
          {
            walletId: adminWallet._id,
            userId: adminUserId,
            type: 'PlatformFee',
            amount: platformFee,
            status: 'Completed',
            completedAt: new Date(),
            description: `Platform fee from investment ${startupId}`,
            relatedStartupId: startupId,
          },
        ],
        session
      );

      if (requestId) {
        await Request.findByIdAndUpdate(
          requestId,
          {
            requestStatus: 'paid',
            updatedUtc: new Date(),
            updatedBy: transaction.userId,
          },
          { session }
        );
      }
    } else if (transaction.type === 'Withdrawal') {
      const meta = decodeMeta(transaction.description, 'SUBSCRIPTION_CHECKOUT') || {};
      const packageType = String(meta.packageType || '').toLowerCase();
      const targetUserId = meta.userId || String(transaction.userId);

      if (!['investor_pro', 'founder_pro'].includes(packageType)) {
        throw new AppError('Invalid subscription package metadata', 400);
      }

      if (!adminUserId) {
        throw new AppError('ADMIN_USER_ID is not configured', 500);
      }

      let adminWallet = await walletRepo.findByUser(adminUserId, session);
      if (!adminWallet) {
        const [createdAdminWallet] = await walletRepo.create([{ userId: adminUserId }], { session });
        adminWallet = createdAdminWallet;
      }

      adminWallet.balance += amount;
      await walletRepo.save(adminWallet, session);

      const user = await User.findById(targetUserId).session(session);
      if (!user) {
        throw new AppError('User not found for subscription activation', 404);
      }

      const now = new Date();
      const currentInvestorExpiry = user.subscription?.investorProExpiresAt ? new Date(user.subscription.investorProExpiresAt) : null;
      const currentFounderExpiry = user.subscription?.founderProExpiresAt ? new Date(user.subscription.founderProExpiresAt) : null;

      const subscription = { ...(user.subscription || {}) };
      if (packageType === 'investor_pro') {
        const baseline = currentInvestorExpiry && currentInvestorExpiry > now ? currentInvestorExpiry : now;
        subscription.investorProExpiresAt = addDays(baseline, 30);
      }
      if (packageType === 'founder_pro') {
        const baseline = currentFounderExpiry && currentFounderExpiry > now ? currentFounderExpiry : now;
        subscription.founderProExpiresAt = addDays(baseline, 30);
        await Idea.updateMany(
          { createdBy: user._id, deletedUtc: null },
          { $set: { promotedUntil: subscription.founderProExpiresAt } },
          { session }
        );
      }

      user.subscription = subscription;
      user.updatedUtc = new Date();
      await user.save({ session });

      transaction.status = 'Completed';
      transaction.completedAt = new Date();
      transaction.description = `${packageType} subscription activated`;
      await txRepo.save(transaction, session);

      await txRepo.create({
        walletId: adminWallet._id,
        userId: adminUserId,
        type: 'PlatformFee',
        amount,
        currency: transaction.currency,
        paymentId: order_id,
        status: 'Completed',
        completedAt: new Date(),
        description: `Subscription revenue: ${packageType}`,
      }, session);
    } else {
      transaction.status = 'Completed';
      transaction.completedAt = new Date();
      await txRepo.save(transaction, session);
    }

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

export const markDepositFailed = async (
  userId,
  orderId,
  reason = 'Payment dismissed or failed in popup'
) => {
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

export const confirmDepositFromClientCallback = async (userId, orderId) => {
  if (!orderId) {
    throw new AppError('orderId is required', 400);
  }

  const allowClientConfirm =
    String(process.env.PAYHERE_ALLOW_CLIENT_CONFIRM || '').toLowerCase() ===
    'true';

  const sandboxMode =
    String(process.env.PAYHERE_SANDBOX || '').toLowerCase() === 'true';

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

// ─── Investment (Atomic Transfer + Platform Fee) ─────────────────────────────

export const executeInvestment = async (
  investor,
  amount,
  startupId,
  startupOwnerId
) => {
  const numericAmount = Number(amount);
  const minimumInvestment = Number(process.env.MIN_INVEST_AMOUNT || 10000);

  if (!startupId || !startupOwnerId) {
    throw new AppError('startupId and startupOwnerId are required', 400);
  }

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new AppError('Invalid investment amount', 400);
  }

  if (numericAmount < minimumInvestment) {
    throw new AppError(`Minimum investment amount is ${minimumInvestment}`, 400);
  }

  if (String(investor.id) === String(startupOwnerId)) {
    throw new AppError('You cannot invest in your own startup', 400);
  }

  if (!getAdminUserId()) {
    throw new AppError('ADMIN_USER_ID is not configured', 500);
  }

  const platformFee = Number(
    ((numericAmount * PLATFORM_FEE_PERCENT()) / 100).toFixed(2)
  );
  const startupNetAmount = Number((numericAmount - platformFee).toFixed(2));

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const investorWallet = await walletRepo.findByUser(investor.id, session);
    if (!investorWallet || investorWallet.balance < numericAmount) {
      throw new AppError('Insufficient funds', 400);
    }

    let startupWallet = await walletRepo.findByUser(startupOwnerId, session);
    if (!startupWallet) {
      const [createdWallet] = await walletRepo.create(
        [{ userId: startupOwnerId }],
        { session }
      );
      startupWallet = createdWallet;
    }

    const ADMIN_USER_ID = getAdminUserId();
    let adminWallet = await walletRepo.findByUser(ADMIN_USER_ID, session);
    if (!adminWallet) {
      const [createdAdminWallet] = await walletRepo.create(
        [{ userId: ADMIN_USER_ID }],
        { session }
      );
      adminWallet = createdAdminWallet;
    }

    // 1. Debit full amount from investor
    investorWallet.balance -= numericAmount;
    await walletRepo.save(investorWallet, session);

    // 2. Credit 95% to startup owner
    startupWallet.balance += startupNetAmount;
    await walletRepo.save(startupWallet, session);

    // 3. Credit 5% to admin/platform
    adminWallet.balance += platformFee;
    await walletRepo.save(adminWallet, session);

    // 4. Record all transaction entries
    await txRepo.createMany(
      [
        {
          walletId: investorWallet._id,
          userId: investor.id,
          type: 'Investment',
          amount: -numericAmount,
          status: 'Completed',
          completedAt: new Date(),
          description: `Investment in Startup ${startupId}`,
          relatedStartupId: startupId,
        },
        {
          walletId: startupWallet._id,
          userId: startupOwnerId,
          type: 'Deposit',
          amount: startupNetAmount,
          status: 'Completed',
          completedAt: new Date(),
          description: `Investment received after ${PLATFORM_FEE_PERCENT}% platform fee`,
          relatedStartupId: startupId,
        },
        {
          walletId: adminWallet._id,
          userId: ADMIN_USER_ID,
          type: 'PlatformFee',
          amount: platformFee,
          status: 'Completed',
          completedAt: new Date(),
          description: `Platform fee collected from startup investment ${startupId}`,
          relatedStartupId: startupId,
        },
      ],
      session
    );

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

/**
 * Founder monthly payout to investor.
 * Atomically deducts founder wallet and credits investor wallet.
 */
export const executeFounderPayout = async (founder, amount, startupId, investorId, requestId = null) => {
  const numericAmount = Number(amount);
  if (!startupId || !investorId) {
    throw new AppError('startupId and investorId are required', 400);
  }
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new AppError('Invalid payout amount', 400);
  }
  if (String(founder.id) === String(investorId)) {
    throw new AppError('Founder and investor cannot be the same user', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const founderWallet = await walletRepo.findByUser(founder.id, session);
    if (!founderWallet || founderWallet.balance < numericAmount) {
      throw new AppError('Insufficient funds for payout', 400);
    }

    let investorWallet = await walletRepo.findByUser(investorId, session);
    if (!investorWallet) {
      const [createdWallet] = await walletRepo.create([{ userId: investorId }], { session });
      investorWallet = createdWallet;
    }

    founderWallet.balance -= numericAmount;
    await walletRepo.save(founderWallet, session);

    investorWallet.balance += numericAmount;
    await walletRepo.save(investorWallet, session);

    const payoutContext = requestId ? ` for request ${requestId}` : '';

    await txRepo.createMany([
      {
        walletId: founderWallet._id,
        userId: founder.id,
        type: 'Withdrawal',
        amount: -numericAmount,
        status: 'Completed',
        description: `Monthly investor payout${payoutContext}`,
        relatedStartupId: startupId,
      },
      {
        walletId: investorWallet._id,
        userId: investorId,
        type: 'Deposit',
        amount: numericAmount,
        status: 'Completed',
        description: `Monthly return from startup ${startupId}`,
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
