import * as ideaRepository from "../repositories/ideaRepository.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

/**
 * Idea Service
 * Handles business logic for Idea operations
 * All database queries delegate to idea Repository
 */

/**
 * Get all ideas (excluding deleted)
 */
export const getAllIdeas = async (filter = {}) => {
  try {
    return await ideaRepository.findAll(filter);
  } catch (error) {
    throw new AppError("Failed to fetch ideas", 500);
  }
};

/**
 * Get a single idea by ID
 */
export const getIdeaById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid idea ID", 400);
  }

  const idea = await ideaRepository.findById(id);
  if (!idea) throw new AppError("Idea not found", 404);

  return idea;
};

export const getIdeasByStartupId = async (StartupId) => {
  if (!mongoose.Types.ObjectId.isValid(StartupId)) {
    throw new AppError("Invalid Startup ID", 400);
  }

  const ideas = await ideaRepository.findByStartupId(StartupId);

  if (!ideas || ideas.length === 0) {
    throw new AppError("No ideas found for this Startup", 404);
  }

  return ideas;
};

/**
 * Create a new idea
 */
export const createNewIdea = async ({ userId, ...data }) => {
  if (
    !userId ||
    !data.StartupId ||
    !data.title ||
    !data.description ||
    !data.category ||
    data.budget == null
  ) {
    throw new AppError("Missing required fields", 400);
  }

  const ideaPayload = {
    ...data,
    createdBy: userId,
    updatedBy: userId,
    createdUtc: new Date(),
    updatedUtc: new Date(),
    currentVersion: 1,
    status: "pending_review",
  };

  return await ideaRepository.create(ideaPayload);
};

/**
 * Update an existing idea
 */
export const updateIdea = async (id, { userId, ...data }) => {
  const idea = await ideaRepository.findById(id);
  if (!idea) throw new AppError("Idea not found", 404);

  Object.assign(idea, data);

  idea.updatedBy = userId;
  idea.updatedUtc = new Date();
  idea.currentVersion += 1;
  idea.status = "pending_review";

  return await ideaRepository.save(idea);
};

/**
 * Delete (archive) an idea
 */
export const deleteIdea = async (id, userId) => {
  const idea = await ideaRepository.findById(id);
  if (!idea) throw new AppError("Idea not found", 404);

  idea.status = "archived";
  idea.deletedUtc = new Date();
  idea.deletedBy = userId;
  idea.updatedUtc = new Date();
  idea.updatedBy = userId;

  return await ideaRepository.save(idea);
};

/**
 * Mentor decision: approve or reject
 */
export const setMentorDecision = async (id, { decision, userId }) => {
  const idea = await ideaRepository.findById(id);
  if (!idea) throw new AppError("Idea not found", 404);

  if (!["approved", "rejected"].includes(decision)) {
    throw new AppError("Decision must be 'approved' or 'rejected'", 400);
  }

  idea.status = decision;
  idea.updatedBy = userId;
  idea.updatedUtc = new Date();

  return await ideaRepository.save(idea);
};