const Evaluation = require('../models/evaluationModel');
// const { GoogleGenerativeAI } = require("@google/generative-ai"); // For real integration

// @desc    Generate AI Evaluation (Triggered by Startup submission or manually)
// @route   POST /api/evaluations/generate
// @access  Private (Startup Owner or Admin)
const generateEvaluation = async (req, res) => {
  const { startupId, description, budget, category } = req.body;

  try {
    // Check if already evaluated
    const existingEval = await Evaluation.findOne({ startupId });
    if (existingEval) {
      return res.status(200).json(existingEval); // Return existing if found
    }

    // --- GEMINI API CALL WOULD GO HERE ---
    // For now, we will simulate the AI response logic
    
    // logic: Higher budget with short description = High Risk
    let calculatedRisk = Math.floor(Math.random() * 10) + 1; 

    const mockAIResponse = {
      strengths: "Strong market potential in " + category,
      weaknesses: "High initial burn rate predicted based on budget.",
      opportunities: "Could expand into related vertical markets.",
      threats: "Competitive landscape is crowded."
    };
    // -------------------------------------

    const evaluation = await Evaluation.create({
      startupId,
      riskScore: calculatedRisk,
      swotAnalysis: mockAIResponse
    });

    res.status(201).json(evaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Evaluation for a specific Startup
// @route   GET /api/evaluations/:startupId
// @access  Private (Investor/Owner)
const getEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ startupId: req.params.startupId });

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    res.status(200).json(evaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateEvaluation,
  getEvaluation
};