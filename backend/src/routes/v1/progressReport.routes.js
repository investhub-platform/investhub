import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import * as controller from "../../controllers/progressReportController.js";

const router = Router();
router.use(requireAuth);

// CRUD
router.get("/", controller.listAll);
router.get("/idea/:ideaId", controller.getByIdea);
router.get("/:id", controller.getSingle);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

// Startup Owner Dashboard
router.get("/dashboard/startup", controller.getStartupDashboard);

export default router;