// app/tools/stripe-fee-calculator/page.tsx
// Server component — handles SEO metadata and structured data.
// Interactive logic lives in StripeFeeCalculatorClient.tsx.

import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeFeeCalculatorClient from "./StripeFeeCalculatorClient";

export const metadata: Metadata = {
  title: "Stripe Fee Calculator — Calculate Stripe Transaction Costs Instantly",
  description:
    "Calculate exactly how much Stripe charges per transaction (2.9% + $0.30). See your net payout, total fees, and what to charge to receive a specific amount. Free, instant, no signup.",
  keywords: [
    "stripe fee calculator",
    "stripe transaction fee",
    "stripe processing fee",
    "how much does stripe charge",
    "stripe fees 2024",
    "stripe net payout calculator",
    "stripe charge to receive amount",
    "stripe fee percentage",
  ],
  openGraph: {
    title: "Stripe Fee Calculator — Free & Instant",
    description:
      "Calculate Stripe fees instantly. See your net payout and what to charge to receive a specific amount after fees.",
  },
  alternates: {
    canonical:
      "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator",
  },
};

const faqs = [
  {
    q: "What is Stripe's standard transaction fee?",
    a: "Stripe charges 2.9% + $0.30 per successful card transaction in the US. For international cards, the rate is 3.9% + $0.30. For manually entered card numbers, it's 3.4% + $0.30.",
  },
  {
    q: "Does Stripe refund fees when I issue a refund?",
    a: "No. When you issue a refund, Stripe does not return the original processing fee. You lose 2.9% + $0.30 on every refunded transaction on top of the refunded amount. The true cost of a refund is the sale amount plus the original fee.",
  },
  {
    q: "How do I calculate what to charge so I receive a specific amount?",
    a: "Use the reverse calculator on this page. To receive $X after Stripe fees, charge: (X + $0.30) / (1 - 0.029). For example, to receive exactly $100, you need to charge $103.09.",
  },
  {
    q: "How do Stripe fees work for subscriptions?",
    a: "Stripe charges the same 2.9% + $0.30 per transaction for subscription billing. There is no volume discount at the standard tier. For high-volume merchants (typically $80K+/month), you can contact Stripe for custom pricing.",
  },
  {
    q: "How do I track Stripe fees in QuickBooks?",
    a: "Stripe fees should be recorded as a bank service charge or merchant fee expense in QuickBooks. Each payout needs to be split between gross revenue and the Stripe fee deduction. Our free Stripe → QuickBooks converter does this automatically.",
  },
  {
    q: "What's the difference between Stripe's gross and net payout?",
    a: "Gross is the total amount your customer paid. Net is what Stripe deposits into your bank account after deducting their processing fee. QuickBooks needs to record both: the full gross as revenue, and the fee as a separate expense.",
  },
];

// JSON-LD structured data — makes Google show FAQ rich results in search
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const toolSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Stripe Fee Calculator",
  description: metadata.description,
  url: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function StripeFeeCalculatorPage() {
  return (
    <>
      {/* Structured data — not visible, read by Google */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="tool-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />

      <ToolLayout
        title="Stripe Fee Calculator"
        description="See exactly how much Stripe takes from every transaction — and what you need to charge to receive a specific amount after fees."
        faqs={faqs}
      >
        <StripeFeeCalculatorClient />
      </ToolLayout>
    </>
  );
}
