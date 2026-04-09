"use client";
import { useState } from "react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export default function AnnualBookkeepingCostClient() {
  const [txPerMonth, setTxPerMonth] = useState("150");
  const [hourlyRate, setHourlyRate] = useState("75");
  const [qbPlan, setQbPlan] = useState<"simple" | "essentials" | "plus">("simple");
  const [hasAccountant, setHasAccountant] = useState(true);
  const [accountantCost, setAccountantCost] = useState("800");

  const tx = parseInt(txPerMonth) || 0;
  const rate = parseFloat(hourlyRate) || 0;
  const accountant = hasAccountant ? (parseFloat(accountantCost) || 0) : 0;

  const qbCosts = { simple: 35, essentials: 65, plus: 99 };
  const qbMonthly = qbCosts[qbPlan];

  // DIY hours estimate based on transaction volume
  const diyHoursPerMonth = Math.max(2, Math.min(40, tx * 0.05 + 2));
  const diyCostPerMonth = diyHoursPerMonth * rate;
  const diyAnnual = (diyCostPerMonth + qbMonthly) * 12 + accountant;

  // Bookkeeper cost estimate
  const bookeeperMonthly = tx < 100 ? 350 : tx < 300 ? 550 : tx < 500 ? 800 : 1200;
  const bookeeperAnnual = bookeeperMonthly * 12 + accountant;

  // Software-assisted DIY (with automation tools)
  const automatedHours = Math.max(1, diyHoursPerMonth * 0.3);
  const automatedCostPerMonth = automatedHours * rate;
  const automatedAnnual = (automatedCostPerMonth + qbMonthly) * 12 + accountant;

  const options = [
    {
      label: "DIY (manual)",
      monthly: diyCostPerMonth + qbMonthly,
      annual: diyAnnual,
      hours: diyHoursPerMonth,
      color: "border-red-200 bg-red-50",
      textColor: "text-red-700",
      badge: "Most time",
      badgeBg: "bg-red-100 text-red-600",
      details: [`${diyHoursPerMonth.toFixed(1)} hrs/month`, `QuickBooks: ${fmt(qbMonthly)}/mo`],
    },
    {
      label: "Hire a bookkeeper",
      monthly: bookeeperMonthly,
      annual: bookeeperAnnual,
      hours: 0,
      color: "border-blue-200 bg-blue-50",
      textColor: "text-blue-700",
      badge: "Most hands-off",
      badgeBg: "bg-blue-100 text-blue-600",
      details: [`Est. ${fmt(bookeeperMonthly)}/month`, "Based on your volume"],
    },
    {
      label: "DIY + automation tools",
      monthly: automatedCostPerMonth + qbMonthly,
      annual: automatedAnnual,
      hours: automatedHours,
      color: "border-green-200 bg-green-50",
      textColor: "text-green-700",
      badge: "Best value",
      badgeBg: "bg-green-100 text-green-600",
      details: [`${automatedHours.toFixed(1)} hrs/month`, "Free tools + QuickBooks"],
    },
  ];

  const cheapest = options.reduce((a, b) => a.annual < b.annual ? a : b);

  return (
    <div className="space-y-6">

      {/* Inputs */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Transactions per month</label>
          <input
            type="text"
            inputMode="numeric"
            value={txPerMonth}
            onChange={(e) => setTxPerMonth(e.target.value.replace(/\D/g, ""))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Your hourly rate (opportunity cost)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* QB plan */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">QuickBooks plan</label>
        <div className="grid grid-cols-3 gap-2">
          {(["simple", "essentials", "plus"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setQbPlan(p)}
              className={`py-2.5 px-3 rounded-lg border text-sm transition-all ${qbPlan === p ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}
            >
              <div className="font-medium capitalize">{p === "simple" ? "Simple Start" : p === "essentials" ? "Essentials" : "Plus"}</div>
              <div className="text-xs text-gray-400">${qbCosts[p]}/mo</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accountant */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Annual accountant / CPA cost</p>
            <p className="text-xs text-gray-400">For tax prep, year-end review</p>
          </div>
          <button
            onClick={() => setHasAccountant(!hasAccountant)}
            className={`relative w-11 h-6 rounded-full transition-colors ${hasAccountant ? "bg-blue-600" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasAccountant ? "translate-x-5" : ""}`} />
          </button>
        </div>
        {hasAccountant && (
          <div className="relative max-w-[180px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={accountantCost}
              onChange={(e) => setAccountantCost(e.target.value.replace(/\D/g, ""))}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">/yr</span>
          </div>
        )}
      </div>

      {/* Comparison cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Annual cost comparison</h3>
        {options.map((opt) => (
          <div key={opt.label} className={`rounded-xl border p-4 ${opt.color}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-semibold text-gray-900">{opt.label}</span>
                {opt.label === cheapest.label && (
                  <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Cheapest</span>
                )}
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${opt.badgeBg}`}>{opt.badge}</span>
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-0.5">
                {opt.details.map((d) => (
                  <p key={d} className="text-xs text-gray-500">{d}</p>
                ))}
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold font-mono ${opt.textColor}`}>{fmt(opt.annual)}</p>
                <p className="text-xs text-gray-400">/year</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Savings callout */}
      <div className="bg-gray-900 rounded-xl p-4 text-center">
        <p className="text-gray-400 text-sm mb-1">Switching from manual DIY to DIY + automation saves you</p>
        <p className="text-3xl font-bold text-green-400 font-mono">{fmt(diyAnnual - automatedAnnual)}</p>
        <p className="text-gray-400 text-sm mt-1">per year — and {(diyHoursPerMonth - automatedHours).toFixed(1)} hours every month</p>
      </div>
    </div>
  );
}
