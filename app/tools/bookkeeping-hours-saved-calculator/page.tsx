import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import BookkeepingHoursSavedClient from "./BookkeepingHoursSavedClient";

export const metadata: Metadata = {
  title: "Bookkeeping Hours Saved Calculator — How Much Time Does Bookkeeping Take?",
  description:
    "Calculate how many hours per month you spend on bookkeeping and how much it's costing you. See exactly how much time automated tools save. Free, instant, no signup.",
  keywords: [
    "how long does bookkeeping take",
    "bookkeeping hours per month",
    "how much time does bookkeeping take small business",
    "bookkeeping time calculator",
    "automate bookkeeping save time",
    "small business bookkeeping hours",
  ],
  openGraph: {
    title: "Bookkeeping Hours Saved Calculator",
    description: "See exactly how many hours bookkeeping costs you monthly — and what automating it would save.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/bookkeeping-hours-saved-calculator",
  },
};

const faqs = [
  {
    q: "How long does bookkeeping take for a small business?",
    a: "For most small businesses, bookkeeping takes 5-15 hours per month. This includes categorizing transactions, reconciling bank accounts, reviewing reports, and preparing data for tax time. Businesses with higher transaction volumes or multiple accounts can spend 20-40 hours monthly.",
  },
  {
    q: "How much does it cost to do your own bookkeeping?",
    a: "The cost of DIY bookkeeping is your time multiplied by your effective hourly rate. If you bill $100/hour and spend 10 hours/month on bookkeeping, that's $1,000/month in opportunity cost — money you could have earned doing your actual work instead.",
  },
  {
    q: "What bookkeeping tasks take the most time?",
    a: "The biggest time sinks are: importing and categorizing transactions (especially from multiple sources like Stripe, PayPal, and bank accounts), reconciling accounts, fixing import errors, and preparing reports. Transaction imports alone can take 2-3 hours monthly if done manually.",
  },
  {
    q: "How can I reduce bookkeeping time?",
    a: "The biggest wins come from automating transaction imports. Instead of manually reformatting CSV exports, use tools that convert them automatically. Our free Stripe → QuickBooks converter, for example, reduces a 2-hour monthly task to 10 seconds.",
  },
  {
    q: "Is it worth hiring a bookkeeper?",
    a: "If bookkeeping takes more than 5 hours/month and your effective hourly rate is over $50, hiring a bookkeeper (typically $300-500/month for basic services) usually makes financial sense. The calculation is: your hourly rate × hours spent > bookkeeper cost.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function BookkeepingHoursSavedPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Bookkeeping Hours Saved Calculator"
        description="Calculate how many hours bookkeeping costs you each month, what it's worth in lost time, and how much automation could save you."
        faqs={faqs}
      >
        <BookkeepingHoursSavedClient />
      </ToolLayout>
    </>
  );
}
