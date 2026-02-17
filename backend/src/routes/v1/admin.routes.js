import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/requireRole.js";
import * as adminController from "../../controllers/adminUserController.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/users", adminController.listUsers);
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

export default router;
