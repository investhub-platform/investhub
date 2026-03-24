import { Router } from 'express';
import {
  getMyWallet,
  initiateDeposit,
  payhereNotify,
  markDepositFailed,
  getDepositStatus,
  investInStartup,
  getWalletHistory,
} from '../../controllers/walletController.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', protect, getMyWallet);
router.get('/transactions', protect, getWalletHistory);

router.post('/deposit/initiate', protect, initiateDeposit);
router.post('/deposit/fail', protect, markDepositFailed);
router.get('/deposit/status/:orderId', protect, getDepositStatus);
router.post('/notify', payhereNotify);
router.post('/invest', protect, investInStartup);

export default router;
