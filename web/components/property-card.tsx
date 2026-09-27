import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { PropertyCard as PropertyCardType } from "@/lib/types";

export function PropertyCard({ property }: { property: PropertyCardType }) {
  const details = [
    property.bedrooms ? `${property.bedrooms} BHK` : null,
    property.propertyType.replace("_", " "),
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block overflow-hidden rounded-md border border-line bg-surface transition-shadow duration-150 ease-out hover:shadow-raised focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand motion-reduce:transition-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-subtle">
        {property.primaryImage ? (
          <Image
            src={property.primaryImage}
            alt={property.title}
            fill
            sizes="(min-width: 1280px) 280px, (min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-150 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-muted">
            No image available
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-brand shadow-sm">
          {property.listingType === "SALE" ? "For sale" : "For rent"}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <p className="tabular text-xl font-bold leading-6 text-ink">
          {formatPrice(property.price, property.listingType)}
        </p>
        <p className="text-sm text-muted">{details}</p>
        <h2 className="truncate text-base font-semibold text-ink">
          {property.title}
        </h2>
        <p className="text-sm text-muted">
          {property.locality}, {property.city}
        </p>
      </div>
    </Link>
  );
}
