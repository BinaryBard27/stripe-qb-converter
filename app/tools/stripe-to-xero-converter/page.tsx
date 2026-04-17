import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeToXeroClient from "./StripeToXeroClient";

export const metadata: Metadata = {
  title: "Stripe to Xero CSV Converter — Free, Instant, No Signup",
  description:
    "Convert your Stripe CSV export to Xero-ready format instantly. Maps columns, fixes date formats, converts amounts, and categorises Stripe fees automatically. Free, browser-based, HMRC compliant.",
  keywords: [
    "stripe to xero",
    "stripe xero import",
    "stripe xero csv",
    "import stripe into xero",
    "stripe xero converter",
    "stripe xero integration free",
    "xero stripe csv import",
    "stripe export xero format",
    "stripe to xero free tool",
  ],
  openGraph: {
    title: "Stripe to Xero CSV Converter — Free & Instant",
    description: "Convert Stripe CSV exports to Xero format in seconds. No signup, no data stored, HMRC compliant.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-to-xero-converter",
  },
};

const faqs = [
  {
    q: "Can I import Stripe transactions directly into Xero?",
    a: "Not directly — Stripe's CSV export uses different column names, date formats (YYYY-MM-DD vs DD/MM/YYYY for UK Xero), and amounts in cents rather than pounds or dollars. This tool reformats your Stripe export into the exact format Xero's bank statement import expects.",
  },
  {
    q: "What format does Xero need for CSV bank imports?",
    a: "Xero's bank statement import requires: Date (DD/MM/YYYY for UK accounts), Amount (positive for credits, negative for debits), and Description. Optionally: Reference and Payee. Column headers must match exactly. This tool outputs the correct format automatically.",
  },
  {
    q: "Is this tool HMRC compliant for Making Tax Digital (MTD)?",
    a: "This tool helps you get your Stripe data into Xero, which is HMRC-recognised MTD-compatible software. Once your transactions are in Xero with proper categorisation, Xero handles the MTD digital links and quarterly HMRC submissions. The tool itself is a bridging step — Xero provides the MTD compliance.",
  },
  {
    q: "How do Stripe fees appear in Xero after importing?",
    a: "Stripe deducts fees before paying out, so your bank statement shows net amounts. This tool creates two entries per transaction: the gross revenue amount and a separate Stripe fee line. In Xero, categorise the fee lines as 'Bank Charges & Fees' expense account for correct P&L reporting.",
  },
  {
    q: "Does this work for Xero UK and Xero Global?",
    a: "Yes. The tool detects your preferred date format. UK Xero uses DD/MM/YYYY, while Xero Global (US, Australia, NZ) uses MM/DD/YYYY or YYYY-MM-DD depending on your regional settings. Select your region in the tool for the correct output format.",
  },
  {
    q: "What's the difference between this and the Stripe Xero integration?",
    a: "The official Stripe-Xero integration costs money and requires ongoing subscription access. This free tool is for businesses that export from Stripe monthly and import manually — a common workflow for small UK businesses that don't need real-time sync.",
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
  name: "Stripe to Xero CSV Converter",
  description: "Convert Stripe CSV exports to Xero bank import format instantly.",
  url: "https://stripe-qb-converter.vercel.app/tools/stripe-to-xero-converter",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
};

export default function StripeToXeroPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script id="tool-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <ToolLayout
        title="Stripe to Xero CSV Converter"
        description="Convert your Stripe export to Xero's bank import format in seconds. Correct date format, mapped columns, fees separated. Free, no signup, HMRC compliant."
        faqs={faqs}
      >
        <StripeToXeroClient />
      </ToolLayout>
    </>
  );
}
