import Startup from "../models/Startup.js";

/**
 * StartupRepository
 * Handles all database queries for Startup model
 * No business logic - only database operations
 */

/**
 * Find all startups (excluding soft-deleted)
 */
export const findAll = async () => {
  return await Startup.find({ deletedUtc: null }).lean();
};

/**
 * Find startup by ID
 */
export const findById = async (id) => {
  return await Startup.findById(id).lean();
};

/**
 * Find startups by UserID
 */
export const findByUserId = async (userId) => {
  return await Startup.find({ UserID: userId, deletedUtc: null }).lean();
};

/**
 * Find startups by status
 */
export const findByStatus = async (status) => {
  return await Startup.find({ status, deletedUtc: null }).lean();
};

/**
 * Create a new startup
 */
export const create = async (payload) => {
  return await Startup.create(payload);
};

/**
 * Update startup by ID
 */
export const updateById = async (id, payload) => {
  return await Startup.findByIdAndUpdate(id, payload, { new: true });
};

/**
 * Find startup by ID for full document updates (not lean)
 */
export const findByIdForUpdate = async (id) => {
  return await Startup.findById(id);
};

/**
 * Save a startup document
 */
export const save = async (doc) => {
  return await doc.save();
};

/**
 * Delete (soft delete) a startup by ID
 */
export const softDeleteById = async (id, userId) => {
  return await Startup.findByIdAndUpdate(
    id,
    {
      deletedUtc: new Date(),
      deletedBy: userId
    },
    { new: true }
  );
};
