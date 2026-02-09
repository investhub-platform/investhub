import React from 'react'
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
        {/* Social Proof Section */}
        <div className="pt-12 px-6 pb-6 max-w-6xl mx-auto">
          <SocialProof />
        </div>

        {/* Value Cards */}
        <div className="px-6">
          <ValueCards />
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
