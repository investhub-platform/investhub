import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import * as userController from "../../controllers/userController.js";
import { handleAvatarUpload } from "../../middlewares/upload.middleware.js";

const router = Router();

router.get("/me", requireAuth, userController.getMe);
router.post("/me/avatar", requireAuth, handleAvatarUpload, userController.uploadAvatar);
router.patch("/me", requireAuth, userController.updateMe);
router.delete("/me", requireAuth, userController.deleteMe);

export default router;
