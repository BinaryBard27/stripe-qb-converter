import { completeMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import ClientComponent from "./Client";
import { FaqSchema } from "@/components/FaqSchema";
import Link from "next/link";

export const metadata: Metadata = completeMetadata({
  title: "Stripe to Xero Import Error Checker",
  description: "Fix Xero CSV import errors from Stripe. Instantly identify missing headers, invalid amounts, and date format issues.",
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-xero-reconciliation-checker",
  },
});

const faqs = [
  {
    "q": "Why is Xero rejecting my Stripe CSV import?",
    "a": "Xero often rejects Stripe CSVs because the date format doesn't match Xero's strict requirements (e.g., DD/MM/YYYY vs YYYY-MM-DD), mandatory columns like 'Description' or 'Amount' are missing or misnamed, or amounts contain currency symbols instead of plain numbers."
  },
  {
    "q": "What format does Xero require for bank statement imports?",
    "a": "Xero requires a very specific CSV format with at minimum: Date, Amount, and Payee/Description columns. Dates must perfectly match the format specified in your Xero import settings, and amounts must be numerical."
  },
  {
    "q": "How can I avoid these import errors altogether?",
    "a": "Instead of manually fixing CSVs every time, you can use a dedicated Stripe to Xero converter which automatically transforms your raw Stripe data into a fully Xero-compliant bank statement file in one click."
  }
];

export default function Page() {
  return (
    <>
      <FaqSchema faqs={faqs} />
      <ToolLayout
        title="Stripe to Xero Import Error Checker"
        description="Fix Xero CSV import errors from Stripe. Instantly identify missing headers, invalid amounts, and date format issues."
        faqs={faqs}
      >
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">What this tool does</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">This checker helps you troubleshoot Xero CSV import failures. If Xero rejects your Stripe export, simply paste the CSV here. The tool will scan every row for common formatting issues—like incorrect date formats, missing mandatory columns, or invalid currency symbols—and provide step-by-step instructions on exactly how to fix the file for a successful Xero import.</p>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm border-t border-gray-100 pt-4 mt-2">
            <div className="text-gray-500 mb-3 sm:mb-0">
              <span className="font-medium">Last updated:</span> September 23, 2026
            </div>
            <div className="flex gap-4">
              <Link href="/tools" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                ← All Tools
              </Link>
              <Link href="/tools/stripe-bas-reporting-formatter" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Related Tool →
              </Link>
            </div>
          </div>
        </div>
        <ClientComponent />
      </ToolLayout>
    </>
  );
}
