// app/tools/stripe-payout-calculator/page.tsx
// Server component — handles SEO metadata and structured data.
// Interactive logic lives in StripePayoutCalculatorClient.tsx.

import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripePayoutCalculatorClient from "./StripePayoutCalculatorClient";
import { FaqSchema } from "@/components/FaqSchema";

export const metadata: Metadata = {
  title: "Stripe Payout Calculator 2026 — Calculate Your Net Deposit | Free",
  description:
    "Calculate your exact Stripe payout. Enter any charge amount and see your net deposit after standard processing fees. Free, instant, no signup.",
  keywords: [
    "stripe payout calculator",
    "stripe net payout",
    "stripe deposit calculator",
    "calculate stripe payout",
    "stripe payout fees",
    "stripe net amount",
    "how much will stripe deposit",
    "stripe payout schedule",
  ],
  openGraph: {
    title: "Stripe Payout Calculator — Free & Instant",
    description:
      "Calculate your exact Stripe payout instantly. See your net deposit amount after standard processing fees.",
  },
  alternates: {
    canonical:
      "https://stripe-qb-converter.vercel.app/tools/stripe-payout-calculator",
  },
};

const faqs = [
  {
    q: "How does Stripe calculate my net payout?",
    a: "Stripe deducts their processing fee (typically 2.9% + $0.30 in the US) directly from the charge amount before sending the rest to your bank account. Your net payout is the gross amount minus this fee.",
  },
  {
    q: "When will I receive my Stripe payout?",
    a: "In the US, the standard Stripe payout schedule is 2 business days. In some countries it can take 3-7 days. High-risk businesses may have a 14-day rolling payout schedule.",
  },
  {
    q: "Can I receive payouts instantly?",
    a: "Yes, Stripe offers Instant Payouts for eligible businesses. This deposits funds to your debit card or bank account within 30 minutes, but costs an additional 1% of the payout volume.",
  },
  {
    q: "Why is my payout less than what my customer paid?",
    a: "Because Stripe deducts their processing fees automatically before depositing funds into your account. Use this calculator to see exactly how much will be deducted from your charges.",
  },
  {
    q: "How do I reconcile Stripe payouts in QuickBooks?",
    a: "In QuickBooks, you must record the full gross amount paid by the customer as revenue, and the Stripe fee as an expense. The remaining amount matches your bank deposit. Our free CSV converter handles this split automatically.",
  },
];

// JSON-LD structured data — makes Google show FAQ rich results in search


const toolSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Stripe Payout Calculator",
  description: metadata.description,
  url: "https://stripe-qb-converter.vercel.app/tools/stripe-payout-calculator",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function StripePayoutCalculatorPage() {
  return (
    <>
      {/* Structured data — not visible, read by Google */}
      <FaqSchema faqs={faqs} />
      <Script
        id="tool-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />

      <ToolLayout
        title="Stripe Payout Calculator"
        description="Calculate exactly how much Stripe will deposit into your bank account after standard transaction fees."
        faqs={faqs}
      >
        <StripePayoutCalculatorClient />
      </ToolLayout>
    </>
  );
}
