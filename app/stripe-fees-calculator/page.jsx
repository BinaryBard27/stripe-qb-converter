"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

// Different angle: side-by-side country comparison + Stripe plan compare
// Targets "stripe fees calculator" (plural "fees") — broader query

const COUNTRIES = {
  us: {
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    symbol: "$",
    standard: { rate: 0.029, fixed: 0.30 },
    international: { rate: 0.044, fixed: 0.30 },
    inPerson: { rate: 0.027, fixed: 0.05 },
  },
  uk: {
    name: "United Kingdom",
    flag: "🇬🇧",
    currency: "GBP",
    symbol: "£",
    standard: { rate: 0.015, fixed: 0.20 },
    international: { rate: 0.025, fixed: 0.20 },
    inPerson: { rate: 0.017, fixed: 0.0 },
  },
  eu: {
    name: "Europe (EU)",
    flag: "🇪🇺",
    currency: "EUR",
    symbol: "€",
    standard: { rate: 0.015, fixed: 0.25 },
    international: { rate: 0.029, fixed: 0.25 },
    inPerson: { rate: 0.018, fixed: 0.0 },
  },
  jp: {
    name: "Japan",
    flag: "🇯🇵",
    currency: "JPY",
    symbol: "¥",
    standard: { rate: 0.036, fixed: 0 },
    international: { rate: 0.051, fixed: 0 },
    inPerson: { rate: 0.032, fixed: 0 },
  },
  au: {
    name: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    symbol: "A$",
    standard: { rate: 0.017, fixed: 0.30 },
    international: { rate: 0.032, fixed: 0.30 },
    inPerson: { rate: 0.019, fixed: 0.0 },
  },
  ca: {
    name: "Canada",
    flag: "🇨🇦",
    currency: "CAD",
    symbol: "C$",
    standard: { rate: 0.029, fixed: 0.30 },
    international: { rate: 0.044, fixed: 0.30 },
    inPerson: { rate: 0.027, fixed: 0.05 },
  },
};

const STRIPE_PRODUCTS = [
  { name: "Standard (Pay-as-you-go)", addRate: 0, addFixed: 0, monthlyFee: 0, color: "bg-gray-100 text-gray-800" },
  { name: "Stripe Billing (Subscriptions)", addRate: 0.005, addFixed: 0, monthlyFee: 0, color: "bg-blue-50 text-blue-800" },
  { name: "Radar for Fraud Teams", addRate: 0, addFixed: 0.05, monthlyFee: 0, color: "bg-purple-50 text-purple-800" },
  { name: "Instant Payouts", addRate: 0.015, addFixed: 0, monthlyFee: 0, color: "bg-orange-50 text-orange-800" },
];

const FAQ = [
  {
    q: "What are Stripe's fees in 2024?",
    a: "Stripe fees vary by country. In the US, standard online card fees are 2.9% + $0.30. In the EU/UK, the EU Interchange++ regulation means Stripe can offer lower rates — 1.5% + €0.25 for EU cards in Europe. Japan charges 3.6% with no fixed fee. International card fees always add ~1.5% on top of the standard rate.",
  },
  {
    q: "How do Stripe fees compare across countries?",
    a: "European businesses generally pay lower Stripe fees than US businesses due to EU regulations capping interchange fees. US businesses pay 2.9% + $0.30 while EU businesses pay 1.5% + €0.25 for domestic cards — almost half the percentage rate. Japan's 3.6% is in between, with no fixed fee which benefits small transactions.",
  },
  {
    q: "Does Stripe charge for failed payments?",
    a: "Stripe does not charge a fee for failed payment attempts. You only pay the processing fee when a payment succeeds. However, chargebacks incur a $15 (or local equivalent) dispute fee, refundable if you win.",
  },
  {
    q: "What is the cheapest way to accept payments on Stripe?",
    a: "For US businesses, in-person payments via Stripe Terminal are cheapest at 2.7% + $0.05. For online, standard card rates apply. ACH bank transfers are 0.8% capped at $5.00 — by far the cheapest for large B2B transactions. In Europe, SEPA Direct Debit at 0.8% capped at €6 offers similar savings.",
  },
  {
    q: "How do I calculate my total Stripe fees per month?",
    a: "Multiply your monthly revenue by your applicable rate, then add the fixed fee multiplied by your number of transactions. If you have mixed card types (domestic vs international), calculate each segment separately and sum them. Our monthly estimator below does this automatically.",
  },
  {
    q: "Does Stripe have hidden fees?",
    a: "Stripe is generally transparent about fees. The main 'surprise' fees businesses encounter are: the 1.5% cross-border fee for international cards (not always noticed), the 1% currency conversion fee if payout currency differs from charge currency, and the $15 chargeback dispute fee. Stripe does not charge monthly subscription fees on standard accounts.",
  },
];

function fmt(n, symbol) {
  if (symbol === "¥") return "¥" + Math.round(n).toLocaleString();
  return symbol + n.toFixed(2);
}

export default function StripeFeeCalculator() {
  const [country, setCountry] = useState("us");
  const [cardType, setCardType] = useState("standard");
  const [amount, setAmount] = useState("");
  const [monthlyTxns, setMonthlyTxns] = useState("");
  const [compareAll, setCompareAll] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState("single");

  const c = COUNTRIES[country];

  const tier = cardType === "standard" ? c.standard : cardType === "international" ? c.international : c.inPerson;

  const result = useMemo(() => {
    const raw = parseFloat(amount) || 0;
    const fee = raw * tier.rate + tier.fixed;
    return { gross: raw, fee, net: raw - fee, effectiveRate: raw > 0 ? (fee / raw) * 100 : 0 };
  }, [amount, tier]);

  const monthlyResult = useMemo(() => {
    const raw = parseFloat(amount) || 0;
    const txns = parseInt(monthlyTxns) || 0;
    const feePer = raw * tier.rate + tier.fixed;
    return {
      gross: raw * txns,
      fee: feePer * txns,
      net: (raw - feePer) * txns,
      txns,
    };
  }, [amount, tier, monthlyTxns]);

  const crossCountryComparison = useMemo(() => {
    const raw = parseFloat(amount) || 100;
    return Object.entries(COUNTRIES).map(([key, ct]) => {
      const t = ct.standard;
      const fee = raw * t.rate + t.fixed;
      return { key, ...ct, fee, net: raw - fee };
    }).sort((a, b) => a.fee - b.fee);
  }, [amount]);

  return (
    <div className="min-h-screen bg-[#f8f8f6] text-gray-900">
      {/* Top bar */}
      <div className="bg-[#18181b] text-white py-2 text-center text-sm">
        <span className="opacity-60">Free tool by</span>{" "}
        <Link href="/" className="underline underline-offset-2 text-violet-300 hover:text-violet-200">
          Stripe QB Converter
        </Link>{" "}
        <span className="opacity-60">— Export Stripe transactions to QuickBooks in seconds</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-3 py-1 text-sm text-violet-700 mb-4">
            🌍 All Countries · All Payment Types
          </div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
            Stripe Fees Calculator
          </h1>
          <p className="text-lg text-gray-500">
            Calculate Stripe processing fees for any country, payment type, or product. Compare
            fees side-by-side. No signup required.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "single", label: "Single Transaction" },
            { id: "monthly", label: "Monthly Estimator" },
            { id: "compare", label: "Country Comparison" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-violet-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-violet-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Single transaction tab */}
        {activeTab === "single" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                >
                  {Object.entries(COUNTRIES).map(([key, ct]) => (
                    <option key={key} value={key}>
                      {ct.flag} {ct.name} ({ct.currency})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                >
                  <option value="standard">Domestic Card (Online)</option>
                  <option value="international">International Card (+cross-border)</option>
                  <option value="inPerson">In-Person (Terminal)</option>
                </select>
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Amount ({c.currency})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{c.symbol}</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={c.symbol === "¥" ? "10000" : "100.00"}
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
            </div>

            <div className="text-xs text-gray-400 mb-6">
              Rate: {(tier.rate * 100).toFixed(1)}%{tier.fixed > 0 ? ` + ${c.symbol}${tier.fixed}` : ""}
            </div>

            {result.gross > 0 && (
              <div className="bg-violet-50 rounded-xl p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Charged</p>
                    <p className="text-2xl font-bold">{fmt(result.gross, c.symbol)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Stripe Fee</p>
                    <p className="text-2xl font-bold text-red-600">−{fmt(result.fee, c.symbol)}</p>
                    <p className="text-xs text-gray-400">({result.effectiveRate.toFixed(2)}%)</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-500 uppercase tracking-wide mb-1">You Receive</p>
                    <p className="text-2xl font-bold text-green-700">{fmt(result.net, c.symbol)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Monthly estimator tab */}
        {activeTab === "monthly" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
              Monthly Fee Estimator
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                >
                  {Object.entries(COUNTRIES).map(([key, ct]) => (
                    <option key={key} value={key}>{ct.flag} {ct.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                >
                  <option value="standard">Domestic Card</option>
                  <option value="international">International Card</option>
                  <option value="inPerson">In-Person</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Avg Order ({c.currency})</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={c.symbol === "¥" ? "10000" : "100"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transactions/Month</label>
                <input
                  type="number"
                  value={monthlyTxns}
                  onChange={(e) => setMonthlyTxns(e.target.value)}
                  placeholder="200"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
            </div>

            {monthlyResult.gross > 0 && monthlyResult.txns > 0 && (
              <div className="space-y-3">
                <div className="bg-violet-50 rounded-xl p-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Monthly Revenue</p>
                    <p className="text-xl font-bold">{fmt(monthlyResult.gross, c.symbol)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-500 uppercase tracking-wide mb-1">Total Fees</p>
                    <p className="text-xl font-bold text-red-600">−{fmt(monthlyResult.fee, c.symbol)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Net Payout</p>
                    <p className="text-xl font-bold text-green-700">{fmt(monthlyResult.net, c.symbol)}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                    Add-on Product Cost Comparison
                  </p>
                  <div className="space-y-2">
                    {STRIPE_PRODUCTS.map((p) => {
                      const extraFee =
                        monthlyResult.gross * p.addRate +
                        monthlyResult.txns * p.addFixed +
                        p.monthlyFee;
                      return (
                        <div key={p.name} className="flex items-center justify-between text-sm">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.color}`}>
                            {p.name}
                          </span>
                          <span className="text-gray-600">
                            {extraFee > 0 ? `+${fmt(extraFee, c.symbol)}/mo` : "Included"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Country comparison tab */}
        {activeTab === "compare" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Country Comparison
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              How much would a transaction cost across different countries? Enter an amount to compare.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Amount (in each country's currency)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <p className="text-xs text-gray-400 mt-2">
                Comparison uses the same number in each country's local currency for fair comparison.
              </p>
            </div>

            <div className="space-y-2">
              {crossCountryComparison.map((ct, i) => {
                const pct = parseFloat(amount) > 0
                  ? (ct.fee / parseFloat(amount)) * 100
                  : ct.standard.rate * 100;
                return (
                  <div
                    key={ct.key}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      i === 0 ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{ct.flag}</span>
                      <div>
                        <p className="text-sm font-medium">{ct.name}</p>
                        <p className="text-xs text-gray-400">
                          {(ct.standard.rate * 100).toFixed(1)}%
                          {ct.standard.fixed > 0 ? ` + ${ct.symbol}${ct.standard.fixed}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        −{ct.symbol}{parseFloat(amount) > 0 ? ct.fee.toFixed(ct.symbol === "¥" ? 0 : 2) : "?"}
                      </p>
                      <p className="text-xs text-gray-400">{pct.toFixed(2)}% effective</p>
                    </div>
                    {i === 0 && <span className="ml-3 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Cheapest</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Stripe Fees — Common Questions</h2>
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
        <div className="bg-[#18181b] text-white rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Ready to stop doing this manually?</h3>
          <p className="text-gray-400 mb-6 text-sm">
            Stripe QB Converter automatically imports your Stripe transactions into QuickBooks —
            fees deducted correctly, payouts matched, reconciliation done.
          </p>
          <Link
            href="/"
            className="inline-block bg-violet-500 hover:bg-violet-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Try Stripe QB Converter Free →
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>
          Free tool. No data stored. Not affiliated with Stripe, Inc.{" "}
          <Link href="/stripe-fee-calculator-japan" className="underline hover:text-gray-600">Japan</Link>
          {" · "}
          <Link href="/stripe-fee-calculator-germany" className="underline hover:text-gray-600">Germany</Link>
        </p>
      </div>
    </div>
  );
}
