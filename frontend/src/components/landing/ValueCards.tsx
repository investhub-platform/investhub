import React from 'react'
import { motion } from 'framer-motion'
import { Users, FilePlus, DollarSign } from 'lucide-react'

const cards = [
  {
    title: 'Post Your Idea',
    subtitle: 'Founders',
    desc: 'Pitch your startup with AI-assisted documentation and get matched with mentors and investors.',
    icon: FilePlus,
  },
  {
    title: 'Technical Guidance',
    subtitle: 'Mentors',
    desc: 'Review code, architecture and milestones to lower investment risk.',
    icon: Users,
  },
  {
    title: 'Secure Funding',
    subtitle: 'Investors',
    desc: 'Invest via our virtual wallet with transparent milestone tracking.',
    icon: DollarSign,
  },
]

export default function ValueCards() {
  return (
    <section className="w-full py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c, i) => {
            const Icon = c.icon
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group relative p-6 rounded-2xl bg-[#0B0D10] border border-white/10 backdrop-blur-xl hover:translate-y-[-6px] transform transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/6 flex items-center justify-center text-blue-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">{c.subtitle}</div>
                      <div className="text-lg font-bold text-white">{c.title}</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 hidden sm:block">Learn more →</div>
                </div>

                <p className="mt-4 text-slate-400 text-sm leading-relaxed">{c.desc}</p>

                <div className="absolute -bottom-6 right-6 w-36 h-24 rounded-xl bg-gradient-to-br from-blue-700/10 to-indigo-600/8 blur-2xl pointer-events-none opacity-60" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
