import { completeMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import ClientComponent from "./Client";
import { FaqSchema } from "@/components/FaqSchema";
import Link from "next/link";

export const metadata: Metadata = completeMetadata({
  title: "Stripe BAS Reporting Formatter",
  description: "Summarize the GST component of your Australian Stripe transactions for easy BAS filing.",
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-bas-reporting-formatter",
  },
});

const faqs = [
  {
    "q": "Where do I report Stripe fees on my BAS?",
    "a": "Stripe processing fees include GST in Australia. The total fees (including GST) should typically be reported at G11 (Non-capital purchases), and the GST component can be claimed back as an input tax credit at 1B."
  },
  {
    "q": "How does this tool calculate the GST on sales?",
    "a": "The tool assumes your domestic sales are GST-inclusive and calculates the GST component (1/11th of the total). You can adjust settings if you have a mix of GST-free and taxable sales."
  },
  {
    "q": "Is this tool a substitute for an accountant?",
    "a": "No. This tool helps format and summarize your Stripe data for easier data entry, but you should always verify the figures with your accountant or tax professional before submitting your final BAS to the ATO."
  }
];

export default function Page() {
  return (
    <>
      <FaqSchema faqs={faqs} />
      <ToolLayout
        title="Stripe BAS Reporting Formatter"
        description="Summarize the GST component of your Australian Stripe transactions for easy BAS filing."
        faqs={faqs}
      >
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">What this tool does</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">This tool simplifies your Australian Business Activity Statement (BAS) preparation by analyzing your Stripe exports. It calculates total GST-inclusive sales (G1) and extracts the GST you paid on Stripe processing fees, providing you with the exact figures needed for your ATO filing without having to manually calculate GST components row by row.</p>
          
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
