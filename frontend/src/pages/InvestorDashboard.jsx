import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BriefcaseBusiness, Mail, Landmark, Building2 } from "lucide-react";
import AppNavbar from "../components/layout/AppNavBar";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { FilterBar } from "@/components/FilterBar";
import { StartupCard } from "@/components/StartupCard";
import api from "@/lib/axios";

const arrayify = (value) => {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
  return [value];
};

const extractPayload = (response) => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const pickContact = (record) => {
  return (
    record?.contactEmail ||
    record?.email ||
    record?.investorEmail ||
    record?.createdBy?.email ||
    ""
  );
};

const normalizeMandate = (item, index) => {
  const createdBy = item?.createdBy;
  const mandateTitle = item?.title || item?.name || "Untitled mandate";
  const investorName =
    item?.investorName ||
    item?.createdByName ||
    (typeof createdBy === "object" ? createdBy?.name : "") ||
    "Unknown investor";

  const preferredIndustries = arrayify(item?.preferredIndustries || item?.industries || item?.category || item?.customCategory);
  const minCheck = Number(item?.minCheckSize || item?.targetCheckSize || item?.budget || 0);
  const maxCheck = Number(item?.maxCheckSize || 0);
  const contactEmail = pickContact(item);

  return {
    id: item?._id || item?.id || `${mandateTitle}-${index}`,
    mandateTitle,
    investorName,
    preferredIndustries,
    minCheck,
    maxCheck,
    contactEmail,
    summary: item?.description || item?.expectedOutcomes || item?.aiSummary || "No additional preference details provided.",
  };
};

const formatMoney = (value) => {
  if (!Number.isFinite(value) || value <= 0) return "Not specified";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const InvestorDashboard = () => {
  const [activeTab, setActiveTab] = useState("startups");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);

  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mandates, setMandates] = useState([]);
  const [mandatesLoading, setMandatesLoading] = useState(true);
  const [mandatesError, setMandatesError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/v1/ideas");
        if (!mounted) return;
        const items = extractPayload(res);

        const ideaItems = items.filter((it) => it?.isIdea === true);
        const planItems = items.filter((it) => it?.isIdea === false);

        const normalized = ideaItems.map((it) => ({
          id: it._id || it.id,
          _id: it._id || it.id,
          name: it.title || it.name || "Untitled",
          tagline: (it.description && String(it.description).split(". ")[0]) || (it.aiSummary ? it.aiSummary.split("\n")[0] : ""),
          tags: arrayify(it.category ? [it.category] : it.tags),
          industry: it.category || it.industry || "",
          stage: it.stage || "",
          fundingGoal: it.budget || it.fundingGoal || 0,
          currentFunding: it.currentFunding || 0,
          logo: it.ImgURL ? "" : (it.logo || ""),
          aiRiskLevel: it.aiRiskLevel || "UNKNOWN",
          aiRiskScore: it.aiRiskScore || 0,
          founders: it.createdBy
            ? [{ name: "Founder", avatar: (it.createdBy && String(it.createdBy).slice(0, 2).toUpperCase()) }]
            : arrayify(it.founders),
          raw: it,
        }));

        setStartups(normalized);
        setMandates(planItems.map(normalizeMandate));
        setMandatesError("");
      } catch (e) {
        console.error("Failed to load ideas", e);
        if (mounted) {
          setError("Failed to load items");
          setMandatesError("Failed to load investor mandates");
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setMandatesLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFilter = (f) => {
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const filtered = useMemo(() => {
    return startups.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilters =
        activeFilters.length === 0 ||
          activeFilters.some((f) => {
          if (f === "AI Risk < 20%") return s.aiRiskScore < 20;
          return (
            s.tags?.includes(f) ||
            s.industry?.includes(f) ||
            s.stage === f
          );
        });

      return matchesSearch && matchesFilters;
    });
  }, [startups, searchQuery, activeFilters]);

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30">
      
      <AppNavbar />

      <div className="flex pt-20 overflow-hidden relative min-h-[calc(100vh-5rem)]">
        {/* Abstract background glow */}
        <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="fixed bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

        <DesktopSidebar />

        <main className="flex-1 w-full overflow-y-auto px-4 md:px-8 lg:ml-64 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Area matching target design */}
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Explore Opportunities</h1>
              <p className="text-slate-400 text-sm md:text-base">
                Discover founders waiting for smart, AI-vetted capital.
              </p>
            </div>

            <div className="mb-8 inline-flex rounded-full p-1 bg-white/5 border border-white/10 backdrop-blur-xl">
              {[
                { key: "startups", label: "Startups Pitching" },
                { key: "mandates", label: "Investor Mandates" },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative px-5 md:px-7 py-2.5 rounded-full text-sm md:text-[15px] font-semibold transition-colors ${
                      isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="investor-dashboard-active-tab"
                        className="absolute inset-0 rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.45)]"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "startups" ? (
                <motion.div
                  key="startups-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="mb-10">
                    <FilterBar
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      activeFilters={activeFilters}
                      onToggleFilter={toggleFilter}
                    />
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                      Loading startups...
                    </div>
                  ) : error ? (
                    <div className="text-center py-20 text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20 max-w-2xl mx-auto">
                      {error}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((startup, i) => (
                          <StartupCard key={startup._id || startup.id || i} startup={startup} index={i} />
                        ))}
                      </div>

                      {filtered.length === 0 && (
                        <div className="text-center py-32 bg-white/5 border border-white/5 rounded-3xl mt-8">
                          <p className="text-xl font-bold text-white mb-2">No startups found</p>
                          <p className="text-sm text-slate-400">Try adjusting your filters or search query.</p>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="mandates-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {mandatesLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                      Loading investor mandates...
                    </div>
                  ) : mandatesError ? (
                    <div className="text-center py-20 text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20 max-w-2xl mx-auto">
                      {mandatesError}
                    </div>
                  ) : mandates.length === 0 ? (
                    <div className="max-w-3xl mx-auto mt-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-center shadow-[0_0_40px_rgba(37,99,235,0.08)]">
                      <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                        <BriefcaseBusiness className="w-7 h-7 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No investor mandates found</h3>
                      <p className="text-sm text-slate-400">
                        Mandates will appear here once investors publish their preferred check size and sectors.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {mandates.map((mandate) => (
                        <div
                          key={mandate.id}
                          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_0_30px_rgba(37,99,235,0.08)]"
                        >
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.2em] text-blue-300/80 mb-2">Investor Mandate</p>
                              <h3 className="text-lg font-bold text-white leading-tight">{mandate.mandateTitle}</h3>
                              <p className="text-xs text-slate-400 mt-1">{mandate.investorName}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shrink-0">
                              <Landmark className="w-5 h-5 text-blue-300" />
                            </div>
                          </div>

                          <div className="space-y-3 text-sm mb-5">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Building2 className="w-4 h-4 text-slate-500" />
                              <span>
                                Check size: {formatMoney(mandate.minCheck)}
                                {mandate.maxCheck > 0 ? ` - ${formatMoney(mandate.maxCheck)}` : ""}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {mandate.preferredIndustries.length > 0 ? (
                                mandate.preferredIndustries.map((industry, idx) => (
                                  <span
                                    key={`${mandate.id}-${industry}-${idx}`}
                                    className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-200"
                                  >
                                    {industry}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                                  Any industry
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-slate-400 leading-relaxed mb-5 min-h-[3.5rem]">{mandate.summary}</p>

                          {mandate.contactEmail ? (
                            <a
                              href={`mailto:${mandate.contactEmail}`}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-[0_0_16px_rgba(37,99,235,0.35)]"
                            >
                              <Mail className="w-4 h-4" /> Contact
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 text-slate-500 text-sm font-semibold cursor-not-allowed"
                            >
                              <Mail className="w-4 h-4" /> Contact
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvestorDashboard;