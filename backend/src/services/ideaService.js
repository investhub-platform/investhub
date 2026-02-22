import * as ideaRepository from "../repositories/ideaRepository.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
import { generateIdeaSummary } from "./aiService.js";
import * as notificationService from "./notificationService.js";
import * as userRepo from "../repositories/userRepository.js";
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

  // Generate AI Summary
  let aiSummary = null;

  try {
    aiSummary = await generateIdeaSummary(data);
  } catch (error) {
    console.error("AI summary generation failed:", error.message);
  }

  const ideaPayload = {
    ...data,
    createdBy: userId,
    updatedBy: userId,
    createdUtc: new Date(),
    updatedUtc: new Date(),
    currentVersion: 1,
    status: "pending_review",
    aiSummary,
    aiGeneratedAt: aiSummary ? new Date() : null
  };

  const createdIdea = await ideaRepository.create(ideaPayload);

  // ✅ Notify Admins + Matching Mentors (by category = expertise)
  const [admins, mentors] = await Promise.all([
    userRepo.findByRole("admin"),
    userRepo.findActiveMentorsByExpertise(createdIdea.category),
  ]);

  const recipients = [...admins, ...mentors]
    .filter((u, i, arr) => arr.findIndex(x => x._id.toString() === u._id.toString()) === i)
    .filter((u) => u._id.toString() !== userId.toString());

  await Promise.all(
    recipients.map((u) =>
      notificationService.notifyUser({
        recipientUserId: u._id,
        type: "idea_submitted",
        title: "New idea pending review",
        message: `New idea "${createdIdea.title}" is pending review (Category: ${createdIdea.category}).`,
        relatedId: createdIdea._id,
        actionUrl: `/ideas/${createdIdea._id}`,
        createdBy: userId,
      })
       )
  );

  return createdIdea;
};

/**
 * Update an existing idea
 */
export const updateIdea = async (id, { userId, regenerateAI, ...data }) => {
  // Fetch the idea
  const idea = await ideaRepository.findById(id);
  if (!idea) throw new AppError("Idea not found", 404);

  // Keep track of which fields are updated
  const keyFields = ["title", "description", "category", "budget", "timeline", "expectedOutcomes"];
  const isKeyFieldUpdated = keyFields.some((field) => field in data);

  // Apply updates
  Object.assign(idea, data);

  idea.updatedBy = userId;
  idea.updatedUtc = new Date();
  idea.currentVersion += 1;
  idea.status = "pending_review";

  //   Regenerate AI summary if:
  // - Frontend explicitly requested it, OR
  // - Any key field has changed, OR
  // - AI summary is missing (null)
  if (regenerateAI || isKeyFieldUpdated || !idea.aiSummary) {
    try {
      const aiSummary = await generateIdeaSummary({
        title: idea.title,
        description: idea.description,
        category: idea.category,
        budget: idea.budget,
        timeline: idea.timeline,
        expectedOutcomes: idea.expectedOutcomes,
      });

      idea.aiSummary = aiSummary;
      idea.aiGeneratedAt = new Date();
    } catch (error) {
      console.error("AI regeneration failed:", error.response?.data || error.message);
      // Do not fail the update if AI fails — just leave old summary
    }
  }

  // Save updated idea
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

  await ideaRepository.save(idea);

  // 🔔 Notify idea owner
await notificationService.notifyUser({
  recipientUserId: idea.createdBy,
  type: "idea_reviewed",
  title: decision === "approved"
    ? "Your idea was approved 🎉"
    : "Your idea was rejected",
  message: `Your idea "${idea.title}" was ${decision} by a mentor.`,
  relatedId: idea._id,
  actionUrl: `/ideas/${idea._id}`,
  createdBy: userId,
});

return idea;
};