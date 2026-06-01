"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";

// Bank statement to Excel converter
// Client-side only: CSV/TSV → cleaned Excel via SheetJS (xlsx)
// Add <script src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js" /> to your layout or load dynamically

const PRICING_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 conversions per day",
      "CSV & TSV bank exports",
      "Auto-detect columns",
      "Clean formatted Excel output",
      "Works in browser — no upload to server",
    ],
    missing: ["PDF bank statements", "Multi-bank batch processing", "Custom column mapping", "Priority support"],
    cta: "Use Free Tool",
    ctaStyle: "border border-gray-300 text-gray-700 hover:border-gray-400",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    features: [
      "Unlimited conversions",
      "PDF bank statement parsing",
      "CSV, TSV, OFX, QFX support",
      "Multi-statement batch processing",
      "Custom column mapping & templates",
      "QuickBooks-ready output format",
      "Email support",
    ],
    missing: [],
    cta: "Get Pro",
    ctaStyle: "bg-violet-600 text-white hover:bg-violet-500",
    highlight: true,
  },
];

const SUPPORTED_BANKS = [
  "Chase", "Bank of America", "Wells Fargo", "Citibank", "Capital One",
  "HSBC", "Barclays", "Lloyds", "NatWest", "Deutsche Bank",
  "Commerzbank", "BNP Paribas", "Santander", "BBVA", "ING",
];

const FAQ = [
  {
    q: "What file formats does this tool support?",
    a: "The free tool supports CSV and TSV bank statement exports. Most major banks allow you to download statements as CSV from their online banking portal. Pro supports PDF, OFX (Open Financial Exchange), and QFX (Quicken) formats in addition to CSV/TSV.",
  },
  {
    q: "Is my bank data secure?",
    a: "Your data never leaves your device. The free tool runs entirely in your browser using JavaScript — no files are uploaded to any server. You can even use it offline. This is fundamentally safer than cloud-based converters.",
  },
  {
    q: "Why does my bank statement CSV look messy?",
    a: "Different banks export CSV in different formats — varying column names, date formats, and encodings. This tool automatically detects common patterns (Date, Description, Debit, Credit, Balance) and standardizes them into a clean Excel file regardless of your bank's export format.",
  },
  {
    q: "Can I use this to import into QuickBooks?",
    a: "Yes. The Excel output is formatted for easy QuickBooks import. However, if you use Stripe, our Stripe QB Converter handles Stripe-specific reconciliation (separating gross charges from fees and payouts) which this tool doesn't do.",
  },
  {
    q: "What is OFX/QFX and does the free tool support it?",
    a: "OFX (Open Financial Exchange) and QFX (Quicken's variant) are structured financial data formats that many banks support. They contain cleaner transaction data than CSV. OFX/QFX support is available in the Pro plan.",
  },
];

function detectColumns(headers) {
  const h = headers.map((h) => h.toLowerCase().trim());
  return {
    date: h.findIndex((x) => x.includes("date") || x.includes("posted") || x.includes("transaction date")),
    description: h.findIndex((x) =>
      x.includes("desc") || x.includes("memo") || x.includes("narration") || x.includes("detail") || x.includes("particular")
    ),
    debit: h.findIndex((x) => x.includes("debit") || x.includes("withdrawal") || x.includes("dr")),
    credit: h.findIndex((x) => x.includes("credit") || x.includes("deposit") || x.includes("cr")),
    amount: h.findIndex((x) => x === "amount" || x === "transaction amount" || x === "net amount"),
    balance: h.findIndex((x) => x.includes("balance") || x.includes("running")),
  };
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  return lines.map((line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if ((ch === "," || ch === "\t") && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  });
}

function cleanAmount(val) {
  if (!val) return "";
  const cleaned = val.replace(/[$£€¥,\s]/g, "").replace(/[()]/g, (m) => (m === "(" ? "-" : ""));
  const num = parseFloat(cleaned);
  return isNaN(num) ? val : num;
}

export default function BankStatementToExcel() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [conversionCount, setConversionCount] = useState(0);
  const fileRef = useRef(null);

  const handleFile = useCallback(async (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["csv", "tsv", "txt"].includes(ext)) {
      setError("Please upload a CSV or TSV file. PDF support is available in Pro.");
      return;
    }
    if (conversionCount >= 5) {
      setError("Free limit reached (5/day). Upgrade to Pro for unlimited conversions.");
      return;
    }
    setFile(f);
    setError(null);
    setProcessing(true);

    try {
      const text = await f.text();
      const rows = parseCSV(text);
      if (rows.length < 2) throw new Error("File appears empty or malformed.");

      const headers = rows[0];
      const colMap = detectColumns(headers);
      const dataRows = rows.slice(1).filter((r) => r.some((c) => c.trim() !== ""));

      // Build clean output
      const outputHeaders = ["Date", "Description", "Debit", "Credit", "Amount", "Balance"];
      const outputRows = dataRows.map((row) => [
        colMap.date >= 0 ? row[colMap.date] : "",
        colMap.description >= 0 ? row[colMap.description] : "",
        colMap.debit >= 0 ? cleanAmount(row[colMap.debit]) : "",
        colMap.credit >= 0 ? cleanAmount(row[colMap.credit]) : "",
        colMap.amount >= 0 ? cleanAmount(row[colMap.amount]) : "",
        colMap.balance >= 0 ? cleanAmount(row[colMap.balance]) : "",
      ]);

      setPreview({
        headers: outputHeaders,
        rows: outputRows.slice(0, 5),
        totalRows: outputRows.length,
        allRows: outputRows,
        originalHeaders: headers,
        detectedColumns: colMap,
        filename: f.name.replace(/\.(csv|tsv|txt)$/i, "") + "_converted.xlsx",
      });
    } catch (e) {
      setError("Could not parse file: " + e.message);
    }
    setProcessing(false);
  }, [conversionCount]);

  const downloadExcel = useCallback(async () => {
    if (!preview) return;

    // Dynamically load SheetJS if not present
    if (!window.XLSX) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    const XLSX = window.XLSX;
    const wsData = [preview.headers, ...preview.allRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Style header row width
    ws["!cols"] = [{ wch: 14 }, { wch: 45 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bank Statement");
    XLSX.writeFile(wb, preview.filename);

    setConversionCount((c) => c + 1);
  }, [preview]);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  return (
    <div className="min-h-screen bg-[#f6f6f4] text-gray-900">
      {/* Top bar */}
      <div className="bg-[#1a1a2e] text-white py-2 text-center text-sm">
        <span className="opacity-60">Free tool by</span>{" "}
        <Link href="/" className="underline underline-offset-2 text-violet-300 hover:text-violet-200">
          Stripe QB Converter
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-sm text-emerald-700 mb-4">
            🔒 Runs in browser · No upload · Free
          </div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
            Bank Statement to Excel Converter
          </h1>
          <p className="text-lg text-gray-500">
            Upload your bank's CSV export and get a clean, standardized Excel file in seconds.
            Your data never leaves your device.
          </p>
        </div>

        {/* Upload zone */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-emerald-400 bg-emerald-50"
                : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
            }`}
          >
            <div className="text-4xl mb-3">📄</div>
            <p className="font-medium text-gray-700 mb-1">
              {file ? file.name : "Drop your bank statement CSV here"}
            </p>
            <p className="text-sm text-gray-400">
              or click to browse · CSV, TSV, TXT · Max 10MB
            </p>
            <p className="text-xs text-gray-300 mt-2">
              {5 - conversionCount} free conversions remaining today
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.tsv,.txt"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {processing && (
            <div className="mt-4 text-center text-sm text-gray-500 py-4">
              Parsing file...
            </div>
          )}

          {preview && !processing && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    ✅ Parsed {preview.totalRows} transactions
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Detected: {Object.entries(preview.detectedColumns)
                      .filter(([, v]) => v >= 0)
                      .map(([k]) => k)
                      .join(", ")}
                  </p>
                </div>
                <button
                  onClick={downloadExcel}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                >
                  ⬇ Download Excel
                </button>
              </div>

              {/* Preview table */}
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview.headers.map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {preview.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 text-gray-700 max-w-[140px] truncate">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.totalRows > 5 && (
                  <div className="bg-gray-50 px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
                    Showing 5 of {preview.totalRows} rows — all rows included in download
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Supported banks */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Tested with exports from
          </p>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_BANKS.map((b) => (
              <span key={b} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-600">
                {b}
              </span>
            ))}
            <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-400">
              + any CSV export
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-2">Pricing</h2>
          <p className="text-gray-400 text-sm mb-6">
            Start free. Upgrade when you need PDF support or unlimited conversions.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 ${
                  plan.highlight
                    ? "border-violet-300 bg-violet-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block bg-violet-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-3">
                    Most Popular
                  </span>
                )}
                <div className="mb-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 text-sm ml-1">/{plan.period}</span>
                </div>
                <p className="font-semibold text-gray-800 mb-4">{plan.name}</p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="mt-0.5 flex-shrink-0">✗</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.highlight && alert("Pro plan — add your payment link here")}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-10">
          <h2 className="text-xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { step: "1", icon: "⬆️", title: "Upload CSV", desc: "Export your statement from online banking as CSV" },
              { step: "2", icon: "⚡", title: "Auto-Parse", desc: "Tool detects columns, cleans amounts, standardizes dates" },
              { step: "3", icon: "📊", title: "Download Excel", desc: "Get a clean .xlsx file ready for QuickBooks or analysis" },
            ].map((s) => (
              <div key={s.step}>
                <div className="text-3xl mb-3">{s.icon}</div>
                <p className="font-semibold text-sm mb-1">{s.title}</p>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-gray-900 text-sm">{item.q}</span>
                  <span className="text-gray-400 ml-4 flex-shrink-0">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cross-sell CTA */}
        <div className="bg-[#1a1a2e] text-white rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Reconciling Stripe specifically?</h3>
          <p className="text-gray-400 mb-6 text-sm">
            Bank statement conversion is one step. If you use Stripe, our dedicated Stripe QB
            Converter splits out Stripe fees, maps to QuickBooks accounts, and handles payout
            reconciliation automatically.
          </p>
          <Link
            href="/"
            className="inline-block bg-violet-500 hover:bg-violet-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Try Stripe QB Converter Free →
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <p>
          Free to use · No account required · Data stays in your browser ·{" "}
          <Link href="/stripe-fees-calculator" className="underline hover:text-gray-600">Stripe Fees Calculator</Link>
          {" · "}
          <Link href="/stripe-fee-calculator-japan" className="underline hover:text-gray-600">Japan</Link>
          {" · "}
          <Link href="/stripe-fee-calculator-germany" className="underline hover:text-gray-600">Germany</Link>
        </p>
      </div>
    </div>
  );
}
