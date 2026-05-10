"use client";
import { useState } from "react";

const REGIONS = [
  { id: "au_domestic", label: " Australia — domestic card", pct: 0.017, fixed: 0.30, symbol: "A$", currency: "AUD", badge: "1.7% + A$0.30" },
  { id: "au_intl", label: " Australia — international card", pct: 0.035, fixed: 0.30, symbol: "A$", currency: "AUD", badge: "3.5% + A$0.30" },
  { id: "nz_domestic", label: " New Zealand — domestic card", pct: 0.027, fixed: 0.30, symbol: "NZ$", currency: "NZD", badge: "2.7% + NZ$0.30" },
  { id: "nz_intl", label: " New Zealand — international card", pct: 0.037, fixed: 0.30, symbol: "NZ$", currency: "NZD", badge: "3.7% + NZ$0.30" },
];

function fmt(n: number, symbol: string) { return symbol + n.toFixed(2); }
function parse(raw: string) { return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0; }

export default function StripeFeeAustraliaClient() {
  const [mode, setMode] = useState<"charge" | "receive">("charge");
  const [amountRaw, setAmountRaw] = useState("");
  const [regionId, setRegionId] = useState("au_domestic");
  const [monthlyRaw, setMonthlyRaw] = useState("");
  const [includeGst, setIncludeGst] = useState(false);

  const region = REGIONS.find((r) => r.id === regionId)!;
  const amount = parse(amountRaw);
  const monthly = parseInt(monthlyRaw) || 0;

  const baseFee = amount * region.pct + region.fixed;
  const gstOnFee = includeGst ? baseFee * 0.10 : 0;
  const totalFee = baseFee + gstOnFee;
  const net = Math.max(0, amount - totalFee);

  const reverseCharge = amount > 0 ? (amount + region.fixed) / (1 - region.pct - (includeGst ? region.pct * 0.10 : 0)) : 0;
  const reverseFee = reverseCharge - amount;

  const hasResult = amount > 0;

  return (
    <div className="space-y-6">

      {/* AU notice */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
        <span className="text-xl"></span>
        <div>
          <p className="font-semibold text-blue-800">Stripe Australia Pricing 2026</p>
          <p className="text-blue-700 text-xs mt-0.5">Domestic cards: <strong>1.7% + A$0.30</strong> · International cards: <strong>3.5% + A$0.30</strong> · GST may apply</p>
        </div>
      </div>

      {/* Mode toggle */}
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
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {mode === "charge" ? "Amount you charge" : "Amount you want to receive"}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">{region.symbol}</span>
          <input type="text" inputMode="decimal" value={amountRaw}
            onChange={(e) => setAmountRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg font-mono text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
        </div>
      </div>

      {/* Region selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card type & country</label>
        <div className="space-y-2">
          {REGIONS.map((r) => (
            <button key={r.id} onClick={() => setRegionId(r.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${regionId === r.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              <span className="font-medium">{r.label}</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${regionId === r.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{r.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* GST toggle */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-700">Include GST on fees (+10%)</p>
          <p className="text-xs text-gray-400 mt-0.5">For GST-registered businesses — you can claim this back as an input tax credit</p>
        </div>
        <button onClick={() => setIncludeGst(!includeGst)}
          className={`relative w-11 h-6 rounded-full transition-colors ${includeGst ? "bg-blue-600" : "bg-gray-200"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${includeGst ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {/* Result */}
      {hasResult && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-2.5">
          {mode === "charge" ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">You charge</span>
                <span className="font-mono text-gray-700">{fmt(amount, region.symbol)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stripe fee ({(region.pct * 100).toFixed(1)}% + {region.symbol}0.30)</span>
                <span className="font-mono text-red-500">− {fmt(baseFee, region.symbol)}</span>
              </div>
              {includeGst && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST on fee (10%)</span>
                  <span className="font-mono text-red-400">− {fmt(gstOnFee, region.symbol)}</span>
                </div>
              )}
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">You receive</span>
                <span className="font-mono font-bold text-xl text-green-600">{fmt(net, region.symbol)}</span>
              </div>
              <p className="text-xs text-gray-400">Effective rate: {((totalFee / amount) * 100).toFixed(2)}%</p>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">You want to receive</span>
                <span className="font-mono text-gray-700">{fmt(amount, region.symbol)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stripe fee added</span>
                <span className="font-mono text-red-500">+ {fmt(reverseFee, region.symbol)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Charge customer</span>
                <span className="font-mono font-bold text-xl text-blue-600">{fmt(reverseCharge, region.symbol)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Monthly projection */}
      {hasResult && mode === "charge" && (
        <div className="border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly projection</h3>
          <div className="flex items-center gap-3 mb-4">
            <input type="text" inputMode="numeric" value={monthlyRaw}
              onChange={(e) => setMonthlyRaw(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 50"
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-sm text-gray-500">transactions/month</span>
          </div>
          {monthly > 0 && (
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Monthly volume", value: fmt(amount * monthly, region.symbol), color: "text-gray-700" },
                { label: "Stripe fees", value: fmt(totalFee * monthly, region.symbol), color: "text-red-500" },
                { label: "You receive", value: fmt(net * monthly, region.symbol), color: "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rate table */}
      <details className="text-sm text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700 font-medium">Stripe AU/NZ full rate table</summary>
        <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Card type", "Rate", "Fixed fee"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { type: "AU domestic (Visa/MC)", rate: "1.7%", fixed: "A$0.30" },
                { type: "AU international card", rate: "3.5%", fixed: "A$0.30" },
                { type: "NZ domestic (Visa/MC)", rate: "2.7%", fixed: "NZ$0.30" },
                { type: "NZ international card", rate: "3.7%", fixed: "NZ$0.30" },
                { type: "AU ACH/BECS direct debit", rate: "1.0%", fixed: "A$0.30 (max A$3.50)" },
              ].map((row) => (
                <tr key={row.type} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-600">{row.type}</td>
                  <td className="px-3 py-2 font-mono text-gray-700">{row.rate}</td>
                  <td className="px-3 py-2 font-mono text-gray-700">{row.fixed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
