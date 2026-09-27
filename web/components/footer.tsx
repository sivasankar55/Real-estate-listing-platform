import Image from "next/image";
import Link from "next/link";

const propertyLinks = [
  { label: "Buy a property", href: "/properties?listingType=SALE" },
  { label: "Rent a property", href: "/properties?listingType=RENT" },
  { label: "Apartments", href: "/properties?type=APARTMENT" },
  { label: "Commercial spaces", href: "/properties?type=COMMERCIAL" },
];

const ownerLinks = [
  { label: "Post a listing", href: "/dashboard/properties/new" },
  { label: "My listings", href: "/dashboard" },
];

const companyLinks = [
  { label: "About Nestora", href: "/about" },
  { label: "FAQs", href: "/faqs" },
  { label: "Property search", href: "/properties" },
];

const legalLinks = [
  { label: "Terms & conditions", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-brand text-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-white/15 py-12 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-8">
          <div className="max-w-sm">
            <Image
              src="/nestora-logo-light.svg"
              alt="Nestora"
              width={160}
              height={40}
            />
            <p className="mt-5 text-sm leading-6 text-white/75">
              Find a place that feels like home, directly from the people who know it best.
            </p>
            <Link
              href="/dashboard/properties/new"
              className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-white px-4 font-semibold text-brand transition hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              List your property
            </Link>
          </div>

          <FooterColumn title="Find a home" links={propertyLinks} />
          <FooterColumn title="For owners" links={ownerLinks} />
          <FooterColumn title="Nestora" links={companyLinks} />
          <FooterColumn title="Help & legal" links={legalLinks} />
        </div>

        <div className="flex flex-col gap-3 py-5 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nestora. Built for better home finding.</p>
          <p>Owner-first listings · Clear conversations · Better moves</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-white/70">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
