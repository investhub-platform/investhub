import mongoose from 'mongoose';
import Startup from "../models/Startup.js";

/**
 * StartupRepository
 * Handles all database queries for Startup model
 * No business logic - only database operations
 */

export const findAll = async () => {
  return await Startup.find().lean();
};

export const findById = async (id) => {
  // Explicitly cast to ObjectId — BaseSchema uses { _id: false } which causes Mongoose
  // to skip automatic ObjectId casting on lookups, so findById/findOne({ _id: id }) fail.
  const oid = id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(String(id));
  return await Startup.findOne({ _id: oid }).lean();
};

export const create = async (payload) => {
  return await Startup.create(payload);
};

export const updateById = async (id, payload) => {
  return await Startup.findByIdAndUpdate(id, payload, { new: true });
};

export const findByIdForUpdate = async (id) => {
  return await Startup.findById(id);
};

export const save = async (doc) => {
  return await doc.save();
};
