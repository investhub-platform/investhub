//src/route/v1/index.js
import { Router } from "express";
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
  setMentorDecision
} from "../../controllers/requestController.js";

const router = Router();

// Health check
router.get("/health", (_req, res) => res.json({ ok: true }));

// Startup routes
router.get("/startups", listStartups); // list all startups
router.get("/startups/user/:userId", getStartupsByUser); // get startups by user ID
router.get("/startups/status/:status", getStartupsByStatusController); // get startups by status
router.get("/startups/:id", getStartup); // get a single startup by ID
router.post("/startups", createStartup); // create a new startup
router.put("/startups/:id", updateStartup); // update a startup completely
router.patch("/startups/:id/approve", approveStartup); // approve a startup
router.patch("/startups/:id/reject", rejectStartup); // reject a startup
router.delete("/startups/:id", deleteStartup); // soft delete a startup

// Request routes
router.get("/requests", listRequests); // list all requests
router.get("/requests/:id", getRequest); // get a single request by ID
router.post("/requests", createRequest); // create a new request
router.put("/requests/:id", updateRequest); // update a request completely
router.patch("/requests/:id/withdraw", withdrawRequest); // withdraw a request
router.patch("/requests/:id/founder-decision", setFounderDecision); // set founder decision
router.patch("/requests/:id/mentor-decision", setMentorDecision); // set mentor decision

export default router;
