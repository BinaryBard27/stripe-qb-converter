"use client";
import { useState, useCallback } from "react";
import Papa from "papaparse";

interface FreeAgentRow {
  "Date": string;
  "Description": string;
  "Amount": string;
}

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

const BANKS = [
  { id: "natwest", label: "NatWest", flag: "🏦" },
  { id: "rbs", label: "Royal Bank of Scotland", flag: "🏦" },
  { id: "mettle", label: "Mettle", flag: "🏦" },
  { id: "other", label: "Other FreeAgent user", flag: "📊" },
];

export default function StripeToFreeAgentClient() {
  const [csv, setCsv] = useState("");
  const [bank, setBank] = useState("natwest");
  const [separateFees, setSeparateFees] = useState(true);
  const [result, setResult] = useState<FreeAgentRow[] | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<{ rows: number; total: number } | null>(null);
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!csv.trim()) return;
    try {
      const rows = parseCSV(csv);
      if (!rows.length) { setError("No data found. Paste your Stripe CSV export."); return; }

      let totalNet = 0;
      const faRows: FreeAgentRow[] = [];

      rows.forEach((row) => {
        const dateStr = row["Created (UTC)"] || row["created"] || row["Date"] || "";
        const amountCents = row["Amount"] || row["amount"] || "0";
        const feeCents = row["Fee"] || row["fee"] || "0";
        const desc = row["Description"] || row["description"] || "Stripe payment";
        const customer = row["Customer Email"] || row["email"] || "";

        const grossAmount = centsToPounds(amountCents);
        const feeAmount = centsToPounds(feeCents);
        const netAmount = grossAmount - feeAmount;

        const date = formatUKDate(dateStr);
        const fullDesc = customer ? `${desc} (${customer})` : desc;

        if (separateFees && feeAmount > 0) {
          faRows.push({
            Date: date,
            Description: fullDesc || "Stripe payment",
            Amount: grossAmount.toFixed(2),
          });
          faRows.push({
            Date: date,
            Description: "Stripe processing fee",
            Amount: (-feeAmount).toFixed(2),
          });
        } else {
          faRows.push({
            Date: date,
            Description: fullDesc || "Stripe payment",
            Amount: netAmount.toFixed(2),
          });
        }

        totalNet += netAmount;
      });

      setResult(faRows);
      setStats({ rows: rows.length, total: totalNet });

      const csvOut = Papa.unparse(faRows);
      const blob = new Blob([csvOut], { type: "text/csv;charset=utf-8;" });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to convert.");
    }
  }, [csv, separateFees, downloadUrl]);

  return (
    <div className="space-y-5">

      {/* FreeAgent notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
        <p className="font-semibold text-green-800 mb-1">🏦 Free for NatWest, RBS & Mettle customers</p>
        <p className="text-green-700 text-xs">FreeAgent is included free with NatWest, RBS, Ulster Bank and Mettle business accounts. This tool converts your Stripe CSV to FreeAgent's bank import format.</p>
      </div>

      {/* Bank selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your bank / FreeAgent account</label>
        <div className="grid grid-cols-2 gap-2">
          {BANKS.map((b) => (
            <button key={b.id} onClick={() => setBank(b.id)}
              className={`flex items-center gap-2 py-2.5 px-3 rounded-lg border text-sm transition-all ${bank === b.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              <span style={{ fontSize: "16px" }}>{b.flag}</span>
              <span className="font-medium text-xs">{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fee separation */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-700">Separate fee lines</p>
          <p className="text-xs text-gray-400 mt-0.5">Recommended — categorise as Bank Charges in FreeAgent</p>
        </div>
        <button onClick={() => setSeparateFees(!separateFees)}
          className={`relative w-11 h-6 rounded-full transition-colors ${separateFees ? "bg-blue-600" : "bg-gray-200"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${separateFees ? "translate-x-5" : ""}`} />
        </button>
      </div>

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
        Convert to FreeAgent Format
      </button>

      {result && downloadUrl && stats && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-green-700">✓ {stats.rows} transactions converted</p>
                <p className="text-xs text-green-600 mt-0.5">Net total: £{stats.total.toFixed(2)}</p>
              </div>
              <a href={downloadUrl} download="stripe-freeagent-import.csv"
                className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download for FreeAgent
              </a>
            </div>

            <div className="bg-white rounded-lg border border-green-100 p-3 text-xs text-gray-600">
              <p className="font-semibold text-gray-700 mb-1">How to import into FreeAgent:</p>
              <ol className="space-y-0.5 list-decimal list-inside">
                <li>Banking → Add a new bank account (or select existing Stripe account)</li>
                <li>Import a bank statement → Upload CSV</li>
                <li>Map: Date = Date, Description = Description, Amount = Amount</li>
                <li>Categorise fee lines as "Bank Charges" when reviewing</li>
              </ol>
            </div>
          </div>

          {/* Preview */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Date", "Description", "Amount"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.slice(0, 6).map((row, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${parseFloat(row.Amount) < 0 ? "bg-red-50/30" : ""}`}>
                    <td className="px-3 py-2 font-mono text-gray-600">{row.Date}</td>
                    <td className="px-3 py-2 text-gray-600">{row.Description}</td>
                    <td className={`px-3 py-2 font-mono font-medium ${parseFloat(row.Amount) < 0 ? "text-red-500" : "text-green-600"}`}>
                      {parseFloat(row.Amount) > 0 ? "+" : ""}£{row.Amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.length > 6 && <p className="text-xs text-gray-400 px-3 py-2">+ {result.length - 6} more rows</p>}
          </div>
        </div>
      )}
    </div>
  );
}
