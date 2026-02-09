import { motion } from 'framer-motion'
import { ArrowRight, Github, Twitter, Linkedin, Send } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-16 sm:mt-24 md:mt-32 w-full bg-[#020617] border-t border-white/5 overflow-hidden">
      
      {/* 1. Background Texture (Subtle Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] mask-image-gradient pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12">
        
        {/* 2. Main Top Section: CTA + Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 mb-12 sm:mb-16 md:mb-20">
          
          {/* Left: Brand & Newsletter */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 sm:mb-6"
              >
                Ready to build <br />
                <span className="text-slate-500">the future?</span>
              </motion.h2>
              <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8 max-w-sm leading-relaxed">
                Join 10,000+ founders and investors shaping the next era of fintech.
              </p>
              
              {/* Newsletter Input */}
              <div className="flex items-center gap-2 w-full max-w-sm">
                <div className="relative flex-1 group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="relative w-full bg-[#0B0D10] text-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-white/10 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
                <button className="p-2.5 sm:p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/5 active:scale-95">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Navigation Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Column 1 */}
            <div className="space-y-4 sm:space-y-6">
              <h4 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 sm:space-y-4">
                {['Features', 'Pricing', 'Docs', 'Changelog'].map((item) => (
                  <li key={item}>
                    <a href="#" className="group flex items-center text-sm sm:text-base text-slate-400 hover:text-blue-400 transition-colors active:scale-95">
                      <span className="relative">
                        {item}
                        <span className="absolute -bottom-1 left-0 w-0 h-px bg-blue-400 transition-all group-hover:w-full" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 */}
            <div className="space-y-4 sm:space-y-6">
              <h4 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 sm:space-y-4">
                {['About', 'Careers', 'Blog', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm sm:text-base text-slate-400 hover:text-blue-400 transition-colors active:scale-95">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-4 sm:space-y-6">
              <h4 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3 sm:space-y-4">
                {['Privacy', 'Terms', 'Security', 'Status'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm sm:text-base text-slate-400 hover:text-blue-400 transition-colors active:scale-95">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Bottom Bar: Copyright & Socials */}
        <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-xs sm:text-sm text-center md:text-left">
            © {currentYear} InvestHub Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <SocialIcon icon={Twitter} />
            <SocialIcon icon={Github} />
            <SocialIcon icon={Linkedin} />
          </div>
        </div>

      </div>

      {/* 4. Massive Watermark (Clipped) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 pointer-events-none select-none hidden sm:block">
        <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] font-bold text-white/[0.02] tracking-tighter leading-none whitespace-nowrap">
          InvestHub
        </h1>
      </div>
    </footer>
  )
}

// Helper Component for Social Icons
function SocialIcon({ icon: Icon }: { icon: any }) {
  return (
    <a href="#" className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-90">
      <Icon className="w-5 h-5" />
    </a>
  )
}