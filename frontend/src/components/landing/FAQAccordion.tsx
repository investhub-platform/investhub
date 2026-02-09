import React, { useState } from 'react'
import { motion } from 'framer-motion'

const items = [
  {
    q: 'How quickly can I find a technical co‑founder or team?',
    a: 'Our matching algorithm surfaces vetted engineers and mentors based on skills, availability and project fit — many founders report productive introductions within days.'
  },
  {
    q: 'How does matching between founders and mentors work?',
    a: 'We combine your profile, pitch details and AI analysis to rank suitable mentors. Mentors review technical specs and provide milestone guidance before an investment decision.'
  },
  {
    q: 'Do I need an existing product to join?',
    a: 'No — you can join with an idea or prototype. Mentors help validate technical feasibility and scope milestones for investment-readiness.'
  },
  {
    q: 'How are milestone payments validated and released?',
    a: 'Mentors validate milestone completion and our smart-contracts automate funds release to ensure transparency and trust.'
  },
  {
    q: 'Is the virtual wallet linked to real money?',
    a: 'Yes. Wallets interface with fiat rails and payment partners; investments settle through legal channels. We provide clear on‑chain receipts and reconciliation.'
  },
  {
    q: 'Are mentors compensated or incentivized?',
    a: 'Mentors are typically compensated via advisory fees, equity, or platform incentives depending on the program — terms are visible on each engagement.'
  },
]

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="w-full py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8">Frequently Asked Questions</h2>
        <p className="text-slate-400 mb-8">Answers about joining, mentoring, and investing on InvestHub.</p>

        <div className="space-y-4">
          {items.map((it, idx) => {
            const isOpen = open === idx
            return (
              <motion.div
                key={it.q}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, delay: idx * 0.04 }}
                className="w-full"
              >
                <div className={`mx-auto max-w-3xl rounded-full transition-all duration-300 ${isOpen ? 'ring-2 ring-blue-400/60 shadow-[0_10px_40px_-18px_rgba(59,130,246,0.45)]' : 'border border-white/10 bg-white/3'}`}>
                  <button
                    onClick={() => setOpen(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between px-6 py-5 text-left rounded-full"
                  >
                    <div className="text-left">
                      <div className="text-lg md:text-xl font-semibold text-white">{it.q}</div>
                      <div className="text-slate-400 text-sm mt-1 hidden md:block">{it.a.substring(0, 90)}{it.a.length > 90 ? '…' : ''}</div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white ${isOpen ? 'bg-blue-500' : 'bg-white/6 text-blue-300'}`}>{isOpen ? '−' : '+'}</span>
                    </div>
                  </button>

                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.36 }}
                    style={{ overflow: 'hidden' }}
                    className="px-6 pb-6 pt-0 text-slate-300 text-sm"
                  >
                    {it.a}
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
