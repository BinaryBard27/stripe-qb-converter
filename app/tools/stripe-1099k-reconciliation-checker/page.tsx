import { completeMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import ClientComponent from "./Client";
import { FaqSchema } from "@/components/FaqSchema";
import Link from "next/link";

export const metadata: Metadata = completeMetadata({
  title: "Stripe 1099-K Reconciliation Checker",
  description: "Easily reconcile your Stripe 1099-K reported gross volume against your actual bank payouts by analyzing fees, refunds, and adjustments.",
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-1099k-reconciliation-checker",
  },
});

const faqs = [
  {
    "q": "Why doesn't my Stripe 1099-K match my bank payouts?",
    "a": "Your Form 1099-K reports gross payment volume before Stripe's processing fees and refunds are deducted. Your bank payouts are net of these fees and refunds, creating a significant gap between reported income and actual cash received."
  },
  {
    "q": "How do I reconcile my 1099-K for my tax return?",
    "a": "You must report the gross 1099-K amount as your top-line revenue, and then deduct Stripe processing fees and customer refunds as business expenses on your Schedule C or corporate tax return to arrive at your true net taxable income."
  },
  {
    "q": "Does this tool store my financial data?",
    "a": "No. The reconciliation calculation runs entirely in your browser. Your CSV file is never uploaded to any server, ensuring your financial data remains 100% private and secure."
  }
];

export default function Page() {
  return (
    <>
      <FaqSchema faqs={faqs} />
      <ToolLayout
        title="Stripe 1099-K Reconciliation Checker"
        description="Easily reconcile your Stripe 1099-K reported gross volume against your actual bank payouts by analyzing fees, refunds, and adjustments."
        faqs={faqs}
      >
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">What this tool does</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">This tool helps US merchants understand the gap between the gross volume reported on their Stripe Form 1099-K and their actual bank deposits. It reads your Stripe balance history CSV, calculates the exact totals for gross sales, fees, and refunds, and provides a clear reconciliation report so you can confidently file your taxes without overreporting income.</p>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm border-t border-gray-100 pt-4 mt-2">
            <div className="text-gray-500 mb-3 sm:mb-0">
              <span className="font-medium">Last updated:</span> September 23, 2026
            </div>
            <div className="flex gap-4">
              <Link href="/tools" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                ← All Tools
              </Link>
              <Link href="/tools/stripe-xero-reconciliation-checker" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
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
