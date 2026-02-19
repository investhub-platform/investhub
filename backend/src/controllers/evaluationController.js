import Evaluation from "../models/Evaluation.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Build a structured SWOT + risk prompt and call the Gemini API.
 * Falls back to deterministic mock values if GEMINI_API_KEY is not set.
 */
const runGeminiEvaluation = async ({ description, budget, category }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // ── Mock fallback (dev / no API key) ──────────────────────────────────
    console.warn("[Evaluation] GEMINI_API_KEY not set — using mock response.");
    return {
      swotAnalysis: {
        strengths: `Strong market potential in ${category || "the target market"}.`,
        weaknesses: "High initial burn rate predicted based on budget.",
        opportunities: "Could expand into adjacent vertical markets.",
        threats: "Competitive landscape is crowded with well-funded players.",
      },
      riskScore: 5,
    };
  }

  // ── Real Gemini call ─────────────────────────────────────────────────────
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert startup investment analyst.
Analyze the following startup idea and return ONLY a valid JSON object — no markdown fences, no extra text.

Startup details:
- Category: ${category || "N/A"}
- Budget: ${budget || "N/A"}
- Description: ${description}

Return this exact JSON structure:
{
  "strengths": "<one concise paragraph>",
  "weaknesses": "<one concise paragraph>",
  "opportunities": "<one concise paragraph>",
  "threats": "<one concise paragraph>",
  "riskScore": <integer 1-10 where 10 is highest risk>
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();

  // Strip accidental markdown fences if Gemini adds them
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(cleaned);

  const riskScore = Math.min(10, Math.max(1, parseInt(parsed.riskScore, 10) || 5));

  return {
    swotAnalysis: {
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      opportunities: parsed.opportunities,
      threats: parsed.threats,
    },
    riskScore,
  };
};

// @desc    Generate AI Evaluation (Triggered by Startup submission or manually)
// @route   POST /api/v1/evaluations/generate
// @access  Private (Startup Owner or Admin)
export const generateEvaluation = async (req, res, next) => {
  const { startupId, description, budget, category } = req.body;

  if (!startupId || !description) {
    return res.status(400).json({ message: "startupId and description are required" });
  }

  try {
    // Return existing evaluation if already generated
    const existingEval = await Evaluation.findOne({ startupId });
    if (existingEval) {
      return res.status(200).json({ data: existingEval });
    }

    // Call Gemini (or mock fallback)
    const { swotAnalysis, riskScore } = await runGeminiEvaluation({ description, budget, category });

    const evaluation = await Evaluation.create({
      startupId,
      riskScore,
      swotAnalysis,
    });

    res.status(201).json({ data: evaluation });
  } catch (error) {
    // Specific error for JSON parse issues from Gemini
    if (error instanceof SyntaxError) {
      return next(new Error("AI returned an unexpected format. Please try again."));
    }
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