// index.jsx
import { useState, useMemo } from "react";
import { TopNav } from "@/components/TopNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { FilterBar } from "@/components/FilterBar";
import { StartupCard } from "@/components/StartupCard";
import { startups } from "@/data/mockData";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);

  const toggleFilter = (f) => {
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const filtered = useMemo(() => {
    return startups.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilters =
        activeFilters.length === 0 ||
        activeFilters.some((f) => {
          if (f === "AI Risk < 20%") return s.aiRiskScore < 20;
          return (
            s.tags.includes(f) ||
            s.industry.includes(f) ||
            s.stage === f
          );
        });

      return matchesSearch && matchesFilters;
    });
  }, [searchQuery, activeFilters]);

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-4 pb-8">
        <TopNav />
      </div>

      <div className="flex">
        <DesktopSidebar />

        <main className="flex-1 px-4 md:px-8 pb-12 max-w-7xl">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((startup, i) => (
              <StartupCard key={startup.id} startup={startup} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No startups match your criteria</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;