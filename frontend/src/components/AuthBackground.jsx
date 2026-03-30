import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AuthBackground() {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const crystalsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Ambient floating for crystals
      gsap.to(".crystal", {
        y: "random(-30, 30)",
        x: "random(-30, 30)",
        rotation: "random(-20, 20)",
        duration: "random(5, 10)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.2
      });

      // Pulsing nodes
      gsap.to(".node", {
        opacity: "random(0.2, 1)",
        scale: "random(0.8, 1.5)",
        duration: "random(2, 5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    // Mouse Parallax Tracking
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;

      gsap.to(networkRef.current, { x: x * 40, y: y * 40, duration: 2, ease: "power2.out" });
      gsap.to(crystalsRef.current, { x: x * -50, y: y * -50, duration: 2, ease: "power2.out" });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Generate random fixed coordinates for network nodes
  const nodes = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    cx: `${Math.floor(Math.random() * 100)}%`,
    cy: `${Math.floor(Math.random() * 100)}%`,
  }));

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden bg-[#020617] pointer-events-none">
      
      {/* Base Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 mask-image-gradient" />

      {/* Abstract Crystalline Structures */}
      <div ref={crystalsRef} className="absolute inset-0 flex items-center justify-center">
        {/* Large back glow */}
        <div className="crystal absolute w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-[40%] rotate-45 -translate-x-1/2 -translate-y-1/4" />
        {/* Front cyan glow */}
        <div className="crystal absolute w-[400px] h-[400px] bg-cyan-500/10 blur-[80px] rounded-[30%] -rotate-12 translate-x-1/3 translate-y-1/4" />
        {/* Geometric wireframe crystal */}
        <div className="crystal absolute w-[350px] h-[350px] border border-blue-400/20 rounded-[2rem] rotate-12 blur-[1px] opacity-30 -translate-x-3/4 translate-y-1/3 shadow-[inset_0_0_50px_rgba(59,130,246,0.1)]" />
      </div>

      {/* Neural Network SVG */}
      <div ref={networkRef} className="absolute inset-0 opacity-40 mix-blend-screen">
        <svg className="w-full h-full">
          {nodes.map((n, i) => (
            <g key={n.id}>
              {/* Connect to next node */}
              {i < nodes.length - 1 && (
                <line x1={n.cx} y1={n.cy} x2={nodes[i+1].cx} y2={nodes[i+1].cy} stroke="#3b82f6" strokeWidth="0.5" className="opacity-30" />
              )}
              {/* Connect to a random distant node to create webs */}
              {i > 3 && (
                <line x1={n.cx} y1={n.cy} x2={nodes[i-3].cx} y2={nodes[i-3].cy} stroke="#06b6d4" strokeWidth="0.5" className="opacity-10" />
              )}
              {/* Data points */}
              <circle cx={n.cx} cy={n.cy} r="2" fill="#3b82f6" className="node" />
              <circle cx={n.cx} cy={n.cy} r="6" fill="#06b6d4" className="node opacity-20" />
            </g>
          ))}
        </svg>
      </div>
      
      {/* Dark vignette overlay to keep text readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] opacity-80" />
    </div>
  );
}