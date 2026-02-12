## Frontend Architecure

investhub-web/
├── public/                 # Static assets (favicon, robots.txt, manifests)
├── src/
│   ├── assets/             # Global assets (images, fonts, global css)
│   ├── components/         # Shared UI components (Buttons, Inputs, Cards)
│   │   ├── ui/             # presentation components (Button.jsx)
│   │   └── layout/         # Layout wrappers (Navbar, Sidebar, Footer)
│   ├── config/             # Environment variables & constants (firebase.js, env.js)
│   ├── features/           # BUSINESS LOGIC (The most important folder)
│   │   ├── auth/           # specific to Authentication
│   │   ├── investments/    # specific to Investments
│   │   └── startups/       # specific to Startups
│   ├── hooks/              # Global custom hooks (useTheme, useWindowSize)
│   ├── lib/                # 3rd party library configurations (axios, stripe, gemini)
│   ├── pages/              # Page components (routed views)
│   ├── routes/             # Routing configuration (AppRoutes.jsx)
│   ├── stores/             # Global state management (Zustand/Redux slices)
│   ├── types/              # Optional types folder (for documentation / editors)
│   ├── utils/              # Pure helper functions (formatDate, calculateRisk)
│   ├── App.jsx             # Main App component
│   └── main.jsx            # Entry point
├── .env                    # Environment variables
├── index.html              # Entry HTML
├── tailwind.config.js      # Tailwind configuration
└── vite.config.js          # Vite configuration

## 2. Detailed Breakdown
### A. src/features/ (The Scalability Secret)
Instead of scattering code, group everything related to a specific domain here. This makes it easy to delete or refactor features later.

Example: src/features/investments/

components/ (InvestmentCard.tsx - only used here)

hooks/ (useInvestmentData.ts)

services/ (investmentApi.ts)

types/ (Investment.ts)

### B. src/components/ui/ (Atomic Design)
These are your building blocks. They should have NO logic involving data fetching. They just take props and render UI.

Button.tsx

Input.tsx

Modal.tsx

Card.tsx

### C. src/lib/ (Third-Party Wrappers)
Don't import libraries directly into components. Wrap them here so you can switch them out easily later.

axios.ts (Configured with base URL and interceptors)

stripe.ts (Stripe initialization)

gemini.ts (AI client setup)

utils.ts (Tailwind merge helper for cn())

### D. src/layouts/
Wrappers that define the shell of your page.

RootLayout.tsx (Contains Navbar + Footer)

DashboardLayout.tsx (Contains Sidebar + Header + Auth Check)

AuthLayout.tsx (Centered box for Login/Signup)