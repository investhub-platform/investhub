import * as requestService from "../services/requestService.js";
import AppError from "../utils/AppError.js";

/**
 * RequestController
 * Handles HTTP requests and responses
 * Delegates business logic to requestService
 */

/**
 * List all requests
 * GET /requests
 */
export const listRequests = async (_req, res, next) => {
  try {
    const data = await requestService.getAllRequests();
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single request by ID
 * GET /requests/:id
 */
export const getRequest = async (req, res, next) => {
  try {
    const data = await requestService.getRequestById(req.params.id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new request
 * POST /requests
 */
export const createRequest = async (req, res, next) => {
  try {
    const data = await requestService.createNewRequest(req.body);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing request
 * PUT /requests/:id
 */
export const updateRequest = async (req, res, next) => {
  try {
    const data = await requestService.updateExistingRequest(
      req.params.id,
      req.body
    );
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw a request
 * PATCH /requests/:id/withdraw
 */
export const withdrawRequest = async (req, res, next) => {
  try {
    const data = await requestService.withdrawRequestById(
      req.params.id,
      req.body.updatedBy
    );
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Set founder decision
 * PATCH /requests/:id/founder-decision
 */
export const setFounderDecision = async (req, res, next) => {
  try {
    const data = await requestService.setFounderDecisionOnRequest(
      req.params.id,
      req.body
    );
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Set mentor decision
 * PATCH /requests/:id/mentor-decision
 */
export const setMentorDecision = async (req, res, next) => {
  try {
    const data = await requestService.setMentorDecisionOnRequest(
      req.params.id,
      req.body
    );
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Set investor decision
 * PATCH /requests/:id/investor-decision
 */
export const setInvestorDecision = async (req, res, next) => {
  try {
    const data = await requestService.setInvestorDecisionOnRequest(
      req.params.id,
      req.body
    );
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

export const getRequestsByStartup = async (req, res, next) => {
  try {
    const startupId = req.params.startupId;
    const data = await requestService.getRequestsByStartupId(startupId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

export const setRequestStatus = async (req, res, next) => {
  try {
    const data = await requestService.updateRequestStatus(
      req.params.id,
      req.body.requestStatus,
      req.body.updatedBy
    );
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

export const getRequestsByInvestor = async (req, res, next) => {
  try {
    const investorId = req.params.investorId;
    const data = await requestService.getRequestsByInvestorId(investorId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

export default {
  listRequests,
  getRequest,
  createRequest,
  updateRequest,
  withdrawRequest,
  setFounderDecision,
  setInvestorDecision,
  setMentorDecision,
  getRequestsByStartup,
  getRequestsByInvestor,
  setRequestStatus
};
