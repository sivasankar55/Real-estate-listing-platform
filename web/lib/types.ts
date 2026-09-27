export type PropertyCard = {
  id: string;
  slug: string;
  title: string;
  price: string;
  depositAmount: string | null;
  city: string;
  locality: string;
  propertyType: string;
  listingType: "SALE" | "RENT";
  bedrooms: number | null;
  primaryImage: string | null;
};

export type PropertySearchResponse = {
  data: PropertyCard[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type PropertyDetail = PropertyCard & {
  description: string;
  bathrooms: number | null;
  areaSqft: number;
  ageYears: number | null;
  state: string;
  address: string;
  owner: { id: string; name: string; phone: string | null; email: string };
  images: { id: string; url: string; isPrimary: boolean }[];
};
