import type { RequestHandler } from "express";
import { AppError } from "../../utils/app-error.js";
import { createInquirySchema } from "./validation.js";
import * as inquiryService from "./service.js";

export const create: RequestHandler = async (request, response) => {
  if (!request.user) throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  const propertyId = request.params.id;
  if (typeof propertyId !== "string") throw new AppError(422, "VALIDATION_ERROR", "Invalid property ID.");

  const input = createInquirySchema.safeParse(request.body);
  if (!input.success) {
    throw new AppError(422, "VALIDATION_ERROR", "Please correct the highlighted fields.", input.error.flatten());
  }

  if (input.data.website) return response.status(204).send();
  response.status(201).json(await inquiryService.create(propertyId, request.user.id, input.data));
};

export const received: RequestHandler = async (request, response) => {
  if (!request.user) throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  response.json(await inquiryService.received(request.user.id));
};

