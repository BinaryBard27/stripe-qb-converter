"use client";

import { useState } from "react";

const STRIPE_PCT = 0.029;
const STRIPE_FIXED = 0.30;
const DISPUTE_FEE = 15.00;

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(n);
}

function parseAmt(raw: string) {
  return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;
}

export default function StripeRefundImpactClient() {
  const [amountRaw, setAmountRaw] = useState("");
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [partialRaw, setPartialRaw] = useState("");
  const [isDispute, setIsDispute] = useState(false);
  const [monthlyRaw, setMonthlyRaw] = useState("");

  const saleAmount = parseAmt(amountRaw);
  const partialAmount = parseAmt(partialRaw);
  const monthlyCount = parseInt(monthlyRaw) || 0;

  const refundAmount = refundType === "full" ? saleAmount : Math.min(partialAmount, saleAmount);
  const stripeFee = saleAmount * STRIPE_PCT + STRIPE_FIXED;
  const netReceived = saleAmount - stripeFee;
  const totalLoss = refundAmount + stripeFee + (isDispute ? DISPUTE_FEE : 0);
  const trueCost = totalLoss;
  const extraVsExpected = trueCost - refundAmount;

  const hasResult = saleAmount > 0;

  const monthlyImpact = monthlyCount > 0 ? {
    totalLoss: totalLoss * monthlyCount,
    feesLost: stripeFee * monthlyCount,
    disputeFees: isDispute ? DISPUTE_FEE * monthlyCount : 0,
  } : null;

  return (
    <div className="space-y-6">

      {/* Sale amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Original sale amount
        </label>
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

      {/* Refund type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Refund type</label>
        <div className="flex gap-2">
          {(["full", "partial"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setRefundType(t)}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                refundType === t
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {t === "full" ? "Full refund" : "Partial refund"}
            </button>
          ))}
        </div>
      </div>

      {/* Partial amount */}
      {refundType === "partial" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Refund amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={partialRaw}
              onChange={(e) => setPartialRaw(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
            />
          </div>
        </div>
      )}

      {/* Dispute toggle */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-700">Include dispute fee?</p>
          <p className="text-xs text-gray-400 mt-0.5">Stripe charges $15 for chargebacks (refunded if you win)</p>
        </div>
        <button
          onClick={() => setIsDispute(!isDispute)}
          className={`relative w-11 h-6 rounded-full transition-colors ${isDispute ? "bg-blue-600" : "bg-gray-200"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDispute ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {/* Result */}
      {hasResult && (
        <div className="rounded-xl overflow-hidden border border-gray-100">

          {/* Big loss number */}
          <div className="bg-red-50 border-b border-red-100 px-5 py-4 text-center">
            <p className="text-xs text-red-400 uppercase tracking-widest font-semibold mb-1">True cost of this refund</p>
            <p className="text-4xl font-bold text-red-600 font-mono">{fmt(trueCost)}</p>
            <p className="text-sm text-red-400 mt-1">
              {fmt(extraVsExpected)} more than the refund amount alone
            </p>
          </div>

          {/* Breakdown */}
          <div className="bg-white px-5 py-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer paid you</span>
              <span className="font-mono text-gray-700">{fmt(saleAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Stripe fee deducted</span>
              <span className="font-mono text-red-500">− {fmt(stripeFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">You received</span>
              <span className="font-mono text-gray-700">{fmt(netReceived)}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between">
              <span className="text-gray-500">You refund to customer</span>
              <span className="font-mono text-red-500">− {fmt(refundAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Stripe fee (not returned)</span>
              <span className="font-mono text-red-500">− {fmt(stripeFee)}</span>
            </div>
            {isDispute && (
              <div className="flex justify-between">
                <span className="text-gray-500">Dispute fee</span>
                <span className="font-mono text-red-500">− {fmt(DISPUTE_FEE)}</span>
              </div>
            )}
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Net position</span>
              <span className="font-mono font-bold text-lg text-red-600">− {fmt(trueCost)}</span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border-t border-amber-100 px-5 py-3">
            <p className="text-xs text-amber-700">
              <strong>Why:</strong> Stripe keeps the {fmt(stripeFee)} processing fee regardless of whether you refund. You pay back the customer AND lose the fee permanently.
            </p>
          </div>
        </div>
      )}

      {/* Monthly projection */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly refund impact (optional)</h3>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            inputMode="numeric"
            value={monthlyRaw}
            onChange={(e) => setMonthlyRaw(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 5"
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500">refunds per month like this</span>
        </div>

        {monthlyImpact && hasResult && (
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Monthly loss", value: fmt(monthlyImpact.totalLoss), color: "text-red-600", bg: "bg-red-50 border-red-100" },
              { label: "Fees lost/month", value: fmt(monthlyImpact.feesLost), color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
              { label: "Annual impact", value: fmt(monthlyImpact.totalLoss * 12), color: "text-red-700", bg: "bg-red-50 border-red-100" },
            ].map((s) => (
              <div key={s.label} className={`rounded-lg p-3 border ${s.bg}`}>
                <div className={`text-base font-bold font-mono ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explainer */}
      <details className="text-sm text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700 font-medium">Why doesn't Stripe return the fee on refunds?</summary>
        <div className="mt-3 pl-2 border-l-2 border-gray-100 space-y-2 leading-relaxed text-xs">
          <p>Stripe's policy is that processing fees cover the cost of moving money through the payment network — costs that are incurred regardless of whether a refund is issued later.</p>
          <p>This is standard across most payment processors (PayPal, Square, Braintree all have similar policies). The exception is if Stripe determines the transaction was fraudulent on their end.</p>
          <p>The practical implication: your effective refund rate cost is higher than face value. A 5% refund rate doesn't cost you 5% of revenue — it costs more once you factor in the non-returned fees.</p>
        </div>
      </details>
    </div>
  );
}
