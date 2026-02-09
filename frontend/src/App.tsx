import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import Hero from './components/landing/Hero'
import SocialProof from './components/landing/SocialProof'
// import FeaturesBento from './components/landing/FeaturesBento'
import ValueCards from './components/landing/ValueCards'
import HowItWorks from './components/landing/HowItWorks'
import FAQAccordion from './components/landing/FAQAccordion'
import Footer from './components/layout/Footer'

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <Hero />

      <main className="pb-24">
      {/* Background grid and grouped SocialProof + ValueCards */}
      <div className="relative">
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] mask-image-gradient pointer-events-none"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="pt-12 pb-6">
            <SocialProof />
          </div>

          <div className="pb-6">
            <ValueCards />
          </div>
        </div>
      </div>

        {/* Feature Bento */}
        {/* <div className="px-6">
          <FeaturesBento />
        </div> */}

        {/* How it works */}
        <div className="px-6">
          <HowItWorks />
        </div>

        {/* FAQ */}
        <div className="px-6">
          <FAQAccordion />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
