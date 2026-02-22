import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/requireRole.js";
import * as ideaController from "../../controllers/ideaController.js";

const router = Router();

// Auth required
router.use(requireAuth);

// Routes
router.get("/", ideaController.listIdeas);
router.get("/startup/:StartupId", ideaController.getIdeasByStartup);
router.get("/:id", ideaController.getIdea);
 
router.post("/", ideaController.createIdea);
router.put("/:id", ideaController.updateIdea);
router.delete("/:id", ideaController.deleteIdea);

// Mentor review route (only mentors)
router.patch("/:id/mentor-decision", requireRole("mentor"), ideaController.mentorDecision);

export default router;
