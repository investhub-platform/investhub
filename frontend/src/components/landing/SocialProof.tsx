import { motion } from "framer-motion";
import { 
  Cpu, 
  Globe2, 
  Orbit, 
  Zap, 
  Triangle, 
  Layers, 
  Hexagon, 
  Command 
} from "lucide-react";

// 1. Mock "Real" Logos using Lucide Icons + Text
const companies = [
  { name: "Foundry", icon: Hexagon },
  { name: "LaunchPad", icon: Zap },
  { name: "Vertex", icon: Triangle },
  { name: "Orbit", icon: Orbit },
  { name: "Pioneer", icon: Globe2 },
  { name: "Summit", icon: Layers },
  { name: "Catalyst", icon: Cpu },
  { name: "Nexus", icon: Command },
];

export default function SocialProof() {
  return (
    <section className="relative w-full py-4 sm:py-6 overflow-hidden bg-transparent">
      {/* Background Glow (subtle radial, centered) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, rgba(59,130,246,0.04), transparent 35%)', filter: 'blur(56px)' }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <h3 className="text-center text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-widest mb-4 sm:mb-6">
          Trusted by next‑gen founders from
        </h3>

        {/* 2. The Marquee Container with Gradient Mask */}
        <div className="relative flex overflow-hidden mask-image-gradient py-2">
          {/* Gradient Mask Logic (Add this to your globals.css or use inline style below):
             mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          */}
          <div 
            className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#020617] to-transparent z-20 pointer-events-none" 
          />
          <div 
            className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#020617] to-transparent z-20 pointer-events-none" 
          />

          {/* 3. Framer Motion Infinite Loop */}
          <motion.div
            className="flex flex-nowrap gap-16"
            animate={{ x: "-50%" }}
            transition={{ 
              duration: 30, // Adjust speed (higher = slower)
              ease: "linear", 
              repeat: Infinity 
            }}
            style={{ width: "max-content" }} // Ensures container fits all items
          >
            {/* Render Twice for Seamless Loop */}
            {[...companies, ...companies].map((company, index) => (
              <div 
                key={`${company.name}-${index}`} 
                className="group flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105"
              >
                {/* Icon */}
                <company.icon 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 group-hover:text-blue-400 transition-colors duration-300" 
                  strokeWidth={2.5}
                />
                {/* Text Logo */}
                <span className="text-lg sm:text-xl font-bold text-slate-600 group-hover:text-white transition-colors duration-300 tracking-tight">
                  {company.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}