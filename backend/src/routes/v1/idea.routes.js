// routes/v1/idea.routes.js
import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { handlePostAssetsUpload } from "../../middlewares/upload.middleware.js";
import validateRequest from "../../middlewares/validateRequest.js";
import * as ideaController from "../../controllers/ideaController.js";

const router = Router();


// Public read routes (no auth required) — allow the frontend to list ideas
router.get("/", ideaController.listAll);                  // GET /ideas = all ideas + plans
router.get("/all", ideaController.listIdeasOnly);        // GET /ideas/all = only ideas
router.get("/plans", ideaController.listPlansOnly);      // GET /ideas/plans = only investment plans
router.get("/startup/:StartupId", ideaController.getIdeasByStartup); // ideas by startup
router.get("/:id", ideaController.getSingle);            // single record by ID

// Protect write routes with authentication
router.use(requireAuth);

// CRUD (protected)
router.post(
	"/",
	handlePostAssetsUpload,
	body("title").trim().notEmpty().withMessage("title is required"),
	body("description").trim().notEmpty().withMessage("description is required"),
	body("category").isIn(["Tech", "Health", "Education", "Finance", "Agriculture", "Other"]).withMessage("category is invalid"),
	body("fundingType").isIn(["Equity", "Revenue Share", "SAFE"]).withMessage("fundingType is invalid"),
	validateRequest,
	ideaController.createIdea
);
router.put(
	"/:id",
	handlePostAssetsUpload,
	body("title").optional().trim().notEmpty().withMessage("title cannot be empty"),
	body("description").optional().trim().notEmpty().withMessage("description cannot be empty"),
	body("category").optional().isIn(["Tech", "Health", "Education", "Finance", "Agriculture", "Other"]).withMessage("category is invalid"),
	body("fundingType").optional().isIn(["Equity", "Revenue Share", "SAFE"]).withMessage("fundingType is invalid"),
	validateRequest,
	ideaController.updateIdea
);
router.delete("/:id", ideaController.deleteIdea);

// Mentor review route (requires auth + role)
router.patch("/:id/user-decision", requireRole("user"), ideaController.userDecision);

export default router;