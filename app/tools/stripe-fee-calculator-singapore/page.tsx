import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeFeeSGClient from "./StripeFeeSGClient";

export const metadata: Metadata = {
  title: "Stripe Fee Calculator Singapore 2026 — SGD Fees | Free",
  description:
    "Calculate Stripe fees for Singapore businesses in SGD. Stripe SG charges 3.4% for domestic cards and 3.9% for international cards. See net payout instantly. Free, no signup.",
  keywords: [
    "stripe fee calculator singapore",
    "stripe fees singapore",
    "stripe singapore pricing 2026",
    "stripe sgd fees",
    "stripe singapore transaction fee",
    "stripe sg 3.4%",
    "how much does stripe charge singapore",
    "stripe fees sgd calculator",
    "stripe singapore gst",
  ],
  openGraph: {
    title: "Stripe Fee Calculator Singapore — SGD 2026",
    description: "Calculate Stripe SG fees instantly. 3.4% for domestic cards. Free, no signup.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-singapore",
  },
};

const faqs = [
  {
    q: "What are Stripe's fees in Singapore?",
    a: "Stripe Singapore charges 3.4% for domestic Singapore cards (Visa, Mastercard) with no fixed fee per transaction. For internationally-issued cards, the rate is 3.9%. Note that Singapore Stripe pricing uses a percentage-only model without the fixed per-transaction fee used in US/UK/AU.",
  },
  {
    q: "Does Stripe charge GST in Singapore?",
    a: "Stripe's processing fees are subject to Singapore GST (9% as of 2024) for GST-registered businesses. Stripe will apply GST on fees for Singapore accounts. GST-registered businesses can claim this back as input tax. Stripe provides tax invoices monthly.",
  },
  {
    q: "How do Stripe payouts work in Singapore?",
    a: "Stripe Singapore pays out to Singapore bank accounts in SGD on a 2-day rolling schedule for established accounts. New accounts start with a 7-day schedule. Payouts are processed via FAST (Fast And Secure Transfers) and typically arrive same day.",
  },
  {
    q: "Does Stripe support PayNow in Singapore?",
    a: "Yes. Stripe supports PayNow for Singapore businesses. PayNow transactions have a different fee structure — typically lower than card payments. Contact Stripe for current PayNow pricing as it may differ from standard card processing rates.",
  },
  {
    q: "Is Stripe or PayPal cheaper for Singapore businesses?",
    a: "Stripe Singapore (3.4% domestic) is generally cheaper than PayPal Singapore (3.9% + fixed fee for standard transactions). For international cards, they're more comparable. Stripe also has better API documentation and more payment method options for Singapore.",
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

export default function StripeFeeSGPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Stripe Fee Calculator Singapore"
        description="Calculate Stripe fees for Singapore businesses in SGD. See your net payout after fees — and what to charge to receive a specific amount after Stripe's 3.4% fee."
        faqs={faqs}
      >
        <StripeFeeSGClient />
      </ToolLayout>
    </>
  );
}
