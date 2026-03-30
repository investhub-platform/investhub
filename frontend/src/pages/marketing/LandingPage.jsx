import { useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Navbar from '../../components/layout/Navbar'
import Hero from '../../components/landing/Hero'
import SocialProof from '../../components/landing/SocialProof'
import ValueCards from '../../components/landing/ValueCards'
import HowItWorks from '../../components/landing/HowItWorks'
import Pricing from '../../components/landing/Pricing'
import FAQAccordion from '../../components/landing/FAQAccordion'
import Footer from '../../components/layout/Footer'

gsap.registerPlugin(ScrollTrigger)

const LandingPage = () => {
  
  // Optional: Add a smooth fade-in to sections as you scroll using GSAP
  useEffect(() => {
    const sections = gsap.utils.toArray('.gsap-fade-section');
    sections.forEach((sec) => {
      gsap.fromTo(sec, 
        { opacity: 0, y: 40 },
        {
          opacity: 1, 
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sec,
            start: "top 85%", // Trigger when the top of the section hits 85% of viewport
          }
        }
      );
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] font-sans selection:bg-blue-500/30">
      <Navbar />
      <Hero />

      <main className="pb-24">
        
        <div className="gsap-fade-section pt-12 pb-6">
          <SocialProof />
        </div>

        <div className="gsap-fade-section pb-6 relative z-10">
          <ValueCards />
        </div>

        {/* Global Background Grid Pattern */}
        <div className="relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] mask-image-gradient pointer-events-none" />
          
          <div className="gsap-fade-section relative z-10 px-6">
            <HowItWorks />
          </div>

          <div className="gsap-fade-section relative z-10 px-6">
            <Pricing />
          </div>

          <div className="gsap-fade-section relative z-10 px-6">
            <FAQAccordion />
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}

export default LandingPage