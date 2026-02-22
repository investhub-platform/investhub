import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/requireRole.js";
import * as adminNotificationController from "../../controllers/adminNotificationController.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.post("/notifications", adminNotificationController.createNotification);

export default router;
