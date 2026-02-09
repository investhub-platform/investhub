import { useState, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { User, BrainCircuit, Users, Wallet, Search, ShieldCheck, LineChart, CheckCircle2 } from 'lucide-react'

// Steps Data with Icons
const founderSteps = [
  { id: 1, title: 'Build Profile', desc: 'Create your startup identity with AI-assisted pitch decks.', icon: User },
  { id: 2, title: 'AI Analysis', desc: 'Our Gemini agent analyzes your pitch for market fit & risk scores.', icon: BrainCircuit },
  { id: 3, title: 'Get Mentored', desc: 'Tech mentors validate your architecture and milestones.', icon: Users },
  { id: 4, title: 'Get Funded', desc: 'Unlock investment tiers and receive funds in your secure wallet.', icon: Wallet },
]

const investorSteps = [
  { id: 1, title: 'Discover Deals', desc: 'Browse curated startups filtered by AI risk assessments.', icon: Search },
  { id: 2, title: 'Assess Risk', desc: 'View deep-dive technical reports and mentor validations.', icon: ShieldCheck },
  { id: 3, title: 'Track Growth', desc: 'Monitor real-time milestone completion and burn rates.', icon: LineChart },
  { id: 4, title: 'Invest Securely', desc: 'Fund projects via smart contracts with milestone-based release.', icon: CheckCircle2 },
]

export default function HowItWorks() {
  const [view, setView] = useState<'founder' | 'investor'>('founder')
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Scroll Progress for the "Beam"
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })
  
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const steps = view === 'founder' ? founderSteps : investorSteps

  return (
    <section id="how" className="w-full py-32 bg-[#020617] relative overflow-hidden">
      
      {/* Background Grid (Optional) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] mask-image-gradient pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10" ref={containerRef}>
        
        {/* Header Section */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-sm font-medium"
          >
            Workflow
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            From Idea to <span className="text-blue-500">Exit.</span>
          </h2>
          
          {/* Toggle Switch */}
          <div className="inline-flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-sm relative">
            {(['founder', 'investor'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`relative px-6 py-2 rounded-full text-sm font-medium transition-colors z-10 ${view === tab ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {view === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 capitalize">I am a {tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          
          {/* The Glowing Beam Line (Vertical) */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-0.5 bg-white/10 -translate-x-1/2">
            <motion.div 
              style={{ scaleY, transformOrigin: "top" }}
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500 via-indigo-500 to-transparent"
            />
          </div>

          {/* Steps */}
          <div className="space-y-12 md:space-y-24">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex items-center md:justify-between ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
                >
                  
                  {/* Timeline Dot (Center) */}
                  <div className="absolute left-[28px] md:left-1/2 -translate-x-1/2 w-14 h-14 flex items-center justify-center rounded-full bg-[#020617] border border-blue-500/30 z-20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                    <step.icon className="w-6 h-6 text-blue-400" />
                  </div>

                  {/* Empty space for the other side on desktop */}
                  <div className="hidden md:block w-[45%]" />

                  {/* Content Card */}
                  <div className="w-[calc(100%-80px)] md:w-[45%] ml-20 md:ml-0 pl-4 md:pl-0">
                    <div className="group p-6 rounded-2xl bg-[#0B0D10] border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-xs font-mono text-slate-400 border border-white/5">
                          0{index + 1}
                        </span>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-sm">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                </motion.div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}