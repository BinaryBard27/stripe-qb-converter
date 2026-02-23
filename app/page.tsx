"use client";

import { useCallback, useState, useRef } from "react";
import Papa from "papaparse";

type QuickBooksRow = {
  Date: string;
  Description: string;
  Amount: string;
  Fee: string;
  Net: string;
  Customer: string;
  "Transaction ID": string;
};

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

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [convertedCsvUrl, setConvertedCsvUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const convertStripeToQuickBooks = useCallback((csvText: string) => {
    setError(null);
    setIsSuccess(false);
    setIsConverting(true);
    setConvertedCsvUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    // Simulate short delay for better UX
    setTimeout(() => {
      const parsed = Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length) {
        setError("Oops! That doesn't look like a Stripe CSV. Make sure you exported from: Stripe Dashboard → Payments → Export");
        setIsConverting(false);
        return;
      }

      const rows = parsed.data;
      if (!rows.length) {
        setError("This CSV is empty. Please export a file with at least 1 transaction");
        setIsConverting(false);
        return;
      }

      try {
        const qbRows: QuickBooksRow[] = rows.map((row) => {
          const amountCents = row["Amount"] ?? row["amount"] ?? "0";
          const feeCents = row["Fee"] ?? row["fee"] ?? "0";
          const amount = parseFloat(centsToDollars(amountCents));
          const fee = parseFloat(centsToDollars(feeCents));
          const net = (amount - fee).toFixed(2);

          return {
            Date: formatStripeDateToQB(
              row["Created (UTC)"] ?? row["created_utc"] ?? ""
            ),
            Description: row["Description"] ?? row["description"] ?? "",
            Amount: centsToDollars(amountCents),
            Fee: centsToDollars(feeCents),
            Net: net,
            Customer: row["Customer Email"] ?? row["Customer email"] ?? row["customer_email"] ?? "",
            "Transaction ID": row["id"] ?? "",
          };
        });

        const qbCsv = Papa.unparse(qbRows);
        const blob = new Blob([qbCsv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        setConvertedCsvUrl(url);
        setIsSuccess(true);
      } catch (err) {
        setError("Error processing data. Ensure you're using a standard Stripe CSV export.");
      } finally {
        setIsConverting(false);
      }
    }, 800);
  }, []);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a .csv file (not .xlsx or .txt)");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        convertStripeToQuickBooks(text);
      };
      reader.readAsText(file);
    },
    [convertStripeToQuickBooks]
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
      <section className="relative overflow-hidden px-4 pt-24 pb-16 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
        <div className="relative mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Currently free while in beta
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
            Stop wasting hours reconciling <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Stripe payouts
            </span> in QuickBooks.
          </h1>
          <p className="mt-4 text-lg text-slate-600 sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Upload your Stripe CSV and get a clean, QuickBooks-ready file in seconds.
            <span className="block font-medium text-slate-900 mt-2">No manual cleanup. No spreadsheet hacks.</span>
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Upload Stripe CSV
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-sm"
            >
              See How It Works
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              No Stripe login required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Processed locally
            </div>
          </div>
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
              accept=".csv"
              ref={fileInputRef}
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
              {isDragging ? "Drop your file here" : "Drag and drop a CSV file"}
            </span>
            <span className="mt-1 text-sm text-slate-500">or click to browse</span>
            <span className="mt-1 text-xs text-slate-400">Accepts .csv only</span>
          </label>

          {error && (
            <p className="mt-3 text-center text-sm font-medium text-red-600 px-4 py-3 bg-red-50 rounded-lg border border-red-100">{error}</p>
          )}

          {isConverting && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-slate-600 font-medium">Converting your CSV...</p>
            </div>
          )}

          {isSuccess && convertedCsvUrl && (
            <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center shadow-sm">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-emerald-900 mb-2">
                Conversion Complete!
              </h3>
              <p className="text-emerald-700 mb-6">
                Your QuickBooks-ready CSV is ready to download
              </p>
              <div className="flex justify-center">
                <a
                  href={convertedCsvUrl}
                  download="quickbooks_import.csv"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-white font-bold shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
          )}

          {/* Sample CSV Download Link */}
          <div className="max-w-2xl mx-auto text-center mt-12 p-8 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-sm">
            <p className="text-slate-700 mb-4 font-medium">
              Don't have a Stripe CSV? Try with our sample file first:
            </p>
            <a
              href="/sample-stripe.csv"
              download
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 font-semibold transition shadow-sm"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Sample Stripe CSV
            </a>
            <p className="text-xs text-slate-500 mt-4">
              Contains 3 sample transactions to test the converter
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-slate-200/80 bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">Three simple steps to reconciliation bliss.</p>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:shadow-md">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">1</div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-3">Export CSV</h3>
              <p className="text-slate-600 leading-relaxed">
                Go to your Stripe Dashboard &rarr; Payments &rarr; Export and download your transaction history.
              </p>
            </div>
            <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:shadow-md">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">2</div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-3">Upload Here</h3>
              <p className="text-slate-600 leading-relaxed">
                Drag and drop your file into the converter above. No data ever leaves your computer.
              </p>
            </div>
            <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:shadow-md">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">3</div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-3">Import to QB</h3>
              <p className="text-slate-600 leading-relaxed">
                Download your perfectly formatted CSV and import it directly into QuickBooks Online or Desktop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)]" />
        <div className="mx-auto max-w-5xl px-4 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-extrabold mb-6 sm:text-4xl text-white">
                Why Stripe + QuickBooks reconciliation is painful
              </h2>
              <p className="text-lg text-slate-400 mb-8">
                If you've ever tried to import a raw Stripe export into QuickBooks, you know it's a nightmare. We fixed the four biggest headaches:
              </p>
              <ul className="space-y-6">
                {[
                  { title: "Payout Bundling", desc: "Stripe payouts group multiple transactions into one deposit, making matching impossible." },
                  { title: "Hidden Fees", desc: "Fees are deducted before transfers, leading to balance mismatches in your books." },
                  { title: "Refund Mismatches", desc: "Refunds often appear in different payout cycles than the original sale." },
                  { title: "Formatting Hell", desc: "QuickBooks expects specific column headers and date formats that Stripe doesn't provide." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-3xl backdrop-blur-sm">
              <div className="space-y-4">
                <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse" />
                <div className="h-24 w-full bg-slate-700/50 rounded-xl flex items-center justify-center border border-slate-600 border-dashed">
                  <span className="text-slate-500 text-sm italic">Simulating spreadsheet manual work...</span>
                </div>
                <div className="h-4 w-2/3 bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-700 rounded animate-pulse" />
                <div className="pt-4 mt-4 border-t border-slate-700">
                  <p className="text-xs text-red-400 font-mono">Error: QuickBooks column 'Net' not found.</p>
                  <p className="text-xs text-red-400 font-mono mt-1">Error: Date format '2025-02-23T22:30:45Z' invalid.</p>
                </div>
              </div>
              <div className="mt-8 text-center text-sm font-medium text-slate-300">
                Stop the manual madness.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-white px-4 border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">See it in action</h2>
            <p className="mt-4 text-slate-600">The simplest way to export Stripe to QuickBooks.</p>
          </div>
          <div className="aspect-video bg-slate-50 rounded-3xl border-4 border-slate-100 flex items-center justify-center relative shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5" />
            <div className="text-center relative z-10 px-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-indigo-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.555 5.168A1 1 0 003 6.07v7.86a1 1 0 001.555.832l6.666-3.93a1 1 0 000-1.664l-6.666-3.93z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-slate-900 mb-2">Demo coming soon</p>
              <p className="text-slate-500">We're recording a walkthrough of the tool.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-12">Built for founders and accountants</h3>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-4">🔒</div>
              <div className="text-xl font-bold text-slate-900 mb-1">100% Private</div>
              <p className="text-slate-500 text-sm">Data stays in your browser. Never touches our servers.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-4">⚡</div>
              <div className="text-xl font-bold text-slate-900 mb-1">Instant Conversion</div>
              <p className="text-slate-500 text-sm">Processing happens in milliseconds, not minutes.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-4">💯</div>
              <div className="text-xl font-bold text-slate-900 mb-1">Reliable Formatting</div>
              <p className="text-slate-500 text-sm">Built to match QuickBooks Online & Desktop requirements.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-slate-600">Currently free while in beta. No credit card required.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 shadow-sm relative overflow-hidden">
              <div className="mb-6">
                <h4 className="text-lg font-bold text-slate-900 mb-1">Free</h4>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">$0</span>
                  <span className="text-slate-500 ml-1">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10">
                {["1 CSV per month", "Basic conversion", "Browser-only processing"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full py-3 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Get Started
              </button>
            </div>

            <div className="p-8 rounded-3xl bg-white border-2 border-indigo-600 shadow-xl shadow-indigo-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">
                Coming Soon
              </div>
              <div className="mb-6">
                <h4 className="text-lg font-bold text-slate-900 mb-1">Pro</h4>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">$19</span>
                  <span className="text-slate-500 ml-1">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10 text-sm">
                {["Unlimited conversions", "Advanced formatting", "Priority support", "PayPal & Square support"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button disabled className="w-full py-3 bg-indigo-50 text-indigo-400 rounded-xl font-bold cursor-not-allowed">
                Waitlist Only
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold select-none">S</div>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">StripeQB</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                The fastest way to convert Stripe balance reports into QuickBooks-ready import files. Built for modern businesses.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-6">Product</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="https://github.com/BinaryBard27/stripe-qb-converter" className="hover:text-indigo-600 transition-colors">Open Source</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-6">Contact</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="mailto:sherwindmello27@gmail.com" className="hover:text-indigo-600 transition-colors">Email Support</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs">© 2025 StripeQB Converter. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="https://github.com/BinaryBard27/stripe-qb-converter" className="text-slate-400 hover:text-slate-900 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
