import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeProcessingFeeClient from "./StripeProcessingFeeClient";

export const metadata: Metadata = {
  title: "Stripe Processing Fee Calculator — Calculate Transaction Costs Instantly",
  description:
    "Calculate Stripe processing fees for any transaction. See gross amount, net payout, and total fees. Includes monthly volume calculator and break-even analysis. Free, no signup.",
  keywords: [
    "stripe processing fee calculator",
    "stripe processing fees",
    "stripe payment processing fees",
    "calculate stripe processing fee",
    "stripe merchant fees",
    "stripe transaction cost calculator",
    "stripe fees breakdown",
  ],
  openGraph: {
    title: "Stripe Processing Fee Calculator",
    description: "Calculate Stripe processing fees instantly with monthly volume projections and break-even analysis.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-processing-fee-calculator",
  },
};

const faqs = [
  {
    q: "What is Stripe's processing fee?",
    a: "Stripe charges a processing fee of 2.9% + $0.30 per successful card transaction for US businesses on the standard plan. This fee is automatically deducted before your payout — you never pay an invoice, Stripe simply remits you the net amount.",
  },
  {
    q: "How is Stripe's processing fee calculated?",
    a: "The fee is: (transaction amount × 2.9%) + $0.30. For example, a $100 transaction: ($100 × 0.029) + $0.30 = $2.90 + $0.30 = $3.20 fee. You receive $96.80.",
  },
  {
    q: "Are Stripe processing fees tax deductible?",
    a: "Yes. Stripe processing fees are a legitimate business expense and are tax deductible in most countries. Record them as 'bank service charges' or 'merchant processing fees' in QuickBooks. Stripe provides monthly fee summaries in your dashboard for accounting purposes.",
  },
  {
    q: "Does Stripe have monthly fees in addition to processing fees?",
    a: "Stripe's standard plan has no monthly fee — you only pay the per-transaction processing fee. Stripe Billing, Stripe Radar Advanced, and other premium features have additional costs, but basic payment processing has no monthly charge.",
  },
  {
    q: "How can I reduce my Stripe processing fees?",
    a: "Options: (1) Negotiate custom pricing with Stripe once you exceed ~$80K/month in volume. (2) Enable ACH bank transfers (0.8%, capped at $5) for B2B customers who can pay by bank. (3) Use Stripe's optimized checkout to reduce failed payments that still incur fees. (4) Pass fees to customers where legally permitted.",
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

export default function StripeProcessingFeePage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Stripe Processing Fee Calculator"
        description="Calculate Stripe processing fees for any transaction amount. Includes monthly volume projections, annual totals, and break-even analysis."
        faqs={faqs}
      >
        <StripeProcessingFeeClient />
      </ToolLayout>
    </>
  );
}
