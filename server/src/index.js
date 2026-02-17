import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import vapiRoutes from "./routes/vapi.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === "production";

// Security: Helmet for security headers
app.use(
  helmet({
    contentSecurityPolicy: isProd,
    crossOriginEmbedderPolicy: false,
  })
);

// Compression for responses
app.use(compression());

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// Logging
app.use(morgan(isProd ? "combined" : "dev"));

// CORS configuration
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
});

app.use("/auth/signin", authLimiter);
app.use("/auth/signup", authLimiter);
app.use(limiter);

// Body parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Trust proxy (Render, Heroku, etc.)
if (isProd) {
  app.set("trust proxy", 1);
}

// Health check
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/auth", authRoutes);
app.use("/interviews", interviewRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/vapi", vapiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Error:", err);

  // Don't leak error details in production
  const message = isProd && !err.isOperational ? "Something went wrong" : err.message;

  res.status(err.status || 500).json({
    success: false,
    message,
    ...((!isProd || err.isOperational) && { stack: err.stack }),
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Closing HTTP server...`);
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Connect to DB and start server
connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port} (${process.env.NODE_ENV || "development"})`);
      console.log(`   Health check: http://localhost:${port}/health`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to MongoDB", error);
    process.exit(1);
  });
