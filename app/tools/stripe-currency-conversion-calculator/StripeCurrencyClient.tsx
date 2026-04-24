"use client";
import { useState } from "react";

const CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD", "SGD", "INR", "BRL", "MXN", "JPY", "NZD", "CHF"];

const STRIPE_RATES: Record<string, { pct: number; fixed: number; symbol: string }> = {
  USD: { pct: 0.029, fixed: 0.30, symbol: "$" },
  GBP: { pct: 0.015, fixed: 0.20, symbol: "£" },
  EUR: { pct: 0.015, fixed: 0.25, symbol: "€" },
  CAD: { pct: 0.029, fixed: 0.30, symbol: "CA$" },
  AUD: { pct: 0.017, fixed: 0.30, symbol: "A$" },
  SGD: { pct: 0.034, fixed: 0.50, symbol: "S$" },
  INR: { pct: 0.02, fixed: 2.00, symbol: "₹" },
  BRL: { pct: 0.0399, fixed: 0.39, symbol: "R$" },
  MXN: { pct: 0.036, fixed: 3.00, symbol: "MX$" },
  JPY: { pct: 0.036, fixed: 30, symbol: "¥" },
  NZD: { pct: 0.029, fixed: 0.30, symbol: "NZ$" },
  CHF: { pct: 0.029, fixed: 0.30, symbol: "CHF" },
};

function parse(raw: string) { return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0; }
function fmt(n: number, symbol: string) { return symbol + n.toFixed(2); }

export default function StripeCurrencyClient() {
  const [amountRaw, setAmountRaw] = useState("");
  const [chargeCurrency, setChargeCurrency] = useState("USD");
  const [settleCurrency, setSettleCurrency] = useState("GBP");
  const [isIntlCard, setIsIntlCard] = useState(false);

  const amount = parse(amountRaw);
  const needsConversion = chargeCurrency !== settleCurrency;
  const chargeRate = STRIPE_RATES[chargeCurrency] || STRIPE_RATES.USD;

  const basePct = isIntlCard ? chargeRate.pct + 0.01 : chargeRate.pct;
  const conversionPct = needsConversion ? 0.01 : 0;
  const totalPct = basePct + conversionPct;

  const baseFee = amount * chargeRate.pct + chargeRate.fixed;
  const intlFee = isIntlCard ? amount * 0.01 : 0;
  const conversionFee = needsConversion ? amount * 0.01 : 0;
  const totalFee = baseFee + intlFee + conversionFee;
  const net = Math.max(0, amount - totalFee);

  const noConversionFee = baseFee + intlFee;
  const saving = conversionFee;

  const hasResult = amount > 0;

  return (
    <div className="space-y-6">

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Transaction amount</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">{chargeRate.symbol}</span>
          <input type="text" inputMode="decimal" value={amountRaw}
            onChange={(e) => setAmountRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg font-mono text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
        </div>
      </div>

      {/* Currency selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Charge currency</label>
          <select value={chargeCurrency} onChange={(e) => setChargeCurrency(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Settlement currency</label>
          <select value={settleCurrency} onChange={(e) => setSettleCurrency(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* International card toggle */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-700">International card? (+1%)</p>
          <p className="text-xs text-gray-400 mt-0.5">Card issued outside your account country</p>
        </div>
        <button onClick={() => setIsIntlCard(!isIntlCard)}
          className={`relative w-11 h-6 rounded-full transition-colors ${isIntlCard ? "bg-blue-600" : "bg-gray-200"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isIntlCard ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {/* Conversion warning */}
      {needsConversion && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          <strong>Currency conversion fee applies:</strong> Charging in {chargeCurrency} but settling in {settleCurrency} adds a 1% conversion fee on top of the standard processing fee.
        </div>
      )}

      {/* Result */}
      {hasResult && (
        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gray-50 px-5 py-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction amount</span>
              <span className="font-mono text-gray-700">{fmt(amount, chargeRate.symbol)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Standard fee ({(chargeRate.pct * 100).toFixed(1)}% + {chargeRate.symbol}{chargeRate.fixed.toFixed(2)})</span>
              <span className="font-mono text-red-400">− {fmt(baseFee, chargeRate.symbol)}</span>
            </div>
            {isIntlCard && (
              <div className="flex justify-between">
                <span className="text-gray-500">International card surcharge (1%)</span>
                <span className="font-mono text-red-400">− {fmt(intlFee, chargeRate.symbol)}</span>
              </div>
            )}
            {needsConversion && (
              <div className="flex justify-between">
                <span className="text-gray-500">Currency conversion fee (1%)</span>
                <span className="font-mono text-red-500 font-medium">− {fmt(conversionFee, chargeRate.symbol)}</span>
              </div>
            )}
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">You receive ({settleCurrency})</span>
              <span className="font-mono font-bold text-xl text-green-600">{fmt(net, chargeRate.symbol)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Total effective rate</span>
              <span className="font-mono text-gray-500">{(totalFee / amount * 100).toFixed(2)}%</span>
            </div>
          </div>

          {needsConversion && saving > 0 && (
            <div className="bg-blue-50 border-t border-blue-100 px-5 py-3">
              <p className="text-xs text-blue-700">
                <strong>Tip:</strong> Settling in {chargeCurrency} instead of {settleCurrency} would save you{" "}
                <strong>{fmt(saving, chargeRate.symbol)}</strong> on this transaction by avoiding the conversion fee.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
