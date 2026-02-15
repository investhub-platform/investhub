import Request from "../models/Request.js";

/**
 * List all requests
 * GET /requests
 */
export const listRequests = async (_req, res) => {
  // Fetch all Request documents from MongoDB and convert them to plain JS objects with .lean()
  const docs = await Request.find().lean();
  res.json({ data: docs });
};

/**
 * Get a single request by ID
 * GET /requests/:id
 */
export const getRequest = async (req, res) => {
  const doc = await Request.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ message: "request not found" });
  res.json({ data: doc });
};

/**
 * Create a new request
 * POST /requests
 */
export const createRequest = async (req, res) => {
  const { investorId, amount, createdBy } = req.body;
  if (!investorId || amount == null)
    return res
      .status(400)
      .json({ message: "investorId and amount are required" });

  const payload = { ...req.body };
  // ensure createdBy satisfies BaseSchema requirement
  if (!payload.createdBy) payload.createdBy = createdBy || investorId;

  const doc = await Request.create(payload);
  res.status(201).json({ data: doc });
};

/**
 * Update an existing request
 * PUT /requests/:id
 */
export const updateRequest = async (req, res) => {
  const doc = await Request.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  if (!doc) return res.status(404).json({ message: "request not found" });
  res.json({ data: doc });
};

/**
 * Withdraw a request
 * PATCH /requests/:id/withdraw
 */
export const withdrawRequest = async (req, res) => {
  const doc = await Request.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "request not found" });
  doc.requestStatus = "withdrawn";
  if (req.body.updatedBy) doc.updatedBy = req.body.updatedBy;
  await doc.save();
  res.json({ data: doc });
};

/**
 * Set founder decision
 * PATCH /requests/:id/founder-decision
 */
export const setFounderDecision = async (req, res) => {
  const { decision, comment } = req.body;
  if (!["accept", "reject"].includes(decision))
    return res.status(400).json({ message: "invalid decision" });

  const doc = await Request.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "request not found" });

  doc.founderDecision = { decision, comment, decidedAt: new Date() };
  doc.requestStatus = decision === "accept" ? "pending_mentor" : "rejected";
  if (req.body.updatedBy) doc.updatedBy = req.body.updatedBy;
  await doc.save();
  res.json({ data: doc });
};

/**
 * Set mentor decision
 * PATCH /requests/:id/mentor-decision
 */
export const setMentorDecision = async (req, res) => {
  const { decision, comment, finalApprovedAmount } = req.body;
  if (!["accept", "reject"].includes(decision))
    return res.status(400).json({ message: "invalid decision" });

  const doc = await Request.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: "request not found" });

  doc.mentorDecision = { decision, comment, decidedAt: new Date() };
  if (decision === "accept") {
    doc.requestStatus = "approved";
    if (finalApprovedAmount != null)
      doc.finalApprovedAmount = finalApprovedAmount;
  } else {
    doc.requestStatus = "rejected";
  }
  if (req.body.updatedBy) doc.updatedBy = req.body.updatedBy;
  await doc.save();
  res.json({ data: doc });
};

export default {
  listRequests,
  getRequest,
  createRequest,
  updateRequest,
  withdrawRequest,
  setFounderDecision,
  setMentorDecision
};
