backend/
├── src/
│   ├── config/              # Database & 3rd party service configuration
│   │   ├── db.js            # MongoDB connection
│   │   ├── stripe.js        # Stripe API config
│   │   ├── gemini.js        # Google AI config
│   │   └── redis.js         # Redis/BullMQ config
│   │
│   ├── controllers/         # Request Handlers (receive req, send res)
│   │   ├── authController.js
│   │   ├── startupController.js
│   │   ├── investmentController.js
│   │   └── webhookController.js
│   │
│   ├── models/              # Mongoose Schemas (Data Layer)
│   │   ├── User.js
│   │   ├── Startup.js
│   │   ├── Wallet.js
│   │   └── Transaction.js
│   │
│   ├── routes/              # API Route Definitions
│   │   ├── v1/              # Versioning
│   │   │   ├── auth.routes.js
│   │   │   ├── startups.routes.js
│   │   │   └── wallet.routes.js
│   │   └── index.js
│   │
│   ├── services/            # BUSINESS LOGIC (The "Brain")
│   │   ├── ai/
│   │   │   ├── analyzer.service.js  # Gemini prompt logic
│   │   │   └── risk.service.js
│   │   ├── payment/
│   │   │   ├── ledger.service.js    # Internal Virtual Wallet logic
│   │   │   └── stripe.service.js    # External Real money logic
│   │   └── auth.service.js
│   │
│   ├── jobs/                # Background Workers (Async Tasks)
│   │   ├── queues.js        # BullMQ Queue definitions
│   │   └── workers/
│   │       └── aiAnalysisWorker.js # Process AI analysis in background
│   │
│   ├── middlewares/         # Interceptors
│   │   ├── auth.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── utils/               # Helpers
│   │   ├── AppError.js      # Custom Error class
│   │   ├── logger.js        # Winston/Morgan logger
│   │   └── response.js      # Standard JSON response formatter
│   │
│   ├── types/               # Optional folder for any runtime/shared typedefs
│   │   └── express.d.ts     # (If present) Type declarations are not required for runtime
│   │
│   ├── app.js               # Express App Setup (Middleware, Routes)
│   └── server.js            # Entry Point (Port listening)
│
├── .env                     # Environment Variables
├── .gitignore
├── package.json