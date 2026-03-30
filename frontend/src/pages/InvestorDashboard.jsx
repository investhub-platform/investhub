import { useState, useMemo, useEffect } from "react";
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

const InvestorDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);

  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/v1/ideas/all");
        if (!mounted) return;
        const items = res?.data?.data || [];

        const normalized = items.map((it) => ({
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
      } catch (e) {
        console.error("Failed to load ideas", e);
        if (mounted) setError("Failed to load items");
      } finally {
        if (mounted) setLoading(false);
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
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-blue-500/30">
      
      {/* Assuming AppNavbar handles its own fixed positioning. If not, wrap it. */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
        <AppNavbar />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Abstract background glow */}
        <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="fixed bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

        <DesktopSidebar />

        <main className="flex-1 w-full overflow-y-auto px-4 md:px-8 py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Area matching target design */}
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Explore Opportunities</h1>
              <p className="text-slate-400 text-sm md:text-base">
                Discover founders waiting for smart, AI-vetted capital.
              </p>
            </div>

            {/* Filter / Search Area */}
            <div className="mb-10">
              {/* Note: Ensure FilterBar component is using dark-mode classes (e.g. bg-white/5, border-white/10) */}
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilters={activeFilters}
                onToggleFilter={toggleFilter}
              />
            </div>

            {/* Content Grid */}
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvestorDashboard;