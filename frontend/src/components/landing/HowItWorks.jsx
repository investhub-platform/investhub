import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import founderStep1 from "@/assets/how-it-works/founder-step1.jpg";
import founderStep2 from "@/assets/how-it-works/founder-step2.jpg";
import founderStep3 from "@/assets/how-it-works/founder-step3.jpg";
import founderFinal from "@/assets/how-it-works/founder-final.jpg";
import investorStep1 from "@/assets/how-it-works/investor-step1.jpg";
import investorStep2 from "@/assets/how-it-works/investor-step2.jpg";
import investorStep3 from "@/assets/how-it-works/investor-step3.jpg";
import investorFinal from "@/assets/how-it-works/investor-final.jpg";
import mentorStep1 from "@/assets/how-it-works/mentor-step1.jpg";
import mentorStep2 from "@/assets/how-it-works/mentor-step2.jpg";
import mentorStep3 from "@/assets/how-it-works/mentor-step3.jpg";
import mentorFinal from "@/assets/how-it-works/mentor-final.jpg";

const roleData = {
  founder: [
    { label: "Phase 01", title: "Build your Pitch", desc: "In ~5 minutes, submit your startup idea, upload your pitch deck, and define your required budget. Let our system build a comprehensive profile for investors.", image: founderStep1 },
    { label: "Phase 02", title: "AI Risk Analysis", desc: "Our Gemini-powered AI instantly analyzes your pitch, generating a detailed summary, identifying market potential, and assigning a standardized Risk Score.", image: founderStep2 },
    { label: "Phase 03", title: "Connect with Mentors", desc: "Get matched with elite technical mentors who will review your architecture, validate your code, and verify your milestones to build investor trust.", image: founderStep3 },
    { label: "Phase 04", title: "Secure Funding", desc: "Unlock virtual investments via our secure wallet system. Funds are released transparently as you hit your mentor-approved development milestones.", image: founderFinal },
  ],
  investor: [
    { label: "Phase 01", title: "Discover Opportunities", desc: "Browse a highly curated list of promising startups spanning multiple tech sectors. Filter by funding stage, category, and AI-predicted success rates.", image: investorStep1 },
    { label: "Phase 02", title: "Assess AI Analytics", desc: "Don't rely on gut feelings. Dive into comprehensive AI-generated risk reports, competitive analyses, and technical red flags before making a move.", image: investorStep2 },
    { label: "Phase 03", title: "Follow Mentor Insights", desc: "Leverage the expertise of veteran CTOs and developers. See which projects have had their technical architecture verified by our mentor network.", image: investorStep3 },
    { label: "Phase 04", title: "Invest & Track", desc: "Fund projects securely via our virtual wallet. Monitor your portfolio's growth in real-time and release funds based on strictly validated milestones.", image: investorFinal },
  ],
  mentor: [
    { label: "Phase 01", title: "Build your Profile", desc: "Highlight your technical stack, past exits, and industry experience. Let our system verify your credentials to establish your authority on MentorHub.", image: mentorStep1 },
    { label: "Phase 02", title: "Create Content", desc: "Share your expertise on MentorHub by posting lectures, workshops, tutorials, webinars, and more. Help the next generation of founders level up.", image: mentorStep2 },
    { label: "Phase 03", title: "Engage & Educate", desc: "Host live sessions, answer questions, and build a following. Every role on InvestHub can also mentor — founders and investors included.", image: mentorStep3 },
    { label: "Phase 04", title: "Build Reputation", desc: "Earn platform credibility, grow your audience, and get exclusive access to emerging tech communities — all while contributing as a founder or investor too.", image: mentorFinal },
  ],
};

const roles = [
  { key: "founder", label: "Founder" },
  { key: "investor", label: "Investor" },
  { key: "mentor", label: "Mentor" },
];

const HowItWorks = () => {
  const [activeRole, setActiveRole] = useState("founder");
  const steps = roleData[activeRole];

  return (
    <section id="how-it-works" className="relative py-32 bg-transparent overflow-visible z-10 scroll-mt-20">
      
      {/* Ambient Background Glows (Seamless blend) */}
      <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6">
            How it Works
          </h2>
          <p className="text-lg md:text-xl text-slate-400 font-medium">
            A simple, transparent process from start to finish.
          </p>
        </div>

        {/* Premium Segmented Control */}
        <div className="flex justify-center mb-24">
          <div className="inline-flex rounded-full bg-[#0B0D10]/80 p-1.5 border border-white/10 backdrop-blur-xl shadow-2xl relative">
            {roles.map((role) => {
              const isActive = activeRole === role.key;
              return (
                <button
                  key={role.key}
                  onClick={() => setActiveRole(role.key)}
                  className={`relative px-8 py-3 rounded-full text-sm font-bold transition-colors z-10 ${
                    isActive ? "text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="hiw-active-pill"
                      className="absolute inset-0 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Alternating Timeline */}
        <div className="relative">
          {/* Glowing Center Line */}
          <div className="absolute left-1/2 top-8 bottom-8 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-blue-500/30 to-transparent hidden lg:block" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-16 lg:space-y-24"
            >
              {steps.map((step, index) => {
                const isEven = index % 2 === 1;

                return (
                  <div key={index} className={`relative flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${isEven ? "lg:flex-row-reverse" : ""}`}>
                    
                    {/* Center Node (Desktop) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center w-12 h-12 rounded-full bg-[#020617] border-4 border-[#0B0D10] shadow-[0_0_20px_rgba(37,99,235,0.2)] z-20">
                      <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                    </div>

                    {/* Text Content */}
                    <div className={`flex-1 w-full lg:w-1/2 flex ${isEven ? "lg:justify-start" : "lg:justify-end"}`}>
                      <div className={`max-w-xl ${isEven ? "lg:pl-12" : "lg:pr-12"}`}>
                        <div className="inline-block px-3 py-1 mb-6 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-widest uppercase shadow-sm">
                          {step.label}
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                          {step.title}
                        </h3>
                        <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>

                    {/* Image Content */}
                    <div className="flex-1 w-full lg:w-1/2">
                      <div className="relative group rounded-[2rem] overflow-hidden bg-[#0B0D10] border border-white/5 shadow-2xl p-2 transform transition-transform duration-700 hover:-translate-y-2 hover:border-blue-500/30">
                        {/* Subtle Inner Glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none" />
                        
                        <img
                          src={step.image}
                          alt={step.title}
                          loading="lazy"
                          className="rounded-[1.5rem] w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;