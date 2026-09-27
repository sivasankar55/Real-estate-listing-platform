import type { MetadataRoute } from "next";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/properties`, changeFrequency: "hourly", priority: 0.9 },
  ];
  try {
    let cursor: string | null = null;
    do {
      const query = new URLSearchParams({ limit: "50" });
      if (cursor) query.set("cursor", cursor);
      const response = await fetch(`${apiUrl}/api/properties?${query}`, {
        next: { revalidate: 3600 },
      });
      if (!response.ok) break;
      const result = (await response.json()) as { data: { slug: string }[]; nextCursor: string | null };
      entries.push(
        ...result.data.map((property) => ({
          url: `${siteUrl}/properties/${property.slug}`,
          changeFrequency: "daily" as const,
          priority: 0.7,
        })),
      );
      cursor = result.nextCursor;
    } while (cursor);
  } catch {
   
  }
  return entries;
}
