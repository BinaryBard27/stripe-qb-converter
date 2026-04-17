"use client";
import { useState, useCallback } from "react";
import Papa from "papaparse";

interface MtdRow {
  "Date": string;
  "Description": string;
  "Gross Amount (£)": string;
  "VAT Amount (£)": string;
  "Net Amount (£)": string;
  "HMRC Category": string;
  "Transaction Type": string;
  "Reference": string;
}

const HMRC_CATEGORIES = [
  "Sales/income",
  "Office costs",
  "Travel and transport",
  "Clothing expenses",
  "Staff costs",
  "Reselling goods",
  "Legal and financial costs",
  "Marketing and advertising",
  "Clothing",
  "Other allowable expenses",
];

const VAT_RATES = [
  { id: "standard", label: "Standard rate (20%)", rate: 0.20 },
  { id: "reduced", label: "Reduced rate (5%)", rate: 0.05 },
  { id: "zero", label: "Zero rated (0%)", rate: 0 },
  { id: "exempt", label: "VAT exempt", rate: 0 },
  { id: "outside", label: "Outside scope of VAT", rate: 0 },
];

function formatUKDate(utcStr: string): string {
  if (!utcStr) return "";
  const d = new Date(utcStr);
  if (isNaN(d.getTime())) return utcStr;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function centsToPounds(val: string): number {
  return (parseFloat(val) || 0) / 100;
}

function parseCSV(text: string): Record<string, string>[] {
  const result = Papa.parse<string[]>(text, { header: false, skipEmptyLines: true });
  if (result.data.length < 2) return [];
  const headers = (result.data[0] as string[]).map((h) => h.trim());
  return (result.data.slice(1) as string[][]).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = (row[i] ?? "").trim(); });
    return obj;
  });
}

export default function MtdBridgingClient() {
  const [csv, setCsv] = useState("");
  const [vatRateId, setVatRateId] = useState("standard");
  const [vatRegistered, setVatRegistered] = useState(false);
  const [result, setResult] = useState<MtdRow[] | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<{ rows: number; gross: number; vat: number; net: number } | null>(null);
  const [error, setError] = useState("");

  const vatRate = VAT_RATES.find((v) => v.id === vatRateId)!;

  const handleConvert = useCallback(() => {
    setError("");
    if (!csv.trim()) return;
    try {
      const rows = parseCSV(csv);
      if (!rows.length) { setError("No data found in CSV."); return; }

      let totalGross = 0;
      let totalVat = 0;

      const mtdRows: MtdRow[] = [];

      rows.forEach((row) => {
        const dateStr = row["Created (UTC)"] || row["created"] || row["Date"] || "";
        const amountCents = row["Amount"] || row["amount"] || "0";
        const feeCents = row["Fee"] || row["fee"] || "0";
        const desc = row["Description"] || row["description"] || "Stripe payment";
        const ref = row["id"] || row["Balance Transaction ID"] || "";

        const grossAmount = centsToPounds(amountCents);
        const feeAmount = centsToPounds(feeCents);

        // Income line
        const vatOnIncome = vatRegistered ? grossAmount - (grossAmount / (1 + vatRate.rate)) : 0;
        const netIncome = grossAmount - vatOnIncome;

        totalGross += grossAmount;
        totalVat += vatOnIncome;

        mtdRows.push({
          "Date": formatUKDate(dateStr),
          "Description": desc,
          "Gross Amount (£)": grossAmount.toFixed(2),
          "VAT Amount (£)": vatOnIncome.toFixed(2),
          "Net Amount (£)": netIncome.toFixed(2),
          "HMRC Category": "Sales/income",
          "Transaction Type": "Income",
          "Reference": ref,
        });

        // Stripe fee as expense
        if (feeAmount > 0) {
          mtdRows.push({
            "Date": formatUKDate(dateStr),
            "Description": "Stripe processing fee",
            "Gross Amount (£)": (-feeAmount).toFixed(2),
            "VAT Amount (£)": vatRegistered ? (-feeAmount * 0.20).toFixed(2) : "0.00",
            "Net Amount (£)": vatRegistered ? (-(feeAmount / 1.20)).toFixed(2) : (-feeAmount).toFixed(2),
            "HMRC Category": "Legal and financial costs",
            "Transaction Type": "Expense",
            "Reference": ref,
          });
        }
      });

      setResult(mtdRows);
      setStats({ rows: rows.length, gross: totalGross, vat: totalVat, net: totalGross - totalVat });

      const csvOut = Papa.unparse(mtdRows);
      const blob = new Blob([csvOut], { type: "text/csv;charset=utf-8;" });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to convert.");
    }
  }, [csv, vatRateId, vatRegistered, downloadUrl, vatRate]);

  return (
    <div className="space-y-5">

      {/* MTD notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
        <p className="font-semibold text-blue-800 mb-1">🇬🇧 Making Tax Digital — April 2026</p>
        <p className="text-blue-700 text-xs">Required for UK sole traders &amp; landlords with gross income over £50,000. This tool formats your Stripe data for MTD-compatible bridging software.</p>
      </div>

      {/* VAT registered toggle */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-700">VAT registered?</p>
          <p className="text-xs text-gray-400 mt-0.5">UK VAT threshold is £90,000 turnover</p>
        </div>
        <button onClick={() => setVatRegistered(!vatRegistered)}
          className={`relative w-11 h-6 rounded-full transition-colors ${vatRegistered ? "bg-blue-600" : "bg-gray-200"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${vatRegistered ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {/* VAT rate */}
      {vatRegistered && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">VAT rate on your Stripe sales</label>
          <div className="space-y-2">
            {VAT_RATES.map((v) => (
              <button key={v.id} onClick={() => setVatRateId(v.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${vatRateId === v.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}>
                <span className="font-medium">{v.label}</span>
                {vatRateId === v.id && <span className="text-blue-500">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CSV input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Paste your Stripe CSV export</label>
        <textarea value={csv} onChange={(e) => { setCsv(e.target.value); setResult(null); }}
          rows={7} placeholder="Paste CSV content here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y placeholder:text-gray-300"
          spellCheck={false} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button onClick={handleConvert} disabled={!csv.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-lg text-sm transition-colors">
        Format for MTD
      </button>

      {result && downloadUrl && stats && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-green-700">✓ {stats.rows} transactions formatted for MTD</p>
                <p className="text-xs text-green-600 mt-0.5">Ready for bridging software (VitalTax, TaxCalc, etc.)</p>
              </div>
              <a href={downloadUrl} download="stripe-mtd-records.csv"
                className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download MTD CSV
              </a>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Gross income", value: `£${stats.gross.toFixed(2)}` },
                { label: "VAT collected", value: `£${stats.vat.toFixed(2)}` },
                { label: "Net income", value: `£${stats.net.toFixed(2)}` },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-lg p-2 border border-green-100">
                  <p className="text-sm font-bold font-mono text-gray-800">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Import instructions */}
          <div className="border border-gray-200 rounded-xl p-4 text-sm">
            <p className="font-semibold text-gray-700 mb-2">Next steps for MTD compliance:</p>
            <ol className="space-y-1.5 text-gray-500 text-xs list-decimal list-inside">
              <li>Import this CSV into your MTD bridging software (VitalTax, TaxCalc, Xero, QuickBooks)</li>
              <li>Review HMRC categories — adjust any miscategorised lines</li>
              <li>Submit quarterly updates to HMRC via your MTD software</li>
              <li>Keep this CSV as your digital record — HMRC may request it</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
