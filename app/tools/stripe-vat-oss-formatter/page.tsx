import { completeMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import ClientComponent from "./Client";
import { FaqSchema } from "@/components/FaqSchema";
import Link from "next/link";

export const metadata: Metadata = completeMetadata({
  title: "Stripe VAT OSS Formatter",
  description: "Format Stripe transactions for EU One-Stop-Shop (OSS) VAT filing. Group sales by country and calculate VAT automatically.",
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-vat-oss-formatter",
  },
});

const faqs = [
  {
    "q": "What is the EU VAT OSS scheme?",
    "a": "The One-Stop-Shop (OSS) allows businesses selling digital services or goods to consumers across the EU to register for VAT in just one member state and declare all their pan-EU sales in a single quarterly return."
  },
  {
    "q": "How does this tool help with OSS returns?",
    "a": "An OSS return requires you to report total sales value broken down by the customer's country and the applicable VAT rate. This tool parses your Stripe transactions, identifies the country for each sale, and aggregates the totals into the exact format needed for filing."
  },
  {
    "q": "What Stripe export do I need to use?",
    "a": "You should export your 'Balance History' or 'Payments' CSV from the Stripe dashboard. Ensure that the export includes customer billing country data so the tool can accurately group the transactions."
  }
];

export default function Page() {
  return (
    <>
      <FaqSchema faqs={faqs} />
      <ToolLayout
        title="Stripe VAT OSS Formatter"
        description="Format Stripe transactions for EU One-Stop-Shop (OSS) VAT filing. Group sales by country and calculate VAT automatically."
        faqs={faqs}
      >
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">What this tool does</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">This formatter automatically groups your Stripe transactions by EU customer country, separating them by different VAT rates. It takes your standard Stripe export CSV and transforms it into a clean summary report that perfectly matches the format required for filing your quarterly EU One-Stop-Shop (OSS) VAT return, saving hours of manual spreadsheet work.</p>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm border-t border-gray-100 pt-4 mt-2">
            <div className="text-gray-500 mb-3 sm:mb-0">
              <span className="font-medium">Last updated:</span> September 23, 2026
            </div>
            <div className="flex gap-4">
              <Link href="/tools" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                ← All Tools
              </Link>
              <Link href="/tools/stripe-1099k-reconciliation-checker" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
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
