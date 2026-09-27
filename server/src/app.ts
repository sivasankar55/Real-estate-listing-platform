import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { openApiSpec } from "./config/swagger.js";
import { prisma } from "./db/prisma.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { authRouter } from "./modules/auth/routes.js";
import { propertyRouter } from "./modules/properties/routes.js";
import { inquiryRouter } from "./modules/inquiries/routes.js";
import { AppError } from "./utils/app-error.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/health", async (_request, response, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ status: "ok" });
  } catch {
    next(new AppError(503, "DATABASE_UNAVAILABLE", "The database is not ready."));
  }
});

app.get("/api-docs.json", (_request, response) => response.json(openApiSpec));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec, { customSiteTitle: "Real Estate Listing API" }));

app.use("/api/auth", authRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/inquiries", inquiryRouter);
app.use(notFound);
app.use(errorHandler);
