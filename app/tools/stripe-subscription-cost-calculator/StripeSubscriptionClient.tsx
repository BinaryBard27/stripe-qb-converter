"use client";
import { useState } from "react";

const PCT = 0.029;
const FIXED = 0.30;
const ACH_PCT = 0.008;
const ACH_CAP = 5.00;

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function parse(raw: string) { return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0; }

export default function StripeSubscriptionClient() {
  const [monthlyPriceRaw, setMonthlyPriceRaw] = useState("");
  const [annualDiscountRaw, setAnnualDiscountRaw] = useState("20");
  const [customersRaw, setCustomersRaw] = useState("50");
  const [churnRaw, setChurnRaw] = useState("5");

  const monthlyPrice = parse(monthlyPriceRaw);
  const annualDiscount = parse(annualDiscountRaw) / 100;
  const customers = parseInt(customersRaw) || 0;
  const churnPct = parse(churnRaw) / 100;

  const annualPrice = monthlyPrice * 12 * (1 - annualDiscount);

  // Monthly billing costs (per customer per year)
  const monthlyFeePerTx = monthlyPrice * PCT + FIXED;
  const monthlyFeesPerYear = monthlyFeePerTx * 12;
  const monthlyNetPerYear = monthlyPrice * 12 - monthlyFeesPerYear;

  // Annual billing costs (per customer per year)
  const annualFeePerTx = annualPrice * PCT + FIXED;
  const annualFeesPerYear = annualFeePerTx; // only 1 transaction
  const annualNetPerYear = annualPrice - annualFeesPerYear;

  // ACH costs (annual plan)
  const achFee = Math.min(annualPrice * ACH_PCT, ACH_CAP);
  const achNetPerYear = annualPrice - achFee;

  const savingsAnnualVsMonthly = monthlyFeesPerYear - annualFeesPerYear;
  const savingsAchVsMonthly = monthlyFeesPerYear - achFee;

  // At scale
  const totalMonthlyFees = monthlyFeesPerYear * customers;
  const totalAnnualFees = annualFeesPerYear * customers;

  const hasResult = monthlyPrice > 0;

  return (
    <div className="space-y-6">

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly plan price</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input type="text" inputMode="decimal" value={monthlyPriceRaw}
              onChange={(e) => setMonthlyPriceRaw(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="e.g. 49"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Annual plan discount</label>
          <div className="relative">
            <input type="text" inputMode="decimal" value={annualDiscountRaw}
              onChange={(e) => setAnnualDiscountRaw(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full pr-8 pl-4 py-2.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
          {monthlyPrice > 0 && <p className="text-xs text-gray-400 mt-1">Annual price: {fmt(annualPrice)}/year</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of customers</label>
          <input type="text" inputMode="numeric" value={customersRaw}
            onChange={(e) => setCustomersRaw(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly churn rate</label>
          <div className="relative">
            <input type="text" inputMode="decimal" value={churnRaw}
              onChange={(e) => setChurnRaw(e.target.value.replace(/[^0-9.]/g, ""))}
              className="w-full pr-8 pl-4 py-2.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </div>
      </div>

      {hasResult && (
        <>
          {/* Per-customer comparison */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Cost per customer per year</h3>
            <div className="grid gap-2">
              {[
                { label: "Monthly billing (12 transactions)", fee: monthlyFeesPerYear, net: monthlyNetPerYear, badge: "Most common", badgeColor: "bg-gray-100 text-gray-500" },
                { label: `Annual billing (1 transaction, ${annualDiscountRaw}% off)`, fee: annualFeesPerYear, net: annualNetPerYear, badge: `Save ${fmt(savingsAnnualVsMonthly)}`, badgeColor: "bg-green-100 text-green-700" },
                { label: "ACH bank transfer (annual)", fee: achFee, net: achNetPerYear, badge: `Save ${fmt(savingsAchVsMonthly)}`, badgeColor: "bg-blue-100 text-blue-700" },
              ].map((opt, i) => (
                <div key={i} className={`border rounded-xl p-4 ${i === 2 ? "border-blue-200 bg-blue-50/30" : i === 1 ? "border-green-200 bg-green-50/30" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${opt.badgeColor}`}>{opt.badge}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stripe fees/year</span>
                    <span className="font-mono text-red-500">−{fmt(opt.fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">You keep</span>
                    <span className="font-mono font-semibold text-green-600">{fmt(opt.net)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* At scale */}
          <div className="bg-gray-900 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">At scale — {customers} customers</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Monthly billing fees/year</p>
                <p className="text-xl font-bold font-mono text-red-400">{fmt(totalMonthlyFees)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Annual billing fees/year</p>
                <p className="text-xl font-bold font-mono text-green-400">{fmt(totalAnnualFees)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 text-center">
              <p className="text-gray-400 text-sm">Switching everyone to annual billing saves</p>
              <p className="text-2xl font-bold text-white font-mono mt-1">{fmt((totalMonthlyFees - totalAnnualFees))}/year</p>
              <p className="text-gray-500 text-xs mt-1">in Stripe processing fees</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
