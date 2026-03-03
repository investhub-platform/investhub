// StartupOwnerDashboard.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppNavbar from "../components/layout/AppNavBar";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { ownedStartups } from "@/data/startupOwnerData";
import { formatCurrency } from "@/data/mockData";
import {
  Plus,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Users,
  Rocket,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const StartupOwnerDashboard = () => {
  const [activeView, setActiveView] = useState("manage");

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="flex">
        <DesktopSidebar />
        <main className="flex-1 px-4 md:px-8 pt-28 pb-12 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl heading-tight">Founder Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage your startups and investor relations.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveView(activeView === "create" ? "manage" : "create")}
              className="self-start flex items-center gap-2 px-5 py-2.5 rounded-full gradient-blue text-sm font-semibold glow-blue transition-all"
            >
              {activeView === "create" ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {activeView === "create" ? "Cancel" : "Add Startup"}
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {activeView === "create" ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CreateStartupForm onClose={() => setActiveView("manage")} />
              </motion.div>
            ) : (
              <motion.div
                key="manage"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {ownedStartups.map((startup, i) => (
                  <StartupManageCard key={startup.id} startup={startup} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

function StartupManageCard({ startup, index }) {
  const [expanded, setExpanded] = useState(index === 0);

  const statusConfig = {
    draft: { color: "bg-muted text-muted-foreground border-white/10", label: "Draft" },
    pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: "Pending Review" },
    approved: { color: "bg-accent/20 text-accent border-accent/30", label: "Approved" },
    rejected: { color: "bg-destructive/20 text-destructive border-destructive/30", label: "Rejected" },
  };

  const status = statusConfig[startup.status];
  const fundingPercent = startup.fundingGoal > 0
    ? Math.round((startup.currentFunding / startup.fundingGoal) * 100)
    : 0;
  const pendingRequests = startup.investorRequests.filter((r) => r.status === "pending").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="obsidian-card overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center text-sm font-bold shrink-0">
          {startup.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold">{startup.name}</h3>
            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${status.color}`}>
              {status.label}
            </span>
            {pendingRequests > 0 && (
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                {pendingRequests} pending request{pendingRequests > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{startup.tagline}</p>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-white/[0.07] pt-5">
              {/* Stats row */}
              {startup.status !== "draft" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon={DollarSign} label="Goal" value={formatCurrency(startup.fundingGoal)} />
                  <StatCard icon={DollarSign} label="Raised" value={formatCurrency(startup.currentFunding)} />
                  <StatCard icon={Users} label="Investors" value={String(startup.investorRequests.length)} />
                  <StatCard icon={Rocket} label="Stage" value={startup.stage} />
                </div>
              )}

              {/* Funding progress */}
              {startup.fundingGoal > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Funding Progress</span>
                    <span>{fundingPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full gradient-blue" style={{ width: `${fundingPercent}%` }} />
                  </div>
                </div>
              )}

              {/* Investor Requests */}
              {startup.investorRequests.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Investor Requests
                  </h4>
                  <div className="space-y-3">
                    {startup.investorRequests.map((req) => (
                      <InvestorRequestCard key={req.id} request={req} />
                    ))}
                  </div>
                </div>
              )}

              {startup.status === "draft" && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm mb-3">
                    This startup is in draft. Complete the profile to submit for review.
                  </p>
                  <button className="pill-filter pill-filter-active">Complete Profile</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-2xl bg-white/[0.03] text-center">
      <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function InvestorRequestCard({ request }) {
  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-yellow-400" />,
    accepted: <CheckCircle2 className="w-4 h-4 text-accent" />,
    declined: <XCircle className="w-4 h-4 text-destructive" />,
  };

  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full gradient-blue flex items-center justify-center text-[10px] font-bold shrink-0">
          {request.investorAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{request.investorName}</p>
            <div className="flex items-center gap-1.5">
              {statusIcons[request.status]}
              <span className="text-xs text-muted-foreground capitalize">{request.status}</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-primary mt-0.5">
            {formatCurrency(request.amount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{request.message}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1.5">{request.date}</p>

          {request.status === "pending" && (
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-1.5 rounded-full gradient-blue text-xs font-semibold">
                Accept
              </button>
              <button className="flex-1 py-1.5 rounded-full bg-white/5 border border-white/[0.07] text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateStartupForm({ onClose }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="obsidian-card p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Startup Submitted!</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Your startup has been submitted for review. You&apos;ll be notified once approved.
        </p>
        <button onClick={onClose} className="pill-filter pill-filter-active">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/[0.07] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm";

  return (
    <div className="obsidian-card p-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">Submit New Startup</h2>
      <div className="space-y-5">
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Startup Name</label>
          <input className={inputClass} placeholder="e.g. QuantumLeap" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Tagline</label>
          <input className={inputClass} placeholder="One line that captures your vision" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1.5 block">Pitch Description</label>
          <textarea className={`${inputClass} min-h-[120px] resize-none`} placeholder="Describe your startup, the problem you solve, and your unique advantage..." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Industry</label>
            <input className={inputClass} placeholder="e.g. B2B SaaS" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Stage</label>
            <input className={inputClass} placeholder="e.g. Pre-Seed" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Funding Goal (USD)</label>
            <input className={inputClass} placeholder="500000" type="number" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Tech Stack</label>
            <input className={inputClass} placeholder="React, Python, AWS" />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setSubmitted(true)}
          className="w-full py-3 rounded-full gradient-blue text-sm font-semibold glow-blue"
        >
          Submit for Review
        </motion.button>
      </div>
    </div>
  );
}

export default StartupOwnerDashboard;