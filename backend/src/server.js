// src/server.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import swaggerUi from "swagger-ui-express";

// Load backend .env reliably relative to this file, regardless of cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("ADMIN_USER_ID:", process.env.ADMIN_USER_ID);


import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;
const openApiPath = path.resolve(__dirname, "../doc/openapi.yaml");

app.get("/api/docs/openapi.yaml", (_req, res) => {
  res.type("text/yaml").send(fs.readFileSync(openApiPath, "utf8"));
});

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(null, {
    swaggerOptions: {
      url: "/api/docs/openapi.yaml",
    },
  })
);

async function start() {
  try {
    await connectDB();
    const server = http.createServer(app);
    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
