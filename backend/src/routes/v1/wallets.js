import { Router } from 'express';
import {
  getMyWallet,
  initiateDeposit,
  purchaseSubscriptionFromWallet,
  deactivateSubscriptionPackage,
  initiateInvestmentCheckout,
  payhereNotify,
  markDepositFailed,
  getDepositStatus,
  confirmDepositFromClient,
  investInStartup,
  payoutToInvestor,
  getWalletHistory,
} from '../../controllers/walletController.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', protect, getMyWallet);
router.get('/transactions', protect, getWalletHistory);

router.post('/deposit/initiate', protect, initiateDeposit);
router.post('/subscription/purchase', protect, purchaseSubscriptionFromWallet);
router.post('/subscription/deactivate', protect, deactivateSubscriptionPackage);
router.post('/investment/initiate', protect, initiateInvestmentCheckout);
router.post('/deposit/fail', protect, markDepositFailed);
router.get('/deposit/status/:orderId', protect, getDepositStatus);
router.post('/deposit/confirm-client', protect, confirmDepositFromClient);
router.post('/notify', payhereNotify);
router.post('/invest', protect, investInStartup);
router.post('/payout', protect, payoutToInvestor);

export default router;
