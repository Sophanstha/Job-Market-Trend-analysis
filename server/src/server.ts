import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import cors from "cors";
import rateLimit from "express-rate-limit";

import connectDb from "./confog/db.ts";
import JobData from "./models/JobData.model.ts";
import { jsonData } from "./data/jsonJob.ts";

import authRouter from "./router/authRouter.ts";
import searchRouter from "./router/searchRoute.ts";
import HistoryRouter from "./router/history.ts";
import analysisRouter from "./router/analysis.ts";
import resumeRouter from "./router/resumeRouter.ts";
import Adminrouter from "./router/admin.ts";
import interviewrouter from "./router/interview.ts";
import roadmapRouter from "./router/roadmap.ts";

dotenv.config();

const app = express();

// Trust reverse proxy (Render, Railway, Nginx, Cloudflare, AWS ALB)
app.set("trust proxy", 1);

// Global Rate Limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600, // 600 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
app.use(rateLimiter);

// Flexible Production CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

if (process.env.CLIENT_URL) {
  const envUrls = process.env.CLIENT_URL.split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean);
  allowedOrigins.push(...envUrls);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, mobile, postman)
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/$/, "");
      if (
        allowedOrigins.includes(normalized) ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Body Parsing & Utilities Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "job-market-trend-session-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Health Check & Welcome Routes
app.get("/", (_req, res) => {
  res.json({
    status: "healthy",
    message: "Job Market Trend System API is online",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
});

// Mount Feature Routers
app.use("/api/auth", authRouter);
app.use("/api/search", searchRouter);
app.use("/api/history", HistoryRouter);
app.use("/api/analysis", analysisRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/admin", Adminrouter);
app.use("/api/interview", interviewrouter);
app.use("/api/roadmap", roadmapRouter);

// Global 404 Route Handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found.`,
  });
});

// Global Error Handler Middleware
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[ServerError]:", err);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "An unexpected internal server error occurred.",
    });
  }
);

// Connect Database, Auto-Seed if empty, and start HTTP listener
const PORT = Number(process.env.PORT) || 5000;

connectDb()
  .then(async () => {
    try {
      const jobCount = await JobData.countDocuments();
      if (jobCount === 0) {
        console.log("Empty database detected. Auto-seeding initial job market data...");
        await JobData.insertMany(jsonData);
        console.log(`Successfully auto-seeded ${jsonData.length} job categories.`);
      }
    } catch (seedErr) {
      console.warn("Auto-seed verification error:", (seedErr as Error).message);
    }

    app.listen(PORT, () => {
      console.log(`Server successfully started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Critical: Could not connect to database:", (error as Error).message);
    process.exit(1);
  });
