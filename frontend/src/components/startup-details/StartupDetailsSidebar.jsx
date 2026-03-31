import { ArrowLeft } from "lucide-react";

export default function StartupDetailsSidebar({
  startup,
  isPlan,
  isIdeaLikeRecord,
  detailsRows,
  fundingPercent,
  walletBalance,
  investAmount,
  setInvestAmount,
  openInvestModal,
  formatCurrency,
}) {
  return (
    <div className="lg:w-[380px] shrink-0 space-y-6 order-1 lg:order-2">
      {!isPlan && (
        <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-b from-[#0B0D10] to-[#020617] border border-blue-500/30 shadow-[0_0_40px_rgba(37,99,235,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

          <h2 className="text-xl font-black text-white mb-2">Secure Investment</h2>
          <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">
            Funds locked in smart escrow, released upon milestone validation.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-bold tracking-widest uppercase text-slate-500 mb-2 block ml-1">Investment Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input
                  type="text"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="10,000"
                  className="w-full pl-8 pr-4 py-4 rounded-xl bg-[#1A1D24] border border-white/5 text-white font-bold focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Wallet Balance</p>
              <p className="text-xs font-bold text-emerald-400">{formatCurrency(walletBalance)}</p>
            </div>
          </div>

          <button
            onClick={openInvestModal}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            Commit Capital <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
          <p className="text-[10px] text-slate-500 text-center mt-4 font-medium uppercase tracking-widest">
            Minimum $10,000 • Verified Setup
          </p>
        </div>
      )}

      <div className="p-6 md:p-8 rounded-[2rem] bg-[#0B0D10] border border-white/5 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">
          {startup.recordType === "idea" ? "Idea Metrics" : isPlan ? "Mandate Requirements" : "Startup Metrics"}
        </h3>

        <div className="space-y-4">
          {detailsRows.map(([label, value]) => (
            <div key={label} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0 last:pb-0">
              <span className="text-sm font-medium text-slate-400">{label}</span>
              <span className="text-sm font-bold text-white text-right max-w-[60%] truncate" title={value}>{value}</span>
            </div>
          ))}
        </div>

        {isIdeaLikeRecord && startup.raw?.expectedOutcomes && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Expected Outcomes</p>
            <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">{startup.raw.expectedOutcomes}</p>
          </div>
        )}

        {!isIdeaLikeRecord && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex justify-between text-xs font-bold mb-3">
              <span className="text-slate-400 uppercase tracking-widest">Funding Progress</span>
              <span className="text-blue-400">{fundingPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-3">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${fundingPercent}%` }} />
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-white">{formatCurrency(startup.currentFunding)}</span>
              <span className="text-slate-500">{formatCurrency(startup.fundingGoal)}</span>
            </div>
          </div>
        )}
      </div>

      {startup.recordType === "idea" && startup.startupProfile && (
        <div className="p-6 rounded-[2rem] bg-[#0B0D10] border border-white/5 shadow-xl group cursor-pointer hover:border-white/10 transition-colors">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Parent Startup</h3>
          {startup.startupProfile.photoUrl && (
            <div className="w-full h-32 rounded-xl overflow-hidden mb-4 relative">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
              <img src={startup.startupProfile.photoUrl} alt={startup.startupProfile.name} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500" />
            </div>
          )}
          <p className="text-base font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{startup.startupProfile.name}</p>
          <p className="text-xs text-slate-400 line-clamp-2">{startup.startupProfile.tagline}</p>
        </div>
      )}
    </div>
  );
}
