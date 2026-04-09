import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import ChartOfAccountsClient from "./ChartOfAccountsClient";

export const metadata: Metadata = {
  title: "QuickBooks Chart of Accounts Generator — Free COA Template",
  description:
    "Generate a QuickBooks chart of accounts template for your business type. Get the right account categories for your industry, ready to import into QuickBooks. Free, instant, no signup.",
  keywords: [
    "quickbooks chart of accounts template",
    "quickbooks chart of accounts small business",
    "chart of accounts generator",
    "quickbooks coa setup",
    "quickbooks accounts list",
    "quickbooks chart of accounts saas",
    "quickbooks stripe categories",
  ],
  openGraph: {
    title: "QuickBooks Chart of Accounts Generator",
    description: "Generate a QuickBooks chart of accounts template for your business type — free, instant download.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/quickbooks-chart-of-accounts-generator",
  },
};

const faqs = [
  {
    q: "What is a chart of accounts in QuickBooks?",
    a: "A chart of accounts (COA) is the complete list of financial accounts in your QuickBooks file — categories for revenue, expenses, assets, and liabilities. Every transaction gets assigned to an account. A well-organized COA makes your reports meaningful and your tax prep much easier.",
  },
  {
    q: "What accounts should I set up in QuickBooks for Stripe payments?",
    a: "For Stripe users, you need at minimum: a Stripe account (bank-type asset account to track your Stripe balance), a Sales Revenue account, a Stripe Processing Fees expense account, and your main bank account. When Stripe pays out, you record a transfer from Stripe to bank. Our converter maps these automatically.",
  },
  {
    q: "How do I import a chart of accounts into QuickBooks?",
    a: "In QuickBooks Online: go to Accounting → Chart of Accounts → Import. Upload the CSV file from this generator. QuickBooks will map the columns automatically. You can also add accounts manually one by one, but importing is faster for setting up a new file.",
  },
  {
    q: "What's the difference between account types in QuickBooks?",
    a: "QuickBooks has five main account types: Assets (what you own — bank accounts, receivables), Liabilities (what you owe — loans, credit cards), Equity (owner's stake), Income (revenue), and Expenses (costs). Getting these right is critical because they determine which financial statements accounts appear on.",
  },
  {
    q: "Should I use sub-accounts in QuickBooks?",
    a: "Sub-accounts help you track details within a category. For example, an Expenses parent account with sub-accounts for Software, Marketing, and Contractor Payments. This gives you both a detailed view and a rolled-up summary. For Stripe fees specifically, use a sub-account under Bank Service Charges.",
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

export default function ChartOfAccountsPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="QuickBooks Chart of Accounts Generator"
        description="Select your business type and get a ready-to-import QuickBooks chart of accounts template — with the right categories for your industry."
        faqs={faqs}
      >
        <ChartOfAccountsClient />
      </ToolLayout>
    </>
  );
}
