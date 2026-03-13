// app/tools/page.tsx
// Lives at: stripe-qb-converter.vercel.app/tools
// Add new tool slugs to the `tools` array as you build them.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Stripe & QuickBooks Tools — Calculators & Converters",
  description:
    "Free tools for Stripe and QuickBooks users. Calculate fees, reconcile transactions, fix CSV imports, and more. No signup required.",
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools",
  },
};

// ── ADD NEW TOOLS HERE — the page builds itself ──────────────────────────────
const tools = [
  {
    slug: "stripe-fee-calculator",
    name: "Stripe Fee Calculator",
    description:
      "Calculate exactly how much Stripe charges per transaction — and what you need to charge to receive a specific amount after fees.",
    badge: "Most Popular",
    badgeColor: "bg-blue-100 text-blue-700",
    icon: "💳",
  },
  // Uncomment as you build each one:
  // {
  //   slug: "quickbooks-import-error-checker",
  //   name: "QuickBooks CSV Import Error Checker",
  //   description: "Paste your CSV and instantly see why QuickBooks is rejecting it.",
  //   icon: "🔍",
  // },
  // {
  //   slug: "stripe-payout-calculator",
  //   name: "Stripe Payout Calculator",
  //   description: "See exactly when your Stripe payouts land and how much you'll receive.",
  //   icon: "📅",
  // },
  // {
  //   slug: "stripe-refund-impact-calculator",
  //   name: "Stripe Refund Impact Calculator",
  //   description: "Calculate the true cost of refunds — Stripe keeps the fee.",
  //   icon: "↩️",
  // },
];

// Coming soon — shows as greyed placeholders (good for SEO crawl signals)
const comingSoon = [
  "QuickBooks Import Error Checker",
  "Stripe Payout Calculator",
  "Bookkeeping Hours Saved Calculator",
  "Stripe Refund Impact Calculator",
];

export default function ToolsIndexPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Free Stripe & QuickBooks Tools
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          No signups. No ads. No data stored. Just paste and go.
        </p>
      </div>

      {/* Tool grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group border border-gray-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-md transition-all duration-150 bg-white"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{tool.icon}</span>
              {tool.badge && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${tool.badgeColor}`}
                >
                  {tool.badge}
                </span>
              )}
            </div>
            <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">              {tool.name}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {tool.description}
            </p>
          </Link>
        ))}

        {/* Coming soon placeholders */}
        {comingSoon.map((name) => (
          <div
            key={name}
            className="border border-dashed border-gray-200 rounded-xl p-6 bg-gray-50"
          >
            <div className="text-2xl mb-3 opacity-40">🔧</div>
            <p className="font-medium text-gray-400 text-sm">{name}</p>
            <p className="text-xs text-gray-300 mt-1">Coming soon</p>
          </div>
        ))}
      </div>

      {/* CTA back to main converter */}
      <div className="rounded-2xl p-8 sm:p-10 text-center" style={{ background: "#1e3a5f" }}>
        <h2 className="text-2xl font-bold text-white mb-3">
          Ready to automate the whole thing?
        </h2>
        <p className="mb-6 max-w-xl mx-auto" style={{ color: "#dbeafe" }}>
          These tools help you understand your Stripe data. Our converter
          takes the whole Stripe CSV and produces a QuickBooks-ready import
          file in one click — free, no account needed.
        </p>
        <Link
          href="/"
          className="inline-block bg-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          style={{ color: "#1e3a5f" }}
        >
          Try the Stripe → QuickBooks Converter →
        </Link>
      </div>
    </div>
  );
}
