import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizePropertyOwner } from "../../middleware/authorize-property-owner.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as controller from "./controller.js";
import { imageUpload } from "./upload.js";
import { inquiryLimiter } from "../inquiries/routes.js";
import { create as createInquiry } from "../inquiries/controller.js";

export const propertyRouter = Router();

propertyRouter.get("/mine", authenticate, asyncHandler(controller.mine));
propertyRouter.get("/", asyncHandler(controller.search));
propertyRouter.post("/", authenticate, asyncHandler(controller.create));
propertyRouter.get("/:id/similar", asyncHandler(controller.similar));
propertyRouter.post("/:id/inquiries", authenticate, inquiryLimiter, asyncHandler(createInquiry));
propertyRouter.post("/:id/images", authenticate, asyncHandler(authorizePropertyOwner), imageUpload.array("images", 5), asyncHandler(controller.uploadImages));
propertyRouter.delete("/:id/images/:imageId", authenticate, asyncHandler(authorizePropertyOwner), asyncHandler(controller.removeImage));
propertyRouter.patch("/:id", authenticate, asyncHandler(authorizePropertyOwner), asyncHandler(controller.update));
propertyRouter.delete("/:id", authenticate, asyncHandler(authorizePropertyOwner), asyncHandler(controller.remove));
propertyRouter.get("/:slug", asyncHandler(controller.getBySlug));
