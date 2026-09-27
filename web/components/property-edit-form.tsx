"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/image-uploader";
import { useAuth } from "@/lib/auth";
import { revalidateProperty } from "@/lib/revalidate";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
type EditableProperty = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  depositAmount: string | null;
  listingType: "SALE" | "RENT";
  areaSqft: number;
  ageYears: number | null;
  city: string;
  locality: string;
  state: string;
  address: string;
};

export function PropertyEditForm({ propertyId }: { propertyId: string }) {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState<EditableProperty | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetch(`${apiUrl}/api/properties/mine`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => response.json())
      .then((items: EditableProperty[]) =>
        setProperty(items.find((item) => item.id === propertyId) ?? null),
      )
      .catch(() => setError("Could not load this property."));
  }, [accessToken, propertyId]);
  if (error)
    return (
      <p
        role="alert"
        className="rounded-sm bg-danger-subtle p-3 text-sm text-danger"
      >
        {error}
      </p>
    );
  if (!property) return <p className="text-muted">Loading property...</p>;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const body = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    body.price = String(body.price);
    body.areaSqft = String(body.areaSqft);
    body.ageYears = body.ageYears ? String(body.ageYears) : null as unknown as string;
    body.depositAmount = body.depositAmount ? String(body.depositAmount) : null as unknown as string;
    const current = property!;
    try {
      const response = await fetch(`${apiUrl}/api/properties/${current.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error?.message ?? "Could not save changes.");
      setProperty(result);
      router.push("/properties");
      revalidateProperty(current.slug, accessToken);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save changes.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm font-semibold text-ink">
          Title
          <input
            name="title"
            defaultValue={property.title}
            required
            className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          Description
          <textarea
            name="description"
            defaultValue={property.description}
            required
            minLength={20}
            rows={5}
            className="mt-1 w-full rounded-sm border border-line px-3 py-2 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-ink">
            {property.listingType === "RENT" ? "Monthly rent (₹)" : "Price (₹)"}
            <input
              name="price"
              type="number"
              defaultValue={property.price}
              required
              className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </label>
          {property.listingType === "RENT" ? (
            <label className="block text-sm font-semibold text-ink">
              Security deposit (₹)
              <input
                name="depositAmount"
                type="number"
                min={0}
                placeholder="e.g. 50000"
                defaultValue={property.depositAmount ?? ""}
                className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
              />
            </label>
          ) : null}
          <label className="block text-sm font-semibold text-ink">
            Area (sq.ft)
            <input
              name="areaSqft"
              type="number"
              defaultValue={property.areaSqft}
              required
              className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Age of property (years)
            <input
              name="ageYears"
              type="number"
              min={0}
              max={100}
              defaultValue={property.ageYears ?? ""}
              className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            City
            <input
              name="city"
              defaultValue={property.city}
              required
              className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Locality
            <input
              name="locality"
              defaultValue={property.locality}
              required
              className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            State
            <input
              name="state"
              defaultValue={property.state}
              required
              className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Address
            <input
              name="address"
              defaultValue={property.address}
              required
              className="mt-1 min-h-11 w-full rounded-sm border border-line px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </label>
        </div>
        {error ? (
          <p
            role="alert"
            className="rounded-sm bg-danger-subtle p-3 text-sm text-danger"
          >
            {error}
          </p>
        ) : null}
        <button
          disabled={saving}
          className="min-h-11 rounded-sm bg-brand px-5 font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
      <div className="mt-8">
        <ImageUploader propertyId={property.id} slug={property.slug} />
      </div>
    </>
  );
}
