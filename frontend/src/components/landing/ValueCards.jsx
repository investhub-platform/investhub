import { motion } from 'framer-motion'
import { Rocket, ShieldCheck, Coins } from 'lucide-react'

const cards = [
  {
    role: 'For Founders',
    title: 'Pitch instantly.',
    desc: 'Skip the warm intros. Upload your deck, let our AI analyze your market fit, and get directly in front of funded investors.',
    icon: Rocket,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    role: 'For Mentors',
    title: 'Vet the tech.',
    desc: 'Review architectures, validate code milestones, and earn equity or fees by ensuring investors only fund what actually works.',
    icon: ShieldCheck,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    role: 'For Investors',
    title: 'Fund the future.',
    desc: 'Invest with confidence. Funds are held in a smart virtual wallet and only released when technical mentors verify milestones.',
    icon: Coins,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
]

export default function ValueCards() {
  return (
    <section className="w-full py-24 bg-[#020617]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">One platform. Three forces.</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">We aligned the incentives of builders, verifiers, and backers to create a zero-friction startup ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group relative p-8 rounded-3xl bg-[#0B0D10] border border-white/5 hover:border-white/10 transition-all hover:-translate-y-2 cursor-default"
              >
                <div className="mb-6">
                  <span className="text-xs font-bold tracking-widest uppercase text-slate-500">{card.role}</span>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-6`}>
                  <Icon className={`w-7 h-7 ${card.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-slate-400 leading-relaxed">{card.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}