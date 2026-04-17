import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import MtdBridgingClient from "./MtdBridgingClient";

export const metadata: Metadata = {
  title: "Stripe MTD Bridging Formatter — Making Tax Digital CSV for HMRC",
  description:
    "Format your Stripe transactions for Making Tax Digital (MTD) compliance. Converts Stripe exports to HMRC-compatible digital records with correct VAT categories. Free, HMRC compliant, no signup.",
  keywords: [
    "stripe mtd",
    "making tax digital stripe",
    "stripe hmrc csv",
    "mtd bridging software free",
    "stripe mtd compliant",
    "hmrc digital records stripe",
    "making tax digital sole trader stripe",
    "stripe vat records hmrc",
    "mtd csv formatter",
    "stripe hmrc bridging",
  ],
  openGraph: {
    title: "Stripe MTD Bridging Formatter — Free HMRC-Compatible Tool",
    description: "Convert Stripe exports to MTD-compliant digital records for HMRC. Free, no signup.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-mtd-bridging-formatter",
  },
};

const faqs = [
  {
    q: "What is Making Tax Digital (MTD) and does it affect my Stripe income?",
    a: "Making Tax Digital (MTD) is HMRC's programme requiring digital record-keeping and quarterly tax submissions. From April 6, 2026, sole traders and landlords with gross income over £50,000 must keep digital records and submit quarterly updates via MTD-compatible software. If you use Stripe to receive income, those transactions must be part of your digital records.",
  },
  {
    q: "Is Stripe MTD compliant?",
    a: "Stripe itself is not MTD software — it's a payment processor. However, you can make your Stripe income MTD compliant by importing your Stripe transactions into MTD-recognised software (like Xero, QuickBooks, FreeAgent, or bridging software like VitalTax). This tool formats your Stripe data correctly for that import step.",
  },
  {
    q: "What is MTD bridging software?",
    a: "MTD bridging software sits between your existing records (like a spreadsheet or exported CSV) and HMRC's systems. It reads your digital records and submits the required quarterly updates to HMRC. Examples include VitalTax, TaxCalc, and Absolute Tax. This tool formats your Stripe data so it's ready to feed into bridging software.",
  },
  {
    q: "What HMRC expense categories should Stripe fees go under?",
    a: "Stripe processing fees fall under 'Office costs' or 'Financial charges' in HMRC's self-assessment categories. For VAT-registered businesses using the standard VAT scheme, Stripe fees are input-taxed at the standard rate (20%). For the flat rate scheme, they're included in your flat rate turnover.",
  },
  {
    q: "Do I need to register for MTD if my Stripe income is under £50,000?",
    a: "From April 2026, the threshold is £50,000 gross income. From April 2027, it drops to £30,000. From April 2028, it's expected to cover all self-employed people and landlords. Even if you're below the threshold now, setting up digital records is good practice to avoid a last-minute scramble.",
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

export default function MtdBridgingPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Stripe MTD Bridging Formatter"
        description="Convert your Stripe export into MTD-compliant digital records for HMRC. Assigns HMRC expense categories, formats dates correctly, and outputs a bridging-software-ready CSV."
        faqs={faqs}
      >
        <MtdBridgingClient />
      </ToolLayout>
    </>
  );
}
