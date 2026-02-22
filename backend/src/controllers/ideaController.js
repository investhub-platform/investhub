import * as ideaService from "../services/ideaService.js";

/**
 * Idea Controller
 * Handles HTTP requests and responses
 * Delegates business logic to Idea Service
 */

/**
 * List all ideas
 * GET /ideas
 */
export const listIdeas = async (req, res, next) => {
  try {
    const ideas = await ideaService.getAllIdeas();
    res.json({ success: true, data: ideas });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single idea by ID
 * GET /ideas/:id
 */
export const getIdea = async (req, res, next) => {
  try {
    const idea = await ideaService.getIdeaById(req.params.id);
    res.json({ success: true, data: idea });
  } catch (err) {
    next(err);
  }
};

/**
 * Get ideas with StartUpId
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
 * Create a new idea
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
 * Update an existing idea
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
 * Delete (archive) an idea
 * DELETE /ideas/:id
 */
export const deleteIdea = async (req, res, next) => {
  try {
    await ideaService.deleteIdea(req.params.id, req.user.id);
    res.json({ success: true, message: "Idea archived and delete successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Mentor decision (approve or reject)
 * PATCH /ideas/:id/mentor-decision
 */
export const mentorDecision = async (req, res, next) => {
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