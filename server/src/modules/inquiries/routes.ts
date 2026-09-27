import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as controller from "./controller.js";

export const inquiryRouter = Router();

export const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "TOO_MANY_INQUIRIES", message: "Please wait before submitting another inquiry." } }
});

inquiryRouter.get("/received", authenticate, asyncHandler(controller.received));

