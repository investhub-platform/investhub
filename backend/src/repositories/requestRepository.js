import Request from "../models/Request.js";

/**
 * RequestRepository
 * Handles all database queries for Request model
 * No business logic - only database operations
 */

export const findAll = async () => {
  return await Request.find().lean();
};

export const findById = async (id) => {
  return await Request.findById(id).lean();
};

export const create = async (payload) => {
  return await Request.create(payload);
};

export const updateById = async (id, payload) => {
  return await Request.findByIdAndUpdate(id, payload, { new: true });
};

export const findByIdAndUpdate = async (id, updateData) => {
  return await Request.findById(id);
};

export const save = async (doc) => {
  return await doc.save();
};

export const findByIdForUpdate = async (id) => {
  return await Request.findById(id);
};
