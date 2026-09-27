import "dotenv/config";
import { ListingType, Prisma, PrismaClient, PropertyType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const targetCount = Number(process.env.SEED_PROPERTY_COUNT ?? 1000);
const batchSize = 200;

const owners = [
  ["Arjun Mehta", "arjun.mehta@example.test", "+91 98765 12001"],
  ["Priya Nair", "priya.nair@example.test", "+91 98765 12002"],
  ["Rohan Kapoor", "rohan.kapoor@example.test", "+91 98765 12003"],
  ["Ananya Iyer", "ananya.iyer@example.test", "+91 98765 12004"],
  ["Vikram Shah", "vikram.shah@example.test", "+91 98765 12005"],
  ["Sneha Rao", "sneha.rao@example.test", "+91 98765 12006"],
  ["Karthik Reddy", "karthik.reddy@example.test", "+91 98765 12007"],
  ["Neha Malhotra", "neha.malhotra@example.test", "+91 98765 12008"]
] as const;

const imageSets: Record<PropertyType, string[]> = {
  APARTMENT: ["photo-1545324418-cc1a3fa10c00", "photo-1505693416388-ac5ce068fe85", "photo-1522708323590-d24dbb6b0267"],
  HOUSE: ["photo-1564013799919-ab600027ffc6", "photo-1570129477492-45c003edd2be", "photo-1600585154340-be6161a56a0c"],
  VILLA: ["photo-1613490493576-7fde63acd811", "photo-1600607687939-ce8a6c25118c", "photo-1613977257363-707ba9348227"],
  PLOT: ["photo-1500382017468-9049fed747ef", "photo-1500534623283-312aade485b7", "photo-1448630360428-65456885c650"],
  COMMERCIAL: ["photo-1497366754035-f200968a6e72", "photo-1497366811353-6870744d04b2", "photo-1497366216548-37526070297c"],
  PG: ["photo-1522771739844-6a9f6d5f14af", "photo-1560185008-b033106af5c3", "photo-1554995207-c18c203602cb"]
};

const locations = [
  { city: "Bengaluru", state: "Karnataka", localities: ["Indiranagar", "Whitefield", "Koramangala", "HSR Layout"] },
  { city: "Mumbai", state: "Maharashtra", localities: ["Bandra", "Andheri", "Powai", "Worli"] },
  { city: "Delhi", state: "Delhi", localities: ["Saket", "Dwarka", "Rohini", "Vasant Kunj"] },
  { city: "Hyderabad", state: "Telangana", localities: ["Jubilee Hills", "Gachibowli", "Madhapur", "Kondapur"] },
  { city: "Chennai", state: "Tamil Nadu", localities: ["Adyar", "Velachery", "OMR", "Anna Nagar"] },
  { city: "Pune", state: "Maharashtra", localities: ["Koregaon Park", "Baner", "Wakad", "Kharadi"] }
];

const propertyTypes = Object.values(PropertyType);
const listingTypes = Object.values(ListingType);

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function priceFor(listingType: ListingType, propertyType: PropertyType) {
  if (listingType === "RENT") {
    const base = propertyType === "PG" ? 8000 : propertyType === "COMMERCIAL" ? 40000 : 18000;
    return base + Math.floor(Math.random() * base * 5);
  }

  const base = propertyType === "PLOT" ? 2500000 : propertyType === "COMMERCIAL" ? 6000000 : 4500000;
  return base + Math.floor(Math.random() * base * 8);
}

function buildProperty(index: number, ownerIds: string[]): Prisma.PropertyCreateManyInput {
  const location = randomItem(locations);
  const propertyType = randomItem(propertyTypes);
  const listingType = randomItem(listingTypes);
  const hasRooms = propertyType !== "PLOT" && propertyType !== "COMMERCIAL";
  const bedrooms = hasRooms ? 1 + Math.floor(Math.random() * 4) : null;
  const locality = randomItem(location.localities);
  const price = priceFor(listingType, propertyType);
  const title = `${bedrooms ? `${bedrooms} BHK ` : ""}${propertyType.toLowerCase()} in ${locality}, ${location.city}`;

  return {
    ownerId: randomItem(ownerIds),
    title,
    slug: `seed-${index}-${Math.random().toString(36).slice(2, 8)}`,
    description: `Well-maintained ${propertyType.toLowerCase()} in ${locality}, ${location.city}, offered directly by the owner. The property is close to everyday conveniences and well connected to key parts of the city. Enquire for more details and a viewing.`,
    propertyType,
    listingType,
    price: new Prisma.Decimal(price),
    depositAmount: listingType === "RENT" ? new Prisma.Decimal(price * 2) : null,
    bedrooms,
    bathrooms: hasRooms ? Math.max(1, bedrooms ?? 1) : null,
    areaSqft: propertyType === "PLOT" ? 1200 + Math.floor(Math.random() * 4800) : 450 + Math.floor(Math.random() * 2800),
    ageYears: propertyType === "PLOT" ? null : Math.floor(Math.random() * 21),
    city: location.city,
    locality,
    state: location.state,
    address: `${1 + Math.floor(Math.random() * 200)}, ${locality}, ${location.city}`
  };
}

async function main() {
  if (!Number.isInteger(targetCount) || targetCount < 1) throw new Error("SEED_PROPERTY_COUNT must be a positive integer.");

  await prisma.property.deleteMany({ where: { slug: { startsWith: "seed-" } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: "seed-owner-" } } });

  const passwordHash = await bcrypt.hash("DemoPass123!", 12);
  const ownerRecords = await Promise.all(
    owners.map(([name, email, phone]) => prisma.user.upsert({
      where: { email },
      update: { name, phone, passwordHash },
      create: { name, email, passwordHash, phone },
      select: { id: true }
    }))
  );
  const ownerIds = ownerRecords.map((owner) => owner.id);

  console.log(`Creating ${targetCount} seed properties in batches of ${batchSize}.`);
  for (let offset = 0; offset < targetCount; offset += batchSize) {
    const count = Math.min(batchSize, targetCount - offset);
    const properties = Array.from({ length: count }, (_, index) => buildProperty(offset + index + 1, ownerIds));
    await prisma.property.createMany({ data: properties });
    console.log(`Created ${Math.min(offset + count, targetCount)} of ${targetCount} properties.`);
  }

  const created = await prisma.property.findMany({
    where: { slug: { startsWith: "seed-" } },
    select: { id: true, propertyType: true },
    take: targetCount,
    orderBy: { createdAt: "desc" }
  });

  await prisma.propertyImage.createMany({
    data: created.map((property) => ({
      propertyId: property.id,
      url: `https://images.unsplash.com/${imageSets[property.propertyType][property.id.charCodeAt(property.id.length - 1) % imageSets[property.propertyType].length]}?auto=format&fit=crop&w=1200&q=80`,
      publicId: `seed-placeholder-${property.id}`,
      isPrimary: true
    }))
  });

  console.log("Seed complete. Demo owner password: DemoPass123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
