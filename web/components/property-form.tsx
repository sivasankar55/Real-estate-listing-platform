"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const propertyTypeOptions = [
  "APARTMENT",
  "HOUSE",
  "VILLA",
  "PLOT",
  "COMMERCIAL",
  "PG",
];

const listingTypeOptions = ["SALE", "RENT"];

export function PropertyForm() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [propertyType, setPropertyType] = useState("APARTMENT");
  const [listingType, setListingType] = useState("SALE");
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    body.price = String(body.price);
    body.areaSqft = String(body.areaSqft);
    body.bedrooms = body.bedrooms
      ? String(body.bedrooms)
      : (null as unknown as string);
    body.bathrooms = body.bathrooms
      ? String(body.bathrooms)
      : (null as unknown as string);
    body.ageYears = body.ageYears
      ? String(body.ageYears)
      : (null as unknown as string);
    body.depositAmount = body.depositAmount
      ? String(body.depositAmount)
      : (null as unknown as string);
    try {
      const response = await fetch(`${apiUrl}/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error?.message ?? "Could not publish this listing.",
        );
      router.push(`/dashboard/properties/${result.id}/edit`);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Could not publish this listing.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-semibold text-ink md:col-span-2">
          Title
          <input
            name="title"
            required
            minLength={5}
            placeholder="Bright 2 BHK apartment in Indiranagar"
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <label className="block text-sm font-semibold text-ink md:col-span-2">
          Description
          <textarea
            name="description"
            required
            minLength={20}
            rows={5}
            placeholder="Describe the property and what makes its location useful."
            className="mt-1 w-full rounded-sm border border-line bg-surface px-3 py-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <ResponsiveSelect
          name="propertyType"
          label="Property type"
          value={propertyType}
          options={propertyTypeOptions}
          isOpen={openSelect === "propertyType"}
          onToggle={() => setOpenSelect(openSelect === "propertyType" ? null : "propertyType")}
          onSelect={(value) => {
            setPropertyType(value);
            setOpenSelect(null);
          }}
        />
        <ResponsiveSelect
          name="listingType"
          label="Listing type"
          value={listingType}
          options={listingTypeOptions}
          isOpen={openSelect === "listingType"}
          onToggle={() => setOpenSelect(openSelect === "listingType" ? null : "listingType")}
          onSelect={(value) => {
            setListingType(value);
            setOpenSelect(null);
          }}
        />
        <label className="block text-sm font-semibold text-ink">
          {listingType === "RENT" ? "Monthly rent (₹)" : "Price (₹)"}
          <input
            name="price"
            required
            type="number"
            min="1"
            placeholder={listingType === "RENT" ? "e.g. 25000" : "e.g. 8500000"}
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 tabular font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        {listingType === "RENT" ? (
          <label className="block text-sm font-semibold text-ink">
            Security deposit (₹)
            <input
              name="depositAmount"
              type="number"
              min="0"
              placeholder="e.g. 50000"
              className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 tabular font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
            <span className="mt-1 block text-xs font-normal text-muted">
              Refundable amount paid up front. Leave blank if not applicable.
            </span>
          </label>
        ) : null}
        <label className="block text-sm font-semibold text-ink">
          Area (sq.ft)
          <input
            name="areaSqft"
            required
            type="number"
            min="1"
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 tabular font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          Bedrooms
          <input
            name="bedrooms"
            type="number"
            min="0"
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 tabular font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          Bathrooms
          <input
            name="bathrooms"
            type="number"
            min="0"
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 tabular font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          Age of property (years)
          <input
            name="ageYears"
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 5"
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 tabular font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          City
          <input
            name="city"
            required
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          Locality
          <input
            name="locality"
            required
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          State
          <input
            name="state"
            required
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          Address
          <input
            name="address"
            required
            className="mt-1 min-h-11 w-full rounded-sm border border-line bg-surface px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
        className="min-h-11 rounded-sm bg-brand px-5 font-semibold text-white hover:bg-brand-hover disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {saving ? "Publishing..." : "Publish listing"}
      </button>
    </form>
  );
}

function ResponsiveSelect({
  name,
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: {
  name: string;
  label: string;
  value: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="min-w-0 text-sm font-semibold text-ink">
      <span>{label}</span>
      <div className="relative mt-1">
        <input type="hidden" name={name} value={value} />
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={onToggle}
          onKeyDown={(event) => {
            if (event.key === "Escape" && isOpen) onToggle();
          }}
          className="flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-sm border border-line bg-surface px-3 text-left font-normal text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span className="truncate">{value}</span>
          <span
            aria-hidden
            className={`h-2.5 w-2.5 shrink-0 rotate-45 border-b-2 border-r-2 border-muted transition-transform ${isOpen ? "-translate-y-0.5 rotate-[225deg]" : "-translate-y-0.5"}`}
          />
        </button>
        {isOpen ? (
          <div
            role="listbox"
            aria-label={label}
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 max-h-60 overflow-y-auto rounded-sm border border-line bg-surface p-1 shadow-raised"
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => onSelect(option)}
                className={`flex min-h-10 w-full items-center rounded-sm px-3 text-left font-normal text-ink hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-brand ${option === value ? "bg-brand-subtle font-semibold text-brand" : ""}`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
