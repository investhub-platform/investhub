export const startups = [
  {
    id: "1",
    name: "AgriPulse AI",
    tagline: "Precision agriculture insights for small farms",
    industry: "AgriTech",
    tags: ["AI", "SaaS", "Impact"],
    stage: "Pre-Seed",
    logo: "AP",
    fundingGoal: 250000,
    currentFunding: 102000,
    aiRiskLevel: "LOW",
    aiRiskScore: 18,
    founders: [
      { name: "Nilan Perera", avatar: "NP" },
      { name: "Maya Silva", avatar: "MS" },
    ],
    mentorName: "Dr. Kavinda Fernando",
    techStack: ["React", "Node.js", "PostgreSQL", "TensorFlow"],
    milestonesCompleted: 3,
    milestonesTotal: 5,
    pitchSummary:
      "AgriPulse AI helps farmers forecast crop disease, optimize irrigation, and improve yield using satellite and weather data.",
    aiInsights: {
      summary: [
        "Strong TAM in climate-sensitive agriculture markets.",
        "Founding team shows complementary domain and technical skills.",
        "Revenue model is clear with recurring subscription potential.",
      ],
      marketSentiment:
        "Positive momentum in precision agriculture with increasing demand for affordable data-driven tools.",
    },
    milestones: [
      { title: "MVP completed", date: "2025-08", completed: true },
      { title: "Pilot with 20 farms", date: "2025-11", completed: true },
      { title: "First paid contracts", date: "2026-01", completed: true },
      { title: "Regional expansion", date: "2026-05", completed: false },
      { title: "Series A readiness", date: "2026-10", completed: false },
    ],
    team: [
      { name: "Nilan Perera", role: "CEO", avatar: "NP" },
      { name: "Maya Silva", role: "CTO", avatar: "MS" },
      { name: "Rashmi Dissanayake", role: "Head of Product", avatar: "RD" },
    ],
  },
  {
    id: "2",
    name: "MediLoop",
    tagline: "Clinical workflow automation for private hospitals",
    industry: "HealthTech",
    tags: ["Workflow", "B2B", "Healthcare"],
    stage: "Seed",
    logo: "ML",
    fundingGoal: 600000,
    currentFunding: 320000,
    aiRiskLevel: "MEDIUM",
    aiRiskScore: 34,
    founders: [
      { name: "Jade Fernando", avatar: "JF" },
      { name: "Ishan De Mel", avatar: "ID" },
    ],
    mentorName: "Prof. Ayesha Raman",
    techStack: ["Next.js", "Go", "MongoDB"],
    milestonesCompleted: 4,
    milestonesTotal: 6,
    pitchSummary:
      "MediLoop streamlines admissions, diagnostics routing, and discharge coordination to reduce patient wait times.",
    aiInsights: {
      summary: [
        "Clear operational pain point with measurable ROI.",
        "Regulatory compliance plan is partially defined.",
        "Competitive landscape is crowded but fragmented.",
      ],
      marketSentiment:
        "Steady demand from mid-sized hospitals prioritizing digitization and operational efficiency.",
    },
    milestones: [
      { title: "Prototype launched", date: "2025-03", completed: true },
      { title: "3 hospital pilots", date: "2025-07", completed: true },
      { title: "HIPAA-aligned controls", date: "2025-10", completed: true },
      { title: "Multi-tenant architecture", date: "2026-02", completed: true },
      { title: "Regional sales hiring", date: "2026-06", completed: false },
      { title: "ARR $1M target", date: "2026-12", completed: false },
    ],
    team: [
      { name: "Jade Fernando", role: "CEO", avatar: "JF" },
      { name: "Ishan De Mel", role: "COO", avatar: "ID" },
      { name: "Sachi Peris", role: "Engineering Lead", avatar: "SP" },
    ],
  },
  {
    id: "3",
    name: "LedgerNest",
    tagline: "SMB cashflow forecasting and spend controls",
    industry: "FinTech",
    tags: ["Finance", "SMB", "Analytics"],
    stage: "Pre-Seed",
    logo: "LN",
    fundingGoal: 300000,
    currentFunding: 88000,
    aiRiskLevel: "LOW",
    aiRiskScore: 22,
    founders: [
      { name: "Ruwan Jayasuriya", avatar: "RJ" },
      { name: "Elina Gomez", avatar: "EG" },
    ],
    mentorName: "Mr. Sanjeewa Wickram",
    techStack: ["React", "Python", "PostgreSQL"],
    milestonesCompleted: 2,
    milestonesTotal: 5,
    pitchSummary:
      "LedgerNest gives small businesses a clear view of runway and expense anomalies through AI-powered forecasts.",
    aiInsights: {
      summary: [
        "Strong retention potential due to financial workflow stickiness.",
        "Pricing appears viable for SMB segment.",
        "Customer acquisition channels need broader validation.",
      ],
      marketSentiment:
        "Growing demand for low-cost, AI-assisted financial planning tools in SMB segment.",
    },
    milestones: [
      { title: "Beta released", date: "2025-09", completed: true },
      { title: "100 active SMB users", date: "2025-12", completed: true },
      { title: "Bank feed integrations", date: "2026-03", completed: false },
      { title: "Automated alerts", date: "2026-04", completed: false },
      { title: "Channel partnerships", date: "2026-08", completed: false },
    ],
    team: [
      { name: "Ruwan Jayasuriya", role: "CEO", avatar: "RJ" },
      { name: "Elina Gomez", role: "CPO", avatar: "EG" },
    ],
  },
];

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}
