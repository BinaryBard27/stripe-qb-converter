"use client";
import { useState } from "react";

const CARDS = [
  { id: "visa", name: "Visa", pct: 0.029, fixed: 0.30, color: "bg-blue-50 border-blue-200 text-blue-700", logo: "VISA" },
  { id: "mastercard", name: "Mastercard", pct: 0.029, fixed: 0.30, color: "bg-orange-50 border-orange-200 text-orange-700", logo: "MC" },
  { id: "amex", name: "American Express", pct: 0.029, fixed: 0.30, color: "bg-blue-50 border-blue-200 text-blue-700", logo: "AMEX" },
  { id: "discover", name: "Discover", pct: 0.029, fixed: 0.30, color: "bg-amber-50 border-amber-200 text-amber-700", logo: "DISC" },
  { id: "international", name: "International card", pct: 0.039, fixed: 0.30, color: "bg-purple-50 border-purple-200 text-purple-700", logo: "INTL" },
  { id: "manual", name: "Manually entered", pct: 0.034, fixed: 0.30, color: "bg-gray-50 border-gray-200 text-gray-700", logo: "MAN" },
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function parse(raw: string) { return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0; }

export default function StripeCreditCardFeeClient() {
  const [amountRaw, setAmountRaw] = useState("");
  const [mode, setMode] = useState<"charge" | "receive">("charge");
  const [showAll, setShowAll] = useState(false);

  const amount = parse(amountRaw);

  const results = CARDS.map((card) => {
    const fee = amount * card.pct + card.fixed;
    const net = Math.max(0, amount - fee);
    const reverseCharge = amount > 0 ? (amount + card.fixed) / (1 - card.pct) : 0;
    return { ...card, fee, net, reverseCharge, reverseFee: reverseCharge - amount };
  });

  const displayCards = showAll ? results : results.slice(0, 4);
  const hasResult = amount > 0;

  return (
    <div className="space-y-6">

      {/* Key fact */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
        <strong>Good news:</strong> Stripe charges the same rate (2.9% + $0.30) for Visa, Mastercard, Amex, and Discover. No surcharge for Amex.
      </div>

      {/* Mode */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        {(["charge", "receive"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            {m === "charge" ? "I'm charging..." : "I want to receive..."}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (USD)</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input type="text" inputMode="decimal" value={amountRaw}
            onChange={(e) => setAmountRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg font-mono text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
        </div>
      </div>

      {/* Card comparison table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 grid grid-cols-4 px-4 py-2.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
          <span>Card</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Fee</span>
          <span className="text-right">{mode === "charge" ? "You receive" : "Charge"}</span>
        </div>
        {displayCards.map((card) => (
          <div key={card.id} className={`grid grid-cols-4 px-4 py-3 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50 transition-colors`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${card.color}`} style={{ fontSize: "9px" }}>
                {card.logo}
              </span>
              <span className="text-sm text-gray-700 font-medium">{card.name}</span>
            </div>
            <span className="text-right text-xs font-mono text-gray-500">{(card.pct * 100).toFixed(1)}% + $0.30</span>
            <span className="text-right text-sm font-mono text-red-500">
              {hasResult ? `−${fmt(card.fee)}` : "—"}
            </span>
            <span className={`text-right text-sm font-mono font-semibold ${card.id === "international" ? "text-orange-600" : "text-green-600"}`}>
              {hasResult
                ? mode === "charge"
                  ? fmt(card.net)
                  : fmt(card.reverseCharge)
                : "—"}
            </span>
          </div>
        ))}
        {!showAll && (
          <button onClick={() => setShowAll(true)} className="w-full py-2.5 text-sm text-blue-600 hover:text-blue-700 border-t border-gray-100 bg-gray-50">
            Show all card types ↓
          </button>
        )}
      </div>

      {/* International warning */}
      {hasResult && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
          <p className="text-amber-700">
            <strong>International cards cost more:</strong> A {fmt(amount)} transaction on an international card costs{" "}
            <strong>{fmt(results[4].fee - results[0].fee)}</strong> more in fees than a domestic US card.
            {mode === "charge" && ` You receive ${fmt(results[4].net)} instead of ${fmt(results[0].net)}.`}
          </p>
        </div>
      )}
    </div>
  );
}
