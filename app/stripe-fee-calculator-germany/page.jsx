"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

const CARD_TYPES = [
  { id: "eu", label: "European Card (Visa/MC/Maestro)", rate: 0.015, fixed: 0.25 },
  { id: "non_eu", label: "Non-European Card (US, etc.)", rate: 0.029, fixed: 0.25 },
  { id: "amex", label: "American Express", rate: 0.029, fixed: 0.25 },
  { id: "sepa", label: "SEPA Direct Debit", rate: 0.008, fixed: 0.35, cap: 6.0 },
];

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000, 2500];

const FAQ = [
  {
    q: "What does Stripe charge per transaction in Germany?",
    a: "For European cards (Visa, Mastercard, Maestro), Stripe Germany charges 1.5% + €0.25 per transaction. Non-European cards (like US-issued cards) cost 2.9% + €0.25. SEPA Direct Debit — the most popular payment method in Germany — costs 0.8% + €0.35, capped at €6.00.",
  },
  {
    q: "Is SEPA Direct Debit cheaper than card payments in Germany?",
    a: "Yes, significantly. SEPA Direct Debit at 0.8% + €0.35 with a €6 cap is much cheaper for larger transactions than card processing. For a €500 order, SEPA costs €4.35 vs €7.75 for a European card. This is why many German businesses prefer SEPA.",
  },
  {
    q: "Does Stripe charge VAT in Germany?",
    a: "Stripe applies German VAT (19%) on its fees for German-registered businesses. This is added to your monthly invoice from Stripe, not to customer-facing transaction fees. B2B customers can typically reclaim this VAT.",
  },
  {
    q: "Are there currency conversion fees for EUR payments?",
    a: "If your Stripe account is in a non-EUR currency, Stripe adds 1% for currency conversion. To avoid this, ensure your Stripe account is settled in EUR if selling to German customers.",
  },
  {
    q: "How do I handle Stripe Germany fees in QuickBooks?",
    a: "German Stripe payouts net out fees and VAT. When importing to QuickBooks, each payout must be split into gross revenue, Stripe processing fee, and Stripe fee VAT. Our Stripe QB Converter does this automatically, correctly categorizing each line.",
  },
  {
    q: "What is the best Stripe plan for a German business?",
    a: "Most German businesses start on Stripe's standard pay-as-you-go plan (1.5% + €0.25 for EU cards). Volume discounts kick in with custom pricing once you exceed ~€250,000/month in processing volume. Stripe also offers Stripe Billing at +0.5% for subscription businesses.",
  },
];

function fmtEur(n) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
}

export default function GermanyStripeFeeCalculator() {
  const [amount, setAmount] = useState("");
  const [cardType, setCardType] = useState("eu");
  const [monthlyTxns, setMonthlyTxns] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const card = CARD_TYPES.find((c) => c.id === cardType);

  const result = useMemo(() => {
    const raw = parseFloat(amount) || 0;
    let fee = raw * card.rate + card.fixed;
    if (card.cap) fee = Math.min(fee, card.cap);
    const net = raw - fee;
    const effectiveRate = raw > 0 ? (fee / raw) * 100 : 0;
    return { gross: raw, fee, net, effectiveRate };
  }, [amount, card]);

  const monthlyResult = useMemo(() => {
    const raw = parseFloat(amount) || 0;
    const txns = parseInt(monthlyTxns) || 0;
    const totalGross = raw * txns;
    let fee = raw * card.rate + card.fixed;
    if (card.cap) fee = Math.min(fee, card.cap);
    const totalFee = fee * txns;
    return { totalGross, totalFee, net: totalGross - totalFee };
  }, [amount, card, monthlyTxns]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-gray-900">
      {/* Top bar */}
      <div className="bg-[#1c1c2e] text-white py-2 text-center text-sm">
        <span className="opacity-70">Free tool by</span>{" "}
        <Link href="/" className="underline underline-offset-2 text-blue-300 hover:text-blue-200">
          Stripe QB Converter
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 text-sm text-yellow-800 mb-4">
            <span>🇩🇪</span> Germany / European Market
          </div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
            Stripe Fee Calculator Germany
          </h1>
          <p className="text-lg text-gray-500">
            Calculate Stripe processing fees in EUR for German and EU businesses. Includes SEPA,
            EU cards, and international cards.
          </p>
        </div>

        {/* Main calculator */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Fee Calculator
          </h2>

          {/* Card type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <div className="grid grid-cols-1 gap-2">
              {CARD_TYPES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCardType(c.id)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
                    cardType === c.id
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="font-mono font-semibold text-xs">
                    {(c.rate * 100).toFixed(1)}% + €{c.fixed.toFixed(2)}
                    {c.cap ? ` (max €${c.cap})` : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Amount (EUR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                step="0.01"
                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick amounts */}
          <div className="flex flex-wrap gap-2 mb-8">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                €{a}
              </button>
            ))}
          </div>

          {/* Result */}
          {result.gross > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Gross</p>
                  <p className="text-2xl font-bold">{fmtEur(result.gross)}</p>
                </div>
                <div>
                  <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Stripe Fee</p>
                  <p className="text-2xl font-bold text-red-600">−{fmtEur(result.fee)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Effective rate: {result.effectiveRate.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-green-500 uppercase tracking-wide mb-1">You Receive</p>
                  <p className="text-2xl font-bold text-green-700">{fmtEur(result.net)}</p>
                </div>
              </div>
              {card.id === "sepa" && result.gross > 500 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 mt-2">
                  💡 SEPA cap applied — for orders over ~€700, SEPA is always cheaper than card.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Monthly estimator */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Monthly Cost Estimator
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Estimate your total Stripe fees for the month
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avg. Order Value (€)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transactions / Month
              </label>
              <input
                type="number"
                value={monthlyTxns}
                onChange={(e) => setMonthlyTxns(e.target.value)}
                placeholder="100"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {monthlyResult.totalGross > 0 && parseInt(monthlyTxns) > 0 && (
            <div className="bg-blue-50 rounded-xl p-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monthly Revenue</p>
                <p className="text-lg font-bold">{fmtEur(monthlyResult.totalGross)}</p>
              </div>
              <div>
                <p className="text-xs text-red-500 uppercase tracking-wide mb-1">Stripe Fees</p>
                <p className="text-lg font-bold text-red-600">−{fmtEur(monthlyResult.totalFee)}</p>
              </div>
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Net Payout</p>
                <p className="text-lg font-bold text-green-700">{fmtEur(monthlyResult.net)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Fee table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-10">
          <h2 className="text-xl font-bold mb-2">Stripe Germany — Complete Fee Table</h2>
          <p className="text-sm text-gray-400 mb-6">All fees in EUR. VAT (19%) on Stripe fees billed separately to businesses.</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Payment Method</th>
                <th className="text-right py-2 text-gray-500 font-medium">Rate</th>
                <th className="text-right py-2 text-gray-500 font-medium">Fixed</th>
                <th className="text-right py-2 text-gray-500 font-medium">Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { type: "EU Visa / Mastercard / Maestro", rate: "1.5%", fixed: "€0.25", cap: "—" },
                { type: "Non-EU Cards (US, etc.)", rate: "2.9%", fixed: "€0.25", cap: "—" },
                { type: "American Express", rate: "2.9%", fixed: "€0.25", cap: "—" },
                { type: "SEPA Direct Debit", rate: "0.8%", fixed: "€0.35", cap: "€6.00" },
                { type: "iDEAL (via Stripe)", rate: "0.8%", fixed: "€0.25", cap: "—" },
                { type: "Currency Conversion", rate: "+1.0%", fixed: "—", cap: "—" },
                { type: "Instant Payout", rate: "+1.5%", fixed: "—", cap: "—" },
                { type: "Stripe Billing", rate: "+0.5%", fixed: "—", cap: "—" },
              ].map((row) => (
                <tr key={row.type}>
                  <td className="py-3 text-gray-800">{row.type}</td>
                  <td className="py-3 text-right font-mono text-gray-700">{row.rate}</td>
                  <td className="py-3 text-right font-mono text-gray-700">{row.fixed}</td>
                  <td className="py-3 text-right font-mono text-gray-700">{row.cap}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-4">
            Rates verified against stripe.com/de/pricing. Always confirm current rates before making business decisions.
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Stripe Germany FAQ</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                  <span className="text-gray-400 ml-4 flex-shrink-0">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#1c1c2e] text-white rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Using Stripe in Germany?</h3>
          <p className="text-blue-200 mb-6 text-sm">
            Import Stripe exports directly to QuickBooks — fees, VAT, and payouts handled
            automatically. No manual reconciliation.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Try Stripe QB Converter Free →
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>
          Free tool. Not affiliated with Stripe, Inc.{" "}
          <Link href="/stripe-fee-calculator-japan" className="underline hover:text-gray-600">
            Japan Calculator
          </Link>{" "}
          ·{" "}
          <Link href="/stripe-fees-calculator" className="underline hover:text-gray-600">
            All Fees Calculator
          </Link>
        </p>
      </div>
    </div>
  );
}
