"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Protected } from "@/components/protected";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { revalidateProperty } from "@/lib/revalidate";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function DashboardContent() {
  const { accessToken } = useAuth();
  const [listings, setListings] = useState<
    Array<{
      id: string;
      slug: string;
      title: string;
      price: string;
      listingType: "SALE" | "RENT";
      city: string;
    }>
  >([]);
  useEffect(() => {
    fetch(`${apiUrl}/api/properties/mine`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then(setListings);
  }, [accessToken]);
  async function remove(id: string, slug: string) {
    if (!window.confirm("Delete this listing?")) return;
    await revalidateProperty(slug, accessToken);
    const response = await fetch(`${apiUrl}/api/properties/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (response.ok)
      setListings((items) => items.filter((item) => item.id !== id));
  }
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-ink">My listings</h1>
            <p className="mt-2 text-muted">
              Manage the properties you have posted.
            </p>
          </div>
          <Link
            href="/dashboard/properties/new"
            className="inline-flex min-h-11 items-center rounded-sm bg-brand px-4 font-semibold text-white hover:bg-brand-hover"
          >
            Post listing
          </Link>
        </div>
        {listings.length ? (
          <div className="mt-8 divide-y divide-line rounded-md border border-line bg-surface">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div>
                  <h2 className="font-semibold text-ink">{listing.title}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {listing.city} ·{" "}
                    {formatPrice(listing.price, listing.listingType)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/properties/${listing.slug}`}
                    className="font-semibold text-brand hover:underline"
                  >
                    View listing
                  </Link>
                  <Link
                    href={`/dashboard/properties/${listing.id}/edit`}
                    className="font-semibold text-ink hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(listing.id, listing.slug)}
                    className="font-semibold text-danger hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <section className="mt-8 rounded-md border border-line bg-surface p-8 text-center">
            <h2 className="text-lg font-semibold text-ink">
              You haven&apos;t posted a listing yet.
            </h2>
            <p className="mt-2 text-muted">
              Post your first property to get started.
            </p>
            <Link
              href="/dashboard/properties/new"
              className="mt-5 inline-flex min-h-11 items-center rounded-sm bg-brand px-4 font-semibold text-white hover:bg-brand-hover"
            >
              Post your first listing
            </Link>
          </section>
        )}
      </main>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Protected>
      <DashboardContent />
    </Protected>
  );
}
