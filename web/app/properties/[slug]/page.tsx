import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/inquiry-form";
import { Navbar } from "@/components/navbar";
import { PropertyCard } from "@/components/property-card";
import { PropertyGallery } from "@/components/property-gallery";
import { getProperty, getSimilarProperties } from "@/lib/api";
import { formatAmount, formatPrice } from "@/lib/format";
import { serializeJsonLd } from "@/lib/structured-data";

export const revalidate = 3600;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await getProperty((await params).slug);
  return property
      ? {
        title: `${property.title} | Nestora`,
        description: property.description,
        alternates: { canonical: `${siteUrl}/properties/${property.slug}` },
        openGraph: {
          title: property.title,
          description: property.description,
          url: `${siteUrl}/properties/${property.slug}`,
          type: "website",
          images: property.images[0]?.url ? [property.images[0].url] : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title: property.title,
          description: property.description,
          images: property.images[0]?.url ? [property.images[0].url] : undefined,
        },
      }
    : { title: "Property not found | Nestora" };
}

export default async function PropertyDetailPage({ params }: Props) {
  const property = await getProperty((await params).slug);
  if (!property) notFound();
  const similar = await getSimilarProperties(property.id);
  const image = property.images[0]?.url;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: property.title,
    description: property.description,
    image: image ? [image] : [],
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.state,
    },
    offers: {
      "@type": "Offer",
      price: Number(property.price),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <Link
          href="/properties"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Back to properties
        </Link>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_360px]">
          <article>
            <PropertyGallery title={property.title} images={property.images} />
            <div className="mt-8">
              <p className="text-sm font-semibold text-brand">
                {property.listingType === "SALE" ? "For sale" : "For rent"}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {property.title}
              </h1>
              <p className="mt-2 text-muted">
                {property.locality}, {property.city}, {property.state}
              </p>
              <p className="tabular mt-6 text-2xl font-bold text-ink">
                {formatPrice(property.price, property.listingType)}
              </p>
              {property.listingType === "RENT" && property.depositAmount ? (
                <p className="tabular mt-1 text-sm text-muted">
                  Security deposit {formatAmount(property.depositAmount)}
                </p>
              ) : null}
              <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
                <div className="bg-surface p-4">
                  <dt className="text-xs text-muted">Bedrooms</dt>
                  <dd className="mt-1 font-semibold text-ink">
                    {property.bedrooms ?? "—"}
                  </dd>
                </div>
                <div className="bg-surface p-4">
                  <dt className="text-xs text-muted">Bathrooms</dt>
                  <dd className="mt-1 font-semibold text-ink">
                    {property.bathrooms ?? "—"}
                  </dd>
                </div>
                <div className="bg-surface p-4">
                  <dt className="text-xs text-muted">Area</dt>
                  <dd className="mt-1 font-semibold text-ink">
                    {property.areaSqft} sq.ft
                  </dd>
                </div>
                <div className="bg-surface p-4">
                  <dt className="text-xs text-muted">Type</dt>
                  <dd className="mt-1 font-semibold text-ink">
                    {property.propertyType}
                  </dd>
                </div>
                <div className="bg-surface p-4">
                  <dt className="text-xs text-muted">Listing type</dt>
                  <dd className="mt-1 font-semibold text-ink">
                    {property.listingType === "SALE" ? "For sale" : "For rent"}
                  </dd>
                </div>
                <div className="bg-surface p-4">
                  <dt className="text-xs text-muted">Age</dt>
                  <dd className="mt-1 font-semibold text-ink">
                    {typeof property.ageYears === "number"
                      ? `${property.ageYears} ${property.ageYears === 1 ? "year" : "years"}`
                      : "—"}
                  </dd>
                </div>
              </dl>
              <section className="mt-8">
                <h2 className="text-xl font-semibold text-ink">
                  About this property
                </h2>
                <p className="mt-3 max-w-prose whitespace-pre-line leading-7 text-muted">
                  {property.description}
                </p>
                <p className="mt-4 text-sm text-muted">{property.address}</p>
              </section>
            </div>
          </article>
          <aside className="h-fit rounded-md border border-line bg-surface p-5 lg:sticky lg:top-6">
            <p className="text-sm text-muted">Posted by</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">
              {property.owner.name}
            </h2>
            <dl className="mt-3 space-y-1 text-sm">
              {property.owner.phone ? (
                <div className="flex items-center gap-2">
                  <dt className="text-muted">Phone</dt>
                  <dd className="tabular">
                    <a
                      className="font-semibold text-brand hover:underline"
                      href={`tel:${property.owner.phone}`}
                    >
                      {property.owner.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <dt className="text-muted">Email</dt>
                <dd>
                  <a
                    className="break-all font-semibold text-brand hover:underline"
                    href={`mailto:${property.owner.email}`}
                  >
                    {property.owner.email}
                  </a>
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-muted">
              Interested in this property?
            </p>
            <InquiryForm propertyId={property.id} />
          </aside>
        </div>
        {similar.length ? (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-ink">
              Similar properties
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
