import { motion } from 'framer-motion'
import { Users, FilePlus, DollarSign, ArrowRight } from 'lucide-react'

const cards = [
  {
    title: 'Post Your Idea',
    subtitle: 'Founders',
    desc: 'Pitch your startup with AI-assisted documentation and get matched with mentors and investors.',
    icon: FilePlus,
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    title: 'Technical Guidance',
    subtitle: 'Mentors',
    desc: 'Review code, architecture and milestones to lower investment risk.',
    icon: Users,
    gradient: 'from-indigo-500/20 to-purple-500/20',
  },
  {
    title: 'Secure Funding',
    subtitle: 'Investors',
    desc: 'Invest via our virtual wallet with transparent milestone tracking.',
    icon: DollarSign,
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
]

export default function ValueCards() {
  return (
    <section className="w-full py-12 sm:py-16 md:py-24 bg-[#020617]"> {/* Matching your dark theme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 50 }}
                className="group relative h-full"
              >
                {/* 1. The Glass Card Container */}
                <div className="relative h-full p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] bg-[#0B0D10] border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/10 hover:shadow-2xl hover:shadow-blue-900/10 active:scale-[0.98]">
                  
                  {/* 2. Hover Gradient Glow (Spotlight Effect) */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${card.gradient} blur-3xl`} />
                  
                  {/* Content Wrapper (Relative to sit on top of glow) */}
                  <div className="relative z-10 flex flex-col h-full">
                    
                    {/* Header: Icon + Badge */}
                    <div className="flex justify-between items-start mb-4 sm:mb-6">
                      <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-slate-200" />
                      </div>
                      <span className="px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-medium tracking-wide text-slate-400 uppercase bg-white/5 rounded-full border border-white/5">
                        {card.subtitle}
                      </span>
                    </div>

                    {/* Text Content */}
                    <div className="mb-auto">
                      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3 tracking-tight group-hover:text-blue-100 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-sm sm:text-[15px]">
                        {card.desc}
                      </p>
                    </div>

                    {/* Footer: Learn More Button */}
                    <div className="pt-6 sm:pt-8 mt-3 sm:mt-4 flex items-center text-xs sm:text-sm font-medium text-white/40 group-hover:text-white transition-colors cursor-pointer">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}