import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const items = [
  {
    q: 'How quickly can I find a technical co‑founder or team?',
    a: 'Our matching algorithm surfaces vetted engineers and mentors based on skills, availability, and project fit. Many founders report productive introductions within days of their pitch going live.'
  },
  {
    q: 'How does matching between founders and mentors work?',
    a: 'We combine your profile, pitch details, and AI analysis to rank suitable mentors. Mentors review technical specs and provide milestone guidance before an investment decision is finalized.'
  },
  {
    q: 'Do I need an existing product to join?',
    a: 'No — you can join with an idea or prototype. Mentors help validate technical feasibility and scope milestones for investment-readiness to ensure your concept is viable.'
  },
  {
    q: 'How are milestone payments validated and released?',
    a: 'Mentors validate milestone completion, and our secure escrow system automates funds release to ensure absolute transparency and trust between founders and investors.'
  },
  {
    q: 'Is the virtual wallet linked to real money?',
    a: 'Yes. Wallets interface with fiat rails and payment partners; investments settle through legal channels. We provide clear on‑chain receipts and full reconciliation.'
  },
  {
    q: 'Are mentors compensated or incentivized?',
    a: 'Mentors are typically compensated via advisory fees, equity, or platform incentives depending on the program — exact terms are transparent and visible on each engagement.'
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="relative w-full py-24 md:py-32 bg-[#020617] overflow-hidden scroll-mt-20">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
        
        {/* Left Column: Sticky Header */}
        <div className="lg:w-1/3 lg:sticky lg:top-40">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6">
            Frequently <br className="hidden lg:block" />
            Asked Questions
          </h2>
          <p className="text-lg text-slate-400 font-medium mb-8">
            Everything you need to know about joining, mentoring, and securing capital on InvestHub.
          </p>
          <a href="#contact" className="inline-flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors">
            Still have questions? Contact support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>

        {/* Right Column: Accordion List */}
        <div className="lg:w-2/3 w-full flex flex-col gap-4">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div 
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-500 border ${
                    isOpen 
                      ? 'bg-[#0B0D10]/80 border-white/10 shadow-[0_10px_40px_-15px_rgba(59,130,246,0.15)]' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                  } backdrop-blur-xl`}
                >
                  {/* Active State Left-Border Highlight */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-500 transition-transform duration-500 ease-out origin-top ${
                      isOpen ? 'scale-y-100' : 'scale-y-0'
                    }`} 
                  />

                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between px-6 sm:px-8 py-6 text-left focus:outline-none"
                  >
                    <span className={`text-base sm:text-lg font-bold pr-8 transition-colors duration-300 ${
                      isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {item.q}
                    </span>
                    
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      isOpen ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300'
                    }`}>
                      <Plus className={`w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] ${
                        isOpen ? 'rotate-[135deg]' : 'rotate-0'
                      }`} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                      >
                        <div className="px-6 sm:px-8 pb-6 pt-0 text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}