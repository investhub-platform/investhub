import { useEffect, useRef, useState } from 'react'
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const navShellRef = useRef(null)

  useEffect(() => {
    const shell = navShellRef.current
    if (!shell) return

    const ctx = gsap.context(() => {
      gsap.set(shell, {
        width: 'min(97vw, 1280px)',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        borderRadius: '9999px',
        y: -10,
        opacity: 0
      })

      gsap.to(shell, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out'
      })

      gsap.to(shell, {
        width: 'min(95vw, 1024px)',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: '+=260',
          scrub: true
        }
      })
    }, shell)

    return () => {
      ctx.revert()
    }
  }, [])

  const handleSectionScroll = (event, sectionId) => {
    event.preventDefault()
    setOpen(false)

    const target = document.getElementById(sectionId)
    if (!target) return

    gsap.to(window, {
      duration: 1,
      ease: 'power3.out',
      scrollTo: { y: target, offsetY: 110 }
    })
  }

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none">
      <div ref={navShellRef} className="pointer-events-auto flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-lg backdrop-saturate-150 border border-transparent rounded-full shadow-lg w-full mx-4 transition-all">
        
        <Link to="/" className="flex items-center gap-3">
          <img src="/favicon.ico" alt="InvestHub logo" className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <span className="text-white font-bold tracking-tight text-lg">InvestHub</span>
        </Link>

        {/* Updated Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#how-it-works" onClick={(event) => handleSectionScroll(event, 'how-it-works')} className="hover:text-white transition-colors">How it Works</a>
          <a href="#startups" onClick={(event) => handleSectionScroll(event, 'startups')} className="hover:text-white transition-colors">Startups</a>
          <a href="#mentors" onClick={(event) => handleSectionScroll(event, 'mentors')} className="hover:text-white transition-colors">Mentors</a>
          <a href="#pricing" onClick={(event) => handleSectionScroll(event, 'pricing')} className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/auth/login" className="hidden md:block text-slate-300 hover:text-white text-sm font-medium transition-colors">
            Log in
          </Link>
          <Link to="/auth/register" className="hidden md:inline-flex items-center px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-all">
            Start Investing
          </Link>
          
          {/* Mobile Toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}><path d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}/></svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pointer-events-auto absolute top-[80px] left-1/2 transform -translate-x-1/2 w-[92%] max-w-md bg-white/5 backdrop-blur-lg backdrop-saturate-150 border border-transparent rounded-2xl p-4 z-40 md:hidden shadow-lg"
          >
            <nav className="flex flex-col gap-3 text-base font-medium text-slate-200">
              <a onClick={(event) => handleSectionScroll(event, 'how-it-works')} href="#how-it-works" className="p-3 rounded-xl hover:bg-white/5">How it Works</a>
              <a onClick={(event) => handleSectionScroll(event, 'startups')} href="#startups" className="p-3 rounded-xl hover:bg-white/5">Startups</a>
              <a onClick={(event) => handleSectionScroll(event, 'mentors')} href="#mentors" className="p-3 rounded-xl hover:bg-white/5">Mentors</a>
              <a onClick={(event) => handleSectionScroll(event, 'pricing')} href="#pricing" className="p-3 rounded-xl hover:bg-white/5">Pricing</a>
              <Link onClick={() => setOpen(false)} to="/auth/login" className="p-3 rounded-xl hover:bg-white/5">Log in</Link>
              <Link onClick={() => setOpen(false)} to="/auth/register" className="mt-2 p-3 text-center rounded-xl bg-white text-black font-semibold">Start Investing</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar