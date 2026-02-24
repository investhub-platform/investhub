import ProgressReport from "../models/ProgressReport.js";

/**
 * progress Repository
 * Handles all database queries
 */

export const findAll = async () => ProgressReport.find({ deletedUtc: null }).lean();
export const findById = async (id) => ProgressReport.findById(id);
export const findByIdeaId = async (ideaId) => ProgressReport.find({ ideaId, deletedUtc: null }).lean();
export const create = async (payload) => ProgressReport.create(payload);
export const save = async (doc) => doc.save();
export const softDelete = async (doc, userId) => {
  doc.deletedUtc = new Date();
  doc.deletedBy = userId;
  doc.updatedUtc = new Date();
  doc.updatedBy = userId;
  return doc.save();
};