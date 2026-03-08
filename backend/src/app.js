import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes/index.js";
import errorHandler from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(express.json());
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5174", "http://localhost:5173"].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin like mobile apps or curl
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS policy: origin not allowed"));
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api", router);

app.get("/", (_req, res) => res.json({ status: "ok" }));

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
