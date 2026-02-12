import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Brain, Lock, Users, CheckCircle2, TrendingUp, Shield } from 'lucide-react';

const FeaturesBento = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="relative w-full py-24 px-6 overflow-hidden">
      {/* Section Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto mb-16 text-center"
      >
        <motion.span 
          className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          Next-Gen Investment Platform
        </motion.span>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Built for the <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Modern Investor</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Powered by AI, secured by blockchain, guided by industry experts
        </p>
      </motion.div>

      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-min">
        
        {/* Box 1 - AI Risk Analysis (Large - spans 4 columns) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="md:col-span-4 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl hover:border-blue-500/30 transition-all duration-500"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content */}
          <div className="relative h-full p-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI Risk Analysis</h3>
              <p className="text-slate-400 text-base max-w-md">
                Real-time portfolio risk assessment powered by machine learning. Get instant insights on every investment.
              </p>
            </div>

            {/* Animated Risk Score Chart */}
            <RiskScoreChart />
          </div>

          {/* Noise Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }}
          />
        </motion.div>

        {/* Box 2 - Smart Contracts (Tall - spans 2 columns, 2 rows) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl hover:border-indigo-500/30 transition-all duration-500"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content */}
          <div className="relative h-full p-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <Lock className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Smart Contracts</h3>
              <p className="text-slate-400 text-base">
                Milestone-based fund release. Your capital unlocks automatically as targets are achieved.
              </p>
            </div>

            {/* Animated Wallet Lock/Unlock */}
            <WalletUnlock />
          </div>

          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }}
          />
        </motion.div>

        {/* Box 3 - Mentorship Network (Wide - spans 4 columns) */}
          <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-4 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl hover:border-emerald-500/30 transition-all duration-500"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content */}
          <div className="relative h-full p-8 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Elite Mentorship Network</h3>
              <p className="text-slate-400 text-base max-w-md mb-8">
                Learn from verified CTOs and executives from top tech companies. Direct access to industry leaders.
              </p>
            </div>

            {/* Avatar Stack with Verified Badges */}
            <MentorAvatars />
          </div>

          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }}
          />
        </motion.div>

      </div>
    </section>
  );
};

// Risk Score Chart Component
const RiskScoreChart = () => {
  const [score, setScore] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setScore(prev => {
            if (prev >= 92) {
              clearInterval(interval);
              return 92;
            }
            return prev + 1;
          });
        }, 20);
        return () => clearInterval(interval);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  const riskBars = [
    { label: 'Market Volatility', value: 78, color: 'bg-blue-500' },
    { label: 'Sector Risk', value: 45, color: 'bg-indigo-500' },
    { label: 'Liquidity', value: 92, color: 'bg-emerald-500' },
    { label: 'Diversification', value: 88, color: 'bg-blue-400' },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Large Risk Score Display */}
      <div className="flex items-end gap-3">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-6xl font-bold bg-gradient-to-br from-blue-400 to-indigo-500 bg-clip-text text-transparent"
        >
          {score}
        </motion.div>
        <div className="pb-2 text-slate-400 text-sm">
          <div className="font-semibold text-white">Risk Score</div>
          <div className="flex items-center gap-1 text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span className="text-xs">Low Risk</span>
          </div>
        </div>
      </div>

      {/* Mini Risk Bars */}
      <div className="space-y-3">
        {riskBars.map((bar, idx) => (
          <motion.div
            key={bar.label}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
            className="space-y-1"
          >
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">{bar.label}</span>
              <span className="text-slate-300 font-medium">{bar.value}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${bar.value}%` } : {}}
                transition={{ duration: 1, delay: 0.6 + idx * 0.1, ease: "easeOut" }}
                className={`h-full ${bar.color} rounded-full relative`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Wallet Unlock Animation Component
const WalletUnlock = () => {
  const [unlockedStages, setUnlockedStages] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  const milestones = [
    { label: 'Prototype', percentage: 25 },
    { label: 'Beta Launch', percentage: 50 },
    { label: 'User Growth', percentage: 75 },
    { label: 'Profitability', percentage: 100 },
  ];

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setUnlockedStages(prev => {
            if (prev >= milestones.length) {
              clearInterval(interval);
              return milestones.length;
            }
            return prev + 1;
          });
        }, 800);
        return () => clearInterval(interval);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInView, milestones.length]);

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Wallet Visual */}
      <div className="relative">
        <motion.div
          animate={unlockedStages === milestones.length ? { 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 0.5 }}
          className="relative w-32 h-32 mx-auto mb-6"
        >
          {/* Wallet Background */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 backdrop-blur-sm" />
          
          {/* Lock/Unlock Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {unlockedStages === milestones.length ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400" strokeWidth={2} />
              </motion.div>
            ) : (
              <Lock className="w-12 h-12 text-indigo-400" strokeWidth={2} />
            )}
          </div>

          {/* Glow */}
          {unlockedStages === milestones.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.5, 2] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="absolute inset-0 rounded-2xl bg-emerald-500/30 blur-xl"
            />
          )}
        </motion.div>
      </div>

      {/* Milestone Progress */}
      <div className="space-y-3">
        {milestones.map((milestone, idx) => {
          const isUnlocked = idx < unlockedStages;
          return (
            <motion.div
              key={milestone.label}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 * idx }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={isUnlocked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  isUnlocked 
                    ? 'bg-emerald-500/20 border-emerald-500' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {isUnlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </motion.div>
                )}
              </motion.div>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className={isUnlocked ? 'text-white font-medium' : 'text-slate-500'}>
                    {milestone.label}
                  </span>
                  <span className={isUnlocked ? 'text-emerald-400' : 'text-slate-600'}>
                    {milestone.percentage}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Mentor Avatars Component
const MentorAvatars = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });

  const mentors = [
    { name: 'Sarah Chen', role: 'CTO at Google', color: 'from-blue-500 to-cyan-500', company: 'Google' },
    { name: 'Marcus Rodriguez', role: 'VP Eng at Meta', color: 'from-indigo-500 to-purple-500', company: 'Meta' },
    { name: 'Emily Watson', role: 'CTO at Stripe', color: 'from-emerald-500 to-teal-500', company: 'Stripe' },
    { name: 'David Kim', role: 'Tech Lead at Apple', color: 'from-pink-500 to-rose-500', company: 'Apple' },
    { name: 'Lisa Anderson', role: 'Dir Eng at Tesla', color: 'from-orange-500 to-amber-500', company: 'Tesla' },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Avatar Stack */}
      <div className="flex items-center -space-x-4">
        {mentors.slice(0, 4).map((mentor, idx) => (
          <motion.div
            key={mentor.name}
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 * idx, type: "spring" }}
            className="relative group"
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${mentor.color} border-4 border-[#020617] flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform cursor-pointer`}>
              {mentor.name.split(' ').map(n => n[0]).join('')}
            </div>
            {/* Verified Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.1 * idx + 0.3 }}
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#020617] flex items-center justify-center"
            >
              <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
        ))}
        {/* +N More */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-16 h-16 rounded-full bg-white/5 border-4 border-[#020617] flex items-center justify-center text-slate-400 font-semibold text-sm backdrop-blur-sm hover:bg-white/10 transition-colors cursor-pointer"
        >
          +120
        </motion.div>
      </div>

      {/* Company Logos/Tags */}
      <div className="flex flex-wrap gap-2 mt-2 z-10">
        {['Google', 'Meta', 'Stripe', 'Apple', 'Tesla', 'Amazon'].map((company, idx) => (
          <motion.div
            key={company}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.6 + idx * 0.05 }}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-medium text-slate-300 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-blue-400" />
              {company}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        {[
          { label: 'Mentors', value: '125+' },
          { label: 'Companies', value: '15' },
          { label: 'Success Rate', value: '94%' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.8 + idx * 0.1 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs text-slate-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesBento;
