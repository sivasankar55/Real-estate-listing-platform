import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/app-error.js";
import type { z } from "zod";
import type { createInquirySchema } from "./validation.js";

type CreateInput = z.infer<typeof createInquirySchema>;

export async function create(propertyId: string, userId: string, input: CreateInput) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { ownerId: true }
  });
  if (!property) throw new AppError(404, "PROPERTY_NOT_FOUND", "Property not found.");
  if (property.ownerId === userId) {
    throw new AppError(422, "SELF_INQUIRY", "You cannot inquire about your own property.");
  }

  try {
    return await prisma.inquiry.create({
      data: { propertyId, userId, name: input.name, phone: input.phone, message: input.message },
      include: { property: { select: { id: true, title: true, slug: true } } }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError(409, "DUPLICATE_INQUIRY", "You have already contacted this property's owner.");
    }
    throw error;
  }
}

export function received(ownerId: string) {
  return prisma.inquiry.findMany({
    where: { property: { ownerId } },
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { id: true, title: true, slug: true } },
      user: { select: { id: true, name: true, email: true } }
    }
  });
}

