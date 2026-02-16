import * as startupRepository from "../repositories/startupRepository.js";
import AppError from "../utils/AppError.js";

/**
 * StartupService
 * Handles business logic for Startup operations
 * All database queries delegate to startupRepository
 */

export const getAllStartups = async () => {
  try {
    return await startupRepository.findAll();
  } catch (error) {
    throw new AppError("Failed to fetch startups", 500);
  }
};

export const getStartupById = async (id) => {
  try {
    const startup = await startupRepository.findById(id);
    if (!startup) {
      throw new AppError("Startup not found", 404);
    }
    return startup;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch startup", 500);
  }
};

export const createNewStartup = async (payload) => {
  // Validate required fields
  const { name, description } = payload;
  if (!name) {
    throw new AppError("Name is required", 400);
  }

  try {
    return await startupRepository.create({
      name: name.trim(),
      description: description || ""
    });
  } catch (error) {
    throw new AppError("Failed to create startup", 500);
  }
};

export const updateExistingStartup = async (id, payload) => {
  try {
    const startup = await startupRepository.updateById(id, payload);
    if (!startup) {
      throw new AppError("Startup not found", 404);
    }
    return startup;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update startup", 500);
  }
};
