backend/
├── src/
│   ├── config/              # Database & 3rd party service configuration
│   │   ├── db.ts            # MongoDB connection
│   │   ├── stripe.ts        # Stripe API config
│   │   ├── gemini.ts        # Google AI config
│   │   └── redis.ts         # Redis/BullMQ config
│   │
│   ├── controllers/         # Request Handlers (receive req, send res)
│   │   ├── authController.ts
│   │   ├── startupController.ts
│   │   ├── investmentController.ts
│   │   └── webhookController.ts
│   │
│   ├── models/              # Mongoose Schemas (Data Layer)
│   │   ├── User.ts
│   │   ├── Startup.ts
│   │   ├── Wallet.ts
│   │   └── Transaction.ts
│   │
│   ├── routes/              # API Route Definitions
│   │   ├── v1/              # Versioning
│   │   │   ├── auth.routes.ts
│   │   │   ├── startups.routes.ts
│   │   │   └── wallet.routes.ts
│   │   └── index.ts
│   │
│   ├── services/            # BUSINESS LOGIC (The "Brain")
│   │   ├── ai/
│   │   │   ├── analyzer.service.ts  # Gemini prompt logic
│   │   │   └── risk.service.ts
│   │   ├── payment/
│   │   │   ├── ledger.service.ts    # Internal Virtual Wallet logic
│   │   │   └── stripe.service.ts    # External Real money logic
│   │   └── auth.service.ts
│   │
│   ├── jobs/                # Background Workers (Async Tasks)
│   │   ├── queues.ts        # BullMQ Queue definitions
│   │   └── workers/
│   │       └── aiAnalysisWorker.ts # Process AI analysis in background
│   │
│   ├── middlewares/         # Interceptors
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── error.middleware.ts
│   │
│   ├── utils/               # Helpers
│   │   ├── AppError.ts      # Custom Error class
│   │   ├── logger.ts        # Winston/Morgan logger
│   │   └── response.ts      # Standard JSON response formatter
│   │
│   ├── types/               # TypeScript Type Definitions
│   │   └── express.d.ts     # Extending Request type (req.user)
│   │
│   ├── app.ts               # Express App Setup (Middleware, Routes)
│   └── server.ts            # Entry Point (Port listening)
│
├── .env                     # Environment Variables
├── .gitignore
├── package.json
└── tsconfig.json