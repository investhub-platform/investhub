// repositories/portfolioRepository.js
import Portfolio from "../models/Portfolio.js";

export const findById = (id) => Portfolio.findById(id);

const startupPopulate = {
  path: "investments.startupId",
  select: "name description UserID",
  populate: {
    path: "UserID",
    select: "name email"
  }
};

export const findByUserId = (userId) =>
  Portfolio.find({ userId, deletedUtc: null })
    .populate(startupPopulate)
    .populate("userId", "name email");

export const create = (payload) => Portfolio.create(payload);

export const updateById = (id, payload) =>
  Portfolio.findByIdAndUpdate(id, payload, { new: true });

export const deleteById = (id) =>
  Portfolio.findByIdAndUpdate(id, { deletedUtc: new Date() }, { new: true });

export const findPublicById = (id) =>
  Portfolio.findById(id)
    .populate(startupPopulate)
    .populate("userId", "name email");
