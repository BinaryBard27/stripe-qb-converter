import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeCreditCardFeeClient from "./StripeCreditCardFeeClient";

export const metadata: Metadata = {
  title: "Stripe Credit Card Fee Calculator — Card Processing Fees by Card Type",
  description:
    "Calculate Stripe credit card processing fees by card type — Visa, Mastercard, Amex, international cards. See net payout and what to charge. Free, instant, no signup.",
  keywords: [
    "stripe credit card fees",
    "stripe credit card processing fee",
    "stripe visa fee",
    "stripe mastercard fee",
    "stripe amex fee",
    "stripe card processing fees",
    "how much does stripe charge for credit cards",
    "stripe credit card calculator",
  ],
  openGraph: {
    title: "Stripe Credit Card Fee Calculator",
    description: "Calculate Stripe credit card processing fees by card type. See exactly what Visa, Mastercard, and Amex cost you.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-credit-card-fee-calculator",
  },
};

const faqs = [
  {
    q: "Does Stripe charge different fees for different credit card types?",
    a: "Stripe charges the same base rate (2.9% + $0.30) for Visa, Mastercard, and Discover cards in the US. American Express is also 2.9% + $0.30 on Stripe's standard plan — unlike some other processors that charge more for Amex. International cards (issued outside the US) are 3.9% + $0.30.",
  },
  {
    q: "Does Stripe charge more for credit cards than debit cards?",
    a: "No. Stripe charges the same rate (2.9% + $0.30) for both credit and debit cards in the US. Some payment processors charge less for debit cards, but Stripe uses a flat rate regardless of whether the card is credit or debit.",
  },
  {
    q: "What is Stripe's Amex fee?",
    a: "Stripe charges 2.9% + $0.30 for American Express cards — the same as Visa and Mastercard. This is one of Stripe's advantages over many other processors, which typically charge 3.5% or more for Amex due to Amex's higher interchange rates.",
  },
  {
    q: "Can I pass credit card fees to customers on Stripe?",
    a: "Yes, with some restrictions. In the US, merchants can surcharge credit card transactions (typically 3-4%) but laws vary by state — surcharging is prohibited in some states. Debit card surcharging is prohibited federally. Always check your local laws. Use the reverse calculator here to find what to charge to net your target amount.",
  },
  {
    q: "How do Stripe credit card fees compare to Square and PayPal?",
    a: "All three charge approximately 2.9% + $0.30 for standard card transactions. The key differences: Stripe is more developer-friendly with better API; Square has better in-person hardware; PayPal has higher recognition from customers. For pure online card processing, fees are nearly identical.",
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

export default function StripeCreditCardFeePage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Stripe Credit Card Fee Calculator"
        description="Calculate Stripe credit card processing fees for Visa, Mastercard, Amex, and international cards. See net payout and compare card types side by side."
        faqs={faqs}
      >
        <StripeCreditCardFeeClient />
      </ToolLayout>
    </>
  );
}
