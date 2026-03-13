// components/ConverterCTA.tsx
// Drop this at the bottom of every free tool page.
// Links internally to your converter (same domain = no external href needed).

import Link from "next/link";

export default function ConverterCTA() {
  return (
    <div
      className="mt-12 rounded-2xl p-8 text-center"
      style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)" }}
    >
      <div
        className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase"
        style={{ background: "rgba(29,78,216,0.5)", color: "#bfdbfe" }}
      >
        Save hours every month
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">
        Stop doing this manually in QuickBooks
      </h2>
      <p className="mb-6 max-w-lg mx-auto text-sm leading-relaxed" style={{ color: "#dbeafe" }}>
        Our free Stripe → QuickBooks converter takes your full Stripe CSV export
        and produces a QuickBooks-ready import file in seconds. Every transaction,
        every fee, every refund — correctly categorized. No signup. No data stored.
      </p>
      <Link
        href="/"
        className="inline-block bg-white font-semibold px-7 py-3 rounded-lg text-sm transition-opacity hover:opacity-90"
        style={{ color: "#1e3a5f" }}
      >
        Try the Free Stripe → QuickBooks Converter →
      </Link>
      <p className="text-xs mt-3" style={{ color: "#93c5fd" }}>
        Free forever · No account required · Browser-side processing
      </p>
    </div>
  );
}
