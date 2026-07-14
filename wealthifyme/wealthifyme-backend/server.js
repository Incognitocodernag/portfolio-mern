// server.js — WealthifyMe main server entry point
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

dotenv.config();
connectDB();

const app = express();

// ── Security Middleware ──────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(cors());

// ── HTTP Request Logging ──────────────────────────────────────
app.use(morgan("combined", { stream: logger.stream }));

// ── Body Parser (with raw buffer verify for Stripe signature) ──
app.use(express.json({
  verify: (req, res, buf) => {
    if (req.originalUrl.includes("/payments/webhook")) {
      req.rawBody = buf;
    }
  }
}));

// ── API Routes (Version 1) ────────────────────────────────────
const { authLimiter, apiLimiter } = require("./middleware/rateLimiter");

app.use("/api/v1/auth", authLimiter, require("./routes/auth"));
app.use("/api/v1/transactions", apiLimiter, require("./routes/transactions"));
app.use("/api/v1/household", apiLimiter, require("./routes/household"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/support", apiLimiter, require("./routes/support"));
app.use("/api/v1/ai", apiLimiter, require("./routes/ai"));


// ── Fallback sitemap routing ──────────────────────────────────
app.get("/sitemap.xml", (req, res) => {
  res.header("Content-Type", "application/xml");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://wealthifyme.com/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://wealthifyme.com/login</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://wealthifyme.com/register</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://wealthifyme.com/privacy</loc>
    <lastmod>2026-06-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://wealthifyme.com/terms</loc>
    <lastmod>2026-06-18</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
  res.send(sitemap);
});

app.get("/", (req, res) => {
  res.json({ message: "💰 WealthifyMe API is running!" });
});

// Global error handler (production sanitization)
app.use((err, req, res, next) => {
  logger.error("Global Error Handler Catch: %o", err);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === "production" ? "An internal server error occurred" : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 WealthifyMe server running on http://localhost:${PORT}`);
});