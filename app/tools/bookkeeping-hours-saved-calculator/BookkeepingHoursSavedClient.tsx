"use client";
import { useState } from "react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

const TASKS = [
  { id: "import", label: "Importing & formatting transaction CSVs", defaultHours: 2.5, automatable: true },
  { id: "categorize", label: "Categorizing transactions in QuickBooks", defaultHours: 2.0, automatable: true },
  { id: "reconcile", label: "Reconciling bank accounts", defaultHours: 1.5, automatable: false },
  { id: "errors", label: "Fixing import errors & format issues", defaultHours: 1.0, automatable: true },
  { id: "reports", label: "Running & reviewing reports", defaultHours: 1.0, automatable: false },
  { id: "tax", label: "Preparing data for accountant / tax time", defaultHours: 1.5, automatable: false },
];

export default function BookkeepingHoursSavedClient() {
  const [hours, setHours] = useState<Record<string, number>>(
    Object.fromEntries(TASKS.map((t) => [t.id, t.defaultHours]))
  );
  const [hourlyRate, setHourlyRate] = useState("75");

  const rate = parseFloat(hourlyRate) || 0;
  const totalHours = Object.values(hours).reduce((a, b) => a + b, 0);
  const automatableHours = TASKS.filter((t) => t.automatable).reduce((a, t) => a + (hours[t.id] || 0), 0);
  const monthlyCost = totalHours * rate;
  const savingsPerMonth = automatableHours * rate;
  const annualSavings = savingsPerMonth * 12;
  const remainingHours = totalHours - automatableHours;

  return (
    <div className="space-y-6">

      {/* Hourly rate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Your effective hourly rate (what your time is worth)
        </label>
        <div className="relative max-w-[200px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/hr</span>
        </div>
      </div>

      {/* Task hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hours spent per month on each task
        </label>
        <div className="space-y-3">
          {TASKS.map((task) => (
            <div key={task.id} className={`flex items-center gap-4 p-3 rounded-lg border ${task.automatable ? "border-blue-100 bg-blue-50/50" : "border-gray-100 bg-gray-50/50"}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 font-medium">{task.label}</p>
                {task.automatable && (
                  <p className="text-xs text-blue-500 mt-0.5">⚡ Automatable</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={hours[task.id]}
                  onChange={(e) => setHours((h) => ({ ...h, [task.id]: parseFloat(e.target.value) || 0 }))}
                  className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-400 w-6">hrs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-gray-900 px-5 py-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white font-mono">{totalHours.toFixed(1)}</p>
            <p className="text-xs text-gray-400 mt-0.5">hrs/month total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400 font-mono">{fmt(monthlyCost)}</p>
            <p className="text-xs text-gray-400 mt-0.5">monthly cost</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400 font-mono">{fmt(monthlyCost * 12)}</p>
            <p className="text-xs text-gray-400 mt-0.5">annual cost</p>
          </div>
        </div>

        <div className="bg-green-50 border-t border-green-100 px-5 py-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600 font-mono">{automatableHours.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-0.5">automatable hrs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 font-mono">{fmt(savingsPerMonth)}</p>
            <p className="text-xs text-gray-500 mt-0.5">savings/month</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 font-mono">{fmt(annualSavings)}</p>
            <p className="text-xs text-gray-500 mt-0.5">annual savings</p>
          </div>
        </div>

        <div className="bg-white px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            After automation: <strong className="text-gray-700">{remainingHours.toFixed(1)} hrs/month</strong> of unavoidable bookkeeping remaining
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Automatable ({((automatableHours / totalHours) * 100).toFixed(0)}%)</span>
          <span>Manual ({((remainingHours / totalHours) * 100).toFixed(0)}%)</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(automatableHours / totalHours) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
