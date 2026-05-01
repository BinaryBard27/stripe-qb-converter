import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeFeeAustraliaClient from "./StripeFeeAustraliaClient";

export const metadata: Metadata = {
  title: "Stripe Fee Calculator Australia — AUD Transaction Fees 2026",
  description:
    "Calculate Stripe fees for Australian businesses in AUD. Stripe Australia charges 1.7% + A$0.30 for domestic cards. See your net payout instantly. Free, no signup.",
  keywords: [
    "stripe fee calculator australia",
    "stripe fees australia",
    "stripe australia pricing",
    "stripe aud fees",
    "stripe australia transaction fee",
    "stripe fee calculator aud",
    "how much does stripe charge australia",
    "stripe australia 1.7%",
    "stripe fees nz",
    "stripe fee calculator nz",
  ],
  openGraph: {
    title: "Stripe Fee Calculator Australia — AUD Fees 2026",
    description: "Calculate Stripe fees for Australian businesses. 1.7% + A$0.30 for domestic cards. Free, instant.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-australia",
  },
};

const faqs = [
  {
    q: "What are Stripe's fees in Australia?",
    a: "Stripe Australia charges 1.7% + A$0.30 for domestic Australian cards (Visa, Mastercard). For internationally-issued cards (non-Australian), the rate is 3.5% + A$0.30. These are Stripe's standard published rates for Australian accounts as of 2026.",
  },
  {
    q: "Does Stripe charge GST in Australia?",
    a: "Stripe's processing fees are subject to Australian GST (10%) for Australian businesses registered for GST. This means the effective cost is 10% higher than the published rate. Stripe provides a monthly tax invoice that GST-registered businesses can use to claim the GST back as an input tax credit.",
  },
  {
    q: "Is Stripe available in New Zealand?",
    a: "Yes. Stripe NZ charges 2.7% + NZ$0.30 for domestic New Zealand cards and 3.7% + NZ$0.30 for international cards. New Zealand accounts settle in NZD. This tool includes NZD as a calculation option.",
  },
  {
    q: "How do Stripe payouts work in Australia?",
    a: "Stripe Australia pays out on a 2-day rolling schedule for established accounts. Payouts go to your Australian bank account in AUD. New accounts start with a 7-day schedule. Stripe uses the NPP (New Payments Platform) for fast bank transfers.",
  },
  {
    q: "How do I record Stripe fees in Australian accounting software?",
    a: "In Xero (the most popular Australian accounting platform), Stripe fees should be categorised as Bank Charges under your expenses. Record the gross transaction amount as income, and the Stripe fee as a separate expense. Our free Stripe → QuickBooks/Xero converter handles this mapping automatically.",
  },
  {
    q: "Is Stripe cheaper than Square or PayPal in Australia?",
    a: "Stripe Australia (1.7% + A$0.30) is generally cheaper than PayPal (2.6% + A$0.30 for standard cards) and competitive with Square (1.9% flat for card present, 2.2% for online). For international cards, all three are similar. Stripe has the most developer-friendly API of the three.",
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

const toolSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Stripe Fee Calculator Australia",
  description: "Calculate Stripe processing fees for Australian businesses in AUD.",
  url: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-australia",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "AUD" },
};

export default function StripeFeeAustraliaPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script id="tool-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <ToolLayout
        title="Stripe Fee Calculator Australia"
        description="Calculate Stripe fees for Australian and New Zealand businesses. See your net payout in AUD or NZD — and what to charge to receive a specific amount after fees."
        faqs={faqs}
      >
        <StripeFeeAustraliaClient />
      </ToolLayout>
    </>
  );
}
