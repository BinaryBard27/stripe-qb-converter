"use client";
import { useState } from "react";

const TIERS = [
  { id: "uk", label: "UK card", desc: "UK-issued cards", pct: 0.015, fixed: 0.20 },
  { id: "intl", label: "International / EEA card", desc: "Non-UK issued cards", pct: 0.025, fixed: 0.20 },
  { id: "amex", label: "Amex (UK)", desc: "American Express UK", pct: 0.025, fixed: 0.20 },
];

function fmt(n: number) {
  return "£" + n.toFixed(2);
}

function parse(raw: string) {
  return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;
}

export default function StripeFeesUKClient() {
  const [mode, setMode] = useState<"charge" | "receive">("charge");
  const [amountRaw, setAmountRaw] = useState("");
  const [tierId, setTierId] = useState("uk");
  const [monthlyRaw, setMonthlyRaw] = useState("");

  const tier = TIERS.find((t) => t.id === tierId)!;
  const amount = parse(amountRaw);
  const monthly = parseInt(monthlyRaw) || 0;

  const fee = amount * tier.pct + tier.fixed;
  const net = Math.max(0, amount - fee);

  const reverseCharge = amount > 0 ? (amount + tier.fixed) / (1 - tier.pct) : 0;
  const reverseFee = reverseCharge - amount;

  const hasResult = amount > 0;

  return (
    <div className="space-y-6">

      {/* UK notice */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
        <span className="text-blue-500 mt-0.5">🇬🇧</span>
        <p className="text-blue-700">Using Stripe UK pricing: <strong>1.5% + 20p</strong> for UK cards, <strong>2.5% + 20p</strong> for international/EEA cards.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        {(["charge", "receive"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {m === "charge" ? "I'm charging..." : "I want to receive..."}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {mode === "charge" ? "Amount you charge (GBP)" : "Amount you want to receive (GBP)"}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">£</span>
          <input
            type="text"
            inputMode="decimal"
            value={amountRaw}
            onChange={(e) => setAmountRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Card type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card type</label>
        <div className="grid gap-2">
          {TIERS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTierId(t.id)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm text-left transition-all ${tierId === t.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
            >
              <div>
                <span className="font-medium">{t.label}</span>
                <span className="text-gray-400 ml-2 text-xs">{t.desc}</span>
              </div>
              <span className="text-xs font-mono text-gray-500">{(t.pct * 100).toFixed(1)}% + £{t.fixed.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      {hasResult && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-2.5">
          {mode === "charge" ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">You charge</span>
                <span className="font-mono text-gray-700">{fmt(amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stripe fee ({(tier.pct * 100).toFixed(1)}% + £{tier.fixed.toFixed(2)})</span>
                <span className="font-mono text-red-500">− {fmt(fee)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">You receive</span>
                <span className="font-mono font-bold text-xl text-green-600">{fmt(net)}</span>
              </div>
              <p className="text-xs text-gray-400">Stripe takes {((fee / amount) * 100).toFixed(2)}% of this transaction</p>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">You want to receive</span>
                <span className="font-mono text-gray-700">{fmt(amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stripe fee added</span>
                <span className="font-mono text-red-500">+ {fmt(reverseFee)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Charge customer</span>
                <span className="font-mono font-bold text-xl text-blue-600">{fmt(reverseCharge)}</span>
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
            <input
              type="text"
              inputMode="numeric"
              value={monthlyRaw}
              onChange={(e) => setMonthlyRaw(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 50"
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">transactions/month</span>
          </div>
          {monthly > 0 && (
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Monthly volume", value: fmt(amount * monthly), color: "text-gray-900" },
                { label: "Stripe fees", value: fmt(fee * monthly), color: "text-red-500" },
                { label: "Net payout", value: fmt(net * monthly), color: "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <p className={`text-base font-bold font-mono ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* How calculated */}
      <details className="text-sm text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700 font-medium">How Stripe UK fees are calculated</summary>
        <div className="mt-3 pl-2 border-l-2 border-gray-100 space-y-2 text-xs leading-relaxed">
          <p>Stripe UK standard rates: <strong>1.5% + £0.20</strong> for UK cards, <strong>2.5% + £0.20</strong> for international/EEA cards.</p>
          <p>To receive exactly £X: charge <code className="bg-gray-100 px-1 rounded">(£X + £0.20) ÷ (1 − rate%)</code></p>
          <p>UK VAT (20%) may apply to Stripe fees for VAT-registered businesses. Stripe provides VAT invoices monthly.</p>
          <p>Rates correct as of 2026. Check <a href="https://stripe.com/gb/pricing" className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">stripe.com/gb/pricing</a> for the latest.</p>
        </div>
      </details>
    </div>
  );
}
