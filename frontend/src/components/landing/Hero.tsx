import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, ChevronRight, TrendingUp, ShieldCheck } from "lucide-react";
import Aurora from './Aurora';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full min-h-screen overflow-hidden text-white selection:bg-blue-500/30">
      
      {/* --- CIRCULAR GRADIENT BACKGROUND (commented out) --- */}
      
      <svg className="absolute z-0 w-full -mt-40 md:mt-0" width="1440" height="676" viewBox="0 0 1440 676" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="-92" y="-948" width="1624" height="1624" rx="812" fill="url(#circleGradient)" fillOpacity="0.45" />
        <defs>
          <radialGradient id="circleGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(90 428 292)scale(812)">
            <stop offset=".63" stopColor="#372AAC" stopOpacity="0" />
            <stop offset="0.9" stopColor="#372AAC" stopOpacity="0.25" />
            <stop offset="1" stopColor="#372AAC" stopOpacity="0.45" />
          </radialGradient>
        </defs>
      </svg>
      

      {/* Aurora background component (replaces SVG) - wrapped to control vertical size */}
      <div className="absolute inset-x-0 -top-56 h-[50vh] z-0 pointer-events-none">
        <Aurora
          colorStops={["#020617","#3b82f6","#06b6d4"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
      </div>


      {/* --- MAIN CONTENT --- */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 pt-40 pb-32 flex flex-col items-center text-center">
        
        {/* Badge / Announcement Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <a href="#" className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium hover:bg-blue-500/20 transition-colors transform-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            New: AI Risk Analysis 2.0
            <ChevronRight className="w-4 h-4 text-blue-400" />
          </a>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
        >
          Venture Capital, <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Democratized.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed"
        >
          Connect with elite technical mentors and secure funding through our <span className="text-white font-medium">AI-driven investment ecosystem</span>. Stop chasing leads, start building.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto"
        >
          <button className="group relative px-8 py-4 rounded-full bg-blue-600 text-white font-semibold shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition-all hover:scale-105 active:scale-95">
            <span className="flex items-center gap-2">
              Start Funding <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <button className="group px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-white font-medium hover:bg-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            <Play className="w-4 h-4 fill-white" /> View Demo
          </button>
        </motion.div>


        {/* --- 3D DASHBOARD VISUAL --- */}
        <motion.div 
          initial={{ opacity: 0, y: 50, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
          className="mt-20 relative w-full max-w-5xl perspective-1000"
        >
          {/* Glow behind the dashboard */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />

          {/* The Dashboard Card */}
          <div className="relative bg-[#0F1117] border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* Fake Browser Header */}
            <div className="h-10 border-b border-white/5 bg-white/[0.02] flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              <div className="ml-4 px-3 py-1 bg-black/40 rounded-md text-[10px] text-slate-500 font-mono">investhub.io/dashboard</div>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="p-6 md:p-8 grid grid-cols-3 gap-6">
              
              {/* Sidebar Mockup */}
              <div className="hidden md:flex flex-col gap-4 col-span-1 border-r border-white/5 pr-6">
                <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
                <div className="space-y-3 mt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-6 w-full bg-white/5 rounded" />
                  ))}
                </div>
                <div className="mt-auto h-20 w-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded border border-blue-500/20 p-4">
                  <div className="h-2 w-12 bg-blue-500/40 rounded mb-2" />
                  <div className="h-4 w-20 bg-blue-500/20 rounded" />
                </div>
              </div>

              {/* Main Area */}
              <div className="col-span-3 md:col-span-2 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Total Valuation</div>
                    <div className="text-3xl font-bold text-white">$2,450,000.00</div>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-sm rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +12.5%
                  </div>
                </div>

                {/* Chart Mockup */}
                <div className="h-40 w-full bg-gradient-to-b from-white/5 to-transparent rounded-lg border border-white/5 relative overflow-hidden">
                   <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10" />
                   <svg className="absolute bottom-0 left-0 w-full h-full text-blue-500/20" viewBox="0 0 100 40" preserveAspectRatio="none">
                     <path d="M0 40 L0 30 C10 30 10 20 20 25 C30 30 40 10 50 20 C60 30 70 5 80 15 C90 25 100 20 100 20 L100 40 Z" fill="currentColor" />
                     <path d="M0 30 C10 30 10 20 20 25 C30 30 40 10 50 20 C60 30 70 5 80 15 C90 25 100 20 100 20" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
                   </svg>
                </div>

                {/* Cards Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 mb-2" />
                    <div className="text-xs text-slate-400">Risk Score</div>
                    <div className="text-lg font-semibold">Low (12%)</div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 mb-2" />
                    <div className="text-xs text-slate-400">Mentors</div>
                    <div className="text-lg font-semibold">14 Active</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;