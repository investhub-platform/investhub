import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader, X } from "lucide-react";

export default function InvestmentModal({
  isOpen,
  isPlan,
  startup,
  investSubmitting,
  setIsInvestOpen,
  investStep,
  investAmount,
  setInvestAmount,
  investMessage,
  setInvestMessage,
  acceptedTerms,
  setAcceptedTerms,
  investError,
  setInvestError,
  minAmount,
  walletBalance,
  amountNumber,
  setInvestStep,
  submitInvestment,
  investSuccess,
  setInvestMessageAndReset,
  formatCurrency,
}) {
  return (
    <AnimatePresence>
      {!isPlan && isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
            onClick={() => !investSubmitting && setIsInvestOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0B0D10] p-6 md:p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="text-2xl font-black text-white tracking-tight">Invest in {startup.name}</h3>
              <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-slate-400" onClick={() => !investSubmitting && setIsInvestOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {investStep === "input" && (
              <div className="space-y-6 relative z-10">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Amount (USD)</label>
                  <input
                    type="text"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder={formatCurrency(minAmount)}
                    className="w-full px-5 py-4 rounded-xl bg-[#1A1D24] border border-white/5 text-white font-bold text-lg focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
                  />
                  <div className="flex justify-between items-center mt-2 px-1">
                    <p className="text-xs font-medium text-slate-500">Minimum {formatCurrency(minAmount)}</p>
                    <p className="text-xs font-bold text-emerald-400">Balance: {formatCurrency(walletBalance)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Message (Optional)</label>
                  <textarea
                    value={investMessage}
                    onChange={(e) => setInvestMessage(e.target.value)}
                    rows={3}
                    className="w-full px-5 py-4 rounded-xl bg-[#1A1D24] border border-white/5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all shadow-inner resize-none placeholder:text-slate-500"
                    placeholder="Add a short note for the founder..."
                  />
                </div>

                {investError && <p className="text-sm font-bold text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{investError}</p>}

                <button
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                  onClick={() => {
                    if (!amountNumber || amountNumber < minAmount) {
                      setInvestError(`Minimum investment is ${formatCurrency(minAmount)}.`);
                      return;
                    }
                    setInvestError("");
                    setInvestStep("confirm");
                  }}
                >
                  Review Investment
                </button>
              </div>
            )}

            {investStep === "confirm" && (
              <div className="space-y-6 relative z-10">
                <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Total Commitment</p>
                  <p className="text-5xl font-black text-white mb-2">{formatCurrency(amountNumber)}</p>
                  <p className="text-sm font-medium text-slate-400">to <strong className="text-white">{startup.name}</strong></p>
                </div>

                {investMessage && (
                  <div className="rounded-xl bg-[#1A1D24] border border-white/5 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Attached Note</p>
                    <p className="text-sm text-slate-300 italic">&quot;{investMessage}&quot;</p>
                  </div>
                )}

                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-blue-500 focus:ring-blue-500"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <span className="text-sm leading-relaxed text-slate-300">
                    I understand that startup investing is high risk, and I may lose 100% of my investment if the company fails. I agree to the <a href="/terms" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline">Terms of Service</a> and understand the high risks associated with startup investing as outlined in the <a href="/terms" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline">Risk Disclosure</a>.
                  </span>
                </label>

                {investError && <p className="text-sm font-bold text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{investError}</p>}

                <div className="flex gap-3">
                  <button className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors" onClick={() => setInvestStep("input")}>
                    Go Back
                  </button>
                  <button
                    className="flex-[2] py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={submitInvestment}
                    disabled={investSubmitting || !acceptedTerms}
                  >
                    {investSubmitting ? <><Loader className="w-5 h-5 animate-spin" /> Sending Request...</> : "Send Request to Founder"}
                  </button>
                </div>
              </div>
            )}

            {investStep === "done" && (
              <div className="text-center py-6 relative z-10">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Request Sent!</h3>
                <p className="text-slate-400 font-medium mb-8 leading-relaxed max-w-sm mx-auto">
                  Your investment request of <strong className="text-white">{formatCurrency(investSuccess?.amount || amountNumber)}</strong> has been sent to the founder of {startup.name}. You&apos;ll be notified once they review it.
                </p>

                <button
                  className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  onClick={setInvestMessageAndReset}
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
