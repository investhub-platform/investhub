import { Brain, CheckCircle2, TrendingUp } from "lucide-react";

export default function AIAnalysisTab({ startup }) {
  const riskColor = startup.aiRiskScore < 25 ? "text-emerald-400" : startup.aiRiskScore < 50 ? "text-yellow-400" : "text-red-400";
  const bgRiskColor = startup.aiRiskScore < 25 ? "bg-emerald-400" : startup.aiRiskScore < 50 ? "bg-yellow-400" : "bg-red-400";

  return (
    <div className="p-6 md:p-8 rounded-[2rem] bg-[#0B0D10] border border-white/5 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
          <Brain className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white leading-tight">AI Pre-Seed Evaluation</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Powered by Gemini Engine</p>
        </div>
      </div>

      <div className="mb-8 p-6 rounded-2xl bg-[#1A1D24]/50 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Predictive Risk Score</p>
          <div className="flex items-end gap-3">
            <span className={`text-6xl font-black ${riskColor} leading-none tracking-tighter drop-shadow-md`}>{startup.aiRiskScore}</span>
            <span className="text-lg font-bold text-slate-500 mb-1">/ 100</span>
          </div>
          <p className={`text-sm font-bold mt-2 uppercase tracking-wide ${riskColor}`}>{startup.aiRiskLevel} RISK</p>
        </div>

        <div className="w-full md:w-1/2">
          <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden shadow-inner border border-white/5">
            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${bgRiskColor}`} style={{ width: `${startup.aiRiskScore}%` }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mt-2 tracking-widest">
            <span>Low (0)</span>
            <span>High (100)</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Key AI Findings</h3>
        <ul className="space-y-3">
          {startup.aiInsights.summary.map((point, i) => (
            <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-sm text-slate-300 font-medium leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Market Sentiment Analysis</h3>
        </div>
        <p className="text-sm text-slate-300 font-medium leading-relaxed bg-[#0B0D10] p-4 rounded-xl border border-white/5 shadow-inner">
          {startup.aiInsights.marketSentiment}
        </p>
      </div>
    </div>
  );
}
