import { ListingType, PropertyType } from "@prisma/client";
import { z } from "zod";

const propertyFields = {
  title: z.string().trim().min(5).max(160),
  description: z.string().trim().min(20).max(5000),
  propertyType: z.nativeEnum(PropertyType),
  listingType: z.nativeEnum(ListingType),
  price: z.coerce.number().positive().max(999999999999),
  depositAmount: z.coerce.number().nonnegative().max(999999999999).nullable().optional(),
  bedrooms: z.coerce.number().int().min(0).max(50).nullable(),
  bathrooms: z.coerce.number().int().min(0).max(50).nullable(),
  areaSqft: z.coerce.number().int().positive().max(100000000),
  ageYears: z.coerce.number().int().min(0).max(100).nullable().optional(),
  city: z.string().trim().min(2).max(100),
  locality: z.string().trim().min(2).max(150),
  state: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(500)
};

export const createPropertySchema = z.object(propertyFields).superRefine((property, context) => {
  const hasNoRooms = property.propertyType === "PLOT" || property.propertyType === "COMMERCIAL";
  if (hasNoRooms && (property.bedrooms !== null || property.bathrooms !== null)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Plots and commercial properties must not have bedroom or bathroom values.", path: ["bedrooms"] });
  }
  if (!hasNoRooms && (property.bedrooms === null || property.bathrooms === null)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Bedrooms and bathrooms are required for this property type.", path: ["bedrooms"] });
  }
  if (property.propertyType === "PLOT" && property.ageYears !== null && property.ageYears !== undefined) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Plots do not have a property age.", path: ["ageYears"] });
  }
  if (property.listingType === "SALE" && property.depositAmount !== null && property.depositAmount !== undefined) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Deposits only apply to rental listings.", path: ["depositAmount"] });
  }
});

export const updatePropertySchema = z.object(propertyFields).partial();

export const propertyIdSchema = z.object({ id: z.string().cuid() });
export const propertySlugSchema = z.object({ slug: z.string().min(1).max(200) });

