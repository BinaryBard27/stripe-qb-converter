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

function findEmail(row: Record<string, string>): string {
  const candidates = [
    row["Customer Email"],
    row["Customer email"],
    row["customer_email"],
    row["email"],
  ];
  for (const val of candidates) {
    if (val && val.includes("@")) return val;
  }
  for (const val of Object.values(row)) {
    if (val && val.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      return val;
    }
  }
  return "";
}

function parseCSV(text: string, delimiter?: string): Record<string, string>[] {
  const parsed = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: true,
    delimiter,
  });
  if (!parsed.data.length || parsed.data.length < 2) {
    throw new Error("Could not parse CSV. Please use a valid Stripe export.");
  }
  const headers = parsed.data[0];
  const dataRows = parsed.data.slice(1);
  const headerCount = headers.length;
  const sampleRow = dataRows[0] ?? [];
  const paddedHeaders = [...headers];
  if (sampleRow.length > headerCount) {
    for (let i = headerCount; i < sampleRow.length; i++) {
      paddedHeaders.push(`__extra_${i}`);
    }
  }
  return dataRows.map((values) => {
    const row: Record<string, string> = {};
    paddedHeaders.forEach((header, i) => {
      const key = header.trim();
      row[key] = (values[i] ?? "").trim();
    });
    return row;
  });
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
  const [convertedRowCount, setConvertedRowCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

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
          row["Created (UTC)"] ??
            row["created_utc"] ??
            row["created"] ??
            ""
        ),
        Description: row["Description"] ?? row["description"] ?? "",
        Amount: centsToDollars(amountCents),
        Fee: centsToDollars(feeCents),
        Net: net,
        Customer: findEmail(row),
        "Transaction ID": row["id"] ?? "",
      };
    });
    const qbCsv = Papa.unparse(qbRows);
    const blob = new Blob([qbCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    setConvertedCsvUrl(url);
    setConvertedRowCount(qbRows.length);
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
              err instanceof Error ? err.message : "Failed to parse Excel file."
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

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pt-14 pb-6 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
        <div className="relative mx-auto max-w-3xl">

          {/* Pain-first headline */}
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Stop manually copying{" "}
            <span className="text-indigo-600">Stripe into QuickBooks</span>
          </h1>
          <p className="mt-5 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Paste your Stripe CSV. Get a QuickBooks-ready import file.{" "}
            <strong className="text-slate-800">10 seconds. Free. No signup. No data stored.</strong>
          </p>

          {/* Trust pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              { icon: "🔒", text: "Runs 100% in your browser" },
              { icon: "⚡", text: "Instant conversion" },
              { icon: "🆓", text: "Free forever" },
              { icon: "✓", text: "No account required" },
            ].map((pill) => (
              <span
                key={pill.text}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm"
              >
                <span>{pill.icon}</span>
                {pill.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPLOAD ───────────────────────────────────────────────────────── */}
      <section className="px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
              isDragging
                ? "border-indigo-500 bg-indigo-50/80 scale-[1.01]"
                : convertedCsvUrl
                ? "border-emerald-400 bg-emerald-50/50"
                : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/50"
            }`}
          >
            <input
              type="file"
              accept=".csv,.tsv,.xlsx,.xls,.json"
              onChange={handleInputChange}
              className="hidden"
            />

            {convertedCsvUrl ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center gap-2 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="font-semibold text-emerald-700">
                  {convertedRowCount} transaction{convertedRowCount !== 1 ? "s" : ""} converted successfully
                </p>
                <p className="text-sm text-slate-500">Click to convert a different file</p>
              </div>
            ) : (
              /* ── Default / drag state ── */
              <div className="flex flex-col items-center gap-2 px-6 text-center">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${isDragging ? "bg-indigo-100" : "bg-slate-100"}`}>
                  <svg className={`h-7 w-7 transition-colors ${isDragging ? "text-indigo-600" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="font-semibold text-slate-700 text-lg">
                  {isDragging ? "Drop it here" : "Drop your Stripe export here"}
                </p>
                <p className="text-sm text-slate-500">or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">
                  Accepts .csv · .xlsx · .xls · .tsv · .json
                </p>
              </div>
            )}
          </label>

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Download button */}
          {convertedCsvUrl && (
            <div className="mt-5 flex flex-col items-center gap-3">
              <a
                href={convertedCsvUrl}
                download="quickbooks_import.csv"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-700 hover:shadow-indigo-500/40"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download quickbooks_import.csv
              </a>
              <p className="text-xs text-slate-400">
                Ready to import → QuickBooks → Banking → Upload transactions
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION BAR ───────────────────────────────────────── */}
      <section className="border-y border-slate-200/80 bg-white/80 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-6 text-center text-sm">
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">😩</span>
              <p className="font-semibold text-slate-800">The problem</p>
              <p className="text-slate-500">Stripe exports 14 columns. QuickBooks needs 6, named differently, with dates in a different format.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <p className="font-semibold text-slate-800">What it costs you</p>
              <p className="text-slate-500">2–3 hours every month reformatting CSVs manually. Or $30–100/month for a tool that does it automatically.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">✅</span>
              <p className="font-semibold text-slate-800">What this does</p>
              <p className="text-slate-500">Maps every column, converts dates, fixes fee formatting, and outputs a QuickBooks-ready file. In 10 seconds. Free.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-white/60 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-500 text-sm">
            Everything runs in your browser using the{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700">FileReader API</code>.
            Your financial data never leaves your device.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Export from Stripe",
                desc: "Go to Stripe Dashboard → Payments → Export. Download as CSV. Takes 30 seconds.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                ),
              },
              {
                step: "2",
                title: "Drop it here",
                desc: "Drag your Stripe CSV onto the upload box above. We instantly map dates, amounts, fees, and transaction IDs.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                ),
              },
              {
                step: "3",
                title: "Import into QuickBooks",
                desc: "Download the converted CSV. In QuickBooks: Banking → Upload transactions → follow the import wizard.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                ),
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <div className="mt-1 text-xs font-bold text-indigo-400 uppercase tracking-widest">Step {item.step}</div>
                <h3 className="mt-1 font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Repeat CTA after How It Works */}
          <div className="mt-10 text-center">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Try it now — upload your Stripe CSV
              <input type="file" accept=".csv,.tsv,.xlsx,.xls,.json" onChange={handleInputChange} className="hidden" />
            </label>
            <p className="mt-2 text-xs text-slate-400">No signup · No data stored · Instant download</p>
          </div>
        </div>
      </section>

      {/* ── DEMO VIDEO ───────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200/80 bg-slate-50/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">See it in action</h2>
          <p className="text-slate-500 text-sm mb-6">Full conversion in under 10 seconds</p>
          <div className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-200 aspect-video bg-slate-900">
            <video
              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
              autoPlay
              loop
              muted
              playsInline
              controls
            >
              <source src="/demo-recording.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <dl className="mt-8 space-y-4">
            {[
              {
                q: "Is my financial data safe?",
                a: "Yes — completely. The entire conversion happens in your browser using JavaScript. Your file is never uploaded to any server. We have no backend. There is no database. Even if you use this on public Wi-Fi, your data goes nowhere.",
              },
              {
                q: "Why doesn't Stripe CSV import directly into QuickBooks?",
                a: "Stripe exports 14+ columns with Stripe-specific names, ISO-format dates (YYYY-MM-DD), and amounts in cents. QuickBooks needs 6 columns with specific names, MM/DD/YYYY dates, and dollar amounts. This tool maps everything automatically.",
              },
              {
                q: "What file formats do you support?",
                a: "CSV, Excel (.xlsx, .xls), TSV, and JSON. Use the export from Stripe Dashboard → Payments → Export. All standard Stripe export formats work.",
              },
              {
                q: "Which version of QuickBooks does this work with?",
                a: "QuickBooks Online, Desktop, and Self-Employed. After downloading, import via Banking → Upload transactions (Online) or File → Utilities → Import (Desktop).",
              },
              {
                q: "Does it handle Stripe fees and refunds?",
                a: "Yes — Stripe fees are mapped to a separate Fee column so you can categorize them as a bank service charge in QuickBooks. Refunds appear as negative amounts. Complex multi-currency refunds may need manual review.",
              },
              {
                q: "Is this really free? What's the catch?",
                a: "No catch. It's free because there's no server cost — your browser does all the work. We also offer free tools for other Stripe and QuickBooks tasks. If you find this useful, sharing it is all we ask.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
                <dt className="font-semibold text-slate-900">{faq.q}</dt>
                <dd className="mt-2 text-sm text-slate-600 leading-relaxed">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200/80 bg-slate-50/80 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <p className="font-semibold text-slate-800">Get notified of updates</p>
          <p className="mt-1 text-sm text-slate-500">New features, format support, and free tools. No spam.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setEmailStatus("sending");
              const form = e.currentTarget;
              const formData = new FormData(form);
              try {
                const response = await fetch("https://formspree.io/f/xzdajyqg", {
                  method: "POST",
                  body: formData,
                  headers: { Accept: "application/json" },
                });
                if (response.ok) {
                  setEmailStatus("success");
                  form.reset();
                } else {
                  setEmailStatus("error");
                }
              } catch {
                setEmailStatus("error");
              }
            }}
            className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={emailStatus === "sending"}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {emailStatus === "sending" ? "Sending..." : "Notify me"}
            </button>
          </form>
          {emailStatus === "success" && (
            <p className="mt-2 text-xs font-medium text-emerald-600">✓ You&apos;re signed up!</p>
          )}
          {emailStatus === "error" && (
            <p className="mt-2 text-xs font-medium text-red-600">Something went wrong. Please try again.</p>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200/80 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 text-sm text-slate-600">
          <div>
            <h3 className="font-semibold text-slate-900">Known Limitations</h3>
            <ul className="mt-3 list-inside list-disc space-y-2 text-slate-500">
              <li>Multi-currency conversions are not yet supported — amounts are processed as-is.</li>
              <li>Complex refunds and disputes may need manual review in QuickBooks.</li>
              <li>Designed for standard Stripe payment exports. Payout reports use a different format.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">More Free Tools</h3>
            <ul className="mt-3 space-y-2 text-slate-500">
              <li>
                <a href="/tools/stripe-fee-calculator" className="hover:text-indigo-600 transition-colors">
                  → Stripe Fee Calculator
                </a>
              </li>
              <li>
                <a href="/tools/quickbooks-import-error-checker" className="hover:text-indigo-600 transition-colors">
                  → QuickBooks CSV Import Error Checker
                </a>
              </li>
              <li>
                <a href="/tools" className="hover:text-indigo-600 transition-colors">
                  → All free tools
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
