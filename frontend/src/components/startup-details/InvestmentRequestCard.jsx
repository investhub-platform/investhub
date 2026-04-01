import { motion } from "framer-motion";
import { Check, X, Clock } from "lucide-react";

export default function InvestmentRequestCard({
  request,
  onAccept,
  onReject,
  isProcessing,
  formatCurrency,
}) {
  const investorName = request.investorId?.name || "Unknown Investor";
  const investorEmail = request.investorId?.email || "";
  const avatarInitials = investorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusConfig = {
    pending_founder: {
      icon: <Clock className="w-4 h-4" />,
      color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
      label: "Awaiting Your Decision"
    },
    pending_mentor: {
      icon: <Clock className="w-4 h-4" />,
      color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      label: "Pending Mentor Review"
    },
    approved: {
      icon: <Check className="w-4 h-4" />,
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      label: "Approved"
    },
    rejected: {
      icon: <X className="w-4 h-4" />,
      color: "bg-red-500/10 border-red-500/20 text-red-400",
      label: "Rejected"
    }
  };

  const status = statusConfig[request.requestStatus] || statusConfig.pending_founder;
  const showActions = request.requestStatus === "pending_founder";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{investorName}</p>
            {investorEmail && (
              <p className="text-[10px] text-slate-500 truncate">{investorEmail}</p>
            )}
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-widest w-fit shrink-0 ${status.color}`}
        >
          {status.icon}
          {status.label}
        </div>
      </div>

      {/* Amount */}
      <div className="p-4 rounded-xl bg-black/20 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
          Investment Amount
        </p>
        <p className="text-2xl font-black text-white">{formatCurrency(request.amount)}</p>
      </div>

      {/* Message */}
      {request.message && (
        <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Message
          </p>
          <p className="text-sm text-slate-300 italic">&quot;{request.message}&quot;</p>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-[9px] text-slate-500 mb-4">
        Sent {new Date(request.createdUtc).toLocaleDateString()} at{" "}
        {new Date(request.createdUtc).toLocaleTimeString()}
      </p>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 pt-4 border-t border-white/5">
          <button
            onClick={() => onReject(request._id || request.id)}
            disabled={isProcessing}
            className="flex-1 px-3 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <X className="w-3.5 h-3.5" /> Reject
          </button>
          <button
            onClick={() => onAccept(request._id || request.id)}
            disabled={isProcessing}
            className="flex-1 px-3 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check className="w-3.5 h-3.5" /> Accept
          </button>
        </div>
      )}

      {/* Decision Info */}
      {request.founderDecision?.decidedAt && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Your Decision
          </p>
          <p className="text-sm font-medium text-white mb-1">
            {request.founderDecision.decision === "accept" ? "✓ Accepted" : "✗ Rejected"}
          </p>
          {request.founderDecision.comment && (
            <p className="text-xs text-slate-400 italic">{request.founderDecision.comment}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}
