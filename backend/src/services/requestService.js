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

export const getRequestsByStartupId = async (startupId) => {
  if (!startupId) {
    throw new AppError("startupId is required", 400);
  }

  try {
    const requests = await requestRepository.findByStartupId(startupId);
    return requests || [];
  } catch (error) {
    throw new AppError("Failed to fetch requests for startup", 500);
  }
};

export const getRequestsByInvestorId = async (investorId) => {
  if (!investorId) {
    throw new AppError("investorId is required", 400);
  }

  try {
    const requests = await requestRepository.findByInvestorId(investorId);
    return requests || [];
  } catch (error) {
    throw new AppError("Failed to fetch requests for investor", 500);
  }
};

export const getRequestsByIdeaId = async (ideaId) => {
  if (!ideaId) {
    throw new AppError("ideaId is required", 400);
  }

  try {
    const requests = await requestRepository.findByIdeaId(ideaId);
    return requests || [];
  } catch (error) {
    throw new AppError("Failed to fetch requests for idea", 500);
  }
};

export const updateRequestStatus = async (id, status, updatedBy) => {
  const validStatuses = [
    "pending_founder",
    "pending_investor",
    "pending_mentor",
    "approved",
    "paid",
    "rejected",
    "withdrawn"
  ];
  if (!id) {
    throw new AppError("Request ID is required", 400);
  }
  if (!validStatuses.includes(status)) {
    throw new AppError(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      400
    );
  }

  try {
    const request = await requestRepository.findByIdForUpdate(id);
    if (!request) {
      throw new AppError("Request not found", 404);
    }

    request.requestStatus = status;
    request.updatedUtc = new Date();
    if (updatedBy) request.updatedBy = updatedBy;

    // Keep decision fields in sync with status when explicit
    if (status === "withdrawn") {
      request.founderDecision = {
        decision: "reject",
        comment: "Withdrawn by requester",
        decidedAt: new Date()
      };
    }

    return await requestRepository.save(request);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update request status", 500);
  }
};

export const createNewRequest = async (payload) => {
  // Validate required fields
  const {
    investorId,
    founderId,
    ideaId,
    direction,
    requestStatus,
    amount,
    createdBy
  } = payload;

  if (!investorId || !founderId || !ideaId || amount == null) {
    throw new AppError("investorId, founderId, ideaId and amount are required", 400);
  }

  if (!["investor_to_startup", "startup_to_investor"].includes(direction)) {
    throw new AppError("direction must be 'investor_to_startup' or 'startup_to_investor'", 400);
  }

  const allowedStatuses = [
    "pending_founder",
    "pending_investor",
    "pending_mentor",
    "approved",
    "paid",
    "rejected",
    "withdrawn"
  ];

  if (requestStatus && !allowedStatuses.includes(requestStatus)) {
    throw new AppError("Invalid requestStatus", 400);
  }

  const derivedStatus = direction === "startup_to_investor" ? "pending_investor" : "pending_founder";

  // Ensure createdBy is set
  const requestPayload = {
    ...payload,
    requestStatus: requestStatus || derivedStatus,
    createdBy: payload.createdBy || (direction === "startup_to_investor" ? founderId : investorId)
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
    if (request.direction === "startup_to_investor") {
      request.investorDecision = {
        decision: "reject",
        comment: "Withdrawn by requester",
        decidedAt: new Date()
      };
    } else {
      request.founderDecision = {
        decision: "reject",
        comment: "Withdrawn by requester",
        decidedAt: new Date()
      };
    }
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

    if (request.direction !== "investor_to_startup") {
      throw new AppError("Founder decision is only valid for investor-to-startup requests", 400);
    }

    if (request.requestStatus !== "pending_founder") {
      throw new AppError("Request is not awaiting founder decision", 400);
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

export const setInvestorDecisionOnRequest = async (id, decisionData) => {
  const { decision, comment, updatedBy } = decisionData;

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

    if (request.direction !== "startup_to_investor") {
      throw new AppError("Investor decision is only valid for startup-to-investor requests", 400);
    }

    if (request.requestStatus !== "pending_investor") {
      throw new AppError("Request is not awaiting investor decision", 400);
    }

    request.investorDecision = {
      decision,
      comment,
      decidedAt: new Date()
    };

    request.requestStatus = decision === "accept" ? "pending_mentor" : "rejected";
    if (updatedBy) request.updatedBy = updatedBy;

    return await requestRepository.save(request);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to set investor decision", 500);
  }
};
