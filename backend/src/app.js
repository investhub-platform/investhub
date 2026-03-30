import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import router from "./routes/index.js";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

dotenv.config();

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
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/api", router);

app.get("/", (_req, res) => res.json({ status: "ok" }));

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
