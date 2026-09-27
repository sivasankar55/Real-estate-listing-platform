import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Nestora",
  description:
    "How Nestora handles account, listing, inquiry, and technical information.",
};

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Privacy policy"
      title="Your information should have a clear purpose."
      intro="This product privacy template describes the information Nestora currently uses to provide accounts, listings, images, search, and owner inquiries. It should be reviewed and adapted for the operating company, jurisdiction, retention schedule, and production vendors before launch."
    >
      <p className="rounded-md border border-brand/20 bg-brand-subtle p-4 text-sm leading-6 text-ink">
        Last updated: September 2026. This page is informational and is not
        legal advice.
      </p>
      <ContentSection title="Information we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Account information such as name, email address, password hash, and
            optional phone number.
          </li>
          <li>
            Property information and images that an owner chooses to publish.
          </li>
          <li>Inquiry information such as name, phone number, and message.</li>
          <li>
            Technical information needed to secure the service, such as request
            metadata and authentication cookies.
          </li>
        </ul>
      </ContentSection>
      <ContentSection title="How we use information">
        <p>
          We use information to create and secure accounts, authenticate
          sessions, display listings, deliver inquiries to listing owners,
          prevent abuse, provide support, improve the product, and comply with
          legal obligations.
        </p>
      </ContentSection>
      <ContentSection title="Cookies and tokens">
        <p>
          Nestora uses a secure refresh-session cookie to keep users signed in.
          The browser also temporarily holds a short-lived access token in
          memory for authenticated API requests. The access token is not stored
          in localStorage by the application.
        </p>
      </ContentSection>
      <ContentSection title="Sharing and service providers">
        <p>
          Listing and owner information is displayed to visitors as part of the
          marketplace experience. Inquiry details are shared with the relevant
          listing owner. Images may be processed and hosted by the configured
          image provider. We do not sell personal information as part of the
          current product design.
        </p>
      </ContentSection>
      <ContentSection title="Retention and security">
        <p>
          We retain information for as long as needed to provide the service,
          meet legal obligations, resolve disputes, and enforce agreements. We
          use access controls, password hashing, secure cookies, validation, and
          session revocation, but no online service can guarantee absolute
          security.
        </p>
      </ContentSection>
      <ContentSection title="Your choices">
        <p>
          You can update or delete listings you own through your account. You
          can sign out to revoke the current session. For account-access,
          deletion, or privacy requests, contact the administrator responsible
          for your Nestora deployment.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
