import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeRefundImpactClient from "./StripeRefundImpactClient";

export const metadata: Metadata = {
  title: "Stripe Refund Impact Calculator — True Cost of Stripe Refunds",
  description:
    "Calculate the true cost of issuing a Stripe refund. Stripe keeps the processing fee even when you refund — see exactly how much each refund really costs you. Free, instant, no signup.",
  keywords: [
    "stripe refund fee",
    "does stripe refund processing fees",
    "stripe refund cost",
    "stripe keeps fee on refund",
    "stripe refund calculator",
    "stripe refund processing fee",
    "true cost stripe refund",
  ],
  openGraph: {
    title: "Stripe Refund Impact Calculator — True Cost of Refunds",
    description:
      "Stripe keeps the 2.9% + $0.30 fee even when you refund. See exactly what each refund really costs your business.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-refund-impact-calculator",
  },
};

const faqs = [
  {
    q: "Does Stripe refund the processing fee when I issue a refund?",
    a: "No. When you issue a refund, Stripe refunds the original payment amount to your customer but keeps the processing fee (2.9% + $0.30). This means a refund costs you more than just the sale amount — you also permanently lose the transaction fee.",
  },
  {
    q: "How much does a Stripe refund actually cost me?",
    a: "A refund costs you the original transaction fee plus the refunded amount. For a $100 sale, Stripe charges $3.20 in fees. When you refund, you pay back $100 to the customer but Stripe keeps the $3.20. Your true cost is $103.20 — not just $100.",
  },
  {
    q: "Does Stripe charge an additional fee for refunds?",
    a: "Stripe does not charge an extra fee specifically for issuing a refund. However, they do not return the original processing fee either. The net effect is the same — you lose the original fee on top of the refunded amount.",
  },
  {
    q: "What happens with Stripe fees if a refund is disputed?",
    a: "If a customer disputes a charge (chargeback), Stripe charges an additional $15 dispute fee on top of the lost processing fee. If you win the dispute, the $15 is refunded. If you lose, you pay the $15 plus forfeit the original transaction amount and processing fee.",
  },
  {
    q: "How should I record Stripe refunds in QuickBooks?",
    a: "In QuickBooks, a Stripe refund should be recorded as a reduction in revenue (credit memo or refund receipt) for the full original amount. The Stripe fee that was kept should remain as a bank service charge expense — do not try to reverse it. Our free Stripe → QuickBooks converter handles this mapping automatically.",
  },
  {
    q: "How can I reduce the impact of Stripe refunds on my business?",
    a: "A few strategies: build refund costs into your pricing, use Stripe Radar to reduce fraudulent transactions that lead to refunds, set clear refund policies to reduce legitimate refund requests, and track your refund rate monthly in QuickBooks to catch patterns early.",
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
  name: "Stripe Refund Impact Calculator",
  description: "Calculate the true cost of issuing a Stripe refund.",
  url: "https://stripe-qb-converter.vercel.app/tools/stripe-refund-impact-calculator",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function StripeRefundImpactPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script id="tool-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <ToolLayout
        title="Stripe Refund Impact Calculator"
        description="Stripe keeps the processing fee even when you issue a refund. See exactly what each refund really costs your business — not just the sale amount."
        faqs={faqs}
      >
        <StripeRefundImpactClient />
      </ToolLayout>
    </>
  );
}
