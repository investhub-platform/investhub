// services/portfolioService.js
import AppError from "../utils/AppError.js";
import * as portfolioRepo from "../repositories/portfolioRepository.js";

export const getPortfolios = async (userId) => {
  return await portfolioRepo.findByUserId(userId);
};

export const getPortfolioById = async (id, userId) => {
  const portfolio = await portfolioRepo.findPublicById(id);
  if (!portfolio || portfolio.deletedUtc)
    throw new AppError("Portfolio not found", 404);
  if (portfolio.userId._id.toString() !== userId)
    throw new AppError("Access denied", 403);
  return portfolio;
};

export const createPortfolio = async (userId, payload) => {
  const portfolioData = {
    ...payload,
    userId,
    createdBy: userId
  };
  return await portfolioRepo.create(portfolioData);
};

export const updatePortfolio = async (id, userId, payload) => {
  const portfolio = await portfolioRepo.findById(id);
  if (!portfolio || portfolio.deletedUtc)
    throw new AppError("Portfolio not found", 404);
  if (portfolio.userId.toString() !== userId)
    throw new AppError("Access denied", 403);

  const allowed = ["name", "description", "investments", "totalValue"];
  const safePayload = {};

  for (const k of allowed) {
    if (payload[k] !== undefined) safePayload[k] = payload[k];
  }

  safePayload.updatedUtc = new Date();
  safePayload.updatedBy = userId;

  return await portfolioRepo.updateById(id, safePayload);
};

export const deletePortfolio = async (id, userId) => {
  const portfolio = await portfolioRepo.findById(id);
  if (!portfolio || portfolio.deletedUtc)
    throw new AppError("Portfolio not found", 404);
  if (portfolio.userId.toString() !== userId)
    throw new AppError("Access denied", 403);

  portfolio.status = "deleted";
  portfolio.deletedUtc = new Date();
  portfolio.deletedBy = userId;
  portfolio.updatedUtc = new Date();
  portfolio.updatedBy = userId;

  await portfolioRepo.updateById(id, portfolio);
  return true;
};
