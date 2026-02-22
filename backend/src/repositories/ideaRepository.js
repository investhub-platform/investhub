import Idea from "../models/Idea.js";

/**
 * ideaRepository.js
 * Handles all database queries for Idea model
 * No business logic - only database operations
 */

// Find all ideas (excluding archived or deleted)
export const findAll = async (filter = {}) => {
  return await Idea.find({ deletedUtc: null, ...filter }).lean();
};

// Find by ID (for reading)
export const findById = async (id) => {
  return await Idea.findById(id);
};

// Find by ID (for update/modification)
export const findByIdForUpdate = async (id) => {
  return await Idea.findById(id);
};

// Find all idea with specific StartupId
export const findByStartupId = async (StartupId) => {
  return await Idea.find({
    StartupId: StartupId,
    deletedUtc: null
  });
};

// Create a new idea
export const create = async (payload) => {
  return await Idea.create(payload);
};

// Save a modified idea document
export const save = async (doc) => {
  return await doc.save();
};

// Update an idea by ID directly (atomic update)
export const updateById = async (id, payload) => {
  return await Idea.findByIdAndUpdate(id, payload, { new: true });
};