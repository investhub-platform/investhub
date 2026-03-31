import { Brain, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { formatCurrency } from "@/data/mockData";

export function StartupCard({ startup, index }) {
  const tags = Array.isArray(startup.tags) ? startup.tags : [];
  const founders = Array.isArray(startup.founders) ? startup.founders : [];
  const goal = Number(startup.fundingGoal || 0);
  const current = Number(startup.currentFunding || 0);
  const fundingPercent = goal > 0 ? Math.round((current / goal) * 100) : 0;

  const location = useLocation();
  const detailPath = startup?.isIdea ? `/app/idea/${startup._id || startup.id}` : `/app/startup/${startup._id || startup.id}`;

  // Generate a consistent pseudo-random gradient for startups without logos
  const gradientClass = [
    "from-blue-500/20 to-indigo-500/20",
    "from-purple-500/20 to-pink-500/20",
    "from-emerald-500/20 to-teal-500/20",
    "from-cyan-500/20 to-blue-500/20"
  ][index % 4];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
      className="h-full"
    >
      <Link to={detailPath} state={{ background: location, startup }} className="block h-full">
        <div className="group flex flex-col h-full bg-[#0B0D10] rounded-[1.5rem] border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/15 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1">
          
          {/* Top Banner Area */}
          <div className={`h-24 w-full bg-gradient-to-br ${gradientClass} relative overflow-hidden border-b border-white/5`}>
            {/* Ambient abstract shapes inside banner */}
            <div className="absolute top-[-50%] left-[-10%] w-32 h-32 bg-white/5 rounded-full blur-[20px]" />
            <div className="absolute bottom-[-50%] right-[-10%] w-32 h-32 bg-black/20 rounded-full blur-[20px]" />
            
            <div className="absolute -bottom-5 left-5 w-14 h-14 rounded-xl bg-[#0B0D10] border border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-lg overflow-hidden">
               {startup.logo ? (
                 <img src={startup.logo} alt="logo" className="w-full h-full object-cover" />
               ) : (
                 <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                   {startup.name.charAt(0)}
                 </span>
               )}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-5 pt-8 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-2">
               <h3 className="text-xl font-bold text-white tracking-tight line-clamp-1 group-hover:text-blue-400 transition-colors">
                 {startup.name}
               </h3>
               {/* Minimal AI Risk Indicator */}
               <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                  startup.aiRiskLevel === "LOW" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                  startup.aiRiskLevel === "MEDIUM" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                  "bg-red-500/10 border-red-500/20 text-red-400"
               }`}>
                  <Brain className="w-3 h-3" />
                  AI Risk: {startup.aiRiskLevel} ({startup.aiRiskScore || 0}%)
               </div>
            </div>
            
            <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
              {startup.tagline || "No description provided."}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-auto">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[11px] font-medium text-slate-300 bg-white/5 border border-white/5 py-1 px-2.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <div className="w-full h-px bg-white/5 my-5" />

            {/* Funding Progress */}
            <div className="mb-4">
               <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                  <span>Target: <strong className="text-white">{formatCurrency(goal)}</strong></span>
                  <span className="text-blue-400 font-bold">{fundingPercent}% funded</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: `${fundingPercent}%` }}
                     viewport={{ once: true }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full relative"
                  >
                     <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]" />
                  </motion.div>
               </div>
            </div>

            {/* Footer Row */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex -space-x-2">
                {founders.slice(0, 3).map((f, i) => (
                  <div
                    key={f.name || i}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#1A1D24] text-slate-300 border-2 border-[#0B0D10]"
                  >
                    {f.avatar || "U"}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/5 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all text-slate-400 group-hover:text-white">
                 <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </div>
        </div>
      </Link>
    </motion.div>
  );
}