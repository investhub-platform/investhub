// controllers/ideaController.js
import * as ideaService from "../services/ideaService.js";

/**
 * Idea Controller
 * Handles HTTP requests and responses
 * Delegates business logic to Idea Service
 */

/**
 * List ALL (Ideas + Investment Plans)
 * GET /ideas
 */
export const listAll = async (req, res, next) => {
  try {
    const records = await ideaService.getAllRecords();
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

/**
 * List all Ideas only
 * GET /ideas/all
 */
export const listIdeasOnly = async (req, res, next) => {
  try {
    const ideas = await ideaService.getAllIdeasOnly();
    res.json({ success: true, data: ideas });
  } catch (err) {
    next(err);
  }
};

/**
 * List all Investment Plans only
 * GET /ideas/plans
 */
export const listPlansOnly = async (req, res, next) => {
  try {
    const plans = await ideaService.getAllPlansOnly();
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

/**
 * Get ideas by StartupId
 * GET /ideas/startup/:StartupId
 */
export const getIdeasByStartup = async (req, res, next) => {
  try {
    const ideas = await ideaService.getIdeasByStartupId(req.params.StartupId);
    res.json({ success: true, data: ideas });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single Idea or Investment Plan
 * GET /ideas/:id
 */
export const getSingle = async (req, res, next) => {
  try {
    const record = await ideaService.getSingleRecord(req.params.id);
    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

/**
 * Create new Idea or Investment Plan
 * POST /ideas
 */
export const createIdea = async (req, res, next) => {
  try {
    const idea = await ideaService.createNewIdea({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ success: true, data: idea });
  } catch (err) {
    next(err);
  }
};

/**
 * Update existing Idea or Plan
 * PUT /ideas/:id
 */
export const updateIdea = async (req, res, next) => {
  try {
    const idea = await ideaService.updateIdea(req.params.id, {
      userId: req.user.id,
      ...req.body
    });
    res.json({ success: true, data: idea });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete (archive) Idea or Plan
 * DELETE /ideas/:id
 */
export const deleteIdea = async (req, res, next) => {
  try {
    await ideaService.deleteIdea(req.params.id, req.user.id);
    res.json({ success: true, message: "Record delete successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Mentor decision: approve or reject
 * PATCH /ideas/:id/mentor-decision
 */
export const userDecision = async (req, res, next) => {
  try {
    const idea = await ideaService.setMentorDecision(req.params.id, {
      userId: req.user.id,
      ...req.body
    });
    res.json({ success: true, data: idea });
  } catch (err) {
    next(err);
  }
};