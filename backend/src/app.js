import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import borrowerRoutes from "./routes/borrowerRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import operationsRoutes from "./routes/operationsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("CredFlow LMS API is running");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

if (process.env.VERCEL !== "1") {
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
}

app.use("/api", async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database middleware error:", error.message);
    res.status(503).json({ message: "Database unavailable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/borrower", borrowerRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/operations", operationsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
