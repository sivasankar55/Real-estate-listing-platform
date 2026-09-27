import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "FAQs | Nestora",
  description:
    "Answers to common questions about searching, listing, and contacting property owners on Nestora.",
};

const questions = [
  {
    question: "What is Nestora?",
    answer:
      "Nestora is a property listing platform where people can search homes, plots, and commercial spaces and contact listing owners directly.",
  },
  {
    question: "How do I search for a property?",
    answer:
      "Use the search bar and filters on the Properties page. You can filter by location, property type, sale or rent, price, bedrooms, and sort order.",
  },
  {
    question: "How can I post a property?",
    answer:
      "Create an account, sign in, and choose Post a listing. You can add the property details and upload supported JPEG, PNG, or WebP images.",
  },
  {
    question: "How do I contact an owner?",
    answer:
      "Open a property detail page and use the inquiry form. You must be signed in, and you can submit one inquiry per property from your account.",
  },
  {
    question: "Can I edit or delete my listing?",
    answer:
      "Yes. Open My listings from the navigation. Only the account that created a listing can edit, upload images for, or delete it.",
  },
  {
    question: "Does Nestora charge brokerage?",
    answer:
      "Nestora is designed for direct owner-to-interested-person conversations. Any payment, brokerage, deposit, or other commercial arrangement should be verified and agreed by the people involved before proceeding.",
  },
  {
    question: "How should I stay safe?",
    answer:
      "Never send money before independently verifying the property and the person offering it. Do not share passwords or one-time codes, and report suspicious activity to the platform administrator.",
  },
];

export default function FaqsPage() {
  return (
    <ContentPage
      eyebrow="Help center"
      title="Frequently asked questions"
      intro="A quick guide to finding a property, publishing a listing, and starting a conversation on Nestora."
    >
      <div className="space-y-3">
        {questions.map((item) => (
          <details
            key={item.question}
            className="group rounded-md border border-line bg-surface px-5 py-4 open:border-brand/40"
          >
            <summary className="relative cursor-pointer list-none pr-8 font-semibold text-ink marker:hidden after:absolute after:right-0 after:top-0 after:text-xl after:leading-none after:text-brand after:content-['+'] group-open:after:content-['−'] focus-visible:outline-2 focus-visible:outline-brand">
              {item.question}
            </summary>
            <p className="mt-3 border-t border-line pt-3 leading-7 text-muted">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </ContentPage>
  );
}
