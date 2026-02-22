import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import * as notificationController from "../../controllers/notificationController.js";

const router = Router();

router.use(requireAuth);

router.get("/", notificationController.listMyNotifications);
router.get("/unread-count", notificationController.unreadCount);
router.patch("/:id/read", notificationController.markRead);
router.patch("/read-all", notificationController.markAllRead);
router.delete("/:id", notificationController.deleteOne);

export default router;
