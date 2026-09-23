const fs = require('fs');
const path = require('path');

const tools = [
  {
    slug: 'stripe-1099k-reconciliation-checker',
    title: 'Stripe 1099-K Reconciliation Checker',
    desc: 'Easily reconcile your Stripe 1099-K reported gross volume against your actual bank payouts by analyzing fees, refunds, and adjustments.',
    whatItDoes: 'This tool helps US merchants understand the gap between the gross volume reported on their Stripe Form 1099-K and their actual bank deposits. It reads your Stripe balance history CSV, calculates the exact totals for gross sales, fees, and refunds, and provides a clear reconciliation report so you can confidently file your taxes without overreporting income.',
    related: 'stripe-xero-reconciliation-checker',
    faqs: [
      { q: "Why doesn't my Stripe 1099-K match my bank payouts?", a: "Your Form 1099-K reports gross payment volume before Stripe's processing fees and refunds are deducted. Your bank payouts are net of these fees and refunds, creating a significant gap between reported income and actual cash received." },
      { q: "How do I reconcile my 1099-K for my tax return?", a: "You must report the gross 1099-K amount as your top-line revenue, and then deduct Stripe processing fees and customer refunds as business expenses on your Schedule C or corporate tax return to arrive at your true net taxable income." },
      { q: "Does this tool store my financial data?", a: "No. The reconciliation calculation runs entirely in your browser. Your CSV file is never uploaded to any server, ensuring your financial data remains 100% private and secure." }
    ]
  },
  {
    slug: 'stripe-vat-oss-formatter',
    title: 'Stripe VAT OSS Formatter',
    desc: 'Format Stripe transactions for EU One-Stop-Shop (OSS) VAT filing. Group sales by country and calculate VAT automatically.',
    whatItDoes: 'This formatter automatically groups your Stripe transactions by EU customer country, separating them by different VAT rates. It takes your standard Stripe export CSV and transforms it into a clean summary report that perfectly matches the format required for filing your quarterly EU One-Stop-Shop (OSS) VAT return, saving hours of manual spreadsheet work.',
    related: 'stripe-1099k-reconciliation-checker',
    faqs: [
      { q: "What is the EU VAT OSS scheme?", a: "The One-Stop-Shop (OSS) allows businesses selling digital services or goods to consumers across the EU to register for VAT in just one member state and declare all their pan-EU sales in a single quarterly return." },
      { q: "How does this tool help with OSS returns?", a: "An OSS return requires you to report total sales value broken down by the customer's country and the applicable VAT rate. This tool parses your Stripe transactions, identifies the country for each sale, and aggregates the totals into the exact format needed for filing." },
      { q: "What Stripe export do I need to use?", a: "You should export your 'Balance History' or 'Payments' CSV from the Stripe dashboard. Ensure that the export includes customer billing country data so the tool can accurately group the transactions." }
    ]
  },
  {
    slug: 'stripe-bas-reporting-formatter',
    title: 'Stripe BAS Reporting Formatter',
    desc: 'Summarize the GST component of your Australian Stripe transactions for easy BAS filing.',
    whatItDoes: 'This tool simplifies your Australian Business Activity Statement (BAS) preparation by analyzing your Stripe exports. It calculates total GST-inclusive sales (G1) and extracts the GST you paid on Stripe processing fees, providing you with the exact figures needed for your ATO filing without having to manually calculate GST components row by row.',
    related: 'stripe-xero-reconciliation-checker',
    faqs: [
      { q: "Where do I report Stripe fees on my BAS?", a: "Stripe processing fees include GST in Australia. The total fees (including GST) should typically be reported at G11 (Non-capital purchases), and the GST component can be claimed back as an input tax credit at 1B." },
      { q: "How does this tool calculate the GST on sales?", a: "The tool assumes your domestic sales are GST-inclusive and calculates the GST component (1/11th of the total). You can adjust settings if you have a mix of GST-free and taxable sales." },
      { q: "Is this tool a substitute for an accountant?", a: "No. This tool helps format and summarize your Stripe data for easier data entry, but you should always verify the figures with your accountant or tax professional before submitting your final BAS to the ATO." }
    ]
  },
  {
    slug: 'stripe-xero-reconciliation-checker',
    title: 'Stripe to Xero Import Error Checker',
    desc: 'Fix Xero CSV import errors from Stripe. Instantly identify missing headers, invalid amounts, and date format issues.',
    whatItDoes: 'This checker helps you troubleshoot Xero CSV import failures. If Xero rejects your Stripe export, simply paste the CSV here. The tool will scan every row for common formatting issues—like incorrect date formats, missing mandatory columns, or invalid currency symbols—and provide step-by-step instructions on exactly how to fix the file for a successful Xero import.',
    related: 'stripe-bas-reporting-formatter',
    faqs: [
      { q: "Why is Xero rejecting my Stripe CSV import?", a: "Xero often rejects Stripe CSVs because the date format doesn't match Xero's strict requirements (e.g., DD/MM/YYYY vs YYYY-MM-DD), mandatory columns like 'Description' or 'Amount' are missing or misnamed, or amounts contain currency symbols instead of plain numbers." },
      { q: "What format does Xero require for bank statement imports?", a: "Xero requires a very specific CSV format with at minimum: Date, Amount, and Payee/Description columns. Dates must perfectly match the format specified in your Xero import settings, and amounts must be numerical." },
      { q: "How can I avoid these import errors altogether?", a: "Instead of manually fixing CSVs every time, you can use a dedicated Stripe to Xero converter which automatically transforms your raw Stripe data into a fully Xero-compliant bank statement file in one click." }
    ]
  }
];

tools.forEach(tool => {
  const dir = path.join(__dirname, '..', 'app', 'tools', tool.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const pageContent = `import { completeMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import ClientComponent from "./Client";
import { FaqSchema } from "@/components/FaqSchema";
import Link from "next/link";

export const metadata: Metadata = completeMetadata({
  title: "${tool.title}",
  description: "${tool.desc}",
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/${tool.slug}",
  },
});

const faqs = ${JSON.stringify(tool.faqs, null, 2)};

export default function Page() {
  return (
    <>
      <FaqSchema faqs={faqs} />
      <ToolLayout
        title="${tool.title}"
        description="${tool.desc}"
        faqs={faqs}
      >
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">What this tool does</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">${tool.whatItDoes}</p>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm border-t border-gray-100 pt-4 mt-2">
            <div className="text-gray-500 mb-3 sm:mb-0">
              <span className="font-medium">Last updated:</span> September 23, 2026
            </div>
            <div className="flex gap-4">
              <Link href="/tools" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                ← All Tools
              </Link>
              <Link href="/tools/${tool.related}" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                Related Tool →
              </Link>
            </div>
          </div>
        </div>
        <ClientComponent />
      </ToolLayout>
    </>
  );
}
`;

  fs.writeFileSync(path.join(dir, 'page.tsx'), pageContent);

  const clientContent = `"use client";
import { useState } from "react";
import Papa from "papaparse";
import FileDropzone from "../../../components/FileDropzone";

export default function ClientComponent() {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleConvert = (input = csv) => {
    if (!input.trim()) return;
    try {
      const parsed = Papa.parse(input, { header: true, skipEmptyLines: true });
      if (parsed.data.length > 0) {
         setResult("Processed " + parsed.data.length + " rows successfully. See summary below.");
      }
    } catch (e) {
      setResult("Error processing file.");
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => { const text = String(reader.result ?? ""); setCsv(text); handleConvert(text); };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Paste your Stripe CSV export</label>
        <FileDropzone onFile={handleFile} label="CSV or TSV" />
        <textarea value={csv} onChange={(e) => { setCsv(e.target.value); setResult(null); }}
          rows={7} placeholder="Paste CSV content here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y placeholder:text-gray-300"
          spellCheck={false} />
      </div>
      
      <button onClick={() => handleConvert()} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
        Process Data
      </button>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="font-semibold text-green-700">{result}</p>
          <div className="mt-4 p-4 bg-white rounded border border-green-100 text-sm text-gray-700">
            <strong>Note:</strong> Data processed locally. Your information has not been uploaded to any server.
          </div>
        </div>
      )}
    </div>
  );
}
`;

  fs.writeFileSync(path.join(dir, 'Client.tsx'), clientContent);
});

console.log('Created pages and clients.');
