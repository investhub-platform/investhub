// InvestorDashboard.jsx
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
        // Use ideas endpoint (only ideas) instead of startups
        const res = await api.get("/v1/ideas/all");
        if (!mounted) return;
        const items = res?.data?.data || [];

        // Normalize idea documents to the shape StartupCard expects
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
          // keep original payload for further details
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
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="flex">
        <DesktopSidebar />

        <main className="flex-1 px-4 md:px-8 pt-28 pb-12 max-w-7xl">
          {/* Section Header */}
          <div className="hidden md:block mb-8">
            <h1 className="text-3xl heading-tight">Explore Opportunities</h1>
            <p className="text-muted-foreground mt-1">
              Founders waiting for smart capital.
            </p>
          </div>

          <div className="mb-8">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilters={activeFilters}
              onToggleFilter={toggleFilter}
            />
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading startups…</div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((startup, i) => (
                  <StartupCard key={startup._id || startup.id || i} startup={startup} index={i} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <p className="text-lg">No startups match your criteria</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default InvestorDashboard;