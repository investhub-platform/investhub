import { useEffect, useState } from "react";
import { Brain, CheckCircle2, TrendingUp } from "lucide-react";

export default function AIAnalysisTab({ startup }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!startup) return;
    let start = 0;
    const end = startup.aiRiskScore || 0;
    const duration = 1500; // ms
    const increment = end / (duration / 15);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setAnimatedScore(Math.round(start));
    }, 15);
    return () => clearInterval(timer);
  }, [startup]);

  if (!startup) return null;

  const riskColor =
    animatedScore < 25
      ? "text-emerald-400"
      : animatedScore < 50
      ? "text-yellow-400"
      : "text-red-400";

  const bgRiskColor =
    animatedScore < 25
      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
      : animatedScore < 50
      ? "bg-gradient-to-r from-yellow-400 to-yellow-300"
      : "bg-gradient-to-r from-red-500 to-red-400";

  const swotTypes = ["Strength", "Weakness", "Opportunity", "Threat"];
  const swotColors = {
    Strength: "bg-emerald-400/20 text-emerald-400",
    Weakness: "bg-red-400/20 text-red-400",
    Opportunity: "bg-blue-400/20 text-blue-400",
    Threat: "bg-yellow-400/20 text-yellow-400",
  };

  return (
    <div className="p-6 md:p-8 rounded-[2rem] bg-[#0B0D10] border border-white/5 shadow-2xl relative overflow-hidden">

      {/* Glow Background */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-inner">
          <Brain className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white leading-tight">
            AI Pre-Seed Evaluation
          </h2>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
            Powered by AI Engine
          </p>
        </div>
      </div>

      {/* Risk Score Section */}
      <div className="mb-10 p-6 rounded-3xl bg-[#1A1D24]/60 border border-white/5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-inner">

        {/* Score */}
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">
            Predictive Risk Score
          </p>

          <div className="flex items-end gap-3">
            <span className={`text-6xl font-black ${riskColor} leading-none tracking-tight`}>
              {animatedScore}
            </span>
            <span className="text-lg font-bold text-slate-500 mb-1">/ 100</span>
          </div>

          <p className={`mt-2 text-sm font-bold uppercase tracking-wide ${riskColor}`}>
            {startup.aiRiskLevel || "UNKNOWN"} RISK
          </p>
        </div>

        {/* Progress */}
        <div className="w-full md:w-1/2">
          <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full ${bgRiskColor} transition-all duration-1500 ease-out`}
              style={{ width: `${animatedScore}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500 mt-2 font-semibold">
            <span>Low (0)</span>
            <span>High (100)</span>
          </div>
        </div>
      </div>

      {/* SWOT Section */}
      <div className="mb-10">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
          Key AI Findings
        </h3>

        <div className="space-y-3">
          {startup.aiInsights.summary.map((point, i) => (
            <div
              key={i}
              className="group flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 opacity-0 animate-fadeIn"
              style={{ animationDelay: `${i * 150}ms`, animationFillMode: "forwards" }}
            >
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm text-slate-300 leading-relaxed font-medium">
                {point}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Market Sentiment */}
      <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md shadow-inner">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            Market Sentiment Analysis
          </h3>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed bg-[#0B0D10]/60 p-4 rounded-xl border border-white/10 shadow-inner">
          {startup.aiInsights.marketSentiment}
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease forwards;
        }
      `}</style>
    </div>
  );
}