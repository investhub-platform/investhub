import Evaluation from "../models/Evaluation.js";

// const { GoogleGenerativeAI } = require("@google/generative-ai"); // For real integration

// @desc    Generate AI Evaluation (Triggered by Startup submission or manually)
// @route   POST /api/v1/evaluations/generate
// @access  Private (Startup Owner or Admin)
export const generateEvaluation = async (req, res, next) => {
  const { startupId, description, budget, category } = req.body;

  try {
    // Check if already evaluated
    const existingEval = await Evaluation.findOne({ startupId });
    if (existingEval) {
      return res.status(200).json({ data: existingEval }); // Return existing if found
    }

    // --- GEMINI API CALL WOULD GO HERE ---
    // For now, we will simulate the AI response logic

    // logic: random score for now
    let calculatedRisk = Math.floor(Math.random() * 10) + 1;

    const mockAIResponse = {
      strengths: "Strong market potential in " + (category || "the target market"),
      weaknesses: "High initial burn rate predicted based on budget.",
      opportunities: "Could expand into related vertical markets.",
      threats: "Competitive landscape is crowded.",
    };
    // -------------------------------------

    const evaluation = await Evaluation.create({
      startupId,
      riskScore: calculatedRisk,
      swotAnalysis: mockAIResponse,
    });

    res.status(201).json({ data: evaluation });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Evaluation for a specific Startup
// @route   GET /api/v1/evaluations/:startupId
// @access  Private (Investor/Owner)
export const getEvaluation = async (req, res, next) => {
  try {
    const evaluation = await Evaluation.findOne({ startupId: req.params.startupId });

    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    res.status(200).json({ data: evaluation });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an Evaluation
// @route   PUT /api/v1/evaluations/:startupId
// @access  Private (admin)
export const updateEvaluation = async (req, res, next) => {
  try {
    // For now only admin allowed to update evaluations
    const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes("admin");
    if (!isAdmin) return res.status(403).json({ message: "Forbidden" });

    const evaluation = await Evaluation.findOne({ startupId: req.params.startupId });
    if (!evaluation) return res.status(404).json({ message: "Evaluation not found" });

    const updatable = ["riskScore", "swotAnalysis", "generatedAt"];
    updatable.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        evaluation[key] = req.body[key];
      }
    });

    await evaluation.save();
    res.status(200).json({ data: evaluation });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an Evaluation
// @route   DELETE /api/v1/evaluations/:startupId
// @access  Private (admin)
export const deleteEvaluation = async (req, res, next) => {
  try {
    const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes("admin");
    if (!isAdmin) return res.status(403).json({ message: "Forbidden" });

    const evaluation = await Evaluation.findOne({ startupId: req.params.startupId });
    if (!evaluation) return res.status(404).json({ message: "Evaluation not found" });

    await evaluation.deleteOne();
    res.status(200).json({ message: "Evaluation deleted" });
  } catch (error) {
    next(error);
  }
};