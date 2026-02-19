import mongoose from 'mongoose';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import crypto from 'crypto'; // For PayHere signature verification

// @desc    Get current user's wallet & balance
// @route   GET /api/wallets/me
// @access  Private
export const getMyWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user.id });

    // Auto-create wallet if it doesn't exist (First time user)
    if (!wallet) {
      wallet = await Wallet.create({ userId: req.user.id });
    }

    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Transaction History
// @route   GET /api/v1/wallets/transactions
// @query   ?type=Deposit|Investment|Withdrawal|Refund
// @query   ?status=Pending|Completed|Failed
// @query   ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private
export const getWalletHistory = async (req, res) => {
  try {
    const { type, status, startDate, endDate } = req.query;

    // Build filter — always scope to the authenticated user
    const filter = { userId: req.user.id };

    if (type)   filter.type   = type;    // e.g. ?type=Deposit
    if (status) filter.status = status;  // e.g. ?status=Completed

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Initiate a Deposit (Generate PayHere Hash)
// @route   POST /api/wallets/deposit/initiate
// @access  Private
export const initiateDeposit = async (req, res) => {
  const { amount } = req.body;
  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_SECRET; // NEVER expose this to frontend
  const orderId = `ORDER_${Date.now()}`;
  const currency = process.env.PAYHERE_CURRENCY || 'LKR';

  if (!merchantId || !merchantSecret) {
    return res.status(500).json({ message: 'Payment gateway not configured' });
  }

  // Validate amount
  const amt = parseFloat(amount);
  if (Number.isNaN(amt) || amt <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  // 1. Generate PayHere Hash (md5)
  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const amountFormatted = amt.toFixed(2);
  const hashString = merchantId + orderId + amountFormatted + currency + hashedSecret;
  const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

  // 2. Ensure wallet exists
  let wallet = await Wallet.findOne({ userId: req.user.id });
  if (!wallet) {
    wallet = await Wallet.create({ userId: req.user.id });
  }

  // 3. Create a "Pending" Transaction record
  await Transaction.create({
    walletId: wallet._id,
    userId: req.user.id,
    type: 'Deposit',
    amount: amt,
    currency: currency,
    paymentId: orderId,
    status: 'Pending',
    description: 'Top-up via PayHere'
  });

  // 4. Send params back to Frontend to open PayHere Popup
  res.status(200).json({
    merchant_id: merchantId,
    return_url: `${process.env.FRONTEND_URL || ''}/wallet`, // Redirect after success
    cancel_url: `${process.env.FRONTEND_URL || ''}/wallet`,
    notify_url: `${process.env.BACKEND_URL || ''}/api/v1/wallets/notify`, // Webhook
    order_id: orderId,
    items: 'Wallet Top-up',
    currency: currency,
    amount: amountFormatted,
    hash: hash,
    first_name: req.user.name || '',
    email: req.user.email || '',
  });
};

// @desc    Handle PayHere Webhook (Server-to-Server)
// @route   POST /api/wallets/notify
// @access  Public (PayHere calls this)
export const payhereNotify = async (req, res) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig // The signature PayHere sends back
  } = req.body;

  const merchantSecret = process.env.PAYHERE_SECRET;

  // 1. Verify Signature (Security Check)
  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const localMd5sig = crypto.createHash('md5')
    .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
    .digest('hex').toUpperCase();

  if (localMd5sig !== (md5sig || '').toUpperCase()) {
    console.warn('Invalid PayHere signature', { order_id });
    return res.status(400).send('Invalid Signature'); // Stop hackers faking payments
  }

  // 2. Process Payment
  if (status_code === '2') { // '2' means Success in PayHere
    const transaction = await Transaction.findOne({ paymentId: order_id });

    if (transaction && transaction.status === 'Pending') {
      // Start a session for atomicity
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Validate amount matches expected
        const expected = parseFloat(transaction.amount).toFixed(2);
        const received = parseFloat(payhere_amount).toFixed(2);
        if (expected !== received) {
          console.error('Amount mismatch for order', order_id, { expected, received });
          await session.abortTransaction();
          return res.status(400).send('Amount mismatch');
        }

        // A. Update Transaction Status
        transaction.status = 'Completed';
        transaction.completedAt = new Date();
        await transaction.save({ session });

        // B. Update Wallet Balance
        const wallet = await Wallet.findById(transaction.walletId).session(session);
        wallet.balance = (parseFloat(wallet.balance) + parseFloat(payhere_amount));
        await wallet.save({ session });

        await session.commitTransaction();
        console.log(`Payment Verified: ${order_id}`);
      } catch (err) {
        await session.abortTransaction();
        console.error('Transaction Error:', err);
      } finally {
        session.endSession();
      }
    } else {
      console.warn('Transaction not found or already processed', { order_id });
    }
  }

  res.status(200).send('OK');
};

// @desc    Invest in a Startup (Atomic Transfer)
// @route   POST /api/wallets/invest
// @access  Private
export const investInStartup = async (req, res) => {
  const { amount, startupId, startupOwnerId } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const investorWallet = await Wallet.findOne({ userId: req.user.id }).session(session);
    
    // 1. Check Balance
    if (!investorWallet || investorWallet.balance < amount) {
      throw new Error('Insufficient funds');
    }

    // 2. Find Startup Wallet (Recipient)
    // Note: Assuming startupOwnerId is passed or we find it via Startup Model
    const startupWallet = await Wallet.findOne({ userId: startupOwnerId }).session(session);
    if (!startupWallet) {
      throw new Error('Startup wallet not initialized');
    }

    // 3. Deduct from Investor
    investorWallet.balance -= amount;
    await investorWallet.save({ session });

    // 4. Add to Startup
    startupWallet.balance += Number(amount);
    await startupWallet.save({ session });

    // 5. Create Transaction Record (Investor Side)
    await Transaction.create([{
      walletId: investorWallet._id,
      userId: req.user.id,
      type: 'Investment',
      amount: -amount, // Negative for deduction logic if you prefer, or handle in UI
      status: 'Completed',
      description: `Investment in Startup ${startupId}`,
      relatedStartupId: startupId
    }], { session });

    // 6. Create Transaction Record (Startup Side)
    await Transaction.create([{
      walletId: startupWallet._id,
      userId: startupOwnerId,
      type: 'Deposit', // Or 'Funding Received'
      amount: amount,
      status: 'Completed',
      description: `Investment received from ${req.user.name}`,
      relatedStartupId: startupId
    }], { session });

    await session.commitTransaction();
    res.status(200).json({ message: 'Investment successful' });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export default {
  getMyWallet,
  getWalletHistory,
  initiateDeposit,
  payhereNotify,
  investInStartup
};