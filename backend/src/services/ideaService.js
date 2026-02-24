import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import * as ideaRepository from "../repositories/ideaRepository.js";
import { generateIdeaSummary } from "./aiService.js";

/**
 * Idea Service
 * Handles business logic for Idea operations
 */

/**
 * Get all records (Ideas + Investment Plans)
 */
export const getAllRecords = async () => {
  return await ideaRepository.findAllRecords();
};

/**
 * Get all Ideas only
 */
export const getAllIdeasOnly = async () => {
  return await ideaRepository.findAllIdeasOnly();
};

/**
 * Get all Investment Plans only
 */
export const getAllPlansOnly = async () => {
  return await ideaRepository.findAllPlansOnly();
};

/**
 * Get single record by ID
 */
export const getSingleRecord = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid ID", 400);
  }
  const record = await ideaRepository.findById(id);
  if (!record) throw new AppError("Record not found", 404);
  return record;
};

/**
 * Get Ideas by StartupId
 */
export const getIdeasByStartupId = async (StartupId) => {
  if (!mongoose.Types.ObjectId.isValid(StartupId)) {
    throw new AppError("Invalid Startup ID", 400);
  }
  const ideas = await ideaRepository.findByStartupId(StartupId);
  return ideas;
};

/**
 * Create a new Idea or Investment Plan
 */
export const createNewIdea = async ({ userId, ...data }) => {
  if (!userId || !data.title || !data.description || !data.category || data.budget == null) {
    throw new AppError("Missing required fields", 400);
  }

  const isIdea = data.isIdea !== undefined ? data.isIdea : true;

  if (isIdea && !data.StartupId) {
    throw new AppError("StartupId is required for Idea", 400);
  }
  if (!isIdea && data.StartupId) {
    throw new AppError("Investment Plan should not have StartupId", 400);
  }

  // Generate AI summary
  let aiSummary = null;
  try {
    aiSummary = await generateIdeaSummary({ ...data, isIdea });
  } catch (err) {
    console.error("AI summary generation failed:", err.message);
  }

  const payload = {
    ...data,
    isIdea,
    createdBy: userId,
    updatedBy: userId,
    createdUtc: new Date(),
    updatedUtc: new Date(),
    currentVersion: 1,
    status: "pending_review",
    aiSummary,
    aiGeneratedAt: aiSummary ? new Date() : null
  };

  return await ideaRepository.create(payload);
};

/**
 * Update an existing Idea or Investment Plan
 */
export const updateIdea = async (id, { userId, regenerateAI, ...data }) => {
  const idea = await ideaRepository.findById(id);
  if (!idea) throw new AppError("Idea not found", 404);

  const keyFields = ["title", "description", "category", "budget", "timeline", "expectedOutcomes"];
  const isKeyFieldUpdated = keyFields.some((field) => field in data);

  Object.assign(idea, data);
  idea.updatedBy = userId;
  idea.updatedUtc = new Date();
  idea.currentVersion += 1;
  idea.status = "pending_review";

  if (regenerateAI || isKeyFieldUpdated || !idea.aiSummary) {
    try {
      const aiSummary = await generateIdeaSummary({
        title: idea.title,
        description: idea.description,
        category: idea.category,
        budget: idea.budget,
        timeline: idea.timeline,
        expectedOutcomes: idea.expectedOutcomes
      });
      idea.aiSummary = aiSummary;
      idea.aiGeneratedAt = new Date();
    } catch (err) {
      console.error("AI regeneration failed:", err.message);
    }
  }

  return await ideaRepository.save(idea);
};

/**
 * Delete (archive) an Idea
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
 * Mentor decision: approve/reject
 */
export const setMentorDecision = async (id, { decision, userId }) => {
  const idea = await ideaRepository.findById(id);
  if (!idea) throw new AppError("Record not found", 404);

  if (!["approved", "rejected"].includes(decision)) {
    throw new AppError("Decision must be 'approved' or 'rejected'", 400);
  }

  idea.status = decision;
  idea.updatedBy = userId;
  idea.updatedUtc = new Date();

  return await ideaRepository.save(idea);
};