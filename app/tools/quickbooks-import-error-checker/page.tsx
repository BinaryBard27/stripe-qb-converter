// app/tools/quickbooks-import-error-checker/page.tsx

import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import QuickBooksImportErrorCheckerClient from "./QuickBooksImportErrorCheckerClient";

export const metadata: Metadata = {
  title: "QuickBooks CSV Import Error Checker — Fix Import Errors Instantly",
  description:
    "Paste your CSV and instantly see why QuickBooks is rejecting it. Detects missing headers, wrong date formats, invalid amounts, duplicate IDs, and more. Free, no signup.",
  keywords: [
    "quickbooks csv import error",
    "quickbooks import not working",
    "quickbooks csv format",
    "quickbooks import rejected",
    "fix quickbooks csv",
    "quickbooks iif import error",
    "quickbooks won't import csv",
    "quickbooks csv columns",
  ],
  openGraph: {
    title: "QuickBooks CSV Import Error Checker — Free & Instant",
    description:
      "Paste your CSV and instantly see exactly why QuickBooks is rejecting it — with fixes.",
  },
  alternates: {
    canonical:
      "https://stripe-qb-converter.vercel.app/tools/quickbooks-import-error-checker",
  },
};

const faqs = [
  {
    q: "Why is QuickBooks rejecting my CSV import?",
    a: "The most common reasons are: wrong date format (QuickBooks requires MM/DD/YYYY, not YYYY-MM-DD), missing required columns (Date, Description, Amount are mandatory), amounts with currency symbols ($) instead of plain numbers, blank rows in the middle of your data, or duplicate transaction IDs. This tool detects all of these automatically.",
  },
  {
    q: "What date format does QuickBooks require for CSV imports?",
    a: "QuickBooks requires MM/DD/YYYY format (e.g. 03/15/2024). It will reject ISO format dates (2024-03-15), dates with dashes in wrong order, or dates with text month names (March 15, 2024). If you're exporting from Stripe, the dates are in YYYY-MM-DD format and need to be converted.",
  },
  {
    q: "What columns does QuickBooks need for a bank transaction import?",
    a: "QuickBooks Online bank imports require at minimum: Date, Description (or Payee), and Amount. Some formats also need a separate Debit/Credit column instead of a single Amount column. The column names must match exactly — QuickBooks is case-sensitive.",
  },
  {
    q: "Why does my Stripe CSV export not import into QuickBooks?",
    a: "Stripe CSV exports have 14+ columns with Stripe-specific naming that QuickBooks doesn't recognize. The dates are in epoch timestamp or ISO format, amounts are in cents (not dollars), and the column headers don't match what QuickBooks expects. Our Stripe → QuickBooks converter handles all of this automatically.",
  },
  {
    q: "How do I fix 'invalid amount' errors in QuickBooks CSV import?",
    a: "QuickBooks requires amounts as plain numbers with no currency symbols. Remove any $ signs, commas in large numbers (use 1000.00 not 1,000.00), and make sure negatives use a minus sign (-50.00), not parentheses (-50.00 not (50.00)). Also check that your decimal separator is a period, not a comma.",
  },
  {
    q: "Can I import a Stripe CSV directly into QuickBooks?",
    a: "Not directly — Stripe and QuickBooks use incompatible CSV formats. You need to reformat the Stripe export to match QuickBooks column names, convert date formats, convert amounts from cents to dollars, and map Stripe's fee data to the correct expense categories. Our free converter does all of this in one click.",
  },
];

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
  name: "QuickBooks CSV Import Error Checker",
  description: "Paste your CSV and instantly see why QuickBooks is rejecting it.",
  url: "https://stripe-qb-converter.vercel.app/tools/quickbooks-import-error-checker",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function QuickBooksImportErrorCheckerPage() {
  return (
    <>
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
        title="QuickBooks CSV Import Error Checker"
        description="Paste your CSV below and instantly see exactly why QuickBooks is rejecting it — with specific fixes for each error."
        faqs={faqs}
      >
        <QuickBooksImportErrorCheckerClient />
      </ToolLayout>
    </>
  );
}
