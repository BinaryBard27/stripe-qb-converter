import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeRevenueForecastClient from "./StripeRevenueForecastClient";

export const metadata: Metadata = {
  title: "Stripe Revenue Forecaster — Project Your Monthly Stripe Revenue",
  description:
    "Forecast your Stripe revenue for the next 12 months. Enter your current MRR and growth rate to see projected revenue, fees, and net payouts. Free, instant, no signup.",
  keywords: [
    "stripe revenue forecast",
    "stripe mrr calculator",
    "stripe monthly recurring revenue",
    "saas revenue forecast",
    "stripe subscription revenue calculator",
    "project stripe revenue",
  ],
  openGraph: {
    title: "Stripe Revenue Forecaster — Project Your Monthly Revenue",
    description: "Enter your current revenue and growth rate to forecast the next 12 months of Stripe income.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-revenue-forecaster",
  },
};

const faqs = [
  {
    q: "How do I forecast my Stripe revenue?",
    a: "Start with your current monthly revenue (MRR), estimate your monthly growth rate based on recent trends, and project forward. A 10% monthly growth rate doubles revenue in about 7 months. This calculator does that math automatically and shows net amounts after Stripe fees.",
  },
  {
    q: "What is a good monthly growth rate for a SaaS business?",
    a: "Early-stage SaaS (under $10K MRR) typically grows 15-20% monthly when things are working. Mid-stage ($10K-100K MRR) typically sees 5-10% monthly growth. Above $100K MRR, 3-5% monthly is strong. Anything above 20% monthly at any stage is exceptional.",
  },
  {
    q: "How much does Stripe take from subscription revenue?",
    a: "Stripe charges 2.9% + $0.30 per successful transaction for subscription billing. There's no additional subscription management fee on the standard plan. On higher-tier plans or using Stripe Billing advanced features, additional fees may apply.",
  },
  {
    q: "How do I track Stripe subscription revenue in QuickBooks?",
    a: "Each Stripe payout represents multiple subscription transactions. You should record the gross subscription revenue, then the Stripe fees as a separate bank service charge expense. Our free Stripe → QuickBooks converter handles this mapping automatically when you import your Stripe CSV export.",
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

export default function StripeRevenueForecastPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Stripe Revenue Forecaster"
        description="Enter your current monthly revenue and growth rate to project your Stripe income — and net payouts after fees — for the next 12 months."
        faqs={faqs}
      >
        <StripeRevenueForecastClient />
      </ToolLayout>
    </>
  );
}
