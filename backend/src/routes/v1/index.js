//src/route/v1/index.js
import { Router } from "express";
import { body } from "express-validator";
import {
  listStartups,
  getStartup,
  getStartupsByUser,
  getStartupsByStatusController,
  createStartup,
  updateStartup,
  approveStartup,
  rejectStartup,
  deleteStartup
} from "../../controllers/startupController.js";

import {
  listRequests,
  getRequest,
  createRequest,
  updateRequest,
  withdrawRequest,
  setFounderDecision,
  setInvestorDecision,
  setMentorDecision,
  getRequestsByStartup,
  getRequestsByInvestor,
  getRequestsByIdea,
  setRequestStatus
} from "../../controllers/requestController.js";
import { handlePostAssetsUpload } from "../../middlewares/upload.middleware.js";

//user management
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import adminRoutes from "./admin.routes.js";
import ideaRoutes from "./idea.routes.js";

//notification management
import notificationRoutes from "./notification.routes.js";
import adminNotificationRoutes from "./adminNotification.routes.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/requireRole.js";
import validateRequest from "../../middlewares/validateRequest.js";

const router = Router();

// Health check
router.get("/health", (_req, res) => res.json({ ok: true }));

// Startup routes
router.get("/startups", listStartups); // list all startups
router.get("/startups/user/:userId", getStartupsByUser); // get startups by user ID
router.get("/startups/status/:status", getStartupsByStatusController); // get startups by status
router.get("/startups/:id", getStartup); // get a single startup by ID
router.post(
  "/startups",
  protect,
  handlePostAssetsUpload,
  body("name").trim().notEmpty().withMessage("name is required"),
  body("businessRegistration").optional().isString(),
  body("status").optional().isIn(["Approved", "NotApproved", "pending"]),
  validateRequest,
  createStartup
); // create a new startup
router.put(
  "/startups/:id",
  protect,
  handlePostAssetsUpload,
  body("name").optional().trim().notEmpty().withMessage("name cannot be empty"),
  body("status").optional().isIn(["Approved", "NotApproved", "pending"]),
  validateRequest,
  updateStartup
); // update a startup completely
router.patch("/startups/:id/approve", protect, requireRole("admin"), approveStartup); // approve a startup
router.patch("/startups/:id/reject", protect, requireRole("admin"), rejectStartup); // reject a startup
router.delete("/startups/:id", protect, deleteStartup); // soft delete a startup

import wallets from "./wallets.js";
import eventsRoutes from "./events.routes.js";
import evaluationsRoutes from "./evaluations.routes.js";
import payhereRoutes from "./payhere.routes.js";

//ProgressReport routes
import progressReportRoutes from "./progressReport.routes.js";

// Wallet routes
router.use("/wallets", wallets);

// PayHere redirect endpoints (return/cancel)
router.use('/payhere', payhereRoutes);

// Event routes
router.use("/events", eventsRoutes);

// Evaluation routes
router.use("/evaluations", evaluationsRoutes);

// Request routes
router.get("/requests", listRequests); // list all requests
router.get("/requests/:id", getRequest); // get a single request by ID
router.post(
  "/requests",
  protect,
  body("investorId").isMongoId().withMessage("investorId must be a valid Mongo id"),
  body("founderId").isMongoId().withMessage("founderId must be a valid Mongo id"),
  body("ideaId").isMongoId().withMessage("ideaId must be a valid Mongo id"),
  body("direction").isIn(["investor_to_startup", "startup_to_investor"]).withMessage("direction is invalid"),
  body("amount").isFloat({ gt: 0 }).withMessage("amount must be greater than 0"),
  body("fundingType").isIn(["Equity", "Revenue Share", "SAFE"]).withMessage("fundingType is invalid"),
  body("proposedPercentage")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage("proposedPercentage must be between 0 and 100"),
  body("proposedPercentage").custom((value, { req }) => {
    if (req.body.fundingType === "SAFE") return true;
    return value !== undefined && value !== null && value !== "";
  }).withMessage("proposedPercentage is required for Equity and Revenue Share"),
  body("acceptedTerms").isBoolean().withMessage("acceptedTerms is required").toBoolean().custom((value) => value === true).withMessage("acceptedTerms must be accepted"),
  validateRequest,
  createRequest
); // create a new request
router.put("/requests/:id", protect, updateRequest); // update a request completely
router.patch("/requests/:id/withdraw", protect, withdrawRequest); // withdraw a request
router.patch("/requests/:id/founder-decision", protect, setFounderDecision); // set founder decision
router.patch("/requests/:id/investor-decision", protect, setInvestorDecision); // set investor decision
router.patch("/requests/:id/mentor-decision", protect, setMentorDecision); // set mentor decision
router.patch("/requests/:id/status", protect, setRequestStatus); // set request status (approved/rejected/withdrawn)
router.get("/requests/startup/:startupId", getRequestsByStartup); // get requests for a startup
router.get("/requests/investor/:investorId", getRequestsByInvestor); // get requests for an investor
router.get("/requests/idea/:ideaId", getRequestsByIdea); // get requests for an idea

//user
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

//admin
router.use("/admin", adminRoutes);

//notification
router.use("/notifications", notificationRoutes);
router.use("/admin", adminNotificationRoutes);

// Idea routes
router.use("/ideas", ideaRoutes);

// Progress Reports
router.use("/progress-reports", progressReportRoutes);

// Portfolio routes
import portfolioRoutes from "./portfolio.routes.js";
router.use("/portfolios", portfolioRoutes);

export default router;
