"use client";
import { useState } from "react";

const CARD_TYPES = [
  { id: "domestic", label: "🇨🇦 Domestic Canadian card", pct: 0.029, fixed: 0.30, badge: "2.9% + CA$0.30" },
  { id: "international", label: "🌍 International card (non-CA)", pct: 0.039, fixed: 0.30, badge: "3.9% + CA$0.30" },
  { id: "amex", label: "💳 American Express", pct: 0.029, fixed: 0.30, badge: "2.9% + CA$0.30" },
];

const PROVINCES = [
  { id: "on", label: "Ontario", hst: 0.13 },
  { id: "bc", label: "British Columbia", hst: 0.05 },
  { id: "ab", label: "Alberta", hst: 0.05 },
  { id: "qc", label: "Quebec", hst: 0.05 },
  { id: "ns", label: "Nova Scotia", hst: 0.15 },
  { id: "nb", label: "New Brunswick", hst: 0.15 },
  { id: "mb", label: "Manitoba", hst: 0.05 },
  { id: "sk", label: "Saskatchewan", hst: 0.05 },
  { id: "nl", label: "Newfoundland", hst: 0.15 },
  { id: "pe", label: "PEI", hst: 0.15 },
];

function fmt(n: number) { return "CA$" + n.toFixed(2); }
function parse(raw: string) { return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0; }

export default function StripeFeeCanadaClient() {
  const [mode, setMode] = useState<"charge" | "receive">("charge");
  const [amountRaw, setAmountRaw] = useState("");
  const [cardTypeId, setCardTypeId] = useState("domestic");
  const [monthlyRaw, setMonthlyRaw] = useState("");
  const [includeTax, setIncludeTax] = useState(false);
  const [provinceId, setProvinceId] = useState("on");

  const card = CARD_TYPES.find((c) => c.id === cardTypeId)!;
  const province = PROVINCES.find((p) => p.id === provinceId)!;
  const amount = parse(amountRaw);
  const monthly = parseInt(monthlyRaw) || 0;

  const baseFee = amount * card.pct + card.fixed;
  const taxOnFee = includeTax ? baseFee * province.hst : 0;
  const totalFee = baseFee + taxOnFee;
  const net = Math.max(0, amount - totalFee);

  const reverseCharge = amount > 0 ? (amount + card.fixed) / (1 - card.pct) : 0;
  const reverseFee = reverseCharge - amount;

  const hasResult = amount > 0;

  return (
    <div className="space-y-6">

      {/* CA notice */}
      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
        <span className="text-xl">🇨🇦</span>
        <div>
          <p className="font-semibold text-red-800">Stripe Canada Pricing 2026</p>
          <p className="text-red-700 text-xs mt-0.5">Domestic cards: <strong>2.9% + CA$0.30</strong> · International: <strong>3.9% + CA$0.30</strong> · HST/GST may apply</p>
        </div>
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
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {mode === "charge" ? "Amount you charge (CAD)" : "Amount you want to receive (CAD)"}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">CA$</span>
          <input type="text" inputMode="decimal" value={amountRaw}
            onChange={(e) => setAmountRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg font-mono text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
        </div>
      </div>

      {/* Card type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card type</label>
        <div className="space-y-2">
          {CARD_TYPES.map((c) => (
            <button key={c.id} onClick={() => setCardTypeId(c.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${cardTypeId === c.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              <span className="font-medium">{c.label}</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${cardTypeId === c.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{c.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tax toggle */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Include HST/GST on fees</p>
            <p className="text-xs text-gray-400 mt-0.5">GST-registered businesses can claim this back</p>
          </div>
          <button onClick={() => setIncludeTax(!includeTax)}
            className={`relative w-11 h-6 rounded-full transition-colors ${includeTax ? "bg-blue-600" : "bg-gray-200"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${includeTax ? "translate-x-5" : ""}`} />
          </button>
        </div>
        {includeTax && (
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Your province</label>
            <select value={provinceId} onChange={(e) => setProvinceId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {PROVINCES.map((p) => (
                <option key={p.id} value={p.id}>{p.label} ({(p.hst * 100).toFixed(0)}% {p.hst === 0.05 ? "GST" : "HST"})</option>
              ))}
            </select>
          </div>
        )}
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
                <span className="text-gray-500">Stripe fee ({(card.pct * 100).toFixed(1)}% + CA$0.30)</span>
                <span className="font-mono text-red-500">− {fmt(baseFee)}</span>
              </div>
              {includeTax && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{province.hst === 0.05 ? "GST" : "HST"} on fee ({(province.hst * 100).toFixed(0)}%)</span>
                  <span className="font-mono text-red-400">− {fmt(taxOnFee)}</span>
                </div>
              )}
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">You receive</span>
                <span className="font-mono font-bold text-xl text-green-600">{fmt(net)}</span>
              </div>
              <p className="text-xs text-gray-400">Effective rate: {((totalFee / amount) * 100).toFixed(2)}%</p>
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
              <div className="flex justify-between items-center">
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
            <input type="text" inputMode="numeric" value={monthlyRaw}
              onChange={(e) => setMonthlyRaw(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 50"
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-sm text-gray-500">transactions/month</span>
          </div>
          {monthly > 0 && (
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Monthly volume", value: fmt(amount * monthly), color: "text-gray-700" },
                { label: "Stripe fees", value: fmt(totalFee * monthly), color: "text-red-500" },
                { label: "You receive", value: fmt(net * monthly), color: "text-green-600" },
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
    </div>
  );
}
