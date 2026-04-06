import mongoose from "mongoose";
import Startup from "../models/Startup.js";

/**
 * StartupRepository
 * Handles all database queries for Startup model
 * No business logic - only database operations
 */

/**
 * Find all startups (excluding soft-deleted)
 */
export const findAll = async ({ query = {}, page = 1, limit = 20 } = {}) => {
  const skip = (Math.max(Number(page) || 1, 1) - 1) * Math.max(Number(limit) || 20, 1);
  return await Startup.find(query)
    .sort({ createdUtc: -1 })
    .skip(skip)
    .limit(Math.max(Number(limit) || 20, 1));
};

/**
 * Find startup by ID
 */
export const findById = async (id) => {
  // Explicitly cast to ObjectId — BaseSchema uses { _id: false } which causes Mongoose
  // to skip automatic ObjectId casting on lookups, so findById/findOne({ _id: id }) fail.
  const oid =
    id instanceof mongoose.Types.ObjectId
      ? id
      : new mongoose.Types.ObjectId(String(id));
  return await Startup.findOne({ _id: oid });
};

/**
 * Find startups by UserID
 */
export const findByUserId = async (userId) => {
  return await Startup.find({
    deletedUtc: null,
    $or: [{ userId }, { UserID: userId }, { createdBy: userId }]
  });
};

/**
 * Find startups by status
 */
export const findByStatus = async (status) => {
  return await Startup.find({ status, deletedUtc: null });
};

export const countAll = async (query = {}) => {
  return await Startup.countDocuments(query);
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
// export const save = async (doc) => {
//   return await doc.save();
// };

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
