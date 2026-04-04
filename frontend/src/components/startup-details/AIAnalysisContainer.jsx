import { useEffect, useState } from "react";
import API from "@/utils/API";
import AIAnalysisTab from "./AIAnalysisTab";

export default function AIAnalysisContainer({ startupId, startup }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const transformData = (evaluation) => {
  // Use full 1-10 range
  const safeScore = Math.min(10, Math.max(1, evaluation.riskScore));

  // Convert to 0–100 scale
  const riskScore100 = safeScore * 10;

  // Correct riskLevel mapping
  let riskLevel = "LOW";
  if (riskScore100 >= 70) riskLevel = "HIGH";
  else if (riskScore100 >= 40) riskLevel = "MEDIUM";
  else riskLevel = "LOW"; // explicitly for <40

  return {
    aiRiskScore: riskScore100,
    aiRiskLevel: riskLevel,
    aiInsights: {
      summary: [
        evaluation.swotAnalysis.strengths,
        evaluation.swotAnalysis.weaknesses,
        evaluation.swotAnalysis.opportunities,
        evaluation.swotAnalysis.threats
      ],
      marketSentiment: evaluation.swotAnalysis.opportunities
    }
  };
};

  const fetchEvaluation = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/evaluations/${startupId}`);
      setData(transformData(res.data.data));

    } catch (err) {
      if (err.response?.status === 404) {
        await generateEvaluation();
      } else {
        setError("Failed to load AI analysis");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateEvaluation = async () => {
    try {
      setLoading(true);

      const res = await API.post("/evaluations/generate", {
        startupId,
        description: startup?.pitchSummary || startup?.tagline || "",
        budget: startup?.fundingGoal || 0,
        category: startup?.industry || "General"
      });

      setData(transformData(res.data.data));
    } catch {
      setError("Failed to generate AI analysis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startupId) fetchEvaluation();
  }, [startupId]);

  if (loading) return <div className="text-white p-6">Analyzing startup...</div>;
  if (error) return <div className="text-red-400 p-6">{error}</div>;

  return <AIAnalysisTab startup={data} />;
}