// services/aiService.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.OPENROUTER_API_KEY) {
  console.warn("⚠️ OPENROUTER_API_KEY is missing!");
}

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "Crowdfunding Platform"
  }
});

/**
 * Generates AI Idea Summary for a startup idea
 * @param {Object} ideaData 
 * @returns {string} AI summary
 */
export const generateIdeaSummary = async (ideaData) => {
  try {

    //ADDED dynamic type
    const typeLabel = ideaData.isIdea ? "Startup Idea" : "Investment Plan";

    const prompt = `
    Generate a professional ${typeLabel} (max 150 words).

    Title: ${ideaData.title}
    Description: ${ideaData.description}
    Category: ${ideaData.category}
    Budget: ${ideaData.budget}
    Timeline: ${ideaData.timeline || "Not specified"}
    Expected Outcomes: ${ideaData.expectedOutcomes || "Not specified"}
    `;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a startup investment analyst." },
        { role: "user", content: prompt }
      ]
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI summary generation failed:", error.response?.data || error.message);
    return null; // safe fallback
  }
};