import type { PropertyDetail, PropertySearchResponse } from "./types";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";

export async function getProperties(search: string) {
  const response = await fetch(`${apiUrl}/api/properties?${search}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load properties.");
  return response.json() as Promise<PropertySearchResponse>;
}

export async function getProperty(slug: string) {
  const response = await fetch(`${apiUrl}/api/properties/${encodeURIComponent(slug)}`, { next: { revalidate: 3600 } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load this property.");
  return response.json() as Promise<PropertyDetail>;
}

export async function getSimilarProperties(id: string) {
  const response = await fetch(`${apiUrl}/api/properties/${id}/similar`, { next: { revalidate: 3600 } });
  if (!response.ok) return [];
  return response.json() as Promise<PropertySearchResponse["data"]>;
}
