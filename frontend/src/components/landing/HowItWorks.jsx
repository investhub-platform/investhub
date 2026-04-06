import { useState } from "react";

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

// roleData maps a role key to an array of step objects
const roleData = {
  founder: [
    {
      label: "Step 1",
      title: "Build your Pitch",
      desc: "In ~5 minutes, submit your startup idea, upload your pitch deck, and define your required budget. Let our system build a comprehensive profile for investors.",
      image: founderStep1,
    },
    {
      label: "Step 2",
      title: "AI Risk Analysis",
      desc: "Our Gemini-powered AI instantly analyzes your pitch, generating a detailed summary, identifying market potential, and assigning a standardized Risk Score.",
      image: founderStep2,
    },
    {
      label: "Step 3",
      title: "Connect with Mentors",
      desc: "Get matched with elite technical mentors who will review your architecture, validate your code, and verify your milestones to build investor trust.",
      image: founderStep3,
    },
    {
      label: "Final Step",
      title: "Secure Funding",
      desc: "Unlock virtual investments via our secure wallet system. Funds are released transparently as you hit your mentor-approved development milestones.",
      image: founderFinal,
    },
  ],
  investor: [
    {
      label: "Step 1",
      title: "Discover Opportunities",
      desc: "Browse a highly curated list of promising startups spanning multiple tech sectors. Filter by funding stage, category, and AI-predicted success rates.",
      image: investorStep1,
    },
    {
      label: "Step 2",
      title: "Assess AI Analytics",
      desc: "Don't rely on gut feelings. Dive into comprehensive AI-generated risk reports, competitive analyses, and technical red flags before making a move.",
      image: investorStep2,
    },
    {
      label: "Step 3",
      title: "Follow Mentor Insights",
      desc: "Leverage the expertise of veteran CTOs and developers. See which projects have had their technical architecture verified by our mentor network.",
      image: investorStep3,
    },
    {
      label: "Final Step",
      title: "Invest & Track",
      desc: "Fund projects securely via our virtual wallet. Monitor your portfolio's growth in real-time and release funds based on strictly validated milestones.",
      image: investorFinal,
    },
  ],
  mentor: [
    {
      label: "Step 1",
      title: "Build your Profile",
      desc: "Highlight your technical stack, past exits, and industry experience. Let our system verify your credentials to establish your authority on MentorHub.",
      image: mentorStep1,
    },
    {
      label: "Step 2",
      title: "Create Content",
      desc: "Share your expertise on MentorHub by posting lectures, workshops, tutorials, webinars, and more. Help the next generation of founders level up.",
      image: mentorStep2,
    },
    {
      label: "Step 3",
      title: "Engage & Educate",
      desc: "Host live sessions, answer questions, and build a following. Every role on InvestHub can also mentor — founders and investors included.",
      image: mentorStep3,
    },
    {
      label: "Final Step",
      title: "Build Reputation",
      desc: "Earn platform credibility, grow your audience, and get exclusive access to emerging tech communities — all while contributing as a founder or investor too.",
      image: mentorFinal,
    },
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
    <section id="how-it-works" className="relative py-20 px-4 bg-hiw-bg min-h-screen scroll-mt-36 transition-transform duration-500 hover:shadow-2xl hover:scale-[1.003]">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <h2 className="text-center text-4xl md:text-5xl font-bold text-foreground mb-4">
          How it Works
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto">
          A simple, transparent process from start to finish.
        </p>

        {/* Role Switcher */}
        <div className="flex justify-center mb-16">
          <div className="inline-flex rounded-full bg-hiw-toggle-bg p-2 gap-3 shadow-inner">
            {roles.map((role) => (
              <button
                key={role.key}
                onClick={() => setActiveRole(role.key)}
                aria-pressed={activeRole === role.key}
                className={`px-6 py-3 rounded-2xl text-sm font-medium transition-transform duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hiw-toggle-active/30 ${
                  activeRole === role.key
                    ? "bg-hiw-toggle-active text-hiw-text-primary shadow-[0_18px_50px_rgba(2,6,23,0.5)] border border-hiw-toggle-active/30"
                    : "bg-transparent text-hiw-text-secondary border border-hiw-card-border/20 hover:bg-hiw-toggle-active/8 hover:text-hiw-text-primary hover:shadow-md hover:-translate-y-1"
                }`}
                style={{ WebkitBackdropFilter: 'blur(6px)', backdropFilter: 'blur(6px)' }}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Dashed SVG line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px hidden md:block">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 1 100"
            >
              <line
                x1="0.5"
                y1="0"
                x2="0.5"
                y2="100"
                stroke="hsl(var(--hiw-dashed-line))"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
            </svg>
          </div>

          {steps.map((step, index) => {
            const isEven = index % 2 === 1;
            const isLast = index === steps.length - 1;

            return (
              <div key={`${activeRole}-${index}`} className="relative mb-12 last:mb-0">
                {/* Step Badge */}
                <div className="flex justify-center mb-4 relative z-10">
                  <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium border bg-hiw-badge-bg border-hiw-badge-border text-hiw-text-secondary">
                    {step.label}
                  </span>
                </div>

                {/* Card */}
                <div
                  className={`group relative rounded-[2rem] overflow-hidden border border-hiw-card-border/50 backdrop-blur-md transition-all duration-400 hover:shadow-2xl hover:scale-[1.02] hover:border-hiw-toggle-active/40`}
                  style={{
                    background:
                      "linear-gradient(135deg, hsla(220,15%,12%,0.95) 0%, hsla(220,20%,8%,0.98) 100%)",
                  }}
                >
                  {/* Internal glow */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      background: isLast
                        ? "radial-gradient(ellipse at 50% 50%, hsla(220,60%,50%,0.3), transparent 70%)"
                        : isEven
                        ? "radial-gradient(ellipse at 30% 50%, hsla(220,60%,50%,0.15), transparent 70%)"
                        : "radial-gradient(ellipse at 70% 50%, hsla(220,60%,50%,0.15), transparent 70%)",
                    }}
                  />

                  <div
                    className={`relative z-10 flex flex-col md:flex-row items-center gap-6 p-8 md:p-10 ${
                      isEven ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Text */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-2xl md:text-3xl font-bold text-hiw-text-primary">
                        {step.title}
                      </h3>
                      <p className="text-hiw-text-secondary text-sm md:text-base leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    {/* Image */}
                    <div className="flex-1 w-full">
                      <img
                        src={step.image}
                        alt={step.title}
                        loading="lazy"
                        width={640}
                        height={512}
                        className="rounded-xl w-full h-auto object-cover shadow-lg transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
