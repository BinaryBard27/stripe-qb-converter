"use client";

import { useState } from "react";

const PROCESSORS = {
  stripe: {
    name: "Stripe",
    color: "#635bff",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    standard: { pct: 0.029, fixed: 0.30, label: "2.9% + $0.30" },
    international: { pct: 0.044, fixed: 0.30, label: "4.4% + $0.30" },
    amex: { pct: 0.029, fixed: 0.30, label: "2.9% + $0.30 (same)" },
  },
  paypal: {
    name: "PayPal",
    color: "#003087",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    standard: { pct: 0.0299, fixed: 0.49, label: "2.99% + $0.49" },
    international: { pct: 0.0449, fixed: 0.49, label: "4.49% + $0.49" },
    amex: { pct: 0.0299, fixed: 0.49, label: "2.99% + $0.49" },
  },
};

type CardType = "standard" | "international" | "amex";

function calcFee(amount: number, pct: number, fixed: number) {
  const fee = amount * pct + fixed;
  return { fee, net: Math.max(0, amount - fee) };
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(n);
}

function pct(n: number) {
  return (n * 100).toFixed(2) + "%";
}

export default function StripeVsPayPalClient() {
  const [amountRaw, setAmountRaw] = useState("");
  const [monthlyRaw, setMonthlyRaw] = useState("");
  const [cardType, setCardType] = useState<CardType>("standard");

  const amount = parseFloat(amountRaw.replace(/[^0-9.]/g, "")) || 0;
  const monthlyTx = parseInt(monthlyRaw) || 0;

  const stripeRate = PROCESSORS.stripe[cardType];
  const paypalRate = PROCESSORS.paypal[cardType];

  const stripe = amount > 0 ? calcFee(amount, stripeRate.pct, stripeRate.fixed) : null;
  const paypal = amount > 0 ? calcFee(amount, paypalRate.pct, paypalRate.fixed) : null;

  const cheaper = stripe && paypal
    ? stripe.fee < paypal.fee ? "stripe" : paypal.fee < stripe.fee ? "paypal" : "tie"
    : null;

  const monthlyStripe = stripe && monthlyTx > 0 ? stripe.fee * monthlyTx : null;
  const monthlyPaypal = paypal && monthlyTx > 0 ? paypal.fee * monthlyTx : null;
  const monthlySavings = monthlyStripe && monthlyPaypal ? Math.abs(monthlyStripe - monthlyPaypal) : null;
  const cheaperMonthly = monthlyStripe && monthlyPaypal
    ? monthlyStripe < monthlyPaypal ? "stripe" : "paypal"
    : null;

  const CARD_TYPES = [
    { id: "standard" as CardType, label: "US card", sub: "Most common" },
    { id: "international" as CardType, label: "International card", sub: "+1.5% both" },
    { id: "amex" as CardType, label: "Amex", sub: "Same rate" },
  ];

  return (
    <div className="space-y-6">

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Transaction amount</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={amountRaw}
            onChange={(e) => setAmountRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Card type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card type</label>
        <div className="grid grid-cols-3 gap-2">
          {CARD_TYPES.map((ct) => (
            <button
              key={ct.id}
              onClick={() => setCardType(ct.id)}
              className={`py-2.5 px-3 rounded-lg border text-sm transition-all text-left ${
                cardType === ct.id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <div className="font-medium">{ct.label}</div>
              <div className="text-xs text-gray-400">{ct.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison result */}
      {stripe && paypal && (
        <div className="space-y-3">

          {/* Winner banner */}
          {cheaper !== "tie" && (
            <div className={`rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${
              cheaper === "stripe"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>
              <span>✓</span>
              <span>
                <strong>{cheaper === "stripe" ? "Stripe" : "PayPal"}</strong> is cheaper by{" "}
                <strong>{fmt(Math.abs(stripe.fee - paypal.fee))}</strong> on this transaction
              </span>
            </div>
          )}
          {cheaper === "tie" && (
            <div className="rounded-lg px-4 py-2.5 text-sm font-medium bg-gray-50 text-gray-600 border border-gray-200">
              Same fee for this transaction amount
            </div>
          )}

          {/* Side by side */}
          <div className="grid grid-cols-2 gap-3">
            {(["stripe", "paypal"] as const).map((p) => {
              const proc = PROCESSORS[p];
              const result = p === "stripe" ? stripe : paypal;
              const rate = p === "stripe" ? stripeRate : paypalRate;
              const isWinner = cheaper === p;
              return (
                <div
                  key={p}
                  className={`rounded-xl border p-4 ${isWinner ? proc.border + " " + proc.bg : "border-gray-200 bg-white"}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-bold text-base ${isWinner ? proc.text : "text-gray-700"}`}>
                      {proc.name}
                    </span>
                    {isWinner && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${proc.bg} ${proc.text} border ${proc.border}`}>
                        Cheaper
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rate</span>
                      <span className="font-mono text-gray-600 text-xs">{rate.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fee</span>
                      <span className="font-mono text-red-500 font-medium">{fmt(result.fee)}</span>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="flex justify-between">
                      <span className="text-gray-500">You receive</span>
                      <span className={`font-mono font-bold ${isWinner ? proc.text : "text-gray-700"}`}>
                        {fmt(result.net)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Effective rate</span>
                      <span className="text-xs text-gray-400">{pct(result.fee / amount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly comparison */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly volume comparison (optional)</h3>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            inputMode="numeric"
            value={monthlyRaw}
            onChange={(e) => setMonthlyRaw(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 100"
            className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500">transactions per month</span>
        </div>

        {monthlyStripe && monthlyPaypal && monthlySavings && amount > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                <div className="text-base font-bold font-mono text-indigo-600">{fmt(monthlyStripe)}</div>
                <div className="text-xs text-gray-400 mt-0.5">Stripe/month</div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <div className="text-base font-bold font-mono text-blue-600">{fmt(monthlyPaypal)}</div>
                <div className="text-xs text-gray-400 mt-0.5">PayPal/month</div>
              </div>
              <div className={`rounded-lg p-3 border ${cheaperMonthly === "stripe" ? "bg-indigo-50 border-indigo-200" : "bg-blue-50 border-blue-200"}`}>
                <div className={`text-base font-bold font-mono ${cheaperMonthly === "stripe" ? "text-indigo-600" : "text-blue-600"}`}>
                  {fmt(monthlySavings)}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {cheaperMonthly === "stripe" ? "Stripe saves" : "PayPal saves"}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Annual savings with {cheaperMonthly === "stripe" ? "Stripe" : "PayPal"}: <strong className="text-gray-600">{fmt(monthlySavings * 12)}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Key differences */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Beyond fees — key differences</h3>
        </div>
        <div className="divide-y divide-gray-100 text-sm">
          {[
            { aspect: "Payout timing", stripe: "2 business days", paypal: "1-3 days (to PayPal balance)" },
            { aspect: "QuickBooks export", stripe: "Structured CSV", paypal: "CSV (less consistent)" },
            { aspect: "Subscription billing", stripe: "Native, powerful", paypal: "Available, more limited" },
            { aspect: "Dispute fee", stripe: "$15 (refunded if won)", paypal: "$20 (not refunded)" },
            { aspect: "Custom checkout", stripe: "Full API control", paypal: "More restricted" },
          ].map((row) => (
            <div key={row.aspect} className="grid grid-cols-3 gap-0">
              <div className="px-4 py-3 bg-gray-50 text-gray-500 font-medium text-xs flex items-center">{row.aspect}</div>
              <div className="px-4 py-3 text-indigo-700 text-xs flex items-center border-l border-gray-100">{row.stripe}</div>
              <div className="px-4 py-3 text-blue-700 text-xs flex items-center border-l border-gray-100">{row.paypal}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
