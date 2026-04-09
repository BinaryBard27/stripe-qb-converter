import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import CsvColumnMapperClient from "./CsvColumnMapperClient";

export const metadata: Metadata = {
  title: "CSV Column Mapper — Map Any CSV to QuickBooks Format",
  description:
    "Paste any CSV and visually map its columns to QuickBooks import format. Fix column name mismatches instantly. Free, browser-based, no signup required.",
  keywords: [
    "csv column mapper",
    "map csv to quickbooks",
    "csv column mapping tool",
    "quickbooks csv columns",
    "rename csv columns",
    "csv header mapper",
    "fix csv columns quickbooks",
  ],
  openGraph: {
    title: "CSV Column Mapper — Map Any CSV to QuickBooks Format",
    description: "Paste your CSV, map columns to QuickBooks format, download the fixed file instantly.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/csv-column-mapper",
  },
};

const faqs = [
  {
    q: "Why do CSV column names matter for QuickBooks imports?",
    a: "QuickBooks expects specific column names for imports. If your CSV has 'Transaction Date' but QuickBooks needs 'Date', it will reject the import or map incorrectly. This tool lets you visually rename columns to match what QuickBooks expects.",
  },
  {
    q: "What column names does QuickBooks need?",
    a: "For bank transaction imports, QuickBooks Online needs: Date, Description (or Payee), and Amount. Some formats use separate Debit and Credit columns instead of a single Amount. The exact requirements depend on which import type you're using.",
  },
  {
    q: "Can I use this to fix a Stripe CSV export?",
    a: "For basic column remapping, yes. However, Stripe CSV exports also have issues with date formats, amounts in cents, and 14+ extra columns. For a complete Stripe → QuickBooks conversion, our main converter handles all of this automatically.",
  },
  {
    q: "Is my CSV data safe?",
    a: "Yes. All processing happens in your browser using JavaScript. Your CSV data is never uploaded to any server. Even if you're on public WiFi, your financial data stays on your device.",
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

export default function CsvColumnMapperPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="CSV Column Mapper"
        description="Paste your CSV, rename columns to match QuickBooks format, and download the fixed file. Browser-based, no data leaves your device."
        faqs={faqs}
      >
        <CsvColumnMapperClient />
      </ToolLayout>
    </>
  );
}
