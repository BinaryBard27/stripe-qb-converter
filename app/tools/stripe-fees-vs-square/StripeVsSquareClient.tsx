"use client";

import { useMemo, useState } from "react";

export default function StripeVsSquareClient() {
  const [amount, setAmount] = useState("100");
  const [transactions, setTransactions] = useState("50");
  const [squareMode, setSquareMode] = useState<"online" | "api">("online");
  const value = Number(amount) || 0;
  const count = Number(transactions) || 0;
  const stripeFee = useMemo(() => value * .029 + .3, [value]);
  const squareRate = squareMode === "online" ? .033 : .029;
  const squareFee = useMemo(() => value * squareRate + .3, [value, squareRate]);
  const stripeMonthly = stripeFee * count;
  const squareMonthly = squareFee * count;
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-gray-700">Transaction amount<input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg" placeholder="100.00" /></label><label className="block text-sm font-medium text-gray-700">Transactions per month<input value={transactions} onChange={(e) => setTransactions(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-lg" placeholder="50" /></label></div>
    <div><p className="mb-2 text-sm font-medium text-gray-700">Square payment type</p><div className="flex gap-2"><button type="button" onClick={() => setSquareMode("online")} className={`rounded-lg border px-4 py-2 text-sm ${squareMode === "online" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600"}`}>Online · 3.3% + $0.30</button><button type="button" onClick={() => setSquareMode("api")} className={`rounded-lg border px-4 py-2 text-sm ${squareMode === "api" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600"}`}>Online API · 2.9% + $0.30</button></div></div>
    <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5"><p className="text-sm font-semibold text-indigo-700">Stripe</p><p className="mt-3 text-3xl font-bold text-gray-900">${stripeFee.toFixed(2)}</p><p className="mt-1 text-sm text-gray-500">fee per transaction</p><p className="mt-4 border-t border-indigo-100 pt-3 text-sm text-gray-600">${stripeMonthly.toFixed(2)} estimated monthly fees</p></div><div className="rounded-xl border border-gray-200 bg-gray-50 p-5"><p className="text-sm font-semibold text-gray-700">Square</p><p className="mt-3 text-3xl font-bold text-gray-900">${squareFee.toFixed(2)}</p><p className="mt-1 text-sm text-gray-500">fee per transaction</p><p className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-600">${squareMonthly.toFixed(2)} estimated monthly fees</p></div></div>
    <p className="rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">Example US online rates. Actual pricing can vary by plan, payment method, country, and custom pricing. Verify current rates with Stripe and Square before making a decision.</p>
  </div>;
}
