import * as startupService from "../services/startupService.js";

/**
 * StartupController
 * Handles HTTP requests and responses
 * Delegates business logic to startupService
 */

/**
 * List all startups
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
 * Create a new startup
 * POST /startups
 */
export const createStartup = async (req, res, next) => {
  try {
    const data = await startupService.createNewStartup(req.body);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};
