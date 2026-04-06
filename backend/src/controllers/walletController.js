import * as walletService from '../services/walletService.js';

// @desc    Get current user's wallet & balance
// @route   GET /api/v1/wallets/me
// @access  Private
export const getMyWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getOrCreateWallet(req.user.id);
    res.status(200).json({ success: true, data: wallet });
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
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate a Deposit (Generate PayHere Hash)
// @route   POST /api/v1/wallets/deposit/initiate
// @access  Private
export const initiateDeposit = async (req, res, next) => {
  try {
    // Allow optional frontend/backend URL overrides when testing locally.
    const options = {
      frontendUrl: req.body.frontendUrl,
      backendUrl: req.body.backendUrl,
    };
    const data = await walletService.initiateDeposit(req.user.id, req.user, req.body.amount, options);
    res.status(200).json({ success: true, data });
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

// @desc    Mark a pending deposit as failed/cancelled from frontend popup events
// @route   POST /api/v1/wallets/deposit/fail
// @access  Private
export const markDepositFailed = async (req, res, next) => {
  try {
    const { orderId, reason } = req.body;
    const transaction = await walletService.markDepositFailed(req.user.id, orderId, reason);
    res.status(200).json({ success: true, data: { message: 'Deposit status updated', transaction } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get status of a deposit order
// @route   GET /api/v1/wallets/deposit/status/:orderId
// @access  Private
export const getDepositStatus = async (req, res, next) => {
  try {
    const data = await walletService.getDepositStatus(req.user.id, req.params.orderId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Local/sandbox fallback confirmation from client callback
// @route   POST /api/v1/wallets/deposit/confirm-client
// @access  Private
export const confirmDepositFromClient = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const data = await walletService.confirmDepositFromClientCallback(req.user.id, orderId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Invest in a Startup (Atomic Transfer)
// @route   POST /api/v1/wallets/invest
// @access  Private
export const investInStartup = async (req, res, next) => {
  try {
    const { amount, startupId, startupOwnerId } = req.body;
    await walletService.executeInvestment(req.user, amount, startupId, startupOwnerId);
    res.status(200).json({ success: true, data: { message: 'Investment successful' } });
  } catch (error) {
    next(error);
  }
};

// @desc    Founder monthly payout to investor (Atomic Transfer)
// @route   POST /api/v1/wallets/payout
// @access  Private
export const payoutToInvestor = async (req, res, next) => {
  try {
    const { amount, startupId, investorId, requestId } = req.body;
    await walletService.executeFounderPayout(req.user, amount, startupId, investorId, requestId);
    res.status(200).json({ success: true, data: { message: 'Monthly payout successful' } });
  } catch (error) {
    next(error);
  }
};

// @desc    Purchase subscription from wallet (Investor Pro / Founder Pro / Pro Max)
// @route   POST /api/v1/wallets/subscription/purchase
// @access  Private
export const purchaseSubscriptionFromWallet = async (req, res, next) => {
  try {
    const data = await walletService.purchaseSubscriptionFromWallet(
      req.user.id,
      req.body.packageType
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate subscription package for current user
// @route   POST /api/v1/wallets/subscription/deactivate
// @access  Private
export const deactivateSubscriptionPackage = async (req, res, next) => {
  try {
    const data = await walletService.deactivateSubscriptionPackage(
      req.user.id,
      req.body.packageType
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate direct investment checkout to PayHere merchant account
// @route   POST /api/v1/wallets/investment/initiate
// @access  Private
export const initiateInvestmentCheckout = async (req, res, next) => {
  try {
    const options = {
      frontendUrl: req.body.frontendUrl,
      backendUrl: req.body.backendUrl,
    };
    const data = await walletService.initiateInvestmentCheckout(
      req.user,
      {
        amount: req.body.amount,
        startupId: req.body.startupId,
        startupOwnerId: req.body.startupOwnerId,
        requestId: req.body.requestId,
      },
      options
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};