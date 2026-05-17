"use client";
import { useState } from "react";

const CARD_TYPES = [
  { id: "domestic", label: "🇮🇳 Domestic Indian card (Visa/MC/RuPay)", pct: 0.02, fixed: 0, badge: "2%" },
  { id: "international", label: "🌍 International card (non-IN)", pct: 0.03, fixed: 0, badge: "3%" },
  { id: "amex", label: "💳 American Express", pct: 0.03, fixed: 0, badge: "3%" },
];

const GST_RATE = 0.18;

function fmt(n: number) {
  return "₹" + new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}
function parse(raw: string) { return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0; }

export default function StripeFeeIndiaClient() {
  const [mode, setMode] = useState<"charge" | "receive">("charge");
  const [amountRaw, setAmountRaw] = useState("");
  const [cardTypeId, setCardTypeId] = useState("domestic");
  const [monthlyRaw, setMonthlyRaw] = useState("");
  const [includeGst, setIncludeGst] = useState(false);

  const card = CARD_TYPES.find((c) => c.id === cardTypeId)!;
  const amount = parse(amountRaw);
  const monthly = parseInt(monthlyRaw) || 0;

  const baseFee = amount * card.pct;
  const gstOnFee = includeGst ? baseFee * GST_RATE : 0;
  const totalFee = baseFee + gstOnFee;
  const net = Math.max(0, amount - totalFee);

  const reverseCharge = amount > 0 ? amount / (1 - card.pct * (includeGst ? 1.18 : 1)) : 0;
  const reverseFee = reverseCharge - amount;
  const hasResult = amount > 0;

  return (
    <div className="space-y-6">

      <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm">
        <span className="text-xl">🇮🇳</span>
        <div>
          <p className="font-semibold text-orange-800">Stripe India Pricing 2026</p>
          <p className="text-orange-700 text-xs mt-0.5">Domestic cards: <strong>2%</strong> (no fixed fee) · International cards: <strong>3%</strong> · GST 18% may apply</p>
        </div>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        {(["charge", "receive"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            {m === "charge" ? "I'm charging..." : "I want to receive..."}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {mode === "charge" ? "Amount you charge (INR)" : "Amount you want to receive (INR)"}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
          <input type="text" inputMode="decimal" value={amountRaw}
            onChange={(e) => setAmountRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg font-mono text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card / Payment type</label>
        <div className="space-y-2">
          {CARD_TYPES.map((c) => (
            <button key={c.id} onClick={() => setCardTypeId(c.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${cardTypeId === c.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              <span className="font-medium">{c.label}</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${cardTypeId === c.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{c.badge}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Stripe India uses percentage-only pricing — no fixed fee per transaction.</p>
      </div>

      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-700">Include GST on fees (+18%)</p>
          <p className="text-xs text-gray-400 mt-0.5">GST-registered businesses can claim as input tax credit</p>
        </div>
        <button onClick={() => setIncludeGst(!includeGst)}
          className={`relative w-11 h-6 rounded-full transition-colors ${includeGst ? "bg-blue-600" : "bg-gray-200"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${includeGst ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {hasResult && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-2.5">
          {mode === "charge" ? (
            <>
              <div className="flex justify-between text-sm"><span className="text-gray-500">You charge</span><span className="font-mono text-gray-700">{fmt(amount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Stripe fee ({(card.pct * 100).toFixed(0)}%)</span><span className="font-mono text-red-500">− {fmt(baseFee)}</span></div>
              {includeGst && <div className="flex justify-between text-sm"><span className="text-gray-500">GST on fee (18%)</span><span className="font-mono text-red-400">− {fmt(gstOnFee)}</span></div>}
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">You receive</span>
                <span className="font-mono font-bold text-xl text-green-600">{fmt(net)}</span>
              </div>
              <p className="text-xs text-gray-400">Stripe takes {((totalFee / amount) * 100).toFixed(2)}% of this transaction</p>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm"><span className="text-gray-500">You want to receive</span><span className="font-mono text-gray-700">{fmt(amount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Stripe fee added</span><span className="font-mono text-red-500">+ {fmt(reverseFee)}</span></div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Charge customer</span>
                <span className="font-mono font-bold text-xl text-blue-600">{fmt(reverseCharge)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {hasResult && mode === "charge" && (
        <div className="border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly projection</h3>
          <div className="flex items-center gap-3 mb-4">
            <input type="text" inputMode="numeric" value={monthlyRaw}
              onChange={(e) => setMonthlyRaw(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 100"
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-sm text-gray-500">transactions/month</span>
          </div>
          {monthly > 0 && (
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Volume", value: fmt(amount * monthly), color: "text-gray-700" },
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
