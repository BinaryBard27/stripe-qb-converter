"use client";
import { useState } from "react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function parse(raw: string) { return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0; }

const FEE_TYPES = [
  { id: "card_us", label: "US card (Visa, MC, Amex, Discover)", pct: 0.029, fixed: 0.30, tag: "Most common" },
  { id: "card_intl", label: "International card (non-US)", pct: 0.039, fixed: 0.30, tag: "+1% international" },
  { id: "card_manual", label: "Manually entered card", pct: 0.034, fixed: 0.30, tag: "Card not present" },
  { id: "ach", label: "ACH bank transfer", pct: 0.008, fixed: 0, cap: 5.00, tag: "Capped at $5" },
  { id: "link", label: "Link (Stripe's saved payments)", pct: 0.019, fixed: 0.30, tag: "Lower rate" },
];

export default function HowMuchStripeChargesClient() {
  const [amountRaw, setAmountRaw] = useState("100");
  const [selected, setSelected] = useState("card_us");

  const amount = parse(amountRaw);

  const results = FEE_TYPES.map((ft) => {
    let fee = amount * ft.pct + (ft.fixed || 0);
    if (ft.cap) fee = Math.min(fee, ft.cap);
    const net = Math.max(0, amount - fee);
    const effectivePct = amount > 0 ? (fee / amount) * 100 : 0;
    return { ...ft, fee, net, effectivePct };
  });

  const selectedResult = results.find((r) => r.id === selected)!;

  const ALL_FEES = [
    { label: "Standard card (US)", value: "2.9% + $0.30" },
    { label: "International card", value: "3.9% + $0.30" },
    { label: "Manually entered card", value: "3.4% + $0.30" },
    { label: "ACH direct debit", value: "0.8% (max $5)" },
    { label: "Link payments", value: "1.9% + $0.30" },
    { label: "Monthly fee", value: "None ($0)" },
    { label: "Setup fee", value: "None ($0)" },
    { label: "Refund fee", value: "None (fee kept)" },
    { label: "Dispute/chargeback", value: "$15 (refunded if won)" },
    { label: "Instant payout", value: "+1.5% (min $0.50)" },
    { label: "Currency conversion", value: "+1.0%" },
  ];

  return (
    <div className="space-y-6">

      {/* Amount input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Transaction amount</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input type="text" inputMode="decimal" value={amountRaw}
            onChange={(e) => setAmountRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg font-mono text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {/* Quick amounts */}
        <div className="flex gap-2 mt-2">
          {[10, 50, 100, 500, 1000].map((v) => (
            <button key={v} onClick={() => setAmountRaw(String(v))}
              className={`text-xs px-2.5 py-1 rounded-md border transition-all ${parse(amountRaw) === v ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
              ${v}
            </button>
          ))}
        </div>
      </div>

      {/* Payment type selector + result */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Payment type</label>
        {results.map((r) => (
          <button key={r.id} onClick={() => setSelected(r.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm text-left transition-all ${selected === r.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
            <div>
              <span className={`font-medium ${selected === r.id ? "text-blue-700" : "text-gray-700"}`}>{r.label}</span>
              <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{r.tag}</span>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              {amount > 0 ? (
                <div>
                  <span className="font-mono font-semibold text-red-500">−{fmt(r.fee)}</span>
                  <span className="text-gray-300 mx-1">→</span>
                  <span className={`font-mono font-semibold ${selected === r.id ? "text-green-600" : "text-gray-600"}`}>{fmt(r.net)}</span>
                </div>
              ) : (
                <span className="text-xs text-gray-400 font-mono">{(r.pct * 100).toFixed(1)}%{r.fixed ? ` + $${r.fixed.toFixed(2)}` : ""}{r.cap ? ` (max $${r.cap})` : ""}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected detail */}
      {amount > 0 && (
        <div className="bg-gray-900 rounded-xl p-5 text-center">
          <p className="text-gray-400 text-sm mb-2">On a {fmt(amount)} {FEE_TYPES.find(f => f.id === selected)?.label.toLowerCase()} transaction</p>
          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="text-2xl font-bold font-mono text-red-400">−{fmt(selectedResult.fee)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Stripe takes</p>
            </div>
            <div className="text-gray-600 text-2xl">→</div>
            <div>
              <p className="text-2xl font-bold font-mono text-green-400">{fmt(selectedResult.net)}</p>
              <p className="text-xs text-gray-500 mt-0.5">You receive</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-3">Effective rate: {selectedResult.effectivePct.toFixed(2)}%</p>
        </div>
      )}

      {/* Complete fee table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-medium text-gray-700">Complete Stripe fee schedule (2026)</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {ALL_FEES.map((fee) => (
            <div key={fee.label} className="flex justify-between px-4 py-2.5 text-sm">
              <span className="text-gray-600">{fee.label}</span>
              <span className="font-mono text-gray-800 font-medium text-xs">{fee.value}</span>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 border-t border-blue-100 px-4 py-2.5">
          <p className="text-xs text-blue-600">Volume discounts available above ~$80K/month. Contact Stripe sales for custom pricing.</p>
        </div>
      </div>
    </div>
  );
}
