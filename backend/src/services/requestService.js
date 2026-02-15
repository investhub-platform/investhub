import * as requestRepository from "../repositories/requestRepository.js";
import AppError from "../utils/AppError.js";

/**
 * RequestService
 * Handles business logic for Request operations
 * All database queries delegate to requestRepository
 */

export const getAllRequests = async () => {
  try {
    return await requestRepository.findAll();
  } catch (error) {
    throw new AppError("Failed to fetch requests", 500);
  }
};

export const getRequestById = async (id) => {
  try {
    const request = await requestRepository.findById(id);
    if (!request) {
      throw new AppError("Request not found", 404);
    }
    return request;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch request", 500);
  }
};

export const createNewRequest = async (payload) => {
  // Validate required fields
  const { investorId, amount, createdBy } = payload;
  if (!investorId || amount == null) {
    throw new AppError("investorId and amount are required", 400);
  }

  // Ensure createdBy is set
  const requestPayload = {
    ...payload,
    createdBy: payload.createdBy || investorId
  };

  try {
    return await requestRepository.create(requestPayload);
  } catch (error) {
    throw new AppError("Failed to create request", 500);
  }
};

export const updateExistingRequest = async (id, payload) => {
  try {
    const request = await requestRepository.updateById(id, payload);
    if (!request) {
      throw new AppError("Request not found", 404);
    }
    return request;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update request", 500);
  }
};

export const withdrawRequestById = async (id, updatedBy) => {
  try {
    const request = await requestRepository.findByIdForUpdate(id);
    if (!request) {
      throw new AppError("Request not found", 404);
    }

    // Apply business logic: update status
    request.requestStatus = "withdrawn";
    if (updatedBy) request.updatedBy = updatedBy;

    return await requestRepository.save(request);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to withdraw request", 500);
  }
};

export const setFounderDecisionOnRequest = async (id, decisionData) => {
  const { decision, comment, updatedBy } = decisionData;

  // Validate decision value
  if (!["accept", "reject"].includes(decision)) {
    throw new AppError(
      "Invalid decision value. Must be 'accept' or 'reject'",
      400
    );
  }

  try {
    const request = await requestRepository.findByIdForUpdate(id);
    if (!request) {
      throw new AppError("Request not found", 404);
    }

    // Apply business logic: set founder decision and update status
    request.founderDecision = {
      decision,
      comment,
      decidedAt: new Date()
    };
    request.requestStatus =
      decision === "accept" ? "pending_mentor" : "rejected";
    if (updatedBy) request.updatedBy = updatedBy;

    return await requestRepository.save(request);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to set founder decision", 500);
  }
};

export const setMentorDecisionOnRequest = async (id, decisionData) => {
  const { decision, comment, finalApprovedAmount, updatedBy } = decisionData;

  // Validate decision value
  if (!["accept", "reject"].includes(decision)) {
    throw new AppError(
      "Invalid decision value. Must be 'accept' or 'reject'",
      400
    );
  }

  try {
    const request = await requestRepository.findByIdForUpdate(id);
    if (!request) {
      throw new AppError("Request not found", 404);
    }

    // Apply business logic: set mentor decision and update status
    request.mentorDecision = {
      decision,
      comment,
      decidedAt: new Date()
    };

    if (decision === "accept") {
      request.requestStatus = "approved";
      if (finalApprovedAmount != null) {
        request.finalApprovedAmount = finalApprovedAmount;
      }
    } else {
      request.requestStatus = "rejected";
    }

    if (updatedBy) request.updatedBy = updatedBy;

    return await requestRepository.save(request);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to set mentor decision", 500);
  }
};
