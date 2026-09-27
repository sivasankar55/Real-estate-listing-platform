import { ListingType, Prisma, PropertyType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../utils/app-error.js";
import { decodeCursor, encodeCursor } from "../../utils/cursor.js";

const searchSchema = z.object({
  q: z.string().trim().min(1).max(100).optional(),
  city: z.string().trim().min(1).max(100).optional(),
  type: z.nativeEnum(PropertyType).optional(),
  listingType: z.nativeEnum(ListingType).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().min(0).max(50).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().min(1).max(500).optional()
}).superRefine((query, context) => {
  if (query.minPrice !== undefined && query.maxPrice !== undefined && query.minPrice > query.maxPrice) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Minimum price must be lower than maximum price.", path: ["minPrice"] });
  }
});

type SearchInput = z.infer<typeof searchSchema>;

type PropertyCardRow = {
  id: string;
  slug: string;
  title: string;
  price: string;
  city: string;
  locality: string;
  propertyType: PropertyType;
  listingType: ListingType;
  bedrooms: number | null;
  createdAt: Date;
  primaryImage: string | null;
};

const cardColumns = Prisma.sql`
  p.id, p.slug, p.title, p.price::text AS price, p.city, p.locality,
  p."propertyType", p."listingType", p.bedrooms, p."createdAt",
  image.url AS "primaryImage"
`;

const primaryImageJoin = Prisma.sql`
  LEFT JOIN LATERAL (
    SELECT url FROM "PropertyImage"
    WHERE "propertyId" = p.id
    ORDER BY "isPrimary" DESC, "sortOrder" ASC
    LIMIT 1
  ) image ON TRUE
`;

export function parseSearchQuery(query: unknown) {
  const result = searchSchema.safeParse(query);
  if (!result.success) throw new AppError(422, "VALIDATION_ERROR", "Invalid search filters.", result.error.flatten());
  return result.data;
}

export async function search(input: SearchInput) {
  const conditions: Prisma.Sql[] = [];

  if (input.q) {
    const pattern = `%${input.q.toLowerCase()}%`;
    conditions.push(Prisma.sql`(lower(p.city) LIKE ${pattern} OR lower(p.locality) LIKE ${pattern})`);
  }
  if (input.city) conditions.push(Prisma.sql`lower(p.city) LIKE ${`%${input.city.toLowerCase()}%`}`);
  if (input.type) conditions.push(Prisma.sql`p."propertyType" = ${input.type}::"PropertyType"`);
  if (input.listingType) conditions.push(Prisma.sql`p."listingType" = ${input.listingType}::"ListingType"`);
  if (input.minPrice !== undefined) conditions.push(Prisma.sql`p.price >= ${input.minPrice}`);
  if (input.maxPrice !== undefined) conditions.push(Prisma.sql`p.price <= ${input.maxPrice}`);
  if (input.bedrooms !== undefined) conditions.push(Prisma.sql`p.bedrooms >= ${input.bedrooms}`);

  const cursor = input.cursor ? decodeCursor(input.cursor) : undefined;
  if (cursor && cursor.sort !== input.sort) {
    throw new AppError(422, "CURSOR_SORT_MISMATCH", "This pagination cursor belongs to a different sort order.");
  }
  const ordering = orderFor(input.sort);
  if (cursor) conditions.push(cursorCondition(input.sort, cursor));

  const where = conditions.length ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty;
  const rows = await prisma.$queryRaw<PropertyCardRow[]>(Prisma.sql`
    SELECT ${cardColumns}
    FROM "Property" p
    ${primaryImageJoin}
    ${where}
    ORDER BY ${ordering}
    LIMIT ${input.limit + 1}
  `);

  const hasMore = rows.length > input.limit;
  const data = hasMore ? rows.slice(0, input.limit) : rows;
  const last = data.at(-1);

  return {
    data,
    hasMore,
    nextCursor: hasMore && last ? encodeCursor({ sort: input.sort, value: cursorValue(input.sort, last), id: last.id }) : null
  };
}

export async function similar(propertyId: string) {
  const source = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, city: true, propertyType: true, listingType: true, bedrooms: true, price: true }
  });
  if (!source) throw new AppError(404, "PROPERTY_NOT_FOUND", "Property not found.");

  const bedroomCondition = source.bedrooms === null
    ? Prisma.sql`p.bedrooms IS NULL`
    : Prisma.sql`p.bedrooms BETWEEN ${source.bedrooms - 1} AND ${source.bedrooms + 1}`;
  const minimumPrice = source.price.mul(0.8);
  const maximumPrice = source.price.mul(1.2);

  return prisma.$queryRaw<PropertyCardRow[]>(Prisma.sql`
    SELECT ${cardColumns}
    FROM "Property" p
    ${primaryImageJoin}
    WHERE p.id <> ${source.id}
      AND p.city = ${source.city}
      AND p."propertyType" = ${source.propertyType}::"PropertyType"
      AND p."listingType" = ${source.listingType}::"ListingType"
      AND ${bedroomCondition}
      AND p.price BETWEEN ${minimumPrice} AND ${maximumPrice}
    ORDER BY abs(p.price - ${source.price}) ASC, p."createdAt" DESC
    LIMIT 6
  `);
}

function orderFor(sort: SearchInput["sort"]) {
  if (sort === "price_asc") return Prisma.sql`p.price ASC, p.id ASC`;
  if (sort === "price_desc") return Prisma.sql`p.price DESC, p.id DESC`;
  return Prisma.sql`p."createdAt" DESC, p.id DESC`;
}

function cursorCondition(sort: SearchInput["sort"], cursor: { value: string; id: string }) {
  if (sort === "price_asc") return Prisma.sql`(p.price, p.id) > (${cursor.value}, ${cursor.id})`;
  if (sort === "price_desc") return Prisma.sql`(p.price, p.id) < (${cursor.value}, ${cursor.id})`;

  const createdAt = new Date(cursor.value);
  if (Number.isNaN(createdAt.valueOf())) throw new AppError(422, "INVALID_CURSOR", "The pagination cursor is invalid.");
  return Prisma.sql`(p."createdAt", p.id) < (${createdAt}, ${cursor.id})`;
}

function cursorValue(sort: SearchInput["sort"], row: PropertyCardRow) {
  return sort === "newest" ? row.createdAt.toISOString() : row.price;
}
