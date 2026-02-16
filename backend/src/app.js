import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes/index.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api", router);

app.get("/", (_req, res) => res.json({ status: "ok" }));

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
