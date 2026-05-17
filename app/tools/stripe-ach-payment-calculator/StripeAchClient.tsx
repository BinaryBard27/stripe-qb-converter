"use client";
import { useState } from "react";

const ACH_PCT = 0.008;
const ACH_CAP = 5.00;
const CARD_PCT = 0.029;
const CARD_FIXED = 0.30;

function calcAch(amount: number) {
  const fee = Math.min(amount * ACH_PCT, ACH_CAP);
  return { fee, net: Math.max(0, amount - fee) };
}

function calcCard(amount: number) {
  const fee = amount * CARD_PCT + CARD_FIXED;
  return { fee, net: Math.max(0, amount - fee) };
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

function parse(raw: string) { return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0; }

// Break-even point where ACH = card
// ACH: amount * 0.008 (until $5 cap) = CARD: amount * 0.029 + 0.30
// Below cap: 0.008x = 0.029x + 0.30 → negative, so ACH always wins below cap threshold
// Cap kicks in at: 0.008x = 5 → x = $625
// Above $625, ACH = $5 flat
// Card at $625: 0.029*625 + 0.30 = $18.425 + $0.30 = $18.725
// So ACH is ALWAYS cheaper above ~$14 (where 0.008x = 0.029x + 0.30 crossover)
const BREAK_EVEN = 0.30 / (0.029 - 0.008); // ~$14.29

export default function StripeAchClient() {
  const [amountRaw, setAmountRaw] = useState("");
  const [monthlyRaw, setMonthlyRaw] = useState("");

  const amount = parse(amountRaw);
  const monthly = parseInt(monthlyRaw) || 0;

  const ach = amount > 0 ? calcAch(amount) : null;
  const card = amount > 0 ? calcCard(amount) : null;
  const savings = ach && card ? card.fee - ach.fee : 0;
  const achCapped = amount >= 625;

  const EXAMPLES = [100, 500, 1000, 5000, 10000];

  return (
    <div className="space-y-6">

      {/* Key fact */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
        <p className="font-semibold text-green-800 mb-1">💡 ACH is almost always cheaper than cards</p>
        <p className="text-green-700 text-xs">Stripe ACH: <strong>0.8% capped at $5</strong>. For any transaction over ~$14, ACH beats the standard 2.9% + $0.30 card rate. For $1,000+, ACH costs $5 vs $29.30 for a card.</p>
      </div>

      {/* Amount input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Transaction amount</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input type="text" inputMode="decimal" value={amountRaw}
            onChange={(e) => setAmountRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg font-mono text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {EXAMPLES.map((v) => (
            <button key={v} onClick={() => setAmountRaw(String(v))}
              className={`text-xs px-2.5 py-1 rounded-md border transition-all ${amount === v ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
              ${v.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Side by side comparison */}
      {ach && card && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">ACH vs Card comparison</h3>
          <div className="grid grid-cols-2 gap-3">

            {/* ACH */}
            <div className="border-2 border-green-400 bg-green-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-green-700 text-sm">ACH / Bank transfer</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Cheaper ✓</span>
              </div>
              <p className="text-xs text-green-600 font-mono mb-3">
                {achCapped ? "0.8% → capped at $5" : `0.8% = ${fmt(ach.fee)}`}
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-mono text-red-500 font-medium">− {fmt(ach.fee)}</span>
                </div>
                <div className="h-px bg-green-200" />
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">You receive</span>
                  <span className="font-mono font-bold text-green-700">{fmt(ach.net)}</span>
                </div>
              </div>
            </div>

            {/* Card */}
            <div className="border border-gray-200 bg-white rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-700 text-sm">Card payment</span>
                <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-semibold">More expensive</span>
              </div>
              <p className="text-xs text-gray-400 font-mono mb-3">2.9% + $0.30</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-mono text-red-500 font-medium">− {fmt(card.fee)}</span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">You receive</span>
                  <span className="font-mono font-bold text-gray-700">{fmt(card.net)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings highlight */}
          <div className="bg-gray-900 rounded-xl px-5 py-4 text-center">
            <p className="text-gray-400 text-sm">ACH saves you</p>
            <p className="text-3xl font-bold text-green-400 font-mono">{fmt(savings)}</p>
            <p className="text-gray-500 text-xs mt-1">on this transaction vs standard card processing</p>
          </div>
        </div>
      )}

      {/* Monthly projection */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly savings projection</h3>
        <div className="flex items-center gap-3 mb-4">
          <input type="text" inputMode="numeric" value={monthlyRaw}
            onChange={(e) => setMonthlyRaw(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 20"
            className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="text-sm text-gray-500">transactions/month</span>
        </div>
        {monthly > 0 && ach && card && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "ACH fees/mo", value: fmt(ach.fee * monthly), color: "text-green-600", bg: "bg-green-50 border-green-100" },
                { label: "Card fees/mo", value: fmt(card.fee * monthly), color: "text-red-500", bg: "bg-red-50 border-red-100" },
                { label: "Monthly saving", value: fmt(savings * monthly), color: "text-green-700", bg: "bg-green-50 border-green-200" },
              ].map((s) => (
                <div key={s.label} className={`rounded-lg p-3 border ${s.bg}`}>
                  <p className={`text-base font-bold font-mono ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500">
              Annual savings switching to ACH: <strong className="text-green-600 font-mono">{fmt(savings * monthly * 12)}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Quick reference table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-medium text-gray-700">ACH vs Card — quick reference</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2 text-gray-400 font-medium">Amount</th>
                <th className="text-right px-4 py-2 text-green-600 font-medium">ACH fee</th>
                <th className="text-right px-4 py-2 text-red-500 font-medium">Card fee</th>
                <th className="text-right px-4 py-2 text-gray-600 font-medium">You save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[10, 50, 100, 250, 500, 625, 1000, 5000, 10000].map((v) => {
                const a = calcAch(v);
                const c = calcCard(v);
                const s = c.fee - a.fee;
                return (
                  <tr key={v} className={`hover:bg-gray-50 ${amount === v ? "bg-blue-50" : ""}`}>
                    <td className="px-4 py-2 font-mono text-gray-700">${v.toLocaleString()}</td>
                    <td className="px-4 py-2 font-mono text-green-600 text-right">{fmt(a.fee)}{v >= 625 ? " 🔒" : ""}</td>
                    <td className="px-4 py-2 font-mono text-red-500 text-right">{fmt(c.fee)}</td>
                    <td className="px-4 py-2 font-mono text-gray-700 font-semibold text-right">{fmt(s)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 px-4 py-2">🔒 = ACH fee capped at $5. All amounts above $625 cost exactly $5 via ACH.</p>
        </div>
      </div>
    </div>
  );
}
