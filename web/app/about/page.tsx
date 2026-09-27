import type { Metadata } from "next";
import { ContentPage, ContentSection } from "@/components/content-page";

export const metadata: Metadata = {
  title: "About Nestora",
  description: "Learn how Nestora makes property discovery more direct and human.",
};

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About Nestora"
      title="A clearer way to find where you belong."
      intro="Nestora is an owner-first property marketplace built to make the first step of moving simpler: find a place, understand it clearly, and start a useful conversation."
    >
      <ContentSection title="Why Nestora exists">
        <p>
          Property search can feel noisy, slow, and disconnected from the people who actually know a home. Nestora brings listings, useful filters, property details, and direct inquiries into one focused experience.
        </p>
      </ContentSection>
      <ContentSection title="Built around better conversations">
        <p>
          Every listing is designed to answer the questions people ask first: where it is, what it costs, what kind of property it is, and how to contact the owner. That keeps discovery practical and helps owners meet people with genuine interest.
        </p>
      </ContentSection>
      <ContentSection title="Our principles">
        <ul className="list-disc space-y-2 pl-5">
          <li>Make property information easy to scan and compare.</li>
          <li>Give owners control of the listings they publish.</li>
          <li>Keep conversations direct, respectful, and useful.</li>
          <li>Build trust through clear product behavior and responsible handling of data.</li>
        </ul>
      </ContentSection>
    </ContentPage>
  );
}
