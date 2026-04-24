import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeSubscriptionClient from "./StripeSubscriptionClient";

export const metadata: Metadata = {
  title: "Stripe Subscription Cost Calculator — Monthly & Annual Plan Fees",
  description:
    "Calculate Stripe fees for subscription pricing. Compare monthly vs annual plans, see total processing costs, and find the optimal pricing for your SaaS. Free, instant, no signup.",
  keywords: [
    "stripe subscription cost calculator",
    "stripe subscription fees",
    "stripe recurring billing fees",
    "stripe subscription pricing calculator",
    "stripe saas fees calculator",
    "stripe monthly billing cost",
    "stripe subscription app cost estimate",
  ],
  openGraph: {
    title: "Stripe Subscription Cost Calculator",
    description: "Calculate Stripe fees for monthly and annual subscription plans. Find optimal SaaS pricing.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-subscription-cost-calculator",
  },
};

const faqs = [
  {
    q: "How much does Stripe charge for subscription billing?",
    a: "Stripe charges 2.9% + $0.30 per successful subscription transaction — the same as one-time payments. There's no additional fee for using Stripe Billing on the standard plan. Failed payment retries (dunning) also incur a fee if the retry succeeds.",
  },
  {
    q: "Is it cheaper to bill annually vs monthly on Stripe?",
    a: "Annual billing reduces Stripe fees significantly. Instead of 12 monthly transactions (each with a $0.30 fixed fee), you have 1 annual transaction. On a $50/month plan: monthly billing costs $20.88/year in Stripe fees, annual billing at $500 costs just $14.80 — saving $6.08 per customer per year.",
  },
  {
    q: "How do I reduce Stripe fees for SaaS subscriptions?",
    a: "Key strategies: (1) Offer annual billing — fewer transactions = less $0.30 fixed fees. (2) Use ACH for US customers — 0.8% capped at $5, much cheaper for higher-priced plans. (3) At $80K+ MRR, negotiate custom pricing with Stripe. (4) Reduce failed payments with smart retry logic to avoid paying fees on failed attempts.",
  },
  {
    q: "Does Stripe charge a fee for failed subscription payments?",
    a: "Stripe does not charge a fee for failed payment attempts. You only pay the 2.9% + $0.30 when a payment succeeds. However, if you use Stripe Billing's smart retries (Revenue Recovery), that feature is included in standard Stripe Billing at no extra cost.",
  },
  {
    q: "How do I record Stripe subscription fees in QuickBooks?",
    a: "Each successful subscription charge should be recorded as revenue (gross amount), with the Stripe processing fee as a separate Bank Service Charges expense. Our free Stripe → QuickBooks converter handles this mapping automatically from your Stripe CSV export.",
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

export default function StripeSubscriptionPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Stripe Subscription Cost Calculator"
        description="Calculate Stripe fees for monthly and annual subscription plans. Compare billing frequencies and find the most cost-efficient pricing for your SaaS."
        faqs={faqs}
      >
        <StripeSubscriptionClient />
      </ToolLayout>
    </>
  );
}
