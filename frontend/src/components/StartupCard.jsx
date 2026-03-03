// StartupCard.jsx
import { Brain, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { formatCurrency } from "@/data/mockData";

export function StartupCard({ startup, index }) {
  const fundingPercent = Math.round((startup.currentFunding / startup.fundingGoal) * 100);

  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link to={`/app/startup/${startup.id}`} state={{ background: location }} className="block">
        <div className="obsidian-card p-5 md:p-6 card-hover group">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center text-xs font-bold shrink-0">
              {startup.logo}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{startup.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{startup.tagline}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {startup.tags.map((tag) => (
              <span key={tag} className="pill-filter text-xs py-1 px-2.5">
                {tag}
              </span>
            ))}
          </div>

          {/* Funding data */}
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Funding Goal: <span className="text-foreground font-medium">{formatCurrency(startup.fundingGoal)}</span>
            </span>
            <span className="text-muted-foreground">
              Current: <span className="text-foreground font-medium">{formatCurrency(startup.currentFunding)}</span>
            </span>
          </div>

          {/* AI Risk Badge */}
          <div className="mb-4">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border animate-pulse-glow ${
                startup.aiRiskLevel === "LOW"
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : startup.aiRiskLevel === "MEDIUM"
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              AI Risk: {startup.aiRiskLevel} ({startup.aiRiskScore}%)
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full gradient-blue transition-all duration-700"
                style={{ width: `${fundingPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{fundingPercent}% funded</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                {startup.founders.map((f, i) => (
                  <div
                      key={f.name}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium ${
                        i === 0 ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" : "bg-white/5 text-white"
                      } border-2 border-white/10`}
                    >
                      {f.avatar}
                    </div>
                ))}
              </div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
              View Analysis
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}