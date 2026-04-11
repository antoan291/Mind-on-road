import { appConfig } from "../../config/app.config";

const rateLimitModule =
  require("express-rate-limit") as typeof import("express-rate-limit");

const rateLimit = rateLimitModule.rateLimit ?? rateLimitModule.default;

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: appConfig.env === "production" ? 10 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Твърде много опити за вход. Изчакайте малко и опитайте пак.",
  },
});

export const changePasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many password change attempts. Try again later.",
  },
});

export const aiAssistantRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many AI assistant requests. Try again later.",
  },
});

export const ocrRunRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: appConfig.env === "production" ? 30 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Твърде много опити за сканиране. Изчакайте малко и опитайте пак.",
  },
});

export const globalMutationRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS",
  message: {
    error: "Too many requests. Please slow down.",
  },
});
