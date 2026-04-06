import { useState } from "react";

export default function MonthlyPayoutModal({
  open,
  onClose,
  onConfirm,
  suggested = 0,
  investorName = "Investor",
  startupTitle = "",
  loading = false,
  error = ""
}) {
  const [amount, setAmount] = useState(suggested);
  const [localError, setLocalError] = useState("");

  if (!open) return null;

  const formatCurrency = (v) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v || 0);

  const handleConfirm = () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setLocalError("Enter a valid payout amount greater than 0.");
      return;
    }
    setLocalError("");
    onConfirm && onConfirm(n);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4">
        <div className="bg-[#071018] border border-white/6 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-white">Send Monthly Return</h3>
                <p className="mt-1 text-sm text-slate-400">To: <span className="font-semibold text-slate-200">{investorName}</span></p>
                {startupTitle && <p className="text-xs text-slate-500 mt-1">Startup: <span className="font-medium text-slate-300">{startupTitle}</span></p>}
              </div>
              <button
                aria-label="Close modal"
                onClick={onClose}
                className="text-slate-400 hover:text-white rounded-full p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-5">
              <label className="block text-sm text-slate-400 mb-2">Monthly return amount (USD)</label>
              <div className="flex items-center gap-3">
                <input
                  autoFocus
                  className="w-full bg-[#021017] border border-white/6 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="text-sm text-slate-400">{formatCurrency(Number(amount) || 0)}</div>
              </div>
              {(localError || error) && (
                <p className="mt-2 text-xs text-red-400">{localError || error}</p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/8 text-sm font-medium text-white/80 hover:bg-white/6"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-[0_8px_30px_rgba(59,130,246,0.18)] hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Return"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
