import { Check, Sparkles } from 'lucide-react';

const Pricing = () => {
  return (
    <section id="pricing" className="relative py-32 bg-transparent overflow-visible z-10">
      {/* Ambient Background Glows (Allowed to bleed upwards) */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6">
            Simple, transparent pricing.
          </h2>
          <p className="text-slate-400 text-lg md:text-xl font-medium">
            No hidden fees. We only win when you win.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-stretch">

          {/* 1. Free Tier */}
          <div className="group relative p-8 rounded-[2rem] bg-[#090b14]/80 backdrop-blur-xl border border-white/5 hover:border-white/15 transition-all duration-500 flex flex-col hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Free <span className="text-slate-500 text-sm">(All Roles)</span></h3>
            <div className="text-5xl font-black text-white mb-6">$0</div>
            <p className="text-slate-400 text-sm mb-8 pb-8 border-b border-white/5 leading-relaxed">
              Everything you need to get started — free for founders, investors, and mentors.
            </p>
            
            <ul className="space-y-5 mb-10 flex-1">
              {['Create your profile & post pitches', 'Basic AI summary & public analysis', 'Match with mentors & projects', 'Transparent platform fees on raised funds'].map((feature, i) => (
                <li key={i} className="flex items-start gap-4 text-slate-300 text-sm leading-snug">
                  <Check className="w-5 h-5 text-slate-500 shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-300">
              Get Started
            </button>
          </div>

          {/* 2. Investor Pro */}
          <div className="group relative p-8 rounded-[2rem] bg-gradient-to-b from-[#0B0D10] to-[#020617] border border-blue-500/20 hover:border-blue-500/50 transition-all duration-500 flex flex-col hover:-translate-y-2 shadow-[0_0_40px_rgba(59,130,246,0.05)] hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] xl:-translate-y-4 xl:hover:-translate-y-6">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Investor Pro</h3>
            <div className="text-5xl font-black text-white mb-6">$20<span className="text-lg text-slate-500 font-medium">/mo</span></div>
            <p className="text-slate-400 text-sm mb-8 pb-8 border-b border-white/5 leading-relaxed">
              Wallet-only billing. Unlock premium investor AI tools and deep analytics.
            </p>
            
            <ul className="space-y-5 mb-10 flex-1 relative z-10">
              {['AI Summary + AI Analysis access', 'Priority access to new listings', 'Detailed mentor technical reports', 'Advanced portfolio analytics'].map((feature, i) => (
                <li key={i} className="flex items-start gap-4 text-slate-200 text-sm leading-snug">
                  <Check className="w-5 h-5 text-blue-500 shrink-0 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> {feature}
                </li>
              ))}
            </ul>
            <button className="relative z-10 w-full py-4 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] active:scale-[0.98]">
              Upgrade to Pro
            </button>
          </div>

          {/* 3. Founder Pro */}
          <div className="group relative p-8 rounded-[2rem] bg-[#090b14]/80 backdrop-blur-xl border border-indigo-500/20 hover:border-indigo-500/50 transition-all duration-500 flex flex-col hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <h3 className="text-lg font-semibold text-indigo-400 mb-2">Founder Pro</h3>
            <div className="text-5xl font-black text-white mb-6">$49<span className="text-lg text-slate-500 font-medium">/mo</span></div>
            <p className="text-slate-400 text-sm mb-8 pb-8 border-b border-white/5 leading-relaxed">
              Wallet-only billing. Get founder AI and premium top placement boosts.
            </p>
            
            <ul className="space-y-5 mb-10 flex-1 relative z-10">
              {['AI Summary + AI Analysis access', 'Startup idea posts boosted to top', 'Founder analytics & premium insights', 'Priority founder support'].map((feature, i) => (
                <li key={i} className="flex items-start gap-4 text-slate-200 text-sm leading-snug">
                  <Check className="w-5 h-5 text-indigo-400 shrink-0 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" /> {feature}
                </li>
              ))}
            </ul>
            <button className="relative z-10 w-full py-4 rounded-full bg-white/5 border border-indigo-500/30 text-indigo-300 font-bold hover:bg-indigo-500/10 hover:text-white transition-all duration-300 active:scale-[0.98]">
              Upgrade Founder
            </button>
          </div>

          {/* 4. Pro Max */}
          <div className="group relative p-8 rounded-[2rem] bg-gradient-to-b from-[#0B0D10] to-emerald-950/20 border border-emerald-500/30 hover:border-emerald-400/60 transition-all duration-500 flex flex-col xl:-translate-y-4 hover:-translate-y-6 shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:shadow-[0_0_60px_rgba(16,185,129,0.2)]">
            
            {/* Glowing Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-1.5 bg-emerald-500 text-[#020617] px-4 py-1.5 rounded-full text-xs font-black tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.5)] uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Best Value
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />

            <h3 className="text-lg font-semibold text-emerald-400 mb-2 mt-2">Pro Max</h3>
            <div className="text-5xl font-black text-white mb-6">$60<span className="text-lg text-emerald-500/60 font-medium">/mo</span></div>
            <p className="text-slate-300 text-sm mb-8 pb-8 border-b border-white/10 leading-relaxed">
              The ultimate toolkit. Includes both Investor Pro and Founder Pro capabilities.
            </p>
            
            <ul className="space-y-5 mb-10 flex-1 relative z-10">
              {['All Investor Pro features', 'All Founder Pro features', 'AI features unlocked platform-wide', 'Top post placement + advanced tools'].map((feature, i) => (
                <li key={i} className="flex items-start gap-4 text-white text-sm font-medium leading-snug">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> {feature}
                </li>
              ))}
            </ul>
            <button className="relative z-10 w-full py-4 rounded-full bg-emerald-500 text-[#020617] font-black hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] active:scale-[0.98]">
              Upgrade to Pro Max
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Pricing;