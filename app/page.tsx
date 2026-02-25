"use client";

import { useCallback, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

type QuickBooksRow = {
  Date: string;
  Description: string;
  Amount: string;
  Fee: string;
  Net: string;
  Customer: string;
  "Transaction ID": string;
};

const ACCEPTED_EXTENSIONS = [".csv", ".tsv", ".xlsx", ".xls", ".json"];

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

function formatStripeDateToQB(utcDateStr: string): string {
  if (!utcDateStr) return "";
  const d = new Date(utcDateStr);
  if (isNaN(d.getTime())) return utcDateStr;
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

function centsToDollars(cents: string | number): string {
  const num = typeof cents === "string" ? parseFloat(cents) || 0 : cents;
  return (num / 100).toFixed(2);
}

function parseCSV(text: string, delimiter?: string): Record<string, string>[] {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    delimiter,
  });

  const fatalErrors = parsed.errors.filter(
    (e) => e.type === "Delimiter" || e.type === "FieldMismatch"
  );
  if (fatalErrors.length && !parsed.data.length) {
    throw new Error("Could not parse CSV. Please use a valid Stripe export.");
  }

  return parsed.data;
}

function parseXLSX(buffer: ArrayBuffer): Record<string, string>[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error("No sheets found in the Excel file.");
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
  });
  return rows.map((row) => {
    const stringRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      stringRow[key] = String(value);
    }
    return stringRow;
  });
}

function parseJSON(text: string): Record<string, string>[] {
  const data = JSON.parse(text);
  // Handle Stripe API response format { data: [...] }
  const arr = Array.isArray(data) ? data : data?.data;
  if (!Array.isArray(arr)) {
    throw new Error(
      "Invalid JSON format. Expected an array or a Stripe API response with a 'data' field."
    );
  }
  return arr.map((item: Record<string, unknown>) => {
    const stringRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(item)) {
      stringRow[key] =
        value === null || value === undefined ? "" : String(value);
    }
    return stringRow;
  });
}

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [convertedCsvUrl, setConvertedCsvUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convertRows = useCallback((rows: Record<string, string>[]) => {
    setError(null);
    setConvertedCsvUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    if (!rows.length) {
      setError("No data found in the file.");
      return;
    }

    const qbRows: QuickBooksRow[] = rows.map((row) => {
      const amountCents = row["Amount"] ?? row["amount"] ?? "0";
      const feeCents = row["Fee"] ?? row["fee"] ?? "0";
      const amount = parseFloat(centsToDollars(amountCents));
      const fee = parseFloat(centsToDollars(feeCents));
      const net = (amount - fee).toFixed(2);

      return {
        Date: formatStripeDateToQB(
          row["Created (UTC)"] ?? row["created_utc"] ?? row["created"] ?? ""
        ),
        Description: row["Description"] ?? row["description"] ?? "",
        Amount: centsToDollars(amountCents),
        Fee: centsToDollars(feeCents),
        Net: net,
        Customer:
          row["Customer Email"] ??
          row["Customer email"] ??
          row["customer_email"] ??
          row["email"] ??
          "",
        "Transaction ID": row["id"] ?? "",
      };
    });

    const qbCsv = Papa.unparse(qbRows);
    const blob = new Blob([qbCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    setConvertedCsvUrl(url);
  }, []);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      const ext = getFileExtension(file.name);

      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setError(
          `Unsupported file type "${ext}". Please upload a .csv, .xlsx, .tsv, or .json file.`
        );
        return;
      }

      setError(null);

      if (ext === ".xlsx" || ext === ".xls") {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const buffer = e.target?.result as ArrayBuffer;
            const rows = parseXLSX(buffer);
            convertRows(rows);
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to parse Excel file."
            );
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (ext === ".json") {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const rows = parseJSON(text);
            convertRows(rows);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Failed to parse JSON file."
            );
          }
        };
        reader.readAsText(file);
      } else {
        // CSV or TSV
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const delimiter = ext === ".tsv" ? "\t" : undefined;
            const rows = parseCSV(text, delimiter);
            convertRows(rows);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Failed to parse file."
            );
          }
        };
        reader.readAsText(file);
      }
    },
    [convertRows]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files?.[0] ?? null);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0] ?? null);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-12 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
        <div className="relative mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Convert Stripe to QuickBooks in 10 Seconds
          </h1>
          <p className="mt-4 text-lg text-slate-600 sm:text-xl">
            Free forever. No signup required.
          </p>
        </div>
      </section>

      {/* Upload */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${isDragging
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/50"
              }`}
          >
            <input
              type="file"
              accept=".csv,.tsv,.xlsx,.xls,.json"
              onChange={handleInputChange}
              className="hidden"
            />
            <svg
              className="h-12 w-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="mt-2 text-sm font-medium text-slate-600">
              {isDragging
                ? "Drop your file here"
                : "Drag and drop your Stripe export file"}
            </span>
            <span className="mt-1 text-sm text-slate-500">
              or click to browse
            </span>
            <span className="mt-1 text-xs text-slate-400">
              Accepts .csv, .xlsx, .xls, .tsv, .json
            </span>
          </label>

          {error && (
            <p className="mt-3 text-center text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          {convertedCsvUrl && (
            <div className="mt-6 flex justify-center">
              <a
                href={convertedCsvUrl}
                download="quickbooks_import.csv"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download quickbooks_import.csv
              </a>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-200/80 bg-white/60 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            How It Works
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">1. Upload</h3>
              <p className="mt-1 text-sm text-slate-600">
                Drop your Stripe payments export (CSV, Excel, TSV, or JSON).
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">2. Convert</h3>
              <p className="mt-1 text-sm text-slate-600">
                We map dates, amounts, fees, and details instantly in your
                browser.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">
                3. Download
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Get your QuickBooks-ready CSV and import it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <dl className="mt-10 space-y-6">
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
              <dt className="font-semibold text-slate-900">
                Is my data safe?
              </dt>
              <dd className="mt-2 text-sm text-slate-600">
                Yes. Everything runs in your browser. Your file is never sent to
                our servers.
              </dd>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
              <dt className="font-semibold text-slate-900">
                What file formats do you support?
              </dt>
              <dd className="mt-2 text-sm text-slate-600">
                CSV, Excel (.xlsx, .xls), TSV, and JSON. Use the export from
                Stripe Dashboard → Payments → Export.
              </dd>
            </div>
            <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
              <dt className="font-semibold text-slate-900">
                Which QuickBooks version?
              </dt>
              <dd className="mt-2 text-sm text-slate-600">
                Works with QuickBooks Online, Desktop, and Self-Employed. Import
                as a bank transaction or similar CSV import.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Email capture */}
      <section className="border-t border-slate-200/80 bg-slate-50/80 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <p className="text-sm font-medium text-slate-700">
            Get notified of updates
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const email =
                (
                  form.querySelector(
                    'input[name="email"]'
                  ) as HTMLInputElement
                )?.value ?? "";
              const body = email
                ? `Please add me to your update list. Email: ${encodeURIComponent(email)}`
                : "Please add me to your update list.";
              window.location.href = `mailto:?subject=${encodeURIComponent("Stripe to QuickBooks updates")}&body=${body}`;
            }}
            className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center"
          >
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Notify me
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-500">
            Opens your email client. Replace with Formspree when ready.
          </p>
        </div>
      </section>
    </div>
  );
}
