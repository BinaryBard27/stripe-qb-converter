import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeToFreeAgentClient from "./StripeToFreeAgentClient";

export const metadata: Metadata = {
  title: "Stripe to FreeAgent CSV Converter — Free Tool for NatWest & RBS Users",
  description:
    "Convert your Stripe CSV export to FreeAgent bank import format. Perfect for NatWest, Royal Bank of Scotland, and Mettle customers who get FreeAgent free. No signup, HMRC compliant.",
  keywords: [
    "stripe to freeagent",
    "stripe freeagent import",
    "stripe freeagent csv",
    "freeagent stripe transactions",
    "natwest freeagent stripe",
    "rbs freeagent stripe",
    "freeagent bank import csv",
    "stripe freeagent converter",
    "freeagent csv format",
    "import stripe freeagent",
  ],
  openGraph: {
    title: "Stripe to FreeAgent CSV Converter — Free",
    description: "Convert Stripe exports to FreeAgent bank import format. Perfect for NatWest and RBS customers.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-to-freeagent-converter",
  },
};

const faqs = [
  {
    q: "Who gets FreeAgent for free in the UK?",
    a: "FreeAgent is provided free to business banking customers of NatWest, Royal Bank of Scotland (RBS), Ulster Bank, and Mettle. If you have a business current account with any of these banks, you have free access to FreeAgent — making it one of the most widely-used accounting tools among UK small businesses.",
  },
  {
    q: "How do I import Stripe transactions into FreeAgent?",
    a: "FreeAgent accepts bank statement imports in OFX, QIF, or CSV format. For CSV, the required columns are: Date (DD/MM/YYYY), Description, and Amount (positive for money in, negative for money out). This tool converts your Stripe CSV export to this exact format.",
  },
  {
    q: "Does FreeAgent connect directly to Stripe?",
    a: "FreeAgent does not have a native Stripe integration. The standard workflow is: export from Stripe → convert CSV → import into FreeAgent as a bank statement. This tool automates the conversion step that would otherwise take 30-60 minutes of manual spreadsheet work.",
  },
  {
    q: "Is FreeAgent MTD compliant?",
    a: "Yes. FreeAgent is HMRC-recognised MTD-compatible software for both VAT returns and Income Tax (MTD for ITSA). If you're required to file under Making Tax Digital, importing your Stripe transactions into FreeAgent means they're part of your MTD-compliant digital records.",
  },
  {
    q: "How should Stripe fees be recorded in FreeAgent?",
    a: "In FreeAgent, Stripe fees should be categorised as 'Bank Charges' under the Expenses section. This tool creates separate fee lines in the CSV so you can easily identify and categorise them when reviewing your imported transactions in FreeAgent.",
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

export default function StripeToFreeAgentPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Stripe to FreeAgent CSV Converter"
        description="Convert your Stripe export to FreeAgent's bank import format. Perfect for NatWest, RBS, and Mettle customers who use FreeAgent free with their business account."
        faqs={faqs}
      >
        <StripeToFreeAgentClient />
      </ToolLayout>
    </>
  );
}
