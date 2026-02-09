import React from 'react'

const companies = [
  { name: 'Foundry' },
  { name: 'LaunchPad' },
  { name: 'Vertex' },
  { name: 'Orbit' },
  { name: 'Pioneer' },
  { name: 'Summit' },
  { name: 'Catalyst' },
  { name: 'Nexus' },
]

export default function SocialProof() {
  // duplicate list so the marquee can loop seamlessly
  const items = [...companies, ...companies]

  return (
    <section className="w-full py-8">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-center text-sm text-slate-400 mb-4">Trusted by next‑gen founders from:</h3>

        <div className="relative overflow-hidden">
          <div
            className="marquee flex gap-8 w-[200%] items-center"
            style={{ animation: 'marquee 28s linear infinite' }}
            aria-hidden={false}
          >
            {items.map((c, i) => (
              <div key={`${c.name}-${i}`} className="flex-shrink-0 w-40 h-12 flex items-center justify-center bg-transparent rounded-md">
                <div className="w-full h-full flex items-center justify-center text-slate-400 opacity-60 hover:opacity-100 hover:text-white transition duration-250 transform hover:-translate-y-0.5">
                  {/* Simple text-logo placeholder to avoid external assets */}
                  <span className="font-semibold tracking-wide">{c.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* pointer overlay to pause on hover via CSS only */}
          <style>{`
            .marquee:hover { animation-play-state: paused; }
          `}</style>
        </div>
      </div>
    </section>
  )
}
