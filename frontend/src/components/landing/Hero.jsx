import { motion } from "framer-motion";
import { ArrowRight, Play, ShieldCheck, Wallet, CheckCircle2, BrainCircuit } from "lucide-react";

const Hero = () => {
  return (
    <section id="hero" className="relative w-full min-h-screen overflow-hidden bg-[#020617] text-white selection:bg-blue-500/30 pt-24 pb-20">
      
      {/* --- MASSIVE TOP-DOWN CIRCULAR GLOW (From Figma/Code) --- */}
      <svg 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] md:w-[140%] max-w-[1800px] pointer-events-none z-0" 
        viewBox="0 0 1440 676" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="-92" y="-948" width="1624" height="1624" rx="812" fill="url(#circleGradient)" className="hero-circle-rect opacity-60 md:opacity-100" />
        <defs>
          <radialGradient id="circleGradient" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(90 428 292)scale(812)">
            <stop offset="0.5" stopColor="#020617" stopOpacity="0" />
            <stop offset="0.85" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="1" stopColor="#06b6d4" stopOpacity="0.45" />
          </radialGradient>
        </defs>
      </svg>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 z-0 pointer-events-none mask-image-gradient" />


      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mt-12 flex flex-col items-center text-center">
        
        {/* Minimalist 2-Line Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight mb-6 leading-[1.05]"
        >
          <span className="block text-white">You don't need</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
            to know someone.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-medium"
        >
          <span className="text-white font-semibold">Venture Capital, Democratized.</span> <br className="hidden sm:block"/>
          Vetted startups. Expert-validated code. Secured milestone funding.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto"
        >
          <a href="/auth/register" className="group relative w-full sm:w-auto px-8 py-4 rounded-full bg-white text-[#020617] font-bold shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all">
            <span className="flex items-center justify-center gap-2">
              Start Investing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
          <button className="group w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white font-semibold hover:bg-white/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
            <Play className="w-4 h-4 fill-white" /> Watch Demo
          </button>
        </motion.div>


        {/* --- BENTO GRID: EXPLAINING THE WEBSITE --- */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, type: "spring", stiffness: 40 }}
          className="mt-20 md:mt-28 w-full grid grid-cols-1 md:grid-cols-3 gap-4 perspective-1000"
        >
          
          {/* Card 1: AI Risk Analysis (Span 2) */}
          <div className="col-span-1 md:col-span-2 relative p-6 md:p-8 rounded-3xl bg-[#0B0D10]/80 backdrop-blur-xl border border-white/10 overflow-hidden group hover:border-blue-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
              <div className="flex-1 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-500/20">
                  <BrainCircuit className="w-4 h-4" /> AI Vetting
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Automated Risk Analysis</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Our Gemini AI agent instantly analyzes pitch decks, market fit, and burn rates, giving you a predictive score before you invest a dime.
                </p>
              </div>

              {/* Glowing Gauge Chart Mockup */}
              <div className="w-full md:w-1/2 relative flex justify-center items-end h-32 md:h-full">
                <svg viewBox="0 0 100 50" className="w-full max-w-[220px] overflow-visible">
                  {/* Background Track */}
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#ffffff10" strokeWidth="8" strokeLinecap="round" />
                  {/* Glowing Fill */}
                  <motion.path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 0.85 }}
                    transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                    className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                  />
                </svg>
                <div className="absolute bottom-0 flex flex-col items-center">
                  <span className="text-3xl font-black text-white">85<span className="text-lg text-slate-400">%</span></span>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Success Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Smart Escrow Wallet */}
          <div className="col-span-1 p-6 md:p-8 rounded-3xl bg-[#0B0D10]/80 backdrop-blur-xl border border-white/10 relative overflow-hidden group hover:border-emerald-500/30 transition-colors flex flex-col justify-between">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
                <Wallet className="w-4 h-4" /> Smart Escrow
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Milestone Funding</h3>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div className="text-xs text-slate-400 mb-1">Funds Locked (Milestone 2)</div>
              <div className="text-2xl font-bold text-emerald-400 mb-3">$125,000.00</div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: '60%' }} 
                  transition={{ duration: 1.5, delay: 1.2 }}
                  className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                />
              </div>
            </div>
          </div>

          {/* Card 3: Mentor Verification (Span 3 - Horizontal) */}
          <div className="col-span-1 md:col-span-3 p-6 rounded-3xl bg-[#0B0D10]/80 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shrink-0">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Verified by Technical Mentors</h3>
                <p className="text-slate-400 text-sm">Real codebases reviewed by elite CTOs before your funds are released.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#0B0D10] flex items-center justify-center overflow-hidden"><img src="https://i.pravatar.cc/100?img=11" alt="Mentor" /></div>
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#0B0D10] flex items-center justify-center overflow-hidden"><img src="https://i.pravatar.cc/100?img=33" alt="Mentor" /></div>
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#0B0D10] flex items-center justify-center overflow-hidden"><img src="https://i.pravatar.cc/100?img=12" alt="Mentor" /></div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> 14 Active Validations
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
};

export default Hero;