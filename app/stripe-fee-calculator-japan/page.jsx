"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

const CARD_TYPES = [
  { id: "domestic", label: "Domestic JP Card (Visa/MC)", rate: 0.036, fixed: 0 },
  { id: "international", label: "International Card (+1.5% cross-border)", rate: 0.051, fixed: 0 },
  { id: "amex", label: "American Express", rate: 0.039, fixed: 0 },
];

const VOLUME_TIERS = [
  { label: "¥100,000", value: 100000 },
  { label: "¥500,000", value: 500000 },
  { label: "¥1,000,000", value: 1000000 },
  { label: "¥5,000,000", value: 5000000 },
];

const FAQ = [
  {
    q: "What are Stripe's fees in Japan?",
    a: "Stripe Japan charges 3.6% per transaction for domestic Visa and Mastercard cards. There is no fixed per-transaction fee in JPY. International cards incur an additional 1.5% cross-border fee, making the total 5.1%. American Express cards are charged at 3.9%.",
  },
  {
    q: "Does Stripe charge a monthly fee in Japan?",
    a: "No. Stripe has no monthly subscription fee in Japan. You only pay the per-transaction percentage fee. This makes it cost-effective for businesses of all sizes.",
  },
  {
    q: "How does Stripe's Japan fee compare to other payment processors?",
    a: "Stripe Japan's 3.6% rate is competitive for the Japanese market. Traditional payment processors in Japan often charge setup fees, monthly fees, and higher per-transaction rates, making Stripe one of the lowest-barrier options.",
  },
  {
    q: "Are there additional fees for currency conversion on Stripe Japan?",
    a: "If you accept payments in currencies other than JPY, Stripe adds a 1% currency conversion fee on top of the standard processing fee. It is best to charge customers in JPY to avoid this.",
  },
  {
    q: "How do I reconcile Stripe Japan payments in QuickBooks?",
    a: "Stripe sends payouts in JPY to your Japanese bank account. You can use our Stripe to QuickBooks Converter to automatically map Stripe transactions to the correct QuickBooks accounts, handling fee deductions correctly.",
  },
];

function fmt(n) {
  return "¥" + Math.round(n).toLocaleString("ja-JP");
}

export default function JapanStripeFeeCalculator() {
  const [amount, setAmount] = useState("");
  const [cardType, setCardType] = useState("domestic");
  const [monthly, setMonthly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const card = CARD_TYPES.find((c) => c.id === cardType);

  const result = useMemo(() => {
    const raw = parseFloat(amount.replace(/,/g, "")) || 0;
    const fee = raw * card.rate + card.fixed;
    const net = raw - fee;
    return { gross: raw, fee, net };
  }, [amount, card]);

  const monthlyResult = useMemo(() => {
    const raw = parseFloat(amount.replace(/,/g, "")) || 0;
    const txns = parseInt(monthly) || 0;
    const totalGross = raw * txns;
    const totalFee = totalGross * card.rate + card.fixed * txns;
    return { totalGross, totalFee, net: totalGross - totalFee };
  }, [amount, card, monthly]);

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-gray-900">
      {/* Top bar */}
      <div className="bg-[#1a1a2e] text-white py-2 text-center text-sm">
        <span className="opacity-70">Free tool by</span>{" "}
        <Link href="/" className="underline underline-offset-2 text-indigo-300 hover:text-indigo-200">
          Stripe QB Converter
        </Link>{" "}
        <span className="opacity-70">— Convert Stripe exports to QuickBooks automatically</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1 text-sm text-red-700 mb-4">
            <span>🇯🇵</span> Japan Market
          </div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
            Stripe Fee Calculator Japan
          </h1>
          <p className="text-lg text-gray-500">
            Calculate exact Stripe processing fees in Japanese Yen (JPY) for domestic and
            international cards. Instant. No signup.
          </p>
        </div>

        {/* Calculator card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Calculator
          </h2>

          {/* Card type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Type</label>
            <div className="grid grid-cols-1 gap-2">
              {CARD_TYPES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCardType(c.id)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
                    cardType === c.id
                      ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <span>{c.label}</span>
                  <span className="font-mono font-semibold">{(c.rate * 100).toFixed(1)}%</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Amount (JPY)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">¥</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick amounts */}
          <div className="flex flex-wrap gap-2 mb-8">
            {VOLUME_TIERS.map((t) => (
              <button
                key={t.value}
                onClick={() => setAmount(String(t.value))}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:border-indigo-300 hover:text-indigo-700 transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Result */}
          {result.gross > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Gross Amount</p>
                  <p className="text-xl font-bold text-gray-900">{fmt(result.gross)}</p>
                </div>
                <div>
                  <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Stripe Fee</p>
                  <p className="text-xl font-bold text-red-600">−{fmt(result.fee)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{(card.rate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-green-500 uppercase tracking-wide mb-1">You Receive</p>
                  <p className="text-xl font-bold text-green-700">{fmt(result.net)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Monthly estimator */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Monthly Fee Estimator
          </h2>
          <p className="text-sm text-gray-400 mb-6">How much are you paying Stripe per month?</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avg. Order Value (¥)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transactions / Month</label>
              <input
                type="number"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                placeholder="50"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {monthlyResult.totalGross > 0 && parseInt(monthly) > 0 && (
            <div className="bg-indigo-50 rounded-xl p-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monthly Revenue</p>
                <p className="text-lg font-bold">{fmt(monthlyResult.totalGross)}</p>
              </div>
              <div>
                <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Total Stripe Fees</p>
                <p className="text-lg font-bold text-red-600">−{fmt(monthlyResult.totalFee)}</p>
              </div>
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Monthly Net</p>
                <p className="text-lg font-bold text-green-700">{fmt(monthlyResult.net)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Fee table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-10">
          <h2 className="text-xl font-bold mb-6">Stripe Japan Fees — Full Breakdown</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Payment Type</th>
                <th className="text-right py-2 text-gray-500 font-medium">Rate</th>
                <th className="text-right py-2 text-gray-500 font-medium">Fixed Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { type: "Domestic Visa / Mastercard", rate: "3.6%", fixed: "¥0" },
                { type: "International Cards", rate: "5.1%", fixed: "¥0" },
                { type: "American Express", rate: "3.9%", fixed: "¥0" },
                { type: "Currency Conversion", rate: "+1.0%", fixed: "—" },
                { type: "Instant Payout", rate: "+1.5%", fixed: "¥250 min" },
                { type: "Stripe Billing (recurring)", rate: "0.5%", fixed: "—" },
              ].map((row) => (
                <tr key={row.type}>
                  <td className="py-3 text-gray-800">{row.type}</td>
                  <td className="py-3 text-right font-mono text-gray-700">{row.rate}</td>
                  <td className="py-3 text-right font-mono text-gray-700">{row.fixed}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-4">
            Source: Stripe Japan pricing page. Rates as of 2024. Always verify at stripe.com/jp/pricing.
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
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
        <div className="bg-[#1a1a2e] text-white rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Using Stripe in Japan?</h3>
          <p className="text-indigo-200 mb-6 text-sm">
            Automatically convert your Stripe Japan transactions to QuickBooks — fees deducted
            correctly, accounts mapped, ready to reconcile.
          </p>
          <Link
            href="/"
            className="inline-block bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Try Stripe QB Converter Free →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>
          Free tool. No data stored. Not affiliated with Stripe, Inc.{" "}
          <Link href="/stripe-fee-calculator-germany" className="underline hover:text-gray-600">
            Germany Calculator
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
