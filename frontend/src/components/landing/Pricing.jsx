import { Check } from 'lucide-react';

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple, transparent pricing.</h2>
          <p className="text-slate-400 text-lg">No hidden fees. We only win when you win.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Founder Tier */}
          <div className="p-8 rounded-3xl bg-[#0B0D10] border border-white/5 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Founder</h3>
            <div className="text-4xl font-black text-white mb-6">Free</div>
            <p className="text-slate-400 text-sm mb-8 pb-8 border-b border-white/5">Everything you need to pitch and raise capital.</p>
            <ul className="space-y-4 mb-8 flex-1">
              {['Post unlimited pitches', 'AI Summary & Analysis with Pro plans', 'Match with mentors', 'Standard 5% success fee on funds raised'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  <Check className="w-5 h-5 text-blue-500 shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-full border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors">Start Building</button>
          </div>

          {/* Investor Pro */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#0B0D10] to-[#020617] border border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative transform md:-translate-y-4 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Investor Pro</h3>
            <div className="text-4xl font-black text-white mb-1">$20<span className="text-lg text-slate-500 font-normal">/mo</span></div>
            <p className="text-slate-400 text-sm mb-8 pb-8 border-b border-white/5">Wallet-only billing. Unlock premium investor AI tools.</p>
            <ul className="space-y-4 mb-8 flex-1">
              {['AI Summary + AI Analysis access', 'Priority access to new listings', 'Detailed mentor technical reports', 'Advanced portfolio analytics'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-white text-sm">
                  <Check className="w-5 h-5 text-blue-400 shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/25">Upgrade to Pro</button>
          </div>

          {/* Founder Pro */}
          <div className="p-8 rounded-3xl bg-[#0B0D10] border border-indigo-500/30 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Founder Pro</h3>
            <div className="text-4xl font-black text-white mb-1">$49<span className="text-lg text-slate-500 font-normal">/mo</span></div>
            <p className="text-slate-400 text-sm mb-8 pb-8 border-b border-white/5">Wallet-only billing. Get founder AI and top placement boosts.</p>
            <ul className="space-y-4 mb-8 flex-1">
              {['AI Summary + AI Analysis access', 'Startup idea posts boosted to top', 'Founder analytics and premium insights', 'Priority founder support'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  <Check className="w-5 h-5 text-indigo-400 shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-full border border-indigo-400/40 text-white font-semibold hover:bg-indigo-500/10 transition-colors">Upgrade Founder</button>
          </div>

          {/* Pro Max */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-emerald-500/10 to-[#0B0D10] border border-emerald-400/40 shadow-[0_0_40px_rgba(16,185,129,0.2)] relative flex flex-col">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide">BEST VALUE</div>
            <h3 className="text-xl font-bold text-white mb-2">Pro Max</h3>
            <div className="text-4xl font-black text-white mb-1">$60<span className="text-lg text-slate-500 font-normal">/mo</span></div>
            <p className="text-slate-300 text-sm mb-8 pb-8 border-b border-white/10">Includes both Investor Pro and Founder Pro capabilities.</p>
            <ul className="space-y-4 mb-8 flex-1">
              {['All Investor Pro features', 'All Founder Pro features', 'AI features unlocked platform-wide', 'Top post placement + advanced investor tools'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-white text-sm">
                  <Check className="w-5 h-5 text-emerald-300 shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-full bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/25">Upgrade to Pro Max</button>
          </div>

          {/* Mentor Tier */}
          <div className="p-8 rounded-3xl bg-[#0B0D10] border border-white/5 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Mentor</h3>
            <div className="text-4xl font-black text-white mb-6">Free</div>
            <p className="text-slate-400 text-sm mb-8 pb-8 border-b border-white/5">Earn by validating the next generation of tech.</p>
            <ul className="space-y-4 mb-8 flex-1">
              {['Review startup architectures', 'Validate funding milestones', 'Build platform reputation', 'Keep 90% of your advisory fees'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                  <Check className="w-5 h-5 text-purple-500 shrink-0" /> {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-full border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors">Apply as Mentor</button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Pricing;