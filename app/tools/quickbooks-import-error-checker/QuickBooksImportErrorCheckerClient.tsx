"use client";

import { useState, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type Severity = "error" | "warning" | "info";

interface Issue {
  severity: Severity;
  title: string;
  detail: string;
  fix: string;
  rows?: number[];
}

interface CheckResult {
  issues: Issue[];
  rowCount: number;
  colCount: number;
  headers: string[];
}

// ── QuickBooks rules ─────────────────────────────────────────────────────────

const REQUIRED_COLS = ["date", "description", "amount"];
const COMMON_ALIASES: Record<string, string> = {
  "transaction date": "date",
  "created (utc)": "date",
  "created": "date",
  "memo": "description",
  "narration": "description",
  "payee": "description",
  "name": "description",
  "debit": "amount",
  "credit": "amount",
  "net": "amount",
  "total": "amount",
};

const DATE_PATTERNS = {
  iso: /^\d{4}-\d{2}-\d{2}$/,           // 2024-03-15  ← wrong for QB
  epoch: /^\d{10,13}$/,                   // 1710460800  ← wrong for QB
  usSlash: /^\d{1,2}\/\d{1,2}\/\d{4}$/,  // 03/15/2024 ← correct
  usDash: /^\d{1,2}-\d{1,2}-\d{4}$/,     // 03-15-2024 ← might work
  textMonth: /^[A-Za-z]+ \d{1,2},? \d{4}$/, // March 15, 2024 ← wrong
};

function parseCSV(raw: string): string[][] {
  const lines = raw.trim().split(/\r?\n/);
  return lines.map((line) => {
    const cols: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cols.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    cols.push(current.trim());
    return cols;
  });
}

function normalizeHeader(h: string): string {
  const lower = h.toLowerCase().replace(/[^a-z\s()]/g, "").trim();
  return COMMON_ALIASES[lower] ?? lower;
}

function checkCSV(raw: string): CheckResult {
  const issues: Issue[] = [];
  const rows = parseCSV(raw);

  if (rows.length < 2) {
    return {
      issues: [{ severity: "error", title: "File too short", detail: "Your CSV needs at least a header row and one data row.", fix: "Make sure you copied the full CSV including the header row.", rows: [] }],
      rowCount: 0, colCount: 0, headers: [],
    };
  }

  const rawHeaders = rows[0];
  const headers = rawHeaders.map((h) => h.replace(/^"|"$/g, "").trim());
  const normalizedHeaders = headers.map(normalizeHeader);
  const dataRows = rows.slice(1).filter((r) => r.some((c) => c.trim() !== ""));
  const colCount = headers.length;

  // ── 1. Missing required columns ──────────────────────────────────────────
  const missingCols = REQUIRED_COLS.filter(
    (req) => !normalizedHeaders.includes(req)
  );
  if (missingCols.length > 0) {
    issues.push({
      severity: "error",
      title: `Missing required column${missingCols.length > 1 ? "s" : ""}: ${missingCols.join(", ")}`,
      detail: `QuickBooks requires Date, Description, and Amount columns. Your CSV has: ${headers.join(", ")}`,
      fix: `Rename your columns to match exactly: "Date", "Description", "Amount". QuickBooks is case-sensitive.`,
    });
  }

  // ── 2. Inconsistent column count ────────────────────────────────────────
  const badColRows: number[] = [];
  dataRows.forEach((row, i) => {
    if (row.length !== colCount) badColRows.push(i + 2);
  });
  if (badColRows.length > 0) {
    issues.push({
      severity: "error",
      title: `Inconsistent columns in ${badColRows.length} row${badColRows.length > 1 ? "s" : ""}`,
      detail: `Header has ${colCount} columns but rows ${badColRows.slice(0, 5).join(", ")}${badColRows.length > 5 ? "..." : ""} have a different count. Usually caused by unescaped commas in descriptions.`,
      fix: `Wrap any fields containing commas in double quotes. E.g. "Stripe payment, monthly" instead of Stripe payment, monthly`,
      rows: badColRows.slice(0, 5),
    });
  }

  // ── 3. Date format issues ────────────────────────────────────────────────
  const dateColIdx = normalizedHeaders.indexOf("date");
  if (dateColIdx !== -1) {
    const isoRows: number[] = [];
    const epochRows: number[] = [];
    const textRows: number[] = [];

    dataRows.forEach((row, i) => {
      const val = (row[dateColIdx] ?? "").replace(/^"|"$/g, "").trim();
      if (!val) return;
      if (DATE_PATTERNS.iso.test(val)) isoRows.push(i + 2);
      else if (DATE_PATTERNS.epoch.test(val)) epochRows.push(i + 2);
      else if (DATE_PATTERNS.textMonth.test(val)) textRows.push(i + 2);
    });

    if (isoRows.length > 0) {
      issues.push({
        severity: "error",
        title: "Wrong date format (ISO → needs MM/DD/YYYY)",
        detail: `${isoRows.length} row${isoRows.length > 1 ? "s" : ""} use YYYY-MM-DD format (e.g. 2024-03-15). QuickBooks requires MM/DD/YYYY (e.g. 03/15/2024). This is the #1 reason Stripe CSV exports fail to import.`,
        fix: `In Excel/Sheets: select the date column → Format Cells → Custom → type MM/DD/YYYY. Or use our Stripe → QuickBooks converter which handles this automatically.`,
        rows: isoRows.slice(0, 5),
      });
    }
    if (epochRows.length > 0) {
      issues.push({
        severity: "error",
        title: "Epoch timestamps detected (not human-readable dates)",
        detail: `${epochRows.length} row${epochRows.length > 1 ? "s" : ""} contain Unix timestamps (e.g. 1710460800). QuickBooks cannot read these.`,
        fix: `Convert timestamps to MM/DD/YYYY format. In Excel: =(A1/86400)+DATE(1970,1,1) then format as date. Or use our Stripe → QuickBooks converter.`,
        rows: epochRows.slice(0, 5),
      });
    }
    if (textRows.length > 0) {
      issues.push({
        severity: "error",
        title: "Text month names in dates (e.g. 'March 15, 2024')",
        detail: `QuickBooks requires numeric date formats only. Text month names will be rejected.`,
        fix: `Convert to MM/DD/YYYY format. In Excel: =DATEVALUE(A1) then format as MM/DD/YYYY.`,
        rows: textRows.slice(0, 5),
      });
    }
  }

  // ── 4. Amount issues ─────────────────────────────────────────────────────
  const amtColIdx = normalizedHeaders.indexOf("amount");
  if (amtColIdx !== -1) {
    const currencySymbolRows: number[] = [];
    const commaRows: number[] = [];
    const parenNegativeRows: number[] = [];
    const emptyAmtRows: number[] = [];
    const centsRows: number[] = [];

    dataRows.forEach((row, i) => {
      const val = (row[amtColIdx] ?? "").replace(/^"|"$/g, "").trim();
      if (!val) { emptyAmtRows.push(i + 2); return; }
      if (/[$£€¥]/.test(val)) currencySymbolRows.push(i + 2);
      if (/\d,\d{3}/.test(val)) commaRows.push(i + 2);
      if (/^\([\d.,]+\)$/.test(val)) parenNegativeRows.push(i + 2);
      // Detect if amounts look like they're in cents (all values > 100 and no decimals)
      const num = parseFloat(val.replace(/[^0-9.-]/g, ""));
      if (!isNaN(num) && Math.abs(num) > 100 && !val.includes(".")) centsRows.push(i + 2);
    });

    if (currencySymbolRows.length > 0) {
      issues.push({
        severity: "error",
        title: `Currency symbols in Amount column (${currencySymbolRows.length} rows)`,
        detail: `QuickBooks requires plain numbers in Amount fields. Found $ or other currency symbols in rows: ${currencySymbolRows.slice(0, 5).join(", ")}`,
        fix: `Remove currency symbols. In Excel: select column → Find & Replace → find "$" → replace with nothing.`,
        rows: currencySymbolRows.slice(0, 5),
      });
    }
    if (commaRows.length > 0) {
      issues.push({
        severity: "error",
        title: `Comma-formatted numbers in Amount column (${commaRows.length} rows)`,
        detail: `Values like "1,250.00" cause import errors. QuickBooks needs "1250.00" (no thousands separator).`,
        fix: `In Excel: select the Amount column → Format Cells → Number → uncheck "Use 1000 Separator".`,
        rows: commaRows.slice(0, 5),
      });
    }
    if (parenNegativeRows.length > 0) {
      issues.push({
        severity: "error",
        title: `Parenthesis-style negatives in Amount column (${parenNegativeRows.length} rows)`,
        detail: `Values like "(50.00)" are accounting notation for negatives. QuickBooks import needs "-50.00" instead.`,
        fix: `In Excel: =IF(LEFT(A1,1)="(","-"&MID(A1,2,LEN(A1)-2),A1) to convert, then paste as values.`,
        rows: parenNegativeRows.slice(0, 5),
      });
    }
    if (centsRows.length > 5) {
      issues.push({
        severity: "warning",
        title: "Amounts may be in cents, not dollars",
        detail: `Many values appear to be large integers with no decimal point. Stripe exports amounts in cents (e.g. 2999 = $29.99). If imported as-is, your books will show amounts 100× too large.`,
        fix: `Divide all Amount values by 100. In Excel: type 100 in an empty cell → copy → select Amount column → Paste Special → Divide.`,
      });
    }
    if (emptyAmtRows.length > 0) {
      issues.push({
        severity: "error",
        title: `Empty Amount cells in ${emptyAmtRows.length} rows`,
        detail: `Rows ${emptyAmtRows.slice(0, 5).join(", ")} have no amount. QuickBooks will reject these rows.`,
        fix: `Either enter a 0 for zero-amount rows, or delete the empty rows before importing.`,
        rows: emptyAmtRows.slice(0, 5),
      });
    }
  }

  // ── 5. Blank rows ────────────────────────────────────────────────────────
  const blankRows: number[] = [];
  rows.slice(1).forEach((row, i) => {
    if (row.every((c) => c.trim() === "")) blankRows.push(i + 2);
  });
  if (blankRows.length > 0) {
    issues.push({
      severity: "warning",
      title: `${blankRows.length} blank row${blankRows.length > 1 ? "s" : ""} found`,
      detail: `Blank rows in the middle of your data can interrupt QuickBooks import. Found at row${blankRows.length > 1 ? "s" : ""}: ${blankRows.slice(0, 5).join(", ")}`,
      fix: `Delete all blank rows before importing. In Excel: Ctrl+G → Special → Blanks → Delete rows.`,
      rows: blankRows.slice(0, 5),
    });
  }

  // ── 6. Stripe-specific detection ────────────────────────────────────────
  const stripeIndicators = ["balance_transaction_id", "transfer", "stripe", "fee_details", "reporting_category"];
  const hasStripeHeaders = headers.some((h) =>
    stripeIndicators.some((s) => h.toLowerCase().includes(s))
  );
  if (hasStripeHeaders) {
    issues.push({
      severity: "info",
      title: "This looks like a Stripe export",
      detail: `Stripe CSV exports use 14+ columns that QuickBooks doesn't understand. Dates are in ISO format, amounts may be in cents, and column names don't match QuickBooks fields.`,
      fix: `Use our free Stripe → QuickBooks converter instead of manual reformatting. It handles all column mapping, date conversion, fee categorization, and QuickBooks formatting automatically.`,
    });
  }

  // ── 7. All clear ────────────────────────────────────────────────────────
  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "No obvious errors detected",
      detail: `Your CSV structure looks compatible with QuickBooks. If you're still getting errors, check: column name spelling (QuickBooks is case-sensitive), special characters in descriptions, and that your QuickBooks version supports the import format you're using.`,
      fix: `Try importing into QuickBooks. If it fails, copy the exact error message and search for it specifically.`,
    });
  }

  return { issues, rowCount: dataRows.length, colCount, headers };
}

// ── Component ─────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    icon: "✕",
    iconBg: "bg-red-100 text-red-600",
    label: "Error",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
    icon: "⚠",
    iconBg: "bg-yellow-100 text-yellow-600",
    label: "Warning",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    icon: "ℹ",
    iconBg: "bg-blue-100 text-blue-600",
    label: "Info",
  },
};

const SAMPLE_CSV = `Date,Description,Amount
2024-03-15,Stripe payment - order #1234,$1,250.00
2024-03-16,Refund - customer Jane,(50.00)
1710460800,Subscription renewal,2999
03/17/2024,Manual payment,75.00`;

export default function QuickBooksImportErrorCheckerClient() {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [checked, setChecked] = useState(false);

  const handleCheck = useCallback(() => {
    if (!csv.trim()) return;
    const res = checkCSV(csv);
    setResult(res);
    setChecked(true);
  }, [csv]);

  const handleSample = useCallback(() => {
    setCsv(SAMPLE_CSV);
    setResult(null);
    setChecked(false);
  }, []);

  const handleReset = useCallback(() => {
    setCsv("");
    setResult(null);
    setChecked(false);
  }, []);

  const errorCount = result?.issues.filter((i) => i.severity === "error").length ?? 0;
  const warningCount = result?.issues.filter((i) => i.severity === "warning").length ?? 0;

  return (
    <div className="space-y-5">

      {/* Instructions */}
      <div className="text-sm text-gray-500 leading-relaxed">
        <p>Export your CSV from Stripe, your bank, or accounting tool, then paste it below. All processing happens in your browser — your data is never uploaded anywhere.</p>
      </div>

      {/* Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-700">
            Paste your CSV here
          </label>
          <button
            onClick={handleSample}
            className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            Load sample with errors →
          </button>
        </div>
        <textarea
          value={csv}
          onChange={(e) => { setCsv(e.target.value); setChecked(false); setResult(null); }}
          placeholder={`Paste CSV content here...\n\nExample:\nDate,Description,Amount\n03/15/2024,Stripe payment,125.00`}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y placeholder:text-gray-300"
          spellCheck={false}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCheck}
          disabled={!csv.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
        >
          Check for Errors
        </button>
        {checked && (
          <button
            onClick={handleReset}
            className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">

          {/* Summary bar */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm flex-wrap">
            <span className="text-gray-500">
              <span className="font-semibold text-gray-900">{result.rowCount}</span> data rows ·{" "}
              <span className="font-semibold text-gray-900">{result.colCount}</span> columns detected
            </span>
            <span className="flex items-center gap-1.5">
              {errorCount > 0 ? (
                <span className="bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                  {errorCount} error{errorCount > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                  ✓ No errors
                </span>
              )}
              {warningCount > 0 && (
                <span className="bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">
                  {warningCount} warning{warningCount > 1 ? "s" : ""}
                </span>
              )}
            </span>
          </div>

          {/* Issue cards */}
          {result.issues.map((issue, i) => {
            const cfg = SEVERITY_CONFIG[issue.severity];
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${cfg.iconBg}`}>
                    {cfg.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">{issue.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 leading-relaxed">{issue.detail}</p>
                    <div className="bg-white/70 rounded-lg px-3 py-2 border border-white">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fix: </span>
                      <span className="text-sm text-gray-700">{issue.fix}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Column map */}
          {result.headers.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-700 font-medium">
                View detected columns ({result.headers.length})
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.headers.map((h, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-mono">
                    {h}
                  </span>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
