import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import VatThresholdClient from "./VatThresholdClient";

export const metadata: Metadata = {
  title: "UK VAT Threshold Calculator 2026 — Do I Need to Register for VAT?",
  description:
    "Calculate if your UK business needs to register for VAT. The 2026 UK VAT threshold is £90,000 taxable turnover in a 12-month period. Free, instant, HMRC compliant.",
  keywords: [
    "vat threshold calculator uk",
    "do i need to register for vat uk",
    "uk vat threshold 2026",
    "vat registration threshold uk",
    "when to register for vat uk",
    "stripe income vat threshold",
    "vat threshold 90000",
    "making tax digital vat",
  ],
  openGraph: {
    title: "UK VAT Threshold Calculator 2026",
    description: "Find out if your UK business needs to register for VAT. Updated for the £90,000 threshold.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/vat-threshold-calculator-uk",
  },
};

const faqs = [
  {
    q: "What is the UK VAT threshold in 2026?",
    a: "The UK VAT registration threshold is £90,000 in taxable turnover over any rolling 12-month period. This threshold has been in place since April 2024 and applies through at least the 2026-27 tax year. If your taxable turnover exceeds £90,000, you must register for VAT within 30 days.",
  },
  {
    q: "Does Stripe income count towards the VAT threshold?",
    a: "Yes. All income received through Stripe from the sale of taxable goods and services counts towards your VAT threshold. This includes subscription revenue, one-time sales, and service fees. Stripe fees deducted before payout do not reduce your gross turnover for VAT purposes — HMRC looks at the full amount charged to customers.",
  },
  {
    q: "What happens if I exceed the VAT threshold?",
    a: "If you exceed £90,000 in taxable turnover in any 12-month rolling period, you must register for VAT with HMRC within 30 days of the end of the month you exceeded the threshold. Failure to register on time results in penalties. Once registered, you must charge VAT on your sales and submit VAT returns (quarterly under Making Tax Digital).",
  },
  {
    q: "Can I register for VAT voluntarily below the threshold?",
    a: "Yes. You can register for VAT voluntarily even if your turnover is below £90,000. This can be beneficial if your customers are VAT-registered businesses (they can reclaim the VAT), or if you have significant input VAT to reclaim on your business purchases.",
  },
  {
    q: "How does the VAT threshold work for Making Tax Digital (MTD)?",
    a: "All VAT-registered businesses must use MTD-compatible software to keep digital records and submit VAT returns electronically. This applies from your first VAT return after registration, regardless of turnover. If you're using Stripe and become VAT-registered, your Stripe transactions need to flow into MTD-compatible software like Xero, QuickBooks, or FreeAgent.",
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

export default function VatThresholdPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="UK VAT Threshold Calculator 2026"
        description="Enter your monthly revenue to see if you're approaching the £90,000 VAT registration threshold — and when you'll need to register."
        faqs={faqs}
      >
        <VatThresholdClient />
      </ToolLayout>
    </>
  );
}
