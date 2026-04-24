import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeCurrencyClient from "./StripeCurrencyClient";

export const metadata: Metadata = {
  title: "Stripe Currency Conversion Calculator — Multi-Currency Fee Calculator",
  description:
    "Calculate Stripe fees for multi-currency transactions including the 1% currency conversion fee. See exact costs when charging in a different currency than your settlement currency. Free, instant.",
  keywords: [
    "stripe currency conversion calculator",
    "stripe multi currency fees",
    "stripe currency conversion fee",
    "stripe foreign currency fee",
    "stripe international currency",
    "stripe currency fee calculator",
    "stripe charge different currency",
  ],
  openGraph: {
    title: "Stripe Currency Conversion Calculator",
    description: "Calculate Stripe fees for multi-currency transactions including the 1% conversion fee.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-currency-conversion-calculator",
  },
};

const faqs = [
  {
    q: "What does Stripe charge for currency conversion?",
    a: "Stripe charges an additional 1% on top of the standard processing fee when you charge in a currency different from your settlement currency. For example, a UK business (settling in GBP) charging a customer in USD would pay the standard card rate plus 1% for the conversion.",
  },
  {
    q: "How do I avoid Stripe's currency conversion fee?",
    a: "To avoid the 1% conversion fee: settle in the same currency you charge in, use Stripe's multi-currency settlement feature to hold balances in multiple currencies, or use Stripe's presentment currency feature to charge customers in their local currency while settling in yours efficiently.",
  },
  {
    q: "Does Stripe use the real exchange rate?",
    a: "Stripe uses a rate close to the mid-market rate but adds a 1% conversion fee. The exact rate is set daily by Stripe. For large volumes of currency conversion, this can add up significantly — which is why many high-volume merchants use separate FX services.",
  },
  {
    q: "What currencies does Stripe support?",
    a: "Stripe supports 135+ currencies for presentment (charging customers). Settlement currencies — what you can receive in your bank account — depend on your country. US accounts settle in USD, UK in GBP, EU in EUR, etc. Check Stripe's documentation for the full list.",
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

export default function StripeCurrencyPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Stripe Currency Conversion Calculator"
        description="Calculate the true cost of charging in a different currency on Stripe, including the 1% conversion fee on top of standard processing fees."
        faqs={faqs}
      >
        <StripeCurrencyClient />
      </ToolLayout>
    </>
  );
}
