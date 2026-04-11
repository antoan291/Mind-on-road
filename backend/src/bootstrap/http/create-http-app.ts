import express = require("express");
import { mkdir } from "node:fs/promises";
import { appConfig } from "../../config/app.config";
import { globalMutationRateLimiter } from "./rate-limiters";
import { aiRouter } from "./routers/ai.router";
import { auditLogsRouter } from "./routers/audit-logs.router";
import { authRouter } from "./routers/auth.router";
import { determinatorRouter } from "./routers/determinator.router";
import { documentsRouter, localDocumentUploadRoot } from "./routers/documents.router";
import { examApplicationsRouter } from "./routers/exam-applications.router";
import { expensesRouter } from "./routers/expenses.router";
import { invoicesRouter } from "./routers/invoices.router";
import { notificationsRouter } from "./routers/notifications.router";
import { paymentsRouter } from "./routers/payments.router";
import { personnelRouter } from "./routers/personnel.router";
import { practicalLessonsRouter } from "./routers/practical-lessons.router";
import { reportsRouter } from "./routers/reports.router";
import { settingsRouter } from "./routers/settings.router";
import { studentsRouter } from "./routers/students.router";
import { theoryRouter } from "./routers/theory.router";
import { vehiclesRouter } from "./routers/vehicles.router";

const helmetModule = require("helmet") as typeof import("helmet");
const helmet = helmetModule.default;

export function createHttpApp() {
  const app = express();
  void mkdir(localDocumentUploadRoot, { recursive: true });

  if (appConfig.env === "production" || appConfig.env === "staging") {
    app.set("trust proxy", 1);
  }
  app.disable("x-powered-by");
  app.use(globalMutationRateLimiter);

  app.use((req, res, next) => {
    if (
      req.path.startsWith("/auth/") ||
      req.path.startsWith("/reports/") ||
      req.path.startsWith("/ai/")
    ) {
      res.set("Cache-Control", "no-store");
      res.set("Pragma", "no-cache");
    }
    next();
  });

  const allowedCorsOrigins = new Set([
    appConfig.webAppUrl,
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);

  const corsModule = require("cors") as typeof import("cors");
  app.use(
    corsModule({
      origin(origin, callback) {
        if (!origin || allowedCorsOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
      },
      credentials: true,
    }),
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "same-site" },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),
  );

  app.use(express.json({ limit: "16kb" }));
  app.use(express.urlencoded({ extended: false, limit: "16kb" }));
  app.use("/uploads", express.static(localDocumentUploadRoot));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use(authRouter);
  app.use(settingsRouter);
  app.use(auditLogsRouter);
  app.use(personnelRouter);
  app.use(studentsRouter);
  app.use(determinatorRouter);
  app.use(paymentsRouter);
  app.use(expensesRouter);
  app.use(theoryRouter);
  app.use(practicalLessonsRouter);
  app.use(notificationsRouter);
  app.use(documentsRouter);
  app.use(examApplicationsRouter);
  app.use(invoicesRouter);
  app.use(vehiclesRouter);
  app.use(aiRouter);
  app.use(reportsRouter);

  return app;
}
