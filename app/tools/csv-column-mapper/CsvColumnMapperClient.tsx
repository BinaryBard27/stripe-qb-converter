"use client";
import { useState, useCallback } from "react";
import Papa from "papaparse";

const QB_COLUMNS = ["Date", "Description", "Amount", "Debit", "Credit", "Payee", "Memo", "Reference", "Account", "(skip this column)"];

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const result = Papa.parse<string[]>(text, { header: false, skipEmptyLines: true });
  if (!result.data.length) return { headers: [], rows: [] };
  return {
    headers: (result.data[0] as string[]).map((h) => String(h).trim()),
    rows: result.data.slice(1) as string[][],
  };
}

export default function CsvColumnMapperClient() {
  const [rawCsv, setRawCsv] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [parsed, setParsed] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleParse = useCallback(() => {
    const { headers: h, rows: r } = parseCSV(rawCsv);
    setHeaders(h);
    setRows(r);
    const defaultMapping: Record<string, string> = {};
    h.forEach((header) => {
      const lower = header.toLowerCase();
      if (lower.includes("date")) defaultMapping[header] = "Date";
      else if (lower.includes("desc") || lower.includes("narr") || lower.includes("memo")) defaultMapping[header] = "Description";
      else if (lower.includes("amount") || lower.includes("net")) defaultMapping[header] = "Amount";
      else if (lower.includes("debit")) defaultMapping[header] = "Debit";
      else if (lower.includes("credit")) defaultMapping[header] = "Credit";
      else if (lower.includes("payee") || lower.includes("name")) defaultMapping[header] = "Payee";
      else defaultMapping[header] = "(skip this column)";
    });
    setMapping(defaultMapping);
    setParsed(true);
    setDownloaded(false);
  }, [rawCsv]);

  const handleDownload = useCallback(() => {
    const keptCols = headers.filter((h) => mapping[h] !== "(skip this column)");
    const newHeaders = keptCols.map((h) => mapping[h]);
    const newRows = rows.map((row) =>
      keptCols.map((h) => row[headers.indexOf(h)] ?? "")
    );
    const csv = Papa.unparse([newHeaders, ...newRows]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quickbooks_mapped.csv";
    link.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  }, [headers, rows, mapping]);

  const keptCount = headers.filter((h) => mapping[h] !== "(skip this column)").length;

  return (
    <div className="space-y-5">

      {/* Instructions */}
      <p className="text-sm text-gray-500 leading-relaxed">
        Paste your CSV below, click Parse, then rename each column to match what QuickBooks expects. Download the remapped file when done.
      </p>

      {/* CSV input */}
      {!parsed && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Paste your CSV</label>
          <textarea
            value={rawCsv}
            onChange={(e) => setRawCsv(e.target.value)}
            rows={7}
            placeholder={"Date,Transaction Description,Net Amount\n03/15/2024,Stripe payment,125.00\n03/16/2024,Refund,-25.00"}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y placeholder:text-gray-300"
            spellCheck={false}
          />
          <button
            onClick={handleParse}
            disabled={!rawCsv.trim()}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            Parse CSV
          </button>
        </div>
      )}

      {/* Column mapper */}
      {parsed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Map {headers.length} columns → keeping {keptCount}
            </h3>
            <button
              onClick={() => { setParsed(false); setRawCsv(""); }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Start over
            </button>
          </div>

          <div className="space-y-2">
            {headers.map((header) => (
              <div key={header} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-gray-700 truncate">{header}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    Sample: {rows[0]?.[headers.indexOf(header)] ?? "—"}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <select
                  value={mapping[header]}
                  onChange={(e) => setMapping((m) => ({ ...m, [header]: e.target.value }))}
                  className={`flex-shrink-0 w-44 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    mapping[header] === "(skip this column)"
                      ? "border-gray-200 text-gray-400 bg-white"
                      : "border-blue-300 text-blue-700 bg-blue-50"
                  }`}
                >
                  {QB_COLUMNS.map((col) => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Preview */}
          {rows.length > 0 && keptCount > 0 && (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="text-xs w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {headers.filter((h) => mapping[h] !== "(skip this column)").map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-semibold text-blue-700">{mapping[h]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      {headers.filter((h) => mapping[h] !== "(skip this column)").map((h) => (
                        <td key={h} className="px-3 py-2 text-gray-600 font-mono">{row[headers.indexOf(h)] ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 3 && (
                <p className="text-xs text-gray-400 px-3 py-2">+ {rows.length - 3} more rows</p>
              )}
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={keptCount === 0}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download remapped CSV ({keptCount} columns)
          </button>

          {downloaded && (
            <p className="text-sm text-green-600 text-center">✓ Downloaded — import into QuickBooks</p>
          )}
        </div>
      )}
    </div>
  );
}
