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
  FileText,
  Image,
  Shield,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/data/mockData";
import api from "@/lib/axios";
import AppNavbar from "../components/layout/AppNavBar";
import { useAuth } from "@/features/auth/useAuth";

const tabs = ["Summary & Pitch", "AI Analysis"];

const StartupDetail = ({ isModal = false }) => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passed = location.state?.startup || null;

  const [startup, setStartup] = useState(
    passed ? normalize(passed, inferPassedType(passed)) : null
  );
  const [loading, setLoading] = useState(!passed);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState(0);
  const [investAmount, setInvestAmount] = useState("");
  const [investMessage, setInvestMessage] = useState("");
  const [isInvestOpen, setIsInvestOpen] = useState(false);
  const [investStep, setInvestStep] = useState("input");
  const [investSubmitting, setInvestSubmitting] = useState(false);
  const [investError, setInvestError] = useState("");
  const [investSuccess, setInvestSuccess] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    let mounted = true;

    const hydrateLinkedStartup = async (record) => {
      if (record?.startupProfile) return record;

      if (record?.raw?.StartupId && typeof record.raw.StartupId === "object") {
        return {
          ...record,
          startupProfile: normalize(record.raw.StartupId, "startup"),
        };
      }

      const startupRef =
        typeof record?.startupRefId === "object"
          ? record?.startupRefId?._id || record?.startupRefId?.id
          : record?.startupRefId;

      const isObjectId = /^[a-fA-F0-9]{24}$/.test(String(startupRef || ""));
      if (!isObjectId) return record;

      if (!startupRef) return record;

      try {
        const startupRes = await api.get(`/v1/startups/${startupRef}`);
        const startupData = startupRes?.data?.data;
        if (!startupData) return record;
        return {
          ...record,
          startupProfile: normalize(startupData, "startup"),
        };
      } catch {
        return record;
      }
    };

    const load = async () => {
      const passedType = passed ? inferPassedType(passed) : null;
      const isStartupRoute = location.pathname.includes("/startup/");
      const isIdeaRoute = location.pathname.includes("/idea/");
      const isPlanRoute = location.pathname.includes("/plan/");

      const preferIdeaFetch = isIdeaRoute || isPlanRoute || passedType === "idea" || passedType === "plan";
      const preferStartupFetch = isStartupRoute && passedType !== "idea" && passedType !== "plan";

      const fetchIdea = async () => {
        const resIdea = await api.get(`/v1/ideas/${id}`);
        if (!mounted) return false;

        const data = resIdea?.data?.data;
        const type = data?.isIdea === false ? "plan" : "idea";
        const normalized = normalize(data, type);
        const withStartup = await hydrateLinkedStartup(normalized);
        if (mounted) {
          setStartup(withStartup);
          setError(null);
        }
        return true;
      };

      const fetchStartup = async () => {
        const resStartup = await api.get(`/v1/startups/${id}`);
        if (!mounted) return false;
        const data = resStartup?.data?.data;
        if (mounted) {
          setStartup(normalize(data, "startup"));
          setError(null);
        }
        return true;
      };

      setLoading(true);

      try {
        if (preferIdeaFetch) {
          try {
            await fetchIdea();
            return;
          } catch (ideaErr) {
            const ideaStatus = ideaErr?.response?.status;
            if (ideaStatus && ideaStatus !== 404) {
              if (mounted) setError("Failed to load record");
              return;
            }

            if (passed) {
              const fallback = await hydrateLinkedStartup(normalize(passed, passedType || "idea"));
              if (mounted) {
                setStartup(fallback);
                setError(null);
              }
              return;
            }

            if (isStartupRoute) {
              try {
                await fetchStartup();
                return;
              } catch (startupErr) {
                const startupStatus = startupErr?.response?.status;
                if (startupStatus !== 404) {
                  console.error("Failed to load detail", startupErr);
                }
                if (mounted) setError("Record not found");
                return;
              }
            }

            if (mounted) setError("Record not found");
            return;
          }
        }

        if (preferStartupFetch) {
          try {
            await fetchStartup();
            return;
          } catch (startupErr) {
            const startupStatus = startupErr?.response?.status;
            if (startupStatus && startupStatus !== 404) {
              console.error("Failed to load detail", startupErr);
              if (mounted) setError("Failed to load record");
              return;
            }

            try {
              await fetchIdea();
              return;
            } catch (ideaErr) {
              const ideaStatus = ideaErr?.response?.status;
              if (ideaStatus && ideaStatus !== 404) {
                console.error("Failed to load detail", ideaErr);
              }
              if (mounted) setError("Record not found");
              return;
            }
          }
        }

        try {
          await fetchIdea();
        } catch (ideaErr) {
          const ideaStatus = ideaErr?.response?.status;
          if (ideaStatus && ideaStatus !== 404) {
            if (mounted) setError("Failed to load record");
            return;
          }

          try {
            await fetchStartup();
          } catch (startupErr) {
            const startupStatus = startupErr?.response?.status;
            if (startupStatus && startupStatus !== 404) {
              console.error("Failed to load detail", startupErr);
            }
            if (mounted) setError("Record not found");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id, passed, location.pathname]);

  useEffect(() => {
    let mounted = true;

    const loadWallet = async () => {
      if (!user?._id && !user?.id) return;
      try {
        const res = await api.get("/v1/wallets/me");
        const payload = res?.data?.data || res?.data || {};
        if (mounted) {
          setWalletBalance(Number(payload?.balance || 0));
        }
      } catch (err) {
        console.error("Failed to load wallet balance", err);
      }
    };

    loadWallet();
    return () => {
      mounted = false;
    };
  }, [user?._id, user?.id]);

  if (loading) {
    return <div className={`${isModal ? "" : "min-h-screen"} bg-background flex items-center justify-center p-6`}>Loading...</div>;
  }

  if (error || !startup) {
    return (
      <div className={`${isModal ? "" : "min-h-screen"} bg-background flex items-center justify-center p-6`}>
        <p className="text-muted-foreground">{error || "Record not found"}</p>
      </div>
    );
  }

  const fundingPercent = startup.fundingGoal > 0
    ? Math.round((startup.currentFunding / startup.fundingGoal) * 100)
    : 0;

  const amountNumber = Number(investAmount || 0);
  const minAmount = 10000;
  const isPlan = startup.recordType === "plan";
  const isIdeaLikeRecord = startup.recordType === "idea" || startup.recordType === "plan";

  const ideaCategory =
    startup.raw?.category === "Other"
      ? startup.raw?.customCategory || "Other"
      : startup.raw?.customCategory || startup.raw?.category || startup.industry || "N/A";

  const detailsRows = isIdeaLikeRecord
    ? [
        ["Category", ideaCategory],
        ["Budget", startup.fundingGoal ? formatCurrency(startup.fundingGoal) : "N/A"],
        ["Timeline", startup.raw?.timeline || "N/A"],
        ["Status", formatStatusLabel(startup.raw?.status)],
        ["Version", startup.raw?.currentVersion ? `v${startup.raw.currentVersion}` : "N/A"],
        ["Created", formatDisplayDate(startup.raw?.createdUtc)],
        ["Pitch Files", `${startup.pitchDeckFiles?.length || 0} attached`],
      ]
    : [
        ["Stage", startup.startupProfile?.stage || startup.stage || "N/A"],
        [
          "Tech Stack",
          startup.startupProfile?.techStack?.length
            ? startup.startupProfile.techStack.join(", ")
            : startup.techStack?.length
            ? startup.techStack.join(", ")
            : "N/A",
        ],
        ["Industry", startup.startupProfile?.industry || startup.industry || "N/A"],
        [
          "Milestones",
          `${startup.startupProfile?.milestonesCompleted ?? startup.milestonesCompleted}/${startup.startupProfile?.milestonesTotal ?? startup.milestonesTotal} Completed`,
        ],
      ];

  const openInvestModal = () => {
    setInvestError("");
    setInvestSuccess(null);
    setInvestStep("input");
    setIsInvestOpen(true);
  };

  const submitInvestment = async () => {
    setInvestError("");

    if (!user?._id && !user?.id) {
      setInvestError("You must be logged in to invest.");
      return;
    }
    if (!amountNumber || amountNumber < minAmount) {
      setInvestError(`Minimum investment is ${formatCurrency(minAmount)}.`);
      return;
    }
    if (amountNumber > walletBalance) {
      setInvestError("Insufficient wallet balance. Please top up your wallet first.");
      return;
    }

    const startupOwnerId =
      startup?.startupProfile?.raw?.UserID ||
      startup?.startupProfile?.raw?.userId ||
      startup?.startupProfile?.raw?.createdBy ||
      startup?.raw?.createdBy ||
      startup?.raw?.UserID ||
      startup?.raw?.userId ||
      startup?.raw?.ownerId;

    const startupId =
      startup?.startupProfile?.id ||
      startup?.startupRefId ||
      (startup.recordType === "startup" ? startup.id : null);

    if (!startupOwnerId || !startupId) {
      setInvestError("Startup owner details are missing. Please contact support.");
      return;
    }

    try {
      setInvestSubmitting(true);
      await api.post("/v1/wallets/invest", {
        amount: amountNumber,
        startupId,
        startupOwnerId,
      });

      setWalletBalance((prev) => Math.max(0, prev - amountNumber));
      setInvestSuccess({ amount: amountNumber });
      setInvestStep("done");
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to complete investment.";
      setInvestError(msg);
    } finally {
      setInvestSubmitting(false);
    }
  };

  return (
    <div className={`${isModal ? "" : "min-h-screen"} bg-background`}>
      {!isModal && <AppNavbar />}

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

          {startup.photoUrl && (
            <div className="mb-5 rounded-3xl overflow-hidden border border-white/10">
              <img src={startup.photoUrl} alt={startup.name} className="w-full max-h-72 object-cover" />
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl gradient-blue flex items-center justify-center text-lg font-bold shrink-0 overflow-hidden">
                {startup.photoUrl ? (
                  <img src={startup.photoUrl} alt={startup.name} className="w-full h-full object-cover" />
                ) : (
                  startup.logo || startup.name?.charAt(0)
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl heading-tight">{startup.name}</h1>
                <p className="text-muted-foreground mt-1">{startup.tagline}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs text-accent">
                    {isPlan ? "Investor mandate" : `Verified by Mentor ${startup.mentorName}`}
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
          <div className="lg:order-2 lg:w-[340px] shrink-0 space-y-6">
            {!isPlan && (
              <div className="glass-card p-6 border-primary/20">
                <h2 className="text-lg font-semibold mb-1">Secure Investment Tier 1</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Funds locked in escrow, milestone-based release.
                </p>

                <div className="space-y-3 mb-5">
                  <label className="text-sm text-muted-foreground">Investment Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$
                    </span>
                    <input
                      type="text"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="10,000"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/[0.07] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                  </div>
                  <p className="text-xs text-accent">{formatCurrency(walletBalance)} Available in Wallet</p>
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
                  Wallet transfer is recorded instantly in transaction history.
                </p>
              </div>
            )}

            <div className="obsidian-card p-5">
              <h3 className="text-sm font-semibold mb-4">
                {startup.recordType === "idea"
                  ? "Idea Details"
                  : isPlan
                  ? "Mandate Details"
                  : "Startup Details"}
              </h3>
              <div className="space-y-3 text-sm">
                {detailsRows.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
              {isIdeaLikeRecord && startup.raw?.expectedOutcomes && (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-muted-foreground mb-1">Expected Outcomes</p>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{startup.raw.expectedOutcomes}</p>
                </div>
              )}
              {!isIdeaLikeRecord && (
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Funding Progress</span>
                    <span>{fundingPercent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full gradient-blue" style={{ width: `${fundingPercent}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1.5">
                    <span className="text-muted-foreground">{formatCurrency(startup.currentFunding)}</span>
                    <span className="text-muted-foreground">{formatCurrency(startup.fundingGoal)}</span>
                  </div>
                </div>
              )}
            </div>

            {startup.recordType === "idea" && startup.startupProfile && (
              <div className="obsidian-card p-5">
                <h3 className="text-sm font-semibold mb-3">Idea Owner Startup</h3>
                {startup.startupProfile.photoUrl && (
                  <img
                    src={startup.startupProfile.photoUrl}
                    alt={startup.startupProfile.name}
                    className="w-full h-36 object-cover rounded-xl border border-white/10 mb-3"
                  />
                )}
                <p className="text-sm font-semibold">{startup.startupProfile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{startup.startupProfile.tagline}</p>
              </div>
            )}
          </div>

          <div className="flex-1 lg:order-1 min-w-0">
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {!isPlan && isInvestOpen && (
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
                  <p className="font-medium">Investment completed successfully</p>
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
      <p className="text-muted-foreground leading-relaxed">{startup.pitchSummary || "No summary available."}</p>

      {startup.pitchDeckText && (
        <div className="mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Pitch Deck Notes</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{startup.pitchDeckText}</p>
        </div>
      )}

      {startup.pitchDeckFiles?.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-sm font-semibold">Pitch Deck Files</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {startup.pitchDeckFiles.map((file, idx) => {
              const isImage = (file?.mimeType || "").startsWith("image/");
              return (
                <div key={`${file.url}-${idx}`} className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                  {isImage ? (
                    <img src={file.url} alt={file.originalName || `pitch-${idx + 1}`} className="w-full h-36 object-cover rounded-lg border border-white/10" />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-300"><FileText className="w-4 h-4" /> {file.originalName || "Document"}</div>
                  )}
                  <a href={file.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" /> Open file
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {startup.tags?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {startup.tags.map((tag) => (
            <span key={tag} className="pill-filter text-xs py-1 px-3">
              {tag}
            </span>
          ))}
        </div>
      )}
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

      <div className="mb-6 p-4 rounded-2xl bg-white/[0.03]">
        <p className="text-sm text-muted-foreground mb-2">Risk Score</p>
        <div className="flex items-end gap-3">
          <span className={`text-4xl font-bold ${riskColor}`}>{startup.aiRiskScore}</span>
          <span className="text-sm text-muted-foreground mb-1">/ 100 - {startup.aiRiskLevel}</span>
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



export default StartupDetail;

function inferPassedType(record) {
  if (record?.isIdea === false) return "plan";
  if (record?.isIdea === true) return "idea";
  return "startup";
}

function normalize(record, type = "idea") {
  if (!record) return null;

  if (type === "idea" || type === "plan") {
    const tags = arrayify(record.customCategory ? [record.customCategory] : (record.category ? [record.category] : record.tags));
    const milestones = arrayify(record.milestones);
    const techStack = arrayify(record.techStack);
    const team = arrayify(record.team);
    const aiInsights = record.aiInsights && typeof record.aiInsights === "object" ? record.aiInsights : {};
    const startupRefId = typeof record.StartupId === "object" ? record.StartupId?._id || record.StartupId?.id : record.StartupId;

    const normalizedPitchDeckFiles = arrayify(record.pitchDeckFiles).map((file) => {
      if (typeof file === "string") {
        return {
          url: resolveAssetUrl(file),
          originalName: null,
          mimeType: null,
          size: null,
        };
      }
      return {
        url: resolveAssetUrl(file?.url || ""),
        originalName: file?.originalName || null,
        mimeType: file?.mimeType || null,
        size: file?.size || null,
      };
    }).filter((f) => Boolean(f.url));

    return {
      id: record._id || record.id,
      recordType: type,
      name: record.title || "Untitled",
      tagline: record.description || (record.aiSummary ? String(record.aiSummary).split("\n")[0] : ""),
      logo: resolveAssetUrl(record.ImgURL || record.logo || ""),
      photoUrl: resolveAssetUrl(record.ImgURL || record.logo || ""),
      mentorName: record.mentorName || "Mentor",
      stage: record.stage || "",
      techStack,
      milestones,
      milestonesCompleted: milestones.filter((m) => m?.completed).length,
      milestonesTotal: milestones.length,
      currentFunding: Number(record.currentFunding || 0),
      fundingGoal: Number(record.budget || record.fundingGoal || 0),
      pitchSummary: record.aiSummary || record.description || "",
      pitchDeckText: record.pitchDeckText || null,
      pitchDeckFiles: normalizedPitchDeckFiles,
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
      startupRefId: startupRefId || null,
      startupProfile: null,
      raw: record,
    };
  }

  const milestones = arrayify(record.milestones);
  const aiInsights = record.aiInsights && typeof record.aiInsights === "object" ? record.aiInsights : {};
  return {
    id: record._id || record.id,
    recordType: "startup",
    name: record.name || record.title || "Untitled",
    tagline: record.tagline || record.description || "",
    logo: resolveAssetUrl(record.ImgURL || record.logo || ""),
    photoUrl: resolveAssetUrl(record.ImgURL || record.logo || ""),
    mentorName: record.mentorName || "Mentor",
    stage: record.stage || "",
    techStack: arrayify(record.techStack),
    milestones,
    milestonesCompleted: milestones.filter((m) => m?.completed).length,
    milestonesTotal: milestones.length,
    currentFunding: Number(record.currentFunding || 0),
    fundingGoal: Number(record.fundingGoal || 0),
    pitchSummary: record.pitchSummary || record.description || "",
    pitchDeckText: record.pitchDeckText || null,
    pitchDeckFiles: arrayify(record.pitchDeckFiles).map((f) => (typeof f === "string" ? { url: resolveAssetUrl(f) } : { ...f, url: resolveAssetUrl(f?.url || "") })),
    tags: arrayify(record.tags),
    industry: record.industry || "",
    aiRiskScore: record.aiRiskScore || 0,
    aiRiskLevel: record.aiRiskLevel || "UNKNOWN",
    aiInsights: {
      summary: arrayify(aiInsights.summary),
      marketSentiment: aiInsights.marketSentiment || "",
    },
    team: arrayify(record.team),
    startupRefId: record._id || record.id,
    startupProfile: null,
    raw: record,
  };
}

function arrayify(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
  return [value];
}

function formatDisplayDate(value) {
  if (!value) return "N/A";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString();
}

function formatStatusLabel(value) {
  if (!value) return "N/A";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function resolveAssetUrl(url) {
  if (!url) return "";
  if (String(url).startsWith("http://") || String(url).startsWith("https://")) return url;
  const baseFromApi = String(api.defaults?.baseURL || "");
  const base = (baseFromApi.startsWith("http")
    ? baseFromApi.replace(/\/api\/?$/, "")
    : "http://localhost:5000").replace(/\/+$/, "");
  if (String(url).startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
}
