"use client";
import { useState } from "react";

const CARD_TYPES = [
  { id: "domestic", label: "Domestic US card", pct: 0.029, fixed: 0.30, badge: "2.9% + $0.30" },
  { id: "international", label: "International card (non-US)", pct: 0.039, fixed: 0.30, badge: "3.9% + $0.30" },
  { id: "manual", label: "Manually entered card", pct: 0.034, fixed: 0.30, badge: "3.4% + $0.30" },
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function parse(raw: string) { return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0; }

export default function StripeInternationalFeeClient() {
  const [amountRaw, setAmountRaw] = useState("");
  const [cardType, setCardType] = useState("international");
  const [currencyConversion, setCurrencyConversion] = useState(false);
  const [mode, setMode] = useState<"charge" | "receive">("charge");

  const amount = parse(amountRaw);
  const card = CARD_TYPES.find((c) => c.id === cardType)!;
  const conversionFee = currencyConversion ? amount * 0.01 : 0;
  const stripeFee = amount * card.pct + card.fixed;
  const totalFee = stripeFee + conversionFee;
  const net = Math.max(0, amount - totalFee);

  // Reverse
  const reverseCharge = amount > 0
    ? (amount + card.fixed) / (1 - card.pct - (currencyConversion ? 0.01 : 0))
    : 0;
  const reverseFee = reverseCharge - amount;

  // vs domestic comparison
  const domesticFee = amount * 0.029 + 0.30;
  const extraCost = totalFee - domesticFee;

  const hasResult = amount > 0;

  return (
    <div className="space-y-6">

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
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Transaction amount (USD)</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input type="text" inputMode="decimal" value={amountRaw}
            onChange={(e) => setAmountRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg font-mono text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
        </div>
      </div>

      {/* Card type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card type</label>
        <div className="space-y-2">
          {CARD_TYPES.map((c) => (
            <button key={c.id} onClick={() => setCardType(c.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm text-left transition-all ${cardType === c.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              <span className="font-medium">{c.label}</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${cardType === c.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{c.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Currency conversion */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-700">Add currency conversion fee (+1%)</p>
          <p className="text-xs text-gray-400 mt-0.5">If charging in a different currency than your settlement currency</p>
        </div>
        <button onClick={() => setCurrencyConversion(!currencyConversion)}
          className={`relative w-11 h-6 rounded-full transition-colors ${currencyConversion ? "bg-blue-600" : "bg-gray-200"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${currencyConversion ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {/* Result */}
      {hasResult && (
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-5 py-4 space-y-2.5 text-sm">
            {mode === "charge" ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction amount</span>
                  <span className="font-mono text-gray-700">{fmt(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stripe fee ({(card.pct * 100).toFixed(1)}% + $0.30)</span>
                  <span className="font-mono text-red-500">− {fmt(stripeFee)}</span>
                </div>
                {currencyConversion && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Currency conversion fee (1%)</span>
                    <span className="font-mono text-red-500">− {fmt(conversionFee)}</span>
                  </div>
                )}
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">You receive</span>
                  <span className="font-mono font-bold text-xl text-green-600">{fmt(net)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">You want to receive</span>
                  <span className="font-mono text-gray-700">{fmt(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total fees added</span>
                  <span className="font-mono text-red-500">+ {fmt(reverseFee)}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Charge customer</span>
                  <span className="font-mono font-bold text-xl text-blue-600">{fmt(reverseCharge)}</span>
                </div>
              </>
            )}
          </div>

          {/* vs domestic comparison */}
          {cardType !== "domestic" && mode === "charge" && extraCost > 0 && (
            <div className="bg-amber-50 border-t border-amber-100 px-5 py-3">
              <p className="text-xs text-amber-700">
                <strong>vs domestic card:</strong> This international transaction costs you an extra{" "}
                <strong>{fmt(extraCost)}</strong> compared to a US card.
                That's {((extraCost / amount) * 100).toFixed(2)}% more.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Rate comparison table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Stripe US rate comparison</h3>
        </div>
        <div className="divide-y divide-gray-100 text-sm">
          {[
            { type: "US domestic card", rate: "2.9% + $0.30", extra: "—" },
            { type: "International card", rate: "3.9% + $0.30", extra: "+1.0%" },
            { type: "Manually entered", rate: "3.4% + $0.30", extra: "+0.5%" },
            { type: "Currency conversion", rate: "+1.0%", extra: "Additional" },
          ].map((row) => (
            <div key={row.type} className="flex justify-between px-4 py-2.5">
              <span className="text-gray-600">{row.type}</span>
              <div className="text-right">
                <span className="font-mono text-gray-700 text-xs">{row.rate}</span>
                {row.extra !== "—" && row.extra !== "Additional" && (
                  <span className="ml-2 text-xs text-red-500">{row.extra}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
