import * as startupService from "../services/startupService.js";

/**
 * StartupController
 * Handles HTTP requests and responses
 * Delegates business logic to startupService
 */

/**
 * List all startups (exclude soft-deleted)
 * GET /startups
 */
export const listStartups = async (_req, res, next) => {
  try {
    const data = await startupService.getAllStartups();
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Get startup by ID
 * GET /startups/:id
 */
export const getStartup = async (req, res, next) => {
  try {
    const data = await startupService.getStartupById(req.params.id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Get startups by UserID
 * GET /startups/user/:userId
 */
export const getStartupsByUser = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user?.id;
    const data = await startupService.getStartupsByUserId(userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Get startups by status
 * GET /startups/status/:status
 */
export const getStartupsByStatusController = async (req, res, next) => {
  try {
    const data = await startupService.getStartupsByStatus(req.params.status);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new startup
 * POST /startups
 */
export const createStartup = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const data = await startupService.createNewStartup(req.body, userId);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a startup by ID
 * PUT /startups/:id
 */
export const updateStartup = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const data = await startupService.updateExistingStartup(
      req.params.id,
      req.body,
      userId
    );
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve a startup by ID
 * PATCH /startups/:id/approve
 */
export const approveStartup = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const data = await startupService.approveStartup(req.params.id, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a startup by ID
 * PATCH /startups/:id/reject
 */
export const rejectStartup = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const data = await startupService.rejectStartup(req.params.id, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete (soft delete) a startup by ID
 * DELETE /startups/:id
 */
export const deleteStartup = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const data = await startupService.deleteStartup(req.params.id, userId);
    res.json({ message: "Startup deleted successfully", data });
  } catch (error) {
    next(error);
  }
};
