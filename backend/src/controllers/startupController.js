import * as startupService from "../services/startupService.js";

const toAssetPath = (file) => (file ? `/uploads/posts/${file.filename}` : null);

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
    const { data, meta } = await startupService.getAllStartups({
      page: _req.query.page,
      limit: _req.query.limit,
      q: _req.query.q,
    });
    res.status(200).json({ success: true, data, meta });
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
    res.status(200).json({ success: true, data });
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
    res.status(200).json({ success: true, data });
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
    res.status(200).json({ success: true, data });
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
    const photoFile = req.files?.photo?.[0] || null;
    const payload = {
      ...req.body,
      ...(photoFile ? { imgUrl: toAssetPath(photoFile) } : {})
    };
    const data = await startupService.createNewStartup(payload, userId);
    res.status(201).json({ success: true, data });
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
    const photoFile = req.files?.photo?.[0] || null;
    const payload = {
      ...req.body,
      ...(photoFile ? { imgUrl: toAssetPath(photoFile) } : {})
    };
    const data = await startupService.updateExistingStartup(
      req.params.id,
      payload,
      userId
    );
    res.status(200).json({ success: true, data });
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
    res.status(200).json({ success: true, data });
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
    res.status(200).json({ success: true, data });
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
    res.status(200).json({
      success: true,
      data: { message: "Startup deleted successfully", startup: data },
    });
  } catch (error) {
    next(error);
  }
};
