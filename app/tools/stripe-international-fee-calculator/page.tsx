import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeInternationalFeeClient from "./StripeInternationalFeeClient";

export const metadata: Metadata = {
  title: "Stripe International Fee Calculator — Cross-Border Transaction Fees",
  description:
    "Calculate Stripe fees for international and cross-border transactions. Compare domestic vs international card rates, currency conversion fees, and net payouts. Free, instant, no signup.",
  keywords: [
    "stripe fee calculator international",
    "stripe international transaction fee",
    "stripe cross border fee",
    "stripe foreign card fee",
    "stripe currency conversion fee",
    "stripe international pricing",
    "stripe 3.9% international",
    "stripe non-us card fee",
  ],
  openGraph: {
    title: "Stripe International Fee Calculator",
    description: "Calculate Stripe fees for international cards and cross-border transactions instantly.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-international-fee-calculator",
  },
};

const faqs = [
  {
    q: "What does Stripe charge for international transactions?",
    a: "For US businesses, Stripe charges 3.9% + $0.30 for internationally-issued cards (non-US), compared to 2.9% + $0.30 for domestic US cards. This extra 1% covers the additional cost of processing cross-border payments.",
  },
  {
    q: "Does Stripe charge a currency conversion fee?",
    a: "Yes. If you charge in a currency different from your settlement currency, Stripe adds a 1% currency conversion fee on top of the transaction fee. For example, a US business charging in EUR would pay 2.9% + $0.30 + 1% currency conversion on a US card, or 3.9% + $0.30 + 1% on an international card.",
  },
  {
    q: "How do I know if a card is international on Stripe?",
    a: "Stripe automatically detects whether a card was issued outside your country. You can see this in your Stripe Dashboard under each payment's details. If the card's country differs from your account country, the international rate applies automatically.",
  },
  {
    q: "Can I pass international transaction fees to customers?",
    a: "Yes. Many businesses add a surcharge for international card payments. To do this, use Stripe Radar rules or your checkout flow to detect international cards and apply a different price. Alternatively, use the reverse calculator here to find what to charge to receive your target amount after international fees.",
  },
  {
    q: "What's the cheapest way to accept international payments with Stripe?",
    a: "To minimize fees: charge in your settlement currency (avoid the 1% conversion fee), use Stripe's local payment methods where available (these often have lower rates), and consider Stripe's optimised checkout which can route transactions more efficiently. For high international volume, contact Stripe for custom pricing.",
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

export default function StripeInternationalFeePage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Stripe International Fee Calculator"
        description="Calculate Stripe fees for international and cross-border transactions. Compare domestic vs international rates and see exactly what currency conversion costs you."
        faqs={faqs}
      >
        <StripeInternationalFeeClient />
      </ToolLayout>
    </>
  );
}
