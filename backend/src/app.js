import express from "express";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes/index.js";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import fs from 'fs';

// Load backend .env relative to this file to ensure env vars are available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();

app.use(express.json());
// PayHere server callbacks are sent as application/x-www-form-urlencoded.
app.use(express.urlencoded({ extended: false }));
const normalizeOrigin = (value) => value?.trim().replace(/\/$/, "");
const envOrigins = [
  ...(process.env.FRONTEND_URLS?.split(",") ?? []),
  process.env.FRONTEND_URL,
];
const allowedOrigins = [
  ...new Set(
    [...envOrigins, "http://localhost:5174", "http://localhost:5173"]
      .filter(Boolean)
      .map(normalizeOrigin)
  ),
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (e.g., server-to-server calls)
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) {
      // Reflect explicit origin to keep credentials compatible.
      return callback(null, origin);
    }

    return callback(new Error("CORS policy: origin not allowed"));
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
// Serve uploaded files from the repository's backend/uploads directory.
// Use __dirname so this works regardless of the process cwd in deployment.
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
// Ensure uploads directory exists so static middleware has a path to serve.
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.info('[Server] Created uploads directory at', uploadsDir);
  } catch (err) {
    console.warn('[Server] Could not create uploads directory', err);
  }
}
app.use('/uploads', express.static(uploadsDir));

app.use("/api", router);

app.get("/", (_req, res) => res.json({ status: "ok" }));

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
