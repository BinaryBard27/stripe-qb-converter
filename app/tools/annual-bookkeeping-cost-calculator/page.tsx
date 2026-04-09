import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import AnnualBookkeepingCostClient from "./AnnualBookkeepingCostClient";

export const metadata: Metadata = {
  title: "Annual Bookkeeping Cost Calculator — How Much Does Bookkeeping Cost?",
  description:
    "Calculate the true annual cost of bookkeeping for your small business. Compare DIY, hiring a bookkeeper, and using software. Free, instant, no signup.",
  keywords: [
    "how much does bookkeeping cost",
    "bookkeeping cost small business",
    "annual bookkeeping cost calculator",
    "bookkeeper cost per month",
    "diy bookkeeping vs hiring bookkeeper",
    "quickbooks bookkeeping cost",
  ],
  openGraph: {
    title: "Annual Bookkeeping Cost Calculator",
    description: "Compare the true cost of DIY bookkeeping vs hiring a bookkeeper vs software.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/annual-bookkeeping-cost-calculator",
  },
};

const faqs = [
  {
    q: "How much does a bookkeeper cost per month?",
    a: "A freelance bookkeeper typically costs $300-800/month for basic services (transaction categorization, reconciliation, monthly reports). Full-charge bookkeepers who handle payroll and more complex tasks cost $800-2,000/month. Virtual bookkeeping services like Bench or Bookkeeper360 charge $299-599/month.",
  },
  {
    q: "Is DIY bookkeeping worth it for small businesses?",
    a: "DIY bookkeeping makes sense if you have fewer than 100 transactions per month, your time is worth less than $50/hour, and your books are simple (one revenue stream, no inventory). Above those thresholds, the time cost of DIY usually exceeds what a bookkeeper would charge.",
  },
  {
    q: "What is the cheapest way to do bookkeeping?",
    a: "The cheapest approach for most small businesses is QuickBooks Self-Employed ($15/month) plus free automation tools for imports. Using free tools like our Stripe → QuickBooks converter to automate transaction imports reduces the time cost of DIY to 1-2 hours/month.",
  },
  {
    q: "Does QuickBooks replace a bookkeeper?",
    a: "QuickBooks is a tool, not a bookkeeper. It can automate transaction imports, generate reports, and categorize expenses — but someone still needs to review categorizations, reconcile accounts, and interpret the numbers. QuickBooks reduces bookkeeping time but doesn't eliminate the need for financial oversight.",
  },
  {
    q: "What's included in basic bookkeeping services?",
    a: "Basic bookkeeping typically includes: monthly transaction categorization, bank reconciliation, accounts payable/receivable tracking, monthly financial reports (P&L, balance sheet), and year-end preparation for your accountant. Payroll, tax filing, and CFO-level analysis are usually separate services.",
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

export default function AnnualBookkeepingCostPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Annual Bookkeeping Cost Calculator"
        description="See the true annual cost of bookkeeping for your business — and compare DIY, hiring a bookkeeper, and using software."
        faqs={faqs}
      >
        <AnnualBookkeepingCostClient />
      </ToolLayout>
    </>
  );
}
