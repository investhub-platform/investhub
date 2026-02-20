import { GoogleGenerativeAI } from '@google/generative-ai';
import * as evalRepo from '../repositories/evaluationRepository.js';
import * as startupRepo from '../repositories/startupRepository.js';
import AppError from '../utils/AppError.js';

/**
 * EvaluationService
 * Business logic for AI-powered SWOT evaluation.
 * Gemini API call lives here; DB operations delegate to evaluationRepository.
 */

// ─── Gemini Helper ────────────────────────────────────────────────────────────

/**
 * Call the Gemini API and parse a structured SWOT + risk score.
 * Falls back to a deterministic mock ONLY when GEMINI_API_KEY is absent (dev / CI without a key).
 * When the key IS set, any API error is thrown — no silent mock fallback.
 */
const runGeminiEvaluation = async ({ description, budget, category }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // No key configured — return deterministic mock so the app still starts in dev
    console.warn('[EvaluationService] GEMINI_API_KEY not set — using mock response.');
    return {
      swotAnalysis: {
        strengths:     `Strong market potential in ${category || 'the target market'}.`,
        weaknesses:    'High initial burn rate predicted based on budget.',
        opportunities: 'Could expand into adjacent vertical markets.',
        threats:       'Competitive landscape is crowded with well-funded players.',
      },
      riskScore: 5,
    };
  }

  // Key is present — always call Gemini; surface errors to the caller
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const prompt = `You are an expert startup investment analyst.
Analyze the following startup idea and return ONLY a valid JSON object — no markdown fences, no extra text.

Startup details:
- Category: ${category || 'N/A'}
- Budget: ${budget || 'N/A'}
- Description: ${description}

Return this exact JSON structure:
{
  "strengths": "<one concise paragraph>",
  "weaknesses": "<one concise paragraph>",
  "opportunities": "<one concise paragraph>",
  "threats": "<one concise paragraph>",
  "riskScore": <integer 1-10 where 10 is highest risk>
}`;

  // Use the v1 API surface (v1beta does not expose newer Gemini 2.x models)
  const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  // Strip accidental markdown fences Gemini sometimes adds
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    swotAnalysis: {
      strengths:     parsed.strengths,
      weaknesses:    parsed.weaknesses,
      opportunities: parsed.opportunities,
      threats:       parsed.threats,
    },
    riskScore: Math.min(10, Math.max(1, parseInt(parsed.riskScore, 10) || 5)),
  };
};

// ─── Public Service Methods ───────────────────────────────────────────────────

/**
 * Return existing evaluation for the startup, or generate a new one via Gemini.
 * Returns { evaluation, created: boolean }.
 */
export const generateOrFetch = async (startupId, { description, budget, category, force } = {}) => {
  const existing = await evalRepo.findByStartup(startupId);
  // Return cached evaluation unless force-regeneration is requested
  if (existing && !force) return { evaluation: existing, created: false };
  // Delete stale evaluation so we can replace it with a fresh Gemini response
  if (existing && force) await evalRepo.deleteDoc(existing);

  // If caller didn't provide description/budget/category, try to fetch from startup record
  if (!description) {
    const startup = await startupRepo.findById(startupId);
    if (startup) {
      description = startup.description || null;
      budget    = budget    || startup.budget;
      category  = category  || startup.category;
    }
    // If startup is not found, Gemini will receive 'N/A' for description — still valid
  }

  const { swotAnalysis, riskScore } = await runGeminiEvaluation({ description, budget, category });
  const evaluation = await evalRepo.create({ startupId, riskScore, swotAnalysis });
  return { evaluation, created: true };
};

/** Retrieve the evaluation for a startup; throws 404 if not found. */
export const getByStartup = async (startupId) => {
  const evaluation = await evalRepo.findByStartup(startupId);
  if (!evaluation) throw new AppError('Evaluation not found', 404);
  return evaluation;
};

/**
 * Apply a partial update (riskScore, swotAnalysis, generatedAt) to an evaluation.
 * Returns the updated document.
 */
export const updateByStartup = async (startupId, payload) => {
  const evaluation = await evalRepo.findByStartup(startupId);
  if (!evaluation) throw new AppError('Evaluation not found', 404);

  const updatable = ['riskScore', 'swotAnalysis', 'generatedAt'];
  updatable.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      evaluation[key] = payload[key];
    }
  });

  return evalRepo.save(evaluation);
};

/** Permanently delete the evaluation for a startup; throws 404 if not found. */
export const deleteByStartup = async (startupId) => {
  const evaluation = await evalRepo.findByStartup(startupId);
  if (!evaluation) throw new AppError('Evaluation not found', 404);
  await evalRepo.deleteDoc(evaluation);
};
