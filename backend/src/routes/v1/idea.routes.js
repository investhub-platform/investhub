// routes/v1/idea.routes.js
import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/requireRole.js";
import * as ideaController from "../../controllers/ideaController.js";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Routes
router.get("/", ideaController.listAll);                  // GET /ideas = all ideas + plans
router.get("/all", ideaController.listIdeasOnly);        // GET /ideas/all = only ideas
router.get("/plans", ideaController.listPlansOnly);      // GET /ideas/plans = only investment plans
router.get("/startup/:StartupId", ideaController.getIdeasByStartup); // ideas by startup
router.get("/:id", ideaController.getSingle);            // single record by ID

// CRUD
router.post("/", ideaController.createIdea);
router.put("/:id", ideaController.updateIdea);
router.delete("/:id", ideaController.deleteIdea);

// Mentor review route
router.patch("/:id/user-decision", requireRole("user"), ideaController.userDecision);

export default router;