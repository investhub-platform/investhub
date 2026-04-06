import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "lucide-react";
import { formatCurrency } from "@/data/mockData";
import api from "@/lib/axios";
import AppNavbar from "../components/layout/AppNavBar";
import { useAuth } from "@/features/auth/useAuth";
import StartupDetailsHero from "@/components/startup-details/StartupDetailsHero";
import StartupDetailsSidebar from "@/components/startup-details/StartupDetailsSidebar";
import InvestmentModal from "@/components/startup-details/InvestmentModal";
import SummaryTab from "@/components/startup-details/SummaryTab";
// import AIAnalysisTab from "@/components/startup-details/AIAnalysisTab";
import AIAnalysisContainer from "@/components/startup-details/AIAnalysisContainer";

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
  const [fundingType, setFundingType] = useState("Equity");
  const [proposedPercentage, setProposedPercentage] = useState("");
  const [investMessage, setInvestMessage] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
              } catch {
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
          } catch (err) {
            const startupStatus = err?.response?.status;
            if (startupStatus && startupStatus !== 404) {
              if (mounted) setError("Failed to load record");
              return;
            }

            try {
              await fetchIdea();
              return;
            } catch {
              if (mounted) setError("Record not found");
              return;
            }
          }
        }

        try {
          await fetchIdea();
        } catch (err) {
          const ideaStatus = err?.response?.status;
          if (ideaStatus && ideaStatus !== 404) {
            if (mounted) setError("Failed to load record");
            return;
          }

          try {
            await fetchStartup();
          } catch {
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
    return (
      <div className={`${isModal ? "h-full min-h-[400px]" : "min-h-screen"} bg-[#020617] flex flex-col items-center justify-center`}>
        <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading details...</p>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className={`${isModal ? "h-full min-h-[400px]" : "min-h-screen"} bg-[#020617] flex items-center justify-center p-6`}>
        <p className="text-slate-400">{error || "Record not found"}</p>
      </div>
    );
  }

  const fundingPercent = startup.fundingGoal > 0
    ? Math.round((startup.currentFunding / startup.fundingGoal) * 100)
    : 0;

  const amountNumber = Number(investAmount || 0);
  const minAmount = 1000;
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
    setAcceptedTerms(false);
    setFundingType("Equity");
    setProposedPercentage("");
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
    const parsedPercentage = Number(proposedPercentage);
    if (
      fundingType !== "SAFE" &&
      (!Number.isFinite(parsedPercentage) || parsedPercentage <= 0 || parsedPercentage > 100)
    ) {
      setInvestError("Enter a valid proposed percentage between 0 and 100.");
      return;
    }
    if (!acceptedTerms) {
      setInvestError("Please accept the Terms of Service and Risk Disclosure to continue.");
      return;
    }

    const founderId =
      startup?.startupProfile?.raw?.UserID ||
      startup?.startupProfile?.raw?.userId ||
      startup?.startupProfile?.raw?.createdBy ||
      startup?.raw?.createdBy ||
      startup?.raw?.UserID ||
      startup?.raw?.userId ||
      startup?.raw?.ownerId;

    const ideaId = startup?.id;

    if (!founderId || !ideaId) {
      setInvestError("Founder or idea details are missing. Please contact support.");
      return;
    }

    try {
      setInvestSubmitting(true);
      const investorId = user?.id || user?._id;
      await api.post("/v1/requests", {
        investorId,
        founderId,
        ideaId,
        amount: amountNumber,
        fundingType,
        proposedPercentage: fundingType === "SAFE" ? null : parsedPercentage,
        message: investMessage || "",
        acceptedTerms,
        direction: "investor_to_startup"
      });

      setInvestSuccess({ amount: amountNumber });
      setInvestStep("done");
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to send investment request.";
      setInvestError(msg);
    } finally {
      setInvestSubmitting(false);
    }
  };

  const closeInvestmentModal = () => {
    setIsInvestOpen(false);
    setInvestAmount("");
    setFundingType("Equity");
    setProposedPercentage("");
    setInvestMessage("");
    setAcceptedTerms(false);
    setInvestStep("input");
  };

  return (
    <div className={`${isModal ? "" : "min-h-screen"} bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden`}>
      {!isModal && <AppNavbar />}

      <StartupDetailsHero isModal={isModal} navigate={navigate} startup={startup} isPlan={isPlan} />

      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-20 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0 order-2 lg:order-1">
            <div className="flex gap-2 p-1.5 bg-[#0B0D10]/80 backdrop-blur-xl border border-white/10 rounded-2xl mb-8 mt-12 overflow-x-auto scrollbar-hide">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`relative px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-1 ${activeTab === i ? "text-white" : "text-slate-400 hover:text-white"}`}
                >
                  {activeTab === i && (
                    <motion.div
                      layoutId="startupDetailTab"
                      className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
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
                {activeTab === 1 && (
                  <AIAnalysisContainer startupId={startup.id} startup={startup} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <StartupDetailsSidebar
            startup={startup}
            isPlan={isPlan}
            isIdeaLikeRecord={isIdeaLikeRecord}
            detailsRows={detailsRows}
            fundingPercent={fundingPercent}
            walletBalance={walletBalance}
            investAmount={investAmount}
            setInvestAmount={setInvestAmount}
            openInvestModal={openInvestModal}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      <InvestmentModal
        isOpen={isInvestOpen}
        isPlan={isPlan}
        startup={startup}
        investSubmitting={investSubmitting}
        setIsInvestOpen={setIsInvestOpen}
        investStep={investStep}
        investAmount={investAmount}
        setInvestAmount={setInvestAmount}
        fundingType={fundingType}
        setFundingType={setFundingType}
        proposedPercentage={proposedPercentage}
        setProposedPercentage={setProposedPercentage}
        investMessage={investMessage}
        setInvestMessage={setInvestMessage}
        acceptedTerms={acceptedTerms}
        setAcceptedTerms={setAcceptedTerms}
        investError={investError}
        setInvestError={setInvestError}
        minAmount={minAmount}
        walletBalance={walletBalance}
        amountNumber={amountNumber}
        setInvestStep={setInvestStep}
        submitInvestment={submitInvestment}
        investSuccess={investSuccess}
        setInvestMessageAndReset={closeInvestmentModal}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default StartupDetail;

// ... (Keep inferPassedType, normalize, arrayify, formatDisplayDate, formatStatusLabel, resolveAssetUrl unchanged below)
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