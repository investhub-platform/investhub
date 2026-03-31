// FilterBar.jsx
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/SearchBar";

const quickFilters = ["SaaS", "Fintech", "AI/ML", "AI Risk < 20%", "HealthTech"];

export function FilterBar({ searchQuery, onSearchChange, activeFilters, onToggleFilter }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <SearchBar value={searchQuery} onChange={onSearchChange} placeholder="Search by industry or AI keyword..." />

        <div className="flex items-center gap-2 flex-wrap">
          {quickFilters.map((f) => (
            <button
              key={f}
              onClick={() => onToggleFilter(f)}
              className={`pill-filter ${activeFilters.includes(f) ? "pill-filter-active" : ""}`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setSheetOpen(true)}
            className="md:hidden pill-filter flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-card border-t border-white/[0.07] rounded-t-3xl z-50 p-6 max-h-[70vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button onClick={() => setSheetOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Industry</label>
                  <div className="flex flex-wrap gap-2">
                    {["SaaS", "Fintech", "AI/ML", "HealthTech", "Climate"].map((f) => (
                      <button
                        key={f}
                        onClick={() => onToggleFilter(f)}
                        className={`pill-filter ${activeFilters.includes(f) ? "pill-filter-active" : ""}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Stage</label>
                  <div className="flex flex-wrap gap-2">
                    {["Pre-Seed", "Seed", "Series A"].map((f) => (
                      <button
                        key={f}
                        onClick={() => onToggleFilter(f)}
                        className={`pill-filter ${activeFilters.includes(f) ? "pill-filter-active" : ""}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Team Size</label>
                  <div className="flex flex-wrap gap-2">
                    {["1-5", "6-15", "16-50"].map((f) => (
                      <button
                        key={f}
                        onClick={() => onToggleFilter(f)}
                        className={`pill-filter ${activeFilters.includes(f) ? "pill-filter-active" : ""}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}