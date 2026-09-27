import type { RequestHandler } from "express";
import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/app-error.js";

declare global {
  namespace Express {
    interface Request {
      property?: { id: string; ownerId: string };
    }
  }
}

export const authorizePropertyOwner: RequestHandler = async (request, _response, next) => {
  if (!request.user) return next(new AppError(401, "UNAUTHORIZED", "Authentication is required."));
  const propertyId = request.params.id;
  if (typeof propertyId !== "string") return next(new AppError(422, "VALIDATION_ERROR", "Invalid property ID."));

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, ownerId: true }
  });

  if (!property) return next(new AppError(404, "PROPERTY_NOT_FOUND", "Property not found."));
  if (property.ownerId !== request.user.id) {
    return next(new AppError(403, "FORBIDDEN", "You do not own this property."));
  }

  request.property = property;
  next();
};
