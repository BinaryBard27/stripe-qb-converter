"use client";
import { useCallback, useState } from "react";
import Papa from "papaparse";

type Region = "uk" | "us" | "au";

interface XeroRow {
  Date: string;
  Amount: string;
  Payee: string;
  Description: string;
  Reference: string;
}

function formatDate(utcStr: string, region: Region): string {
  if (!utcStr) return "";
  const d = new Date(utcStr);
  if (isNaN(d.getTime())) return utcStr;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  if (region === "uk" || region === "au") return `${dd}/${mm}/${yyyy}`;
  return `${mm}/${dd}/${yyyy}`;
}

function centsToPounds(val: string | number): number {
  const n = typeof val === "string" ? parseFloat(val) || 0 : val;
  return n / 100;
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

const REGION_OPTIONS: { id: Region; label: string; flag: string; dateFormat: string }[] = [
  { id: "uk", label: "United Kingdom", flag: "🇬🇧", dateFormat: "DD/MM/YYYY" },
  { id: "us", label: "United States", flag: "🇺🇸", dateFormat: "MM/DD/YYYY" },
  { id: "au", label: "Australia / NZ", flag: "🇦🇺", dateFormat: "DD/MM/YYYY" },
];

export default function StripeToXeroClient() {
  const [csv, setCsv] = useState("");
  const [region, setRegion] = useState<Region>("uk");
  const [separateFees, setSeparateFees] = useState(true);
  const [result, setResult] = useState<XeroRow[] | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!csv.trim()) return;

    try {
      const rows = parseCSV(csv);
      if (!rows.length) { setError("No data found. Paste your Stripe CSV export above."); return; }

      const xeroRows: XeroRow[] = [];

      rows.forEach((row) => {
        const dateStr = row["Created (UTC)"] || row["created"] || row["Date"] || row["date"] || "";
        const amountCents = parseFloat(row["Amount"] || row["amount"] || "0");
        const feeCents = parseFloat(row["Fee"] || row["fee"] || "0");
        const desc = row["Description"] || row["description"] || row["Memo"] || "";
        const ref = row["id"] || row["Balance Transaction ID"] || "";
        const customer = row["Customer Email"] || row["customer_email"] || row["email"] || "";

        const amountPounds = centsToPounds(amountCents);
        const feePounds = centsToPounds(feeCents);
        const netPounds = amountPounds - feePounds;

        const date = formatDate(dateStr, region);
        const payee = customer || "Stripe Customer";

        if (separateFees && feePounds > 0) {
          // Gross revenue line
          xeroRows.push({
            Date: date,
            Amount: amountPounds.toFixed(2),
            Payee: payee,
            Description: desc || "Stripe payment",
            Reference: ref,
          });
          // Fee line (negative)
          xeroRows.push({
            Date: date,
            Amount: (-feePounds).toFixed(2),
            Payee: "Stripe",
            Description: "Stripe processing fee",
            Reference: ref,
          });
        } else {
          xeroRows.push({
            Date: date,
            Amount: netPounds.toFixed(2),
            Payee: payee,
            Description: desc || "Stripe payment",
            Reference: ref,
          });
        }
      });

      setResult(xeroRows);
      setRowCount(rows.length);

      const csvOut = Papa.unparse(xeroRows);
      const blob = new Blob([csvOut], { type: "text/csv;charset=utf-8;" });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to convert. Check your CSV format.");
    }
  }, [csv, region, separateFees, downloadUrl]);

  return (
    <div className="space-y-5">

      {/* Region selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Xero region</label>
        <div className="grid grid-cols-3 gap-2">
          {REGION_OPTIONS.map((r) => (
            <button key={r.id} onClick={() => setRegion(r.id)}
              className={`flex items-center gap-2 py-2.5 px-3 rounded-lg border text-sm transition-all ${region === r.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              <span style={{ fontSize: "16px" }}>{r.flag}</span>
              <div className="text-left">
                <div className="font-medium text-xs">{r.label}</div>
                <div className="text-gray-400 text-xs">{r.dateFormat}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fee separation toggle */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-700">Separate Stripe fees as individual lines</p>
          <p className="text-xs text-gray-400 mt-0.5">Recommended — lets you categorise fees as Bank Charges in Xero</p>
        </div>
        <button onClick={() => setSeparateFees(!separateFees)}
          className={`relative w-11 h-6 rounded-full transition-colors ${separateFees ? "bg-blue-600" : "bg-gray-200"}`}>
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${separateFees ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {/* CSV input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-700">Paste your Stripe CSV export</label>
          <span className="text-xs text-gray-400">Stripe Dashboard → Payments → Export</span>
        </div>
        <textarea value={csv} onChange={(e) => { setCsv(e.target.value); setResult(null); }}
          rows={7} placeholder="Paste CSV content here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y placeholder:text-gray-300"
          spellCheck={false} />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <span>⚠</span>{error}
        </div>
      )}

      <button onClick={handleConvert} disabled={!csv.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-lg text-sm transition-colors">
        Convert to Xero Format
      </button>

      {result && downloadUrl && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-green-700">✓ {rowCount} transactions converted</p>
                <p className="text-xs text-green-600 mt-0.5">{result.length} Xero rows ({separateFees ? "includes separate fee lines" : "net amounts"})</p>
              </div>
              <a href={downloadUrl} download="stripe-xero-import.csv"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download for Xero
              </a>
            </div>
            <div className="bg-white rounded-lg border border-green-100 p-3 text-xs text-gray-600">
              <p className="font-semibold text-gray-700 mb-1">How to import into Xero:</p>
              <ol className="space-y-0.5 list-decimal list-inside">
                <li>Accounting → Bank Accounts → your Stripe account</li>
                <li>Import a Statement → upload this CSV</li>
                <li>Match columns: Date, Amount, Description</li>
                <li>Categorise fee lines as "Bank Charges & Fees"</li>
              </ol>
            </div>
          </div>

          {/* Preview */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Date", "Amount", "Payee", "Description", "Reference"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.slice(0, 5).map((row, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${parseFloat(row.Amount) < 0 ? "bg-red-50/50" : ""}`}>
                    <td className="px-3 py-2 font-mono text-gray-600">{row.Date}</td>
                    <td className={`px-3 py-2 font-mono font-medium ${parseFloat(row.Amount) < 0 ? "text-red-500" : "text-green-600"}`}>{parseFloat(row.Amount) > 0 ? "+" : ""}{row.Amount}</td>
                    <td className="px-3 py-2 text-gray-600">{row.Payee}</td>
                    <td className="px-3 py-2 text-gray-600">{row.Description}</td>
                    <td className="px-3 py-2 text-gray-400 truncate max-w-[100px]">{row.Reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.length > 5 && <p className="text-xs text-gray-400 px-3 py-2">+ {result.length - 5} more rows in download</p>}
          </div>
        </div>
      )}
    </div>
  );
}
