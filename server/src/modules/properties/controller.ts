import type { RequestHandler } from "express";
import { AppError } from "../../utils/app-error.js";
import * as propertyService from "./service.js";
import * as searchService from "./search.js";
import * as imageService from "./images.js";
import { createPropertySchema, propertySlugSchema, updatePropertySchema } from "./validation.js";

function parseOrThrow<T>(result: { success: boolean; data?: T; error?: { flatten(): unknown } }): T {
  if (!result.success) throw new AppError(422, "VALIDATION_ERROR", "Please correct the highlighted fields.", result.error?.flatten());
  return result.data as T;
}

export const create: RequestHandler = async (request, response) => {
  if (!request.user) throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  const input = parseOrThrow(createPropertySchema.safeParse(request.body));
  response.status(201).json(await propertyService.create(request.user.id, input));
};

export const getBySlug: RequestHandler = async (request, response) => {
  const { slug } = parseOrThrow(propertySlugSchema.safeParse(request.params));
  response.json(await propertyService.getBySlug(slug));
};

export const mine: RequestHandler = async (request, response) => {
  if (!request.user) throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  response.json(await propertyService.mine(request.user.id));
};

export const update: RequestHandler = async (request, response) => {
  if (!request.property) throw new AppError(404, "PROPERTY_NOT_FOUND", "Property not found.");
  const input = parseOrThrow(updatePropertySchema.safeParse(request.body));
  response.json(await propertyService.update(request.property.id, input));
};

export const remove: RequestHandler = async (request, response) => {
  if (!request.property) throw new AppError(404, "PROPERTY_NOT_FOUND", "Property not found.");
  await propertyService.remove(request.property.id);
  response.status(204).send();
};

export const search: RequestHandler = async (request, response) => {
  response.json(await searchService.search(searchService.parseSearchQuery(request.query)));
};

export const similar: RequestHandler = async (request, response) => {
  const id = request.params.id;
  if (typeof id !== "string") throw new AppError(422, "VALIDATION_ERROR", "Invalid property ID.");
  response.json(await searchService.similar(id));
};

export const uploadImages: RequestHandler = async (request, response) => {
  if (!request.property) throw new AppError(404, "PROPERTY_NOT_FOUND", "Property not found.");
  const files = Array.isArray(request.files) ? request.files : [];
  response.status(201).json(await imageService.upload(request.property.id, files));
};

export const removeImage: RequestHandler = async (request, response) => {
  if (!request.property) throw new AppError(404, "PROPERTY_NOT_FOUND", "Property not found.");
  const imageId = request.params.imageId;
  if (typeof imageId !== "string") throw new AppError(422, "VALIDATION_ERROR", "Invalid image ID.");
  await imageService.remove(request.property.id, imageId);
  response.status(204).send();
};
