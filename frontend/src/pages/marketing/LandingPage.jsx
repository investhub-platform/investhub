// React import removed (automatic JSX runtime)
import { useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import Hero from '../../components/landing/Hero'
import SocialProof from '../../components/landing/SocialProof'
// import FeaturesBento from '../../components/landing/FeaturesBento'
import ValueCards from '../../components/landing/ValueCards'
import HowItWorks from '../../components/landing/HowItWorks'
import FAQAccordion from '../../components/landing/FAQAccordion'
import Footer from '../../components/layout/Footer'
import Pricing from '../../components/landing/Pricing'

// GSAP Imports
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LandingPage = () => {

  // Optional: Global GSAP reveal for sections
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
    <div className="min-h-screen bg-[#020617] font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <Navbar />
      
      {/* 1. Hero (Awwwards WOW Upgrade) */}
      <Hero />

      <main className="pb-24">
        
        {/* 2. Grouped SocialProof + ValueCards (Clean & Simple) */}
        <div className="relative z-10 gsap-fade-section">
          <div className="max-w-7xl mx-auto px-6 pt-12">
            <SocialProof />
            <ValueCards />
          </div>
        </div>

        {/* 3. The Core Ecosystem Logic (How It Works) */}
        <div className="gsap-fade-section relative">
          <div className="relative z-10 px-6">
            <HowItWorks />
          </div>
        </div>

        {/* 4. Pricing (Transparent Business Model) */}
        <div className="relative z-10 px-6 gsap-fade-section">
           <Pricing />
        </div>

        {/* 5. FAQ (Professional Vetting Questions) */}
        <div className="relative z-10 px-6 gsap-fade-section">
          <FAQAccordion />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default LandingPage