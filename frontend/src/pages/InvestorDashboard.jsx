import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BriefcaseBusiness, Mail, Landmark, Building2, SearchX, ArrowRight, User } from "lucide-react";
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

  // Helper for Mandate Card Gradients
  const getGradient = (index) => {
    const gradients = [
      "from-cyan-500/20 to-blue-600/20",
      "from-purple-500/20 to-indigo-600/20",
      "from-emerald-500/20 to-teal-600/20",
      "from-amber-500/20 to-orange-600/20"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col">
      
      <AppNavbar />

      <div className="flex flex-1 pt-6 relative w-full h-screen overflow-hidden">
        {/* Ambient Background Lights */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

        <DesktopSidebar />

        <main className="flex-1 w-full overflow-y-auto px-4 md:px-8 py-8 lg:py-12 relative z-10 scroll-smooth lg:ml-64">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Area */}
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Explore Opportunities</h1>
              <p className="text-slate-400 text-sm md:text-base font-medium">
                Discover founders waiting for smart capital, or view active investor mandates.
              </p>
            </div>

            {/* Segmented Control Tabs */}
            <div className="inline-flex rounded-full p-1.5 bg-[#0B0D10]/80 border border-white/10 backdrop-blur-xl mb-8 shadow-lg ml-4 md:ml-8">
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
                    className={`relative px-6 py-2.5 rounded-full text-sm font-bold transition-all z-10 ${
                      isActive ? "text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="investor-dashboard-active-tab"
                        className="absolute inset-0 rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {tab.label}
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
                  exit={{ opacity: 0, y: -10 }}
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
                      <span className="font-medium">Loading startups...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-10 text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20 max-w-2xl mx-auto font-medium">
                      {error}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                        {filtered.map((startup, i) => (
                          <StartupCard key={startup._id || startup.id || i} startup={startup} index={i} />
                        ))}
                      </div>

                      {filtered.length === 0 && (
                        <div className="text-center py-24 bg-[#0B0D10]/80 border border-white/5 rounded-[2rem] mt-4 flex flex-col items-center justify-center shadow-xl">
                          <SearchX className="w-12 h-12 text-slate-600 mb-4" />
                          <p className="text-xl font-bold text-white mb-2">No startups found</p>
                          <p className="text-sm text-slate-400 font-medium">Try adjusting your filters or search query.</p>
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
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {mandatesLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <span className="font-medium">Loading mandates...</span>
                    </div>
                  ) : mandatesError ? (
                    <div className="text-center py-10 text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20 max-w-2xl mx-auto font-medium">
                      {mandatesError}
                    </div>
                  ) : mandates.length === 0 ? (
                    <div className="text-center py-24 bg-[#0B0D10]/80 border border-white/5 rounded-[2rem] mt-4 flex flex-col items-center justify-center shadow-xl">
                      <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                        <BriefcaseBusiness className="w-8 h-8 text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">No active mandates</h3>
                      <p className="text-sm text-slate-400 font-medium max-w-md">
                        Mandates will appear here once investors publish their preferred check sizes and target sectors.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                      {mandates.map((mandate, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.4 }}
                          key={mandate.id}
                          className="group flex flex-col h-full bg-[#0B0D10] rounded-[1.5rem] border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/15 hover:shadow-2xl hover:-translate-y-1"
                        >
                          {/* Banner Area */}
                          <div className={`h-20 w-full bg-gradient-to-br ${getGradient(idx)} relative overflow-hidden border-b border-white/5`}>
                            <div className="absolute top-[-50%] left-[-10%] w-32 h-32 bg-white/5 rounded-full blur-[20px]" />
                            <div className="absolute bottom-[-50%] right-[-10%] w-32 h-32 bg-black/20 rounded-full blur-[20px]" />
                            
                            <div className="absolute -bottom-5 left-6 w-12 h-12 rounded-xl bg-[#1A1D24] border border-white/10 flex items-center justify-center shadow-lg">
                               <Landmark className="w-6 h-6 text-white/80" />
                            </div>
                            
                            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/80 border border-white/10">
                              Mandate
                            </div>
                          </div>

                          {/* Content Area */}
                          <div className="p-6 pt-8 flex flex-col flex-1">
                            
                            <div className="mb-4">
                               <h3 className="text-xl font-bold text-white tracking-tight leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                                 {mandate.mandateTitle}
                               </h3>
                               <div className="flex items-center gap-2 text-sm text-slate-400">
                                 <User className="w-3.5 h-3.5" />
                                 <span>{mandate.investorName}</span>
                               </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-5">
                              {mandate.preferredIndustries.length > 0 ? (
                                mandate.preferredIndustries.map((industry, i) => (
                                  <span key={i} className="text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-white/5 border border-white/10 py-1 px-2.5 rounded-md">
                                    {industry}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white/5 border border-white/5 py-1 px-2.5 rounded-md">
                                  Sector Agnostic
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 mb-6 flex-1">
                              {mandate.summary}
                            </p>

                            <div className="w-full h-px bg-white/5 mb-5" />

                            {/* Footer: Check Size & Action */}
                            <div className="flex items-end justify-between mt-auto">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Target Check Size</p>
                                <div className="flex items-center gap-1.5 text-white font-black text-lg">
                                  <Building2 className="w-4 h-4 text-blue-400" />
                                  <span>{formatMoney(mandate.minCheck)}</span>
                                  {mandate.maxCheck > mandate.minCheck && (
                                    <span className="text-slate-400 font-medium text-base">- {formatMoney(mandate.maxCheck)}</span>
                                  )}
                                </div>
                              </div>

                              {mandate.contactEmail ? (
                                <a
                                  href={`mailto:${mandate.contactEmail}`}
                                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors text-white shadow-lg shadow-blue-500/20"
                                  title="Contact Investor"
                                >
                                  <Mail className="w-4 h-4" />
                                </a>
                              ) : (
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed">
                                  <Mail className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                          </div>
                        </motion.div>
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