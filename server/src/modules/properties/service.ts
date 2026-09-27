import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { createSlug } from "../../utils/slugify.js";
import { removeAll } from "./images.js";
import type { z } from "zod";
import type { createPropertySchema, updatePropertySchema } from "./validation.js";

type CreateInput = z.infer<typeof createPropertySchema>;
type UpdateInput = z.infer<typeof updatePropertySchema>;

const detailInclude = {
  owner: { select: { id: true, name: true, phone: true, email: true } },
  images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] }
} satisfies Prisma.PropertyInclude;

export async function create(ownerId: string, input: CreateInput) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.property.create({
        data: { ...input, ownerId, slug: createSlug(input.title) },
        include: detailInclude
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002" || attempt === 2) throw error;
    }
  }

  throw new AppError(500, "SLUG_GENERATION_FAILED", "Could not create a unique property URL.");
}

export async function getBySlug(slug: string) {
  const property = await prisma.property.findUnique({ where: { slug }, include: detailInclude });
  if (!property) throw new AppError(404, "PROPERTY_NOT_FOUND", "Property not found.");
  return property;
}

export async function mine(ownerId: string) {
  return prisma.property.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    include: { images: { where: { isPrimary: true }, select: { url: true }, take: 1 } }
  });
}

export async function update(id: string, input: UpdateInput) {
  const property = await prisma.property.findUnique({
    where: { id },
    select: { propertyType: true, bedrooms: true, bathrooms: true, ageYears: true, listingType: true, depositAmount: true }
  });
  if (!property) throw new AppError(404, "PROPERTY_NOT_FOUND", "Property not found.");

  const propertyType = input.propertyType ?? property.propertyType;
  const bedrooms = input.bedrooms === undefined ? property.bedrooms : input.bedrooms;
  const bathrooms = input.bathrooms === undefined ? property.bathrooms : input.bathrooms;
  const ageYears = input.ageYears === undefined ? property.ageYears : input.ageYears;
  const listingType = input.listingType ?? property.listingType;
  const depositAmount = input.depositAmount === undefined ? property.depositAmount : input.depositAmount;
  const hasNoRooms = propertyType === "PLOT" || propertyType === "COMMERCIAL";

  if (hasNoRooms && (bedrooms !== null || bathrooms !== null)) {
    throw new AppError(422, "VALIDATION_ERROR", "Plots and commercial properties must not have room counts.");
  }
  if (!hasNoRooms && (bedrooms === null || bathrooms === null)) {
    throw new AppError(422, "VALIDATION_ERROR", "Bedrooms and bathrooms are required for this property type.");
  }
  if (propertyType === "PLOT" && ageYears !== null) {
    throw new AppError(422, "VALIDATION_ERROR", "Plots do not have a property age.");
  }
  if (listingType === "SALE" && depositAmount !== null) {
    throw new AppError(422, "VALIDATION_ERROR", "Deposits only apply to rental listings.");
  }

  return prisma.property.update({ where: { id }, data: input, include: detailInclude });
}

export async function remove(id: string) {
  await removeAll(id);
  await prisma.property.delete({ where: { id } });
}
