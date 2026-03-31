import Request from "../models/Request.js";
import Idea from "../models/Idea.js";

/**
 * RequestRepository
 * Handles all database queries for Request model
 * No business logic - only database operations
 */

export const findAll = async () => {
  return await Request.find()
    .populate("investorId", "_id name email role")
    .populate("founderId", "_id name email role")
    .populate("ideaId", "_id title StartupId")
    .populate("mandateId", "_id title")
    .lean();
};

export const findById = async (id) => {
  return await Request.findById(id)
    .populate("investorId", "_id name email role")
    .populate("founderId", "_id name email role")
    .populate("ideaId", "_id title StartupId")
    .populate("mandateId", "_id title")
    .lean();
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

export const findByStartupId = async (startupId) => {
  const startupIdStr = String(startupId);
  const ideas = await Idea.find({ StartupId: startupIdStr, isIdea: true }).select("_id").lean();
  const ideaIds = ideas.map((i) => i._id);

  return await Request.find({
    deletedUtc: null,
    $or: [
      { StartupsId: startupIdStr },
      { ideaId: { $in: ideaIds } },
      { startupId: startupIdStr }
    ]
  })
    .populate("createdBy", "_id name email role")
    .populate("investorId", "_id name email role")
    .populate("founderId", "_id name email role")
    .populate("ideaId", "_id title StartupId")
    .populate("mandateId", "_id title")
    .lean();
};

export const findByInvestorId = async (investorId) => {
  return await Request.find({
    investorId,
    deletedUtc: null
  })
    .populate("createdBy", "_id name email role")
    .populate("investorId", "_id name email role")
    .populate("founderId", "_id name email role")
    .populate("ideaId", "_id title StartupId")
    .populate("mandateId", "_id title")
    .lean();
};

export const findByIdForUpdate = async (id) => {
  return await Request.findById(id);
};
