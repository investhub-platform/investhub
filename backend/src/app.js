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
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api", router);

app.get("/", (_req, res) => res.json({ status: "ok" }));

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
