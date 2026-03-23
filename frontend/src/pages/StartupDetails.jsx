// StartupDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
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
import { formatCurrency } from "@/data/mockData";
import api from "@/lib/axios";
import AppNavbar from "../components/layout/AppNavBar";
import { useAuth } from "@/features/auth/useAuth";

const tabs = ["Summary & Pitch", "AI Analysis", "Milestones", "Team"];

const StartupDetail = ({ isModal = false }) => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Use startup passed in route state if available (faster, avoids refetch)
  const passed = location.state?.startup || null;

  const [startup, setStartup] = useState(
    passed ? normalize(passed, passed.isIdea ? "idea" : "startup") : null
  );
  const [loading, setLoading] = useState(!passed);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (passed) return;
      setLoading(true);
      try {
        // Try idea endpoint first
        const resIdea = await api.get(`/v1/ideas/${id}`);
        if (!mounted) return;
        const data = resIdea?.data?.data;
        setStartup(normalize(data, "idea"));
      } catch {
        try {
          // Fallback to startup endpoint
          const res = await api.get(`/v1/startups/${id}`);
          if (!mounted) return;
          const data = res?.data?.data;
          setStartup(normalize(data, "startup"));
        } catch (err) {
          console.error("Failed to load detail", err);
          if (mounted) setError("Record not found");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id, passed]);

  // If a passed object exists, ensure it's normalized
  useEffect(() => {
    if (passed) setStartup(normalize(passed, passed.isIdea ? "idea" : "startup"));
  }, [passed]);
  const [activeTab, setActiveTab] = useState(0);
  const [investAmount, setInvestAmount] = useState("");
  const [investMessage, setInvestMessage] = useState("");
  const [isInvestOpen, setIsInvestOpen] = useState(false);
  const [investStep, setInvestStep] = useState("input");
  const [investSubmitting, setInvestSubmitting] = useState(false);
  const [investError, setInvestError] = useState("");
  const [investSuccess, setInvestSuccess] = useState(null);

  if (loading) {
    return <div className={`${isModal ? "" : "min-h-screen"} bg-background flex items-center justify-center p-6`}>Loading…</div>;
  }

  if (error || !startup) {
    return (
      <div className={`${isModal ? "" : "min-h-screen"} bg-background flex items-center justify-center p-6`}>
        <p className="text-muted-foreground">{error || "Record not found"}</p>
      </div>
    );
  }

  const fundingPercent = Math.round(
    (startup.currentFunding / startup.fundingGoal) * 100
  );

  const amountNumber = Number(investAmount || 0);
  const minAmount = 10000;

  const openInvestModal = () => {
    setInvestError("");
    setInvestSuccess(null);
    setInvestStep("input");
    setIsInvestOpen(true);
  };

  const submitInvestment = async () => {
    setInvestError("");

    const investorId = user?._id || user?.id;
    if (!investorId) {
      setInvestError("You must be logged in to invest.");
      return;
    }
    if (!amountNumber || amountNumber < minAmount) {
      setInvestError(`Minimum investment is ${formatCurrency(minAmount)}.`);
      return;
    }

    try {
      setInvestSubmitting(true);
      const payload = {
        investorId,
        createdBy: investorId,
        ideaId: startup?.raw?._id || startup?.id,
        StartupsId: startup?.raw?.StartupId || null,
        amount: amountNumber,
        message: investMessage || null,
      };

      const res = await api.post("/v1/requests", payload);
      setInvestSuccess(res?.data?.data || { amount: amountNumber });
      setInvestStep("done");
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to submit investment request.";
      setInvestError(msg);
    } finally {
      setInvestSubmitting(false);
    }
  };

  return (
    <div className={`${isModal ? "" : "min-h-screen"} bg-background`}> 
      {!isModal && <AppNavbar />}

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className={`max-w-7xl mx-auto px-4 md:px-8 ${isModal ? "pt-6 pb-6" : "pt-28 pb-8 md:pb-12"} relative`}>
          {isModal ? (
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Close
            </button>
          ) : (
            <Link
              to="/app/explore"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Explore
            </Link>
          )}

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
                onClick={openInvestModal}
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
                  ["Tech Stack", startup.techStack?.length ? startup.techStack.join(", ") : "N/A"],
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

      {/* Invest modal with confirmation flow */}
      {isInvestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => !investSubmitting && setIsInvestOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a1020] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invest in {startup.name}</h3>
              <button className="text-sm text-muted-foreground" onClick={() => !investSubmitting && setIsInvestOpen(false)}>
                Close
              </button>
            </div>

            {investStep === "input" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Amount (USD)</label>
                  <input
                    type="text"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="10000"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum {formatCurrency(minAmount)}</p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Message (optional)</label>
                  <textarea
                    value={investMessage}
                    onChange={(e) => setInvestMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground"
                    placeholder="Add a short note for the founder"
                  />
                </div>

                {investError && <p className="text-sm text-red-400">{investError}</p>}

                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 rounded-lg border border-white/15" onClick={() => setIsInvestOpen(false)}>
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg gradient-blue font-medium"
                    onClick={() => {
                      if (!amountNumber || amountNumber < minAmount) {
                        setInvestError(`Minimum investment is ${formatCurrency(minAmount)}.`);
                        return;
                      }
                      setInvestError("");
                      setInvestStep("confirm");
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {investStep === "confirm" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="text-sm text-muted-foreground">Confirm Investment</p>
                  <p className="text-xl font-semibold mt-1">{formatCurrency(amountNumber)}</p>
                  <p className="text-sm text-muted-foreground mt-2">to {startup.name}</p>
                </div>

                {investMessage && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-sm text-muted-foreground">Message</p>
                    <p className="text-sm mt-1">{investMessage}</p>
                  </div>
                )}

                {investError && <p className="text-sm text-red-400">{investError}</p>}

                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 rounded-lg border border-white/15" onClick={() => setInvestStep("input")}>
                    Back
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg gradient-blue font-medium disabled:opacity-60"
                    onClick={submitInvestment}
                    disabled={investSubmitting}
                  >
                    {investSubmitting ? "Submitting..." : "Confirm Investment"}
                  </button>
                </div>
              </div>
            )}

            {investStep === "done" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-accent/10 border border-accent/30 p-4">
                  <p className="font-medium">Investment request submitted</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Amount: {formatCurrency(investSuccess?.amount || amountNumber)}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 rounded-lg gradient-blue font-medium"
                    onClick={() => {
                      setIsInvestOpen(false);
                      setInvestAmount("");
                      setInvestMessage("");
                      setInvestStep("input");
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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

// Normalize backend records into the shape expected by this view
function normalize(record, type = "idea") {
  if (!record) return null;

  if (type === "idea") {
    const tags = arrayify(record.customCategory ? [record.customCategory] : (record.category ? [record.category] : record.tags));
    const milestones = arrayify(record.milestones);
    const techStack = arrayify(record.techStack);
    const team = arrayify(record.team);
    const aiInsights = record.aiInsights && typeof record.aiInsights === "object" ? record.aiInsights : {};

    return {
      id: record._id || record.id,
      name: record.title || "Untitled",
      tagline: record.description || (record.aiSummary ? String(record.aiSummary).split("\n")[0] : ""),
      logo: record.ImgURL || record.logo || "",
      mentorName: record.mentorName || "Mentor",
      stage: record.stage || "",
      techStack,
      milestones,
      milestonesCompleted: milestones.filter((m) => m?.completed).length,
      milestonesTotal: milestones.length,
      currentFunding: record.currentFunding || 0,
      fundingGoal: record.budget || record.fundingGoal || 0,
      fundingGoalDisplay: record.budget || record.fundingGoal || 0,
      pitchSummary: record.aiSummary || record.description || "",
      tags,
      industry: record.category || record.industry || "",
      aiRiskScore: record.aiRiskScore || 0,
      aiRiskLevel: record.aiRiskLevel || "UNKNOWN",
      aiInsights: {
        summary: arrayify(aiInsights.summary),
        marketSentiment: aiInsights.marketSentiment || "",
      },
      team: team.length
        ? team
        : (record.createdBy
          ? [{ name: "Founder", role: "Founder", avatar: String(record.createdBy).slice(0, 2).toUpperCase() }]
          : []),
      raw: record,
    };
  }

  // startup type
  const milestones = arrayify(record.milestones);
  const aiInsights = record.aiInsights && typeof record.aiInsights === "object" ? record.aiInsights : {};
  return {
    id: record._id || record.id,
    name: record.name || record.title || "Untitled",
    tagline: record.tagline || record.description || "",
    logo: record.logo || "",
    mentorName: record.mentorName || "Mentor",
    stage: record.stage || "",
    techStack: arrayify(record.techStack),
    milestones,
    milestonesCompleted: milestones.filter((m) => m?.completed).length,
    milestonesTotal: milestones.length,
    currentFunding: record.currentFunding || 0,
    fundingGoal: record.fundingGoal || 0,
    pitchSummary: record.pitchSummary || record.description || "",
    tags: arrayify(record.tags),
    industry: record.industry || "",
    aiRiskScore: record.aiRiskScore || 0,
    aiRiskLevel: record.aiRiskLevel || "UNKNOWN",
    aiInsights: {
      summary: arrayify(aiInsights.summary),
      marketSentiment: aiInsights.marketSentiment || "",
    },
    team: arrayify(record.team),
    raw: record,
  };
}

function arrayify(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
  return [value];
}