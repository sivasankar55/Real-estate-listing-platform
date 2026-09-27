"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type SearchFiltersProps = {
  values: Record<string, string | string[] | undefined>;
};

type SelectOption = { value: string; label: string };

const propertyTypes: SelectOption[] = [
  { value: "", label: "Any type" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "VILLA", label: "Villa" },
  { value: "PLOT", label: "Plot" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "PG", label: "PG" },
];

const listingTypes: SelectOption[] = [
  { value: "", label: "Sale or rent" },
  { value: "SALE", label: "For sale" },
  { value: "RENT", label: "For rent" },
];

const bedroomOptions: SelectOption[] = [
  { value: "", label: "Any bedrooms" },
  { value: "1", label: "1+ BHK" },
  { value: "2", label: "2+ BHK" },
  { value: "3", label: "3+ BHK" },
  { value: "4", label: "4+ BHK" },
];

const sortOptions: SelectOption[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export function SearchFilters({ values }: SearchFiltersProps) {
  const getValue = (key: string) =>
    typeof values[key] === "string" ? values[key] : "";
  const [error, setError] = useState("");
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState({
    type: getValue("type"),
    listingType: getValue("listingType"),
    bedrooms: getValue("bedrooms"),
    sort: getValue("sort") || "newest",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = new FormData(event.currentTarget);
    const min = Number(form.get("minPrice"));
    const max = Number(form.get("maxPrice"));
    if (form.get("minPrice") && form.get("maxPrice") && min > max) {
      event.preventDefault();
      setError("Minimum price must be lower than maximum price.");
      return;
    }
    setError("");
  }

  function updateFilter(name: keyof typeof filterValues, value: string) {
    setFilterValues((current) => ({ ...current, [name]: value }));
    setOpenSelect(null);
  }

  return (
    <form
      action="/properties"
      onSubmit={handleSubmit}
      className="mb-6 grid min-w-0 gap-3 rounded-md border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <ResponsiveSelect
        name="type"
        label="Property type"
        value={filterValues.type}
        options={propertyTypes}
        isOpen={openSelect === "type"}
        onToggle={() => setOpenSelect(openSelect === "type" ? null : "type")}
        onSelect={(value) => updateFilter("type", value)}
      />
      <ResponsiveSelect
        name="listingType"
        label="Listing type"
        value={filterValues.listingType}
        options={listingTypes}
        isOpen={openSelect === "listingType"}
        onToggle={() => setOpenSelect(openSelect === "listingType" ? null : "listingType")}
        onSelect={(value) => updateFilter("listingType", value)}
      />
      <label className="min-w-0 text-sm font-semibold text-ink">
        Min price
        <input
          name="minPrice"
          type="number"
          min="0"
          defaultValue={getValue("minPrice")}
          placeholder="Minimum price"
          className="mt-1 min-h-11 w-full min-w-0 rounded-sm border border-line bg-surface px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </label>
      <label className="min-w-0 text-sm font-semibold text-ink">
        Max price
        <input
          name="maxPrice"
          type="number"
          min="0"
          defaultValue={getValue("maxPrice")}
          placeholder="Maximum price"
          className="mt-1 min-h-11 w-full min-w-0 rounded-sm border border-line bg-surface px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </label>
      <ResponsiveSelect
        name="bedrooms"
        label="Bedrooms"
        value={filterValues.bedrooms}
        options={bedroomOptions}
        isOpen={openSelect === "bedrooms"}
        onToggle={() => setOpenSelect(openSelect === "bedrooms" ? null : "bedrooms")}
        onSelect={(value) => updateFilter("bedrooms", value)}
      />
      <ResponsiveSelect
        name="sort"
        label="Sort"
        value={filterValues.sort}
        options={sortOptions}
        isOpen={openSelect === "sort"}
        onToggle={() => setOpenSelect(openSelect === "sort" ? null : "sort")}
        onSelect={(value) => updateFilter("sort", value)}
      />
      <div className="flex min-w-0 items-end gap-2 sm:col-span-2 lg:col-span-2">
        <button className="min-h-11 rounded-sm bg-brand px-5 font-semibold text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          Apply filters
        </button>
        <Link
          href="/properties"
          className="inline-flex min-h-11 items-center rounded-sm border border-line px-4 font-semibold text-ink hover:bg-brand-subtle"
        >
          Clear
        </Link>
      </div>
      {error ? (
        <p role="alert" className="text-sm font-medium text-danger sm:col-span-2 lg:col-span-4">
          {error}
        </p>
      ) : null}
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
  options: SelectOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="min-w-0 text-sm font-semibold text-ink">
      <label htmlFor={`${name}-filter`}>{label}</label>
      <div className="relative mt-1">
        <input type="hidden" name={name} value={value} />
        <button
          id={`${name}-filter`}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={onToggle}
          onKeyDown={(event) => {
            if (event.key === "Escape" && isOpen) onToggle();
          }}
          className="flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-sm border border-line bg-surface px-3 text-left font-normal text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span className="truncate">{selected.label}</span>
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
                key={option.value || "all"}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => onSelect(option.value)}
                className={`flex min-h-10 w-full items-center rounded-sm px-3 text-left font-normal text-ink hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-brand ${option.value === value ? "bg-brand-subtle font-semibold text-brand" : ""}`}
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
