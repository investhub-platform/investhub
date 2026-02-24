import Idea from "../models/Idea.js";

/**
 * ideaRepository
 * Handles all database queries
 */

/**
 * Find all records (Ideas + Investment Plans)
 */
export const findAllRecords = async () => {
  return await Idea.find({ deletedUtc: null }).lean();
};

/**
 * Find all Ideas only
 */
export const findAllIdeasOnly = async () => {
  return await Idea.find({ deletedUtc: null, isIdea: true }).lean();
};

/**
 * Find all Investment Plans only
 */
export const findAllPlansOnly = async () => {
  return await Idea.find({ deletedUtc: null, isIdea: false }).lean();
};

/**
 * Find by ID
 */
export const findById = async (id) => {
  return await Idea.findById(id);
};

/**
 * Find by StartupId
 */
export const findByStartupId = async (StartupId) => {
  return await Idea.find({ StartupId, deletedUtc: null }).lean();
};

/**
 * Create a new Idea
 */
export const create = async (payload) => {
  return await Idea.create(payload);
};

/**
 * Save an existing Idea document (with hooks)
 */
export const save = async (doc) => {
  return await doc.save();
};

/**
 * Update by ID directly (atomic)
 */
export const updateById = async (id, payload) => {
  return await Idea.findByIdAndUpdate(id, payload, { new: true });
};