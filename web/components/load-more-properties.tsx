"use client";

import { useState } from "react";
import { PropertyCard } from "@/components/property-card";
import type { PropertyCard as PropertyCardType } from "@/lib/types";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function LoadMoreProperties({
  initial,
  nextCursor,
  search,
}: {
  initial: PropertyCardType[];
  nextCursor: string | null;
  search: string;
}) {
  const [items, setItems] = useState(initial);
  const [cursor, setCursor] = useState(nextCursor);
  const [loading, setLoading] = useState(false);
  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams(search);
      params.set("cursor", cursor);
      const response = await fetch(
        `${apiUrl}/api/properties?${params.toString()}`,
      );
      if (!response.ok) throw new Error("Could not load more properties.");
      const result = (await response.json()) as {
        data: PropertyCardType[];
        nextCursor: string | null;
        hasMore: boolean;
      };
      setItems((current) => [...current, ...result.data]);
      setCursor(result.hasMore ? result.nextCursor : null);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      {cursor ? (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="min-h-11 rounded-sm border border-line bg-surface px-5 font-semibold text-ink hover:bg-brand-subtle disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {loading ? "Loading properties..." : "Load more properties"}
          </button>
        </div>
      ) : null}
    </>
  );
}
