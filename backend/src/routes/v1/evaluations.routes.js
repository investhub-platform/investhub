import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import * as evaluationController from "../../controllers/evaluationController.js";

const router = Router();

router.post("/generate", protect, evaluationController.generateEvaluation);
router.get("/:startupId", protect, evaluationController.getEvaluation);
router.put("/:startupId", protect, evaluationController.updateEvaluation);
router.delete("/:startupId", protect, evaluationController.deleteEvaluation);

export default router;
