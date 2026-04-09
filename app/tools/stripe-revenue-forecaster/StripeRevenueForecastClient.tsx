"use client";
import { useState } from "react";

const STRIPE_PCT = 0.029;
const STRIPE_FIXED = 0.30;

function fmt(n: number) {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function fmtFull(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function StripeRevenueForecastClient() {
  const [mrrRaw, setMrrRaw] = useState("");
  const [growthRaw, setGrowthRaw] = useState("10");
  const [avgTxRaw, setAvgTxRaw] = useState("50");
  const [churnRaw, setChurnRaw] = useState("5");

  const mrr = parseFloat(mrrRaw.replace(/[^0-9.]/g, "")) || 0;
  const growth = parseFloat(growthRaw) / 100 || 0;
  const avgTx = parseFloat(avgTxRaw.replace(/[^0-9.]/g, "")) || 50;
  const churn = parseFloat(churnRaw) / 100 || 0;

  const netGrowth = growth - churn;

  // Generate 12 months
  const today = new Date();
  const forecast = Array.from({ length: 12 }, (_, i) => {
    const revenue = mrr * Math.pow(1 + netGrowth, i);
    const txCount = Math.round(revenue / avgTx);
    const fees = txCount * (avgTx * STRIPE_PCT + STRIPE_FIXED);
    const net = revenue - fees;
    const monthIdx = (today.getMonth() + i) % 12;
    return {
      month: MONTHS[monthIdx],
      revenue,
      fees,
      net,
      txCount,
    };
  });

  const totalRevenue = forecast.reduce((a, b) => a + b.revenue, 0);
  const totalFees = forecast.reduce((a, b) => a + b.fees, 0);
  const totalNet = forecast.reduce((a, b) => a + b.net, 0);
  const finalMRR = forecast[11].revenue;
  const growth12x = mrr > 0 ? ((finalMRR - mrr) / mrr) * 100 : 0;

  const maxRevenue = Math.max(...forecast.map((f) => f.revenue));
  const hasData = mrr > 0;

  return (
    <div className="space-y-6">

      {/* Inputs */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Current monthly revenue (MRR)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={mrrRaw}
              onChange={(e) => setMrrRaw(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly growth rate</label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={growthRaw}
              onChange={(e) => setGrowthRaw(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full pr-8 pl-4 py-2.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Avg transaction size</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={avgTxRaw}
              onChange={(e) => setAvgTxRaw(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly churn rate</label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={churnRaw}
              onChange={(e) => setChurnRaw(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full pr-8 pl-4 py-2.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </div>
      </div>

      {hasData && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "12-month revenue", value: fmtFull(totalRevenue), color: "text-gray-900" },
              { label: "Stripe fees (12mo)", value: fmtFull(totalFees), color: "text-red-500" },
              { label: "Net to you (12mo)", value: fmtFull(totalNet), color: "text-green-600" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* MRR milestone */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Month 12 MRR</p>
              <p className="text-xs text-blue-400 mt-0.5">at {growthRaw}% growth, {churnRaw}% churn</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-700 font-mono">{fmt(finalMRR)}</p>
              {growth12x > 0 && <p className="text-xs text-blue-400">+{growth12x.toFixed(0)}% from today</p>}
            </div>
          </div>

          {/* Bar chart */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly revenue forecast</h3>
            <div className="flex items-end gap-1 h-32">
              {forecast.map((f, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm bg-blue-500 transition-all duration-500 min-h-[4px]"
                    style={{ height: `${Math.max(4, (f.revenue / maxRevenue) * 112)}px` }}
                    title={`${f.month}: ${fmtFull(f.revenue)}`}
                  />
                  <span className="text-xs text-gray-400" style={{ fontSize: "9px" }}>{f.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly table */}
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-medium">
              View month-by-month breakdown
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Month", "Revenue", "Stripe fees", "Net payout", "Transactions"].map((h) => (
                      <th key={h} className="text-left py-2 text-gray-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {forecast.map((f, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-2 text-gray-500 font-medium">{f.month}</td>
                      <td className="py-2 font-mono text-gray-700">{fmtFull(f.revenue)}</td>
                      <td className="py-2 font-mono text-red-500">−{fmtFull(f.fees)}</td>
                      <td className="py-2 font-mono text-green-600 font-medium">{fmtFull(f.net)}</td>
                      <td className="py-2 text-gray-400">{f.txCount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
