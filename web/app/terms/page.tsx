import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Terms & Conditions | Nestora",
  description: "The terms that apply when using the Nestora property listing platform.",
};

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Terms & conditions"
      title="Use Nestora thoughtfully."
      intro="These product terms explain the basic rules for using Nestora, publishing listings, and contacting other users. They are a starting-point template and should be reviewed by qualified legal counsel before production launch."
    >
      <p className="rounded-md border border-brand/20 bg-brand-subtle p-4 text-sm leading-6 text-ink">
        Last updated: September 2026. By using Nestora, you agree to follow these terms and all applicable laws.
      </p>
      <ContentSection title="1. The service">
        <p>Nestora provides tools to search property listings, publish property information, and send inquiries. Nestora is not a property owner, broker, agent, lender, insurer, or party to any transaction unless expressly stated.</p>
      </ContentSection>
      <ContentSection title="2. Accounts">
        <p>You must provide accurate registration information, keep your password confidential, and notify the platform administrator if you believe your account has been accessed without permission. You are responsible for activity performed through your account.</p>
      </ContentSection>
      <ContentSection title="3. Listings and user content">
        <p>You may publish only information you are authorized to share. Listings should be accurate, current, lawful, and relevant to the property. Do not upload content that is fraudulent, discriminatory, abusive, infringing, malicious, or designed to mislead.</p>
        <p>You retain responsibility for your listing content. By submitting it, you give Nestora permission to host, display, resize, and distribute it as needed to operate and promote the service.</p>
      </ContentSection>
      <ContentSection title="4. Inquiries and transactions">
        <p>Inquiries are introductions, not guarantees. Verify ownership, identity, property condition, permissions, pricing, deposits, and documents independently. Any sale, rental, payment, deposit, or service agreement is between the relevant parties.</p>
      </ContentSection>
      <ContentSection title="5. Prohibited use and enforcement">
        <p>Do not scrape, abuse, probe, overload, reverse engineer, impersonate another person, bypass access controls, or use Nestora to distribute harmful code or spam. We may remove content, restrict accounts, or suspend access when necessary to protect the service and its users.</p>
      </ContentSection>
      <ContentSection title="6. Availability and changes">
        <p>We work to keep Nestora available and accurate, but the service may change, be interrupted, or contain information supplied by users. We may update these terms as the product evolves and will publish the current version on this page.</p>
      </ContentSection>
    </ContentPage>
  );
}
