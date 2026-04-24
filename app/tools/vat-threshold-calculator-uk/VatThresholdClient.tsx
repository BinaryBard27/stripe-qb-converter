"use client";
import { useState } from "react";

const VAT_THRESHOLD = 90000;

function fmt(n: number) {
  return "£" + Math.round(n).toLocaleString("en-GB");
}
function parse(raw: string) { return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0; }

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function VatThresholdClient() {
  const today = new Date();
  const currentMonth = today.getMonth();

  const [revenues, setRevenues] = useState<string[]>(Array(12).fill(""));
  const [growthRaw, setGrowthRaw] = useState("5");

  const growth = parse(growthRaw) / 100;
  const monthlyRevs = revenues.map(parse);
  const trailing12 = monthlyRevs.reduce((a, b) => a + b, 0);
  const pct = Math.min(100, (trailing12 / VAT_THRESHOLD) * 100);

  const remaining = Math.max(0, VAT_THRESHOLD - trailing12);
  const avgMonthly = trailing12 / 12;

  // Project when threshold will be hit
  let projectedMonth = -1;
  let runningTotal = trailing12;
  for (let i = 1; i <= 24; i++) {
    const projRevenue = avgMonthly * Math.pow(1 + growth, i);
    runningTotal = runningTotal - (monthlyRevs[(currentMonth - 11 + i) % 12] || avgMonthly) + projRevenue;
    if (runningTotal >= VAT_THRESHOLD && projectedMonth === -1) {
      projectedMonth = i;
    }
  }

  const exceedsThreshold = trailing12 >= VAT_THRESHOLD;

  const barColor = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : pct >= 60 ? "bg-yellow-400" : "bg-green-500";
  const statusColor = exceedsThreshold ? "text-red-600 bg-red-50 border-red-200" : pct >= 80 ? "text-amber-600 bg-amber-50 border-amber-200" : "text-green-600 bg-green-50 border-green-200";

  return (
    <div className="space-y-6">

      {/* UK notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
        <p className="font-semibold text-blue-800">🇬🇧 UK VAT Threshold 2026: £90,000</p>
        <p className="text-blue-700 text-xs mt-0.5">Any 12-month rolling period of taxable turnover. Updated April 2024, applies through 2026-27.</p>
      </div>

      {/* Monthly revenue inputs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Monthly taxable turnover (last 12 months)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {MONTHS.map((month, i) => {
            const mIdx = (currentMonth - 11 + i + 12) % 12;
            return (
              <div key={i}>
                <label className="block text-xs text-gray-400 mb-1">{MONTHS[mIdx]}</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">£</span>
                  <input type="text" inputMode="decimal"
                    value={revenues[i]}
                    onChange={(e) => {
                      const newRevs = [...revenues];
                      newRevs[i] = e.target.value.replace(/[^0-9.]/g, "");
                      setRevenues(newRevs);
                    }}
                    placeholder="0"
                    className="w-full pl-5 pr-2 py-1.5 border border-gray-300 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">12-month rolling turnover</span>
          <span className="font-mono font-bold text-gray-900">{fmt(trailing12)}</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>£0</span>
          <span className="font-medium text-gray-600">VAT threshold: £90,000</span>
        </div>
      </div>

      {/* Status */}
      <div className={`border rounded-xl px-5 py-4 ${statusColor}`}>
        {exceedsThreshold ? (
          <>
            <p className="font-bold text-lg mb-1">⚠️ VAT Registration Required</p>
            <p className="text-sm">Your 12-month turnover of <strong>{fmt(trailing12)}</strong> exceeds the £90,000 threshold. You must register for VAT with HMRC within 30 days of the month you exceeded the threshold.</p>
          </>
        ) : pct >= 80 ? (
          <>
            <p className="font-bold text-lg mb-1">⚡ Approaching Threshold</p>
            <p className="text-sm">You're at <strong>{pct.toFixed(0)}%</strong> of the threshold. Only <strong>{fmt(remaining)}</strong> more before you must register. Start preparing now.</p>
          </>
        ) : (
          <>
            <p className="font-bold text-lg mb-1">✓ Below VAT Threshold</p>
            <p className="text-sm">Your turnover is <strong>{pct.toFixed(0)}%</strong> of the threshold. You have <strong>{fmt(remaining)}</strong> of headroom before mandatory VAT registration.</p>
          </>
        )}
      </div>

      {/* Projection */}
      {avgMonthly > 0 && !exceedsThreshold && (
        <div className="border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-gray-700">Monthly growth rate</label>
            <div className="relative w-20">
              <input type="text" inputMode="decimal" value={growthRaw}
                onChange={(e) => setGrowthRaw(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full pr-6 pl-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
            </div>
          </div>

          {projectedMonth > 0 ? (
            <div className="text-center bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-700 text-sm">At {growthRaw}% monthly growth, you'll hit the VAT threshold in approximately</p>
              <p className="text-3xl font-bold text-amber-700 font-mono mt-1">{projectedMonth} months</p>
              <p className="text-amber-600 text-xs mt-1">Start preparing your VAT registration and MTD-compatible software now</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center">At {growthRaw}% monthly growth, you won't hit the threshold in the next 24 months.</p>
          )}
        </div>
      )}

      {/* What to do */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-medium text-gray-700">What to do when approaching the threshold</h3>
        </div>
        <div className="divide-y divide-gray-100 text-sm">
          {[
            { step: "1", text: "Set up MTD-compatible software (Xero, QuickBooks, FreeAgent) before you hit £90K" },
            { step: "2", text: "Register for VAT via HMRC's online portal — takes 2-4 weeks to process" },
            { step: "3", text: "Start adding VAT (20%) to your invoices from your VAT registration date" },
            { step: "4", text: "Import Stripe transactions into your accounting software for MTD compliance" },
            { step: "5", text: "Submit quarterly VAT returns via MTD-compatible software" },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 px-4 py-3">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{item.step}</span>
              <span className="text-gray-600">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
