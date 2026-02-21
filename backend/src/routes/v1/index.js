import { Router } from "express";
import {
  listStartups,
  createStartup
} from "../../controllers/startupController.js";
import {
  listRequests,
  getRequest,
  createRequest,
  updateRequest,
  withdrawRequest,
  setFounderDecision,
  setMentorDecision
} from "../../controllers/requestController.js";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import adminRoutes from "./admin.routes.js";
import ideaRoutes from "./idea.routes.js";

const router = Router();

// Health check
router.get("/health", (_req, res) => res.json({ ok: true }));

// Startup routes
router.get("/startups", listStartups);
router.post("/startups", createStartup);

import wallets from './wallets.js';
import eventsRoutes from './events.routes.js';
import evaluationsRoutes from './evaluations.routes.js';

// Wallet routes
router.use('/wallets', wallets);

// Event routes
router.use('/events', eventsRoutes);

// Evaluation routes
router.use('/evaluations', evaluationsRoutes);

// Request routes
router.get("/requests", listRequests); // list all requests
router.get("/requests/:id", getRequest); // get a single request by ID
router.post("/requests", createRequest); // create a new request
router.put("/requests/:id", updateRequest); // update a request completely
router.patch("/requests/:id/withdraw", withdrawRequest); // withdraw a request
router.patch("/requests/:id/founder-decision", setFounderDecision); // set founder decision
router.patch("/requests/:id/mentor-decision", setMentorDecision); // set mentor decision

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

router.use("/admin", adminRoutes);

// Idea routes
router.use("/ideas", ideaRoutes);


export default router;
