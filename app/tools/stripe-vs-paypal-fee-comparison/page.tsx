import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeVsPayPalClient from "./StripeVsPayPalClient";

export const metadata: Metadata = {
  title: "Stripe vs PayPal Fee Comparison Calculator — Which Costs Less?",
  description:
    "Compare Stripe and PayPal processing fees side by side. Enter your transaction amount and monthly volume to see exactly which payment processor saves you more money. Free, instant, no signup.",
  keywords: [
    "stripe vs paypal fees",
    "stripe vs paypal comparison",
    "stripe or paypal for small business",
    "stripe paypal fee calculator",
    "stripe vs paypal which is cheaper",
    "payment processor comparison",
    "stripe fees vs paypal fees",
  ],
  openGraph: {
    title: "Stripe vs PayPal Fee Calculator — Which Costs Less?",
    description: "Enter your transaction amount to see exactly which payment processor saves you more money.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-vs-paypal-fee-comparison",
  },
};

const faqs = [
  {
    q: "Are Stripe and PayPal fees the same?",
    a: "Stripe and PayPal have similar base rates (both around 2.9% + $0.30 for standard card transactions in the US), but differ in key ways. PayPal charges different rates depending on whether it's a PayPal Checkout payment or a card payment. Stripe's pricing is more transparent and consistent. For international transactions, Stripe typically charges 1.5% extra while PayPal charges 1.5% extra plus a fixed fee.",
  },
  {
    q: "Is Stripe cheaper than PayPal?",
    a: "For standard US card transactions, they're nearly identical (both 2.9% + $0.30). Stripe tends to be cheaper for high-volume merchants who qualify for custom pricing. PayPal can be cheaper for very small transaction volumes because of their micropayment pricing option. For international transactions, they're similar but vary by country.",
  },
  {
    q: "Does PayPal charge fees when you receive money?",
    a: "Yes. PayPal charges fees when you receive payments for goods and services. The standard rate is 3.49% + $0.49 for PayPal Checkout, or 2.99% + $0.49 for standard card transactions. Receiving money from friends and family (personal payments) is free in the US but not intended for business use.",
  },
  {
    q: "Which is better for small businesses — Stripe or PayPal?",
    a: "Stripe is generally better for businesses that need developer flexibility, subscription billing, or custom checkout flows. PayPal is better if your customers expect to pay with PayPal balances, or if you sell on platforms that prefer PayPal. For pure fee comparison, they're very similar at small volumes. Stripe pulls ahead at higher volumes with custom pricing.",
  },
  {
    q: "Does Stripe integrate better with QuickBooks than PayPal?",
    a: "Both Stripe and PayPal exports require reformatting before importing into QuickBooks — neither exports in a QuickBooks-ready format directly. Stripe's CSV export is more consistent and structured, making it easier to convert. Our free Stripe → QuickBooks converter handles this automatically for Stripe users.",
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
  name: "Stripe vs PayPal Fee Comparison Calculator",
  description: "Compare Stripe and PayPal processing fees side by side.",
  url: "https://stripe-qb-converter.vercel.app/tools/stripe-vs-paypal-fee-comparison",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function StripeVsPayPalPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script id="tool-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <ToolLayout
        title="Stripe vs PayPal Fee Comparison"
        description="Enter your transaction amount and monthly volume to see exactly which payment processor costs you less — with a side-by-side fee breakdown."
        faqs={faqs}
      >
        <StripeVsPayPalClient />
      </ToolLayout>
    </>
  );
}
