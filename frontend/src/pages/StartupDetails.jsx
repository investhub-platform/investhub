// StartupDetail.jsx
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bookmark,
  Brain,
  CheckCircle2,
  Circle,
  ExternalLink,
  Shield,
  TrendingUp,
} from "lucide-react";
import { startups, formatCurrency } from "@/data/mockData";
import AppNavbar from "../components/layout/AppNavBar";

const tabs = ["Summary & Pitch", "AI Analysis", "Milestones", "Team"];

const StartupDetail = () => {
  const { id } = useParams();
  const startup = startups.find((s) => s.id === id);
  const [activeTab, setActiveTab] = useState(0);
  const [investAmount, setInvestAmount] = useState("");

  if (!startup) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Startup not found</p>
      </div>
    );
  }

  const fundingPercent = Math.round(
    (startup.currentFunding / startup.fundingGoal) * 100
  );

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-8 md:pb-12 relative">
          <Link
            to="/app/explore"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl gradient-blue flex items-center justify-center text-lg font-bold shrink-0">
                {startup.logo}
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl heading-tight">{startup.name}</h1>
                <p className="text-muted-foreground mt-1">{startup.tagline}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs text-accent">
                    Verified by Mentor {startup.mentorName}
                  </span>
                </div>
              </div>
            </div>
            <button className="self-start p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.07] transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Right sidebar (on top for mobile) */}
          <div className="lg:order-2 lg:w-[340px] shrink-0 space-y-6">
            {/* Investment CTA */}
            <div className="glass-card p-6 border-primary/20">
              <h2 className="text-lg font-semibold mb-1">Secure Investment Tier 1</h2>
              <p className="text-sm text-muted-foreground mb-5">
                Funds locked in escrow, milestone-based release.
              </p>

              <div className="space-y-3 mb-5">
                <label className="text-sm text-muted-foreground">Investment Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <input
                    type="text"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="10,000"
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/[0.07] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
                <p className="text-xs text-accent">$14,500 Available in Wallet</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                className="w-full py-3.5 rounded-full gradient-blue text-sm font-semibold glow-blue transition-all"
              >
                Commit Investment ($10k min)
              </motion.button>
              <p className="text-[11px] text-muted-foreground text-center mt-3">
                Transaction powered by InvestHub Virtual Ledger
              </p>
            </div>

            {/* Meta card */}
            <div className="obsidian-card p-5">
              <h3 className="text-sm font-semibold mb-4">Startup Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  ["Stage", startup.stage],
                  ["Tech Stack", startup.techStack.join(", ")],
                  ["Industry", startup.industry],
                  ["Milestones", `${startup.milestonesCompleted}/${startup.milestonesTotal} Completed`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Funding Progress</span>
                  <span>{fundingPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-blue"
                    style={{ width: `${fundingPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1.5">
                  <span className="text-muted-foreground">{formatCurrency(startup.currentFunding)}</span>
                  <span className="text-muted-foreground">{formatCurrency(startup.fundingGoal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 lg:order-1 min-w-0">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-full mb-6 overflow-x-auto scrollbar-hide">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className="relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
                >
                  {activeTab === i && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-0 gradient-blue rounded-full"
                      transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    />
                  )}
                  <span className={`relative z-10 ${activeTab === i ? "text-foreground" : "text-muted-foreground"}`}>
                    {tab}
                  </span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 0 && <SummaryTab startup={startup} />}
                {activeTab === 1 && <AIAnalysisTab startup={startup} />}
                {activeTab === 2 && <MilestonesTab startup={startup} />}
                {activeTab === 3 && <TeamTab startup={startup} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

function SummaryTab({ startup }) {
  return (
    <div className="obsidian-card p-6">
      <h2 className="text-xl font-semibold mb-4">Pitch Summary</h2>
      <p className="text-muted-foreground leading-relaxed">{startup.pitchSummary}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {startup.tags.map((tag) => (
          <span key={tag} className="pill-filter text-xs py-1 px-3">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function AIAnalysisTab({ startup }) {
  const riskColor =
    startup.aiRiskScore < 25
      ? "text-accent"
      : startup.aiRiskScore < 50
      ? "text-yellow-400"
      : "text-destructive";

  return (
    <div className="obsidian-card p-6 border-accent/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">AI Pre-Seed Evaluation</h2>
          <p className="text-xs text-muted-foreground">Powered by InvestHub AI Engine</p>
        </div>
      </div>

      {/* Risk Score */}
      <div className="mb-6 p-4 rounded-2xl bg-white/[0.03]">
        <p className="text-sm text-muted-foreground mb-2">Risk Score</p>
        <div className="flex items-end gap-3">
          <span className={`text-4xl font-bold ${riskColor}`}>{startup.aiRiskScore}</span>
          <span className="text-sm text-muted-foreground mb-1">/ 100 — {startup.aiRiskLevel}</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              startup.aiRiskScore < 25
                ? "bg-accent"
                : startup.aiRiskScore < 50
                ? "bg-yellow-400"
                : "bg-destructive"
            }`}
            style={{ width: `${startup.aiRiskScore}%` }}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-3">Key Findings</p>
        <ul className="space-y-2">
          {startup.aiInsights.summary.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Market Sentiment */}
      <div className="p-4 rounded-2xl bg-white/[0.03]">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium">Market Sentiment</p>
        </div>
        <p className="text-sm text-muted-foreground">{startup.aiInsights.marketSentiment}</p>
      </div>
    </div>
  );
}

function MilestonesTab({ startup }) {
  return (
    <div className="obsidian-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Milestones & Roadmap</h2>
        <button className="flex items-center gap-1.5 text-xs text-primary hover:underline">
          <ExternalLink className="w-3.5 h-3.5" />
          View GitHub
        </button>
      </div>
      <div className="space-y-4">
        {startup.milestones.map((m, i) => (
          <div key={i} className="flex items-start gap-3">
            {m.completed ? (
              <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground/40 mt-0.5 shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${!m.completed ? "text-muted-foreground" : ""}`}>
                {m.title}
              </p>
              <p className="text-xs text-muted-foreground">{m.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamTab({ startup }) {
  return (
    <div className="space-y-4">
      <div className="obsidian-card p-6">
        <h2 className="text-lg font-semibold mb-4">Founding Team</h2>
        <div className="grid gap-3">
          {startup.team.map((member) => (
            <div key={member.name} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03]">
              <div className="w-10 h-10 rounded-full gradient-blue flex items-center justify-center text-xs font-bold shrink-0">
                {member.avatar}
              </div>
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="obsidian-card p-6">
        <h2 className="text-lg font-semibold mb-4">Assigned Mentor</h2>
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03]">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent shrink-0">
            {startup.mentorName.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-medium">{startup.mentorName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield className="w-3 h-3 text-accent" />
              <p className="text-xs text-accent">Verified Technical Mentor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartupDetail;