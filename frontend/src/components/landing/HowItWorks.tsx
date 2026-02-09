import { useState } from 'react'
import { motion } from 'framer-motion'

const founderSteps = [
  { title: 'Build Profile', desc: 'Create your startup identity.' },
  { title: 'AI Analysis', desc: 'Our agent analyzes your pitch for market fit & risk.' },
  { title: 'Get Mentored', desc: 'Tech mentors validate your milestones.' },
  { title: 'Get Funded', desc: 'Unlock investment tiers.' },
]

const investorSteps = [
  { title: 'Discover Deals', desc: 'Browse curated startups.' },
  { title: 'Assess Risk', desc: 'AI-backed risk analytics.' },
  { title: 'Follow Mentors', desc: 'Leverage mentor assessments.' },
  { title: 'Invest', desc: 'Fund milestones via secure wallet.' },
]

export default function HowItWorks() {
  const [view, setView] = useState<'founder' | 'investor'>('founder')

  const steps = view === 'founder' ? founderSteps : investorSteps

  return (
    <section id="how" className="w-full py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-3xl font-bold text-white">How it works</h3>
            <p className="text-slate-400">A concise flow for {view === 'founder' ? 'Founders' : 'Investors'}</p>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => setView('founder')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${view === 'founder' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'text-slate-300'}`}
            >
              I am a Founder
            </button>
            <button
              onClick={() => setView('investor')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${view === 'investor' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'text-slate-300'}`}
            >
              I am an Investor
            </button>
          </div>
        </div>

        <div className="relative">
          {/* S-curve dashed path - animated */}
          <svg viewBox="0 0 1000 220" className="w-full h-56" preserveAspectRatio="none">
            <motion.path
              d="M20 180 C200 180 300 20 500 20 C700 20 800 180 980 180"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="6 8"
              fill="none"
              strokeLinecap="round"
              opacity="0.35"
              animate={{ strokeDashoffset: [0, -48] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            />

            {steps.map((s, i) => {
              const pos = 120 + (i * 240)
              return (
                <motion.g
                  key={s.title}
                  transform={`translate(${pos}, ${60 + (i % 2 === 0 ? -6 : 18)})`}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                >
                  <rect x="-80" y="-34" width="180" height="72" rx="12" fill="#0b1726" stroke="#ffffff" strokeOpacity="0.12" />
                    <foreignObject x="-76" y="-30" width="172" height="64">
                      {/* @ts-ignore: xmlns is required inside foreignObject for XHTML content */}
                      <div xmlns="http://www.w3.org/1999/xhtml" className="p-3 text-sm text-slate-100">
                        <div className="text-white font-semibold">{s.title}</div>
                        <div className="text-slate-300 text-xs mt-1">{s.desc}</div>
                      </div>
                    </foreignObject>
                </motion.g>
              )
            })}
          </svg>
        </div>
      </div>
    </section>
  )
}
