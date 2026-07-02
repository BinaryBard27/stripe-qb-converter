import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import { FaqSchema } from "@/components/FaqSchema";

export const metadata: Metadata = {
  title: "Export Stripe to QuickBooks — Free Converter, Instant, No Signup",
  description:
    "Export your Stripe transactions to QuickBooks in seconds. Free browser-based converter maps columns, fixes dates, converts amounts, separates fees. No signup, no data stored.",
  keywords: [
    "export stripe to quickbooks",
    "stripe to quickbooks export",
    "stripe export quickbooks import",
    "how to export stripe to quickbooks",
    "stripe csv to quickbooks",
    "stripe quickbooks export",
    "download stripe transactions quickbooks",
    "stripe to quickbooks free",
    "stripe quickbooks csv converter",
    "import stripe into quickbooks",
  ],
  openGraph: {
    title: "Export Stripe to QuickBooks — Free & Instant",
    description: "Convert your Stripe CSV export to QuickBooks format instantly. Free, no signup, no data stored.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/export-stripe-to-quickbooks",
  },
};

const faqs = [
  {
    q: "How do I export Stripe transactions to QuickBooks?",
    a: "Stripe doesn't export in QuickBooks format directly. The process is: (1) Go to Stripe Dashboard → Reports → Balance or Payments → Export as CSV. (2) Use our free converter to reformat the CSV — it fixes date formats, maps column names, converts amounts from cents to dollars, and separates fees. (3) In QuickBooks, go to Banking → Upload transactions → import the converted file.",
  },
  {
    q: "Why can't I import Stripe CSV directly into QuickBooks?",
    a: "Stripe and QuickBooks use incompatible formats. Stripe exports 14+ columns with names like 'Created (UTC)', amounts in cents, and ISO dates (YYYY-MM-DD). QuickBooks needs columns named 'Date', 'Description', 'Amount' with MM/DD/YYYY dates and dollar amounts. Our converter bridges this gap automatically.",
  },
  {
    q: "Does QuickBooks have a native Stripe integration?",
    a: "QuickBooks offers a paid Stripe connector through the QuickBooks App Store, but it requires a monthly subscription. For businesses that export monthly, our free manual conversion tool is a cost-free alternative that takes under 30 seconds.",
  },
  {
    q: "How do Stripe fees appear in QuickBooks after importing?",
    a: "Our converter creates two entries per transaction: the gross revenue amount and a separate Stripe fee line. In QuickBooks, categorise the fee lines as 'Bank Service Charges' or 'Merchant Fees' under expenses. This gives you accurate P&L reporting with both gross revenue and fee expenses correctly recorded.",
  },
  {
    q: "Which QuickBooks versions support CSV import?",
    a: "QuickBooks Online (all tiers), QuickBooks Desktop Pro/Premier/Enterprise, and QuickBooks Self-Employed all support CSV bank imports. The import path varies: Online uses Banking → Upload transactions, Desktop uses File → Utilities → Import → Excel Files.",
  },
  {
    q: "Is my Stripe data safe when using this converter?",
    a: "Yes — completely. The entire conversion happens in your browser using JavaScript. Your Stripe CSV never leaves your device or gets uploaded to any server. Even if you're on public Wi-Fi, your financial data stays local. We have no backend database.",
  },
  {
    q: "How often should I export Stripe to QuickBooks?",
    a: "Most small businesses export monthly — matching their bank reconciliation cycle. Export at the start of each month for the previous month's transactions. Some businesses export weekly for more real-time bookkeeping. The frequency should match your QuickBooks reconciliation schedule.",
  },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Export Stripe to QuickBooks",
  description: "Convert your Stripe CSV export to QuickBooks format in 3 steps",
  step: [
    {
      "@type": "HowToStep",
      name: "Export from Stripe",
      text: "Go to Stripe Dashboard → Reports → Balance → Export. Select your date range and download as CSV.",
    },
    {
      "@type": "HowToStep",
      name: "Convert the CSV",
      text: "Use our free converter below. It maps columns, fixes date formats, converts amounts from cents to dollars, and separates fees automatically.",
    },
    {
      "@type": "HowToStep",
      name: "Import into QuickBooks",
      text: "In QuickBooks Online: Banking → Upload transactions. In QuickBooks Desktop: File → Utilities → Import. Upload the converted CSV and match the columns.",
    },
  ],
};

export default function ExportStripeToQuickBooksPage() {
  return (
    <>
      <FaqSchema faqs={faqs} />
      <Script id="howto-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <ToolLayout
        title="Export Stripe to QuickBooks"
        description="The complete guide to exporting Stripe transactions to QuickBooks — with a free converter that does it in seconds."
        faqs={faqs}
      >
        <ExportStripeContent />
      </ToolLayout>
    </>
  );
}

function ExportStripeContent() {
  return (
    <div className="space-y-6">

      {/* How it works */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">3 Steps to Export Stripe → QuickBooks</h2>

        {[
          {
            step: "1",
            title: "Export from Stripe Dashboard",
            desc: "Stripe Dashboard → Reports → Balance (or Payments) → Export → CSV. Select your date range — usually the previous month.",
            tip: "Tip: Use Balance transactions, not Payments — it includes fees and net amounts.",
            color: "bg-blue-50 border-blue-200",
            numColor: "bg-blue-600",
          },
          {
            step: "2",
            title: "Convert with our free tool",
            desc: "Our converter maps Stripe's 14 columns to QuickBooks format automatically. Dates convert from YYYY-MM-DD to MM/DD/YYYY. Amounts convert from cents to dollars. Fees get separated into their own lines.",
            tip: "Tip: No signup required. Your data never leaves your browser.",
            color: "bg-green-50 border-green-200",
            numColor: "bg-green-600",
          },
          {
            step: "3",
            title: "Import into QuickBooks",
            desc: "QuickBooks Online: Banking → Upload transactions → select your Stripe account → upload CSV → match columns. QuickBooks Desktop: File → Utilities → Import → Excel Files.",
            tip: "Tip: Categorise fee lines as 'Bank Service Charges' when reviewing imported transactions.",
            color: "bg-purple-50 border-purple-200",
            numColor: "bg-purple-600",
          },
        ].map((s) => (
          <div key={s.step} className={`border rounded-xl p-4 ${s.color}`}>
            <div className="flex items-start gap-3">
              <span className={`w-7 h-7 rounded-full ${s.numColor} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`}>{s.step}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">{s.desc}</p>
                <p className="text-gray-500 text-xs mt-2 italic">{s.tip}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA to main converter */}
      <div className="bg-gray-900 rounded-xl p-6 text-center">
        <p className="text-white font-bold text-lg mb-2">Ready to convert your Stripe CSV?</p>
        <p className="text-gray-400 text-sm mb-4">Our free converter handles steps 2 automatically. Paste your CSV, download QuickBooks-ready file. 10 seconds.</p>
        <Link href="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Open Free Stripe → QuickBooks Converter
        </Link>
        <p className="text-gray-500 text-xs mt-3">Free forever · No signup · Browser-side only · No data stored</p>
      </div>

      {/* What gets converted */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-medium text-gray-700">What the converter fixes automatically</h3>
        </div>
        <div className="divide-y divide-gray-100 text-sm">
          {[
            { problem: "Date format: 2024-03-15", fix: "→ 03/15/2024 (QuickBooks format)" },
            { problem: "Amount: 2999 (cents)", fix: "→ 29.99 (dollars)" },
            { problem: "Column: 'Created (UTC)'", fix: "→ 'Date'" },
            { problem: "Column: 'Description'", fix: "→ 'Description' (mapped correctly)" },
            { problem: "Fees mixed into amount", fix: "→ Separated into own lines" },
            { problem: "14 Stripe-specific columns", fix: "→ 6 QuickBooks columns only" },
          ].map((row) => (
            <div key={row.problem} className="flex justify-between px-4 py-2.5 items-center">
              <span className="text-red-500 font-mono text-xs">{row.problem}</span>
              <span className="text-green-600 text-xs font-medium">{row.fix}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Related tools */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Related free tools</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: "/tools/quickbooks-import-error-checker", label: "QB Import Error Checker" },
            { href: "/tools/stripe-fee-calculator", label: "Stripe Fee Calculator" },
            { href: "/tools/stripe-to-xero-converter", label: "Stripe to Xero Converter" },
            { href: "/tools/csv-column-mapper", label: "CSV Column Mapper" },
          ].map((t) => (
            <Link key={t.href} href={t.href}
              className="text-sm text-blue-600 hover:text-blue-700 border border-blue-100 rounded-lg px-3 py-2 bg-blue-50/50 hover:bg-blue-50 transition-colors">
              → {t.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
