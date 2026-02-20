import * as walletService from '../services/walletService.js';

// @desc    Get current user's wallet & balance
// @route   GET /api/v1/wallets/me
// @access  Private
export const getMyWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getOrCreateWallet(req.user.id);
    res.status(200).json(wallet);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Transaction History
// @route   GET /api/v1/wallets/transactions
// @query   ?type=Deposit|Investment|Withdrawal|Refund
// @query   ?status=Pending|Completed|Failed
// @query   ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private
export const getWalletHistory = async (req, res, next) => {
  try {
    const transactions = await walletService.getTransactionHistory(req.user.id, req.query);
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate a Deposit (Generate PayHere Hash)
// @route   POST /api/v1/wallets/deposit/initiate
// @access  Private
export const initiateDeposit = async (req, res, next) => {
  try {
    const data = await walletService.initiateDeposit(req.user.id, req.user, req.body.amount);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

// @desc    Handle PayHere Webhook (Server-to-Server)
// @route   POST /api/v1/wallets/notify
// @access  Public (PayHere calls this — no auth middleware)
export const payhereNotify = async (req, res) => {
  try {
    await walletService.processPayhereNotify(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('[payhereNotify]', error.message);
    res.status(error.statusCode || 400).send(error.message || 'Error');
  }
};

// @desc    Invest in a Startup (Atomic Transfer)
// @route   POST /api/v1/wallets/invest
// @access  Private
export const investInStartup = async (req, res, next) => {
  try {
    const { amount, startupId, startupOwnerId } = req.body;
    await walletService.executeInvestment(req.user, amount, startupId, startupOwnerId);
    res.status(200).json({ message: 'Investment successful' });
  } catch (error) {
    next(error);
  }
};