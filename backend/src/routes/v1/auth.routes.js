import { Router } from "express";
import * as authController from "../../controllers/authController.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/verify-email", authController.verifyEmailOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/resend-email-otp", authController.resendEmailOtp);



export default router;
