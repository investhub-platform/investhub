import * as startupRepository from "../repositories/startupRepository.js";
import AppError from "../utils/AppError.js";

/**
 * StartupService
 * Handles business logic for Startup operations
 * All database queries delegate to startupRepository
 */

/**
 * Get all startups (excluding soft-deleted)
 */
export const getAllStartups = async () => {
  try {
    return await startupRepository.findAll();
  } catch (error) {
    throw new AppError("Failed to fetch startups", 500);
  }
};

/**
 * Get startup by ID
 */
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

/**
 * Get all startups by UserID
 */
export const getStartupsByUserId = async (userId) => {
  try {
    if (!userId) {
      throw new AppError("UserID is required", 400);
    }
    return await startupRepository.findByUserId(userId);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch startups by user", 500);
  }
};

/**
 * Get startups by status
 */
export const getStartupsByStatus = async (status) => {
  try {
    const validStatuses = ["Approved", "NotApproved", "pending"];
    if (!status || !validStatuses.includes(status)) {
      throw new AppError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        400
      );
    }
    return await startupRepository.findByStatus(status);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch startups by status", 500);
  }
};

/**
 * Create a new startup
 */
export const createNewStartup = async (payload, userId) => {
  // Validate required fields
  const { name, UserID, createdBy } = payload;
  if (!name) {
    throw new AppError("Name is required", 400);
  }
  if (!UserID && !userId) {
    throw new AppError("UserID is required", 400);
  }

  try {
    const startupData = {
      name: name.trim(),
      description: payload.description || null,
      BR: payload.BR || null,
      UserID: UserID || userId,
      status: payload.status || "pending",
      createdBy: createdBy || userId,
      updatedBy: createdBy || userId
    };

    return await startupRepository.create(startupData);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to create startup", 500);
  }
};

/**
 * Update an existing startup
 */
export const updateExistingStartup = async (id, payload, userId) => {
  try {
    // Validate status if provided
    if (payload.status) {
      const validStatuses = ["Approved", "NotApproved", "pending"];
      if (!validStatuses.includes(payload.status)) {
        throw new AppError(
          `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
          400
        );
      }
    }

    const updateData = {
      ...payload,
      updatedUtc: new Date(),
      updatedBy: userId
    };

    const startup = await startupRepository.updateById(id, updateData);
    if (!startup) {
      throw new AppError("Startup not found", 404);
    }
    return startup;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update startup", 500);
  }
};

/**
 * Approve a startup
 */
export const approveStartup = async (id, userId) => {
  try {
    const startup = await startupRepository.updateById(id, {
      status: "Approved",
      updatedUtc: new Date(),
      updatedBy: userId
    });
    if (!startup) {
      throw new AppError("Startup not found", 404);
    }
    return startup;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to approve startup", 500);
  }
};

/**
 * Reject a startup
 */
export const rejectStartup = async (id, userId) => {
  try {
    const startup = await startupRepository.updateById(id, {
      status: "NotApproved",
      updatedUtc: new Date(),
      updatedBy: userId
    });
    if (!startup) {
      throw new AppError("Startup not found", 404);
    }
    return startup;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to reject startup", 500);
  }
};

/**
 * Delete (soft delete) a startup
 */
export const deleteStartup = async (id, userId) => {
  try {
    const startup = await startupRepository.softDeleteById(id, userId);
    if (!startup) {
      throw new AppError("Startup not found", 404);
    }
    return startup;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to delete startup", 500);
  }
};
