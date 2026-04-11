"use client";
import { useState } from "react";

const PCT = 0.029;
const FIXED = 0.30;

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function fmtK(n: number) {
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K";
  return fmt(n);
}
function parse(raw: string) { return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0; }

export default function StripeProcessingFeeClient() {
  const [amountRaw, setAmountRaw] = useState("");
  const [volumeRaw, setVolumeRaw] = useState("");
  const [txCountRaw, setTxCountRaw] = useState("");

  const amount = parse(amountRaw);
  const monthlyVolume = parse(volumeRaw);
  const txCount = parseInt(txCountRaw) || 0;

  const fee = amount * PCT + FIXED;
  const net = Math.max(0, amount - fee);
  const effectiveRate = amount > 0 ? (fee / amount) * 100 : 0;

  // Monthly from volume
  const monthlyFeeFromVolume = monthlyVolume > 0
    ? monthlyVolume * PCT + (txCount > 0 ? txCount * FIXED : (monthlyVolume / (amount || 50)) * FIXED)
    : null;

  // Monthly from tx count
  const monthlyFeeFromCount = txCount > 0 && amount > 0 ? fee * txCount : null;
  const monthlyNet = monthlyFeeFromCount ? net * txCount : null;

  const hasResult = amount > 0;

  const VOLUME_EXAMPLES = [
    { volume: 10000, label: "$10K/mo" },
    { volume: 50000, label: "$50K/mo" },
    { volume: 100000, label: "$100K/mo" },
  ];

  return (
    <div className="space-y-6">

      {/* Main calc */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Transaction amount</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input type="text" inputMode="decimal" value={amountRaw}
            onChange={(e) => setAmountRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg font-mono text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
        </div>
      </div>

      {/* Result */}
      {hasResult && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Gross</p>
              <p className="text-xl font-bold font-mono text-gray-700">{fmt(amount)}</p>
            </div>
            <div>
              <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Stripe fee</p>
              <p className="text-xl font-bold font-mono text-red-500">−{fmt(fee)}</p>
            </div>
            <div>
              <p className="text-xs text-green-400 uppercase tracking-wide mb-1">You receive</p>
              <p className="text-xl font-bold font-mono text-green-600">{fmt(net)}</p>
            </div>
          </div>
          <div className="h-px bg-gray-200 mb-3" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fee formula</span>
            <span className="font-mono text-gray-600 text-xs">({fmt(amount)} × 2.9%) + $0.30 = {fmt(fee)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Effective rate</span>
            <span className="font-mono text-gray-600">{effectiveRate.toFixed(3)}%</span>
          </div>
        </div>
      )}

      {/* Monthly from tx count */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly projection</h3>
        <div className="flex items-center gap-3 mb-4">
          <input type="text" inputMode="numeric" value={txCountRaw}
            onChange={(e) => setTxCountRaw(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 100"
            className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="text-sm text-gray-500">transactions/month at {fmt(amount || 0)} each</span>
        </div>
        {monthlyFeeFromCount && monthlyNet && hasResult && (
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Monthly volume", value: fmtK(amount * txCount), color: "text-gray-700" },
              { label: "Monthly fees", value: fmtK(monthlyFeeFromCount), color: "text-red-500" },
              { label: "Monthly net", value: fmtK(monthlyNet), color: "text-green-600" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <p className={`text-base font-bold font-mono ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                <p className="text-xs text-gray-300">{fmtK(s.value === s.value ? (s.label.includes("net") ? monthlyNet * 12 : s.label.includes("fee") ? monthlyFeeFromCount * 12 : amount * txCount * 12) : 0)}/yr</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Volume examples */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5">
          <h3 className="text-sm font-medium text-gray-700">Annual fees at different volumes</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {VOLUME_EXAMPLES.map((ex) => {
            const avgTx = amount || 100;
            const txPerYear = Math.round((ex.volume * 12) / avgTx);
            const annualFee = ex.volume * 12 * PCT + txPerYear * FIXED;
            const annualNet = ex.volume * 12 - annualFee;
            return (
              <div key={ex.label} className="grid grid-cols-3 px-4 py-3 text-sm">
                <span className="font-medium text-gray-700">{ex.label}</span>
                <span className="text-center font-mono text-red-500">−{fmtK(annualFee)}/yr</span>
                <span className="text-right font-mono text-green-600">{fmtK(annualNet)}/yr net</span>
              </div>
            );
          })}
        </div>
        <div className="bg-blue-50 border-t border-blue-100 px-4 py-2.5">
          <p className="text-xs text-blue-600">Above ~$80K/month, contact Stripe for custom pricing to reduce your rate.</p>
        </div>
      </div>
    </div>
  );
}
