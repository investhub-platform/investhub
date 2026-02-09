import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

export default function Footer() {
  return (
    <footer className="relative mt-16">
      {/* Aurora glows */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 flex justify-center overflow-hidden">
        <div className="w-[60rem] h-48 rounded-full bg-gradient-to-r from-[#3b82f6]/30 via-[#8b5cf6]/20 to-[#3b82f6]/10 blur-3xl opacity-40 transform-gpu" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div variants={item} className="col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-4xl font-extrabold text-white leading-tight">Ready to build the future?</h2>
              <p className="mt-3 text-sm text-slate-400 max-w-md">Join founders and investors shaping the next era of infrastructure, marketplaces and fintech.</p>

              <div className="mt-6 flex items-center gap-3">
                <motion.a whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md">
                  Get started
                </motion.a>

                <motion.a whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 text-slate-300 px-4 py-2 rounded-lg border border-white/6 bg-white/2">
                  Contact sales
                </motion.a>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="col-span-1 md:col-span-2 grid grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h4 className="text-white font-semibold">Product</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Docs</li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h4 className="text-white font-semibold">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>About</li>
                <li>Careers</li>
                <li>Blog</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer bottom */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-4">
            <div className="text-white font-semibold">InvestHub</div>
            <div>© {new Date().getFullYear()} InvestHub, Inc.</div>
          </div>

          <div className="flex items-center gap-4">
            <a className="text-slate-400">Privacy</a>
            <a className="text-slate-400">Terms</a>
          </div>
        </div>
      </div>

      {/* Huge subtle watermark (centered & responsive) */}
      <div className="absolute inset-x-0 bottom-0 -mb-28 pointer-events-none overflow-hidden">
        <div className="w-full flex justify-center">
          <span
            className="block font-black text-white leading-none select-none text-[10rem] md:text-[14rem] lg:text-[18rem]"
            style={{ lineHeight: 0.8, opacity: 0.03, transform: 'translateY(8px)' }}
          >
            InvestHub
          </span>
        </div>
      </div>
    </footer>
  )
}
