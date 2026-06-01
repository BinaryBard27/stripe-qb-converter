import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why QuickBooks Won't Accept My Stripe CSV (And How to Fix It)",
  description: "Learn the top 5 reasons QuickBooks rejects your Stripe CSV imports and the fastest way to fix it without manual Excel work.",
};

export default function BlogPost() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
          Why QuickBooks Won't Accept My Stripe CSV (And How to Fix It)
        </h1>
      </header>

      <div className="space-y-6 text-slate-700 text-lg leading-relaxed">
        <p>
          You exported your Stripe transactions. You downloaded the CSV. You tried to import it into QuickBooks. And then QuickBooks just... rejected it.
        </p>
        <p>
          No clear error. Or worse, a confusing error that tells you nothing useful.
        </p>
        <p>
          You're not alone. This is one of the most common frustrations for small business owners who use Stripe. The problem isn't you. The problem is that Stripe and QuickBooks speak different languages — and nobody told you that when you set things up.
        </p>
        <p>
          This post explains exactly why it happens and how to fix it.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">The Core Problem: Stripe CSVs Are Not Built for QuickBooks</h2>
        <p>
          When you export transactions from Stripe, you get a raw data file. It has columns like:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li><code>id</code></li>
          <li><code>Description</code></li>
          <li><code>Amount</code></li>
          <li><code>Amount Refunded</code></li>
          <li><code>Fee</code></li>
          <li><code>Net</code></li>
          <li><code>Created (UTC)</code></li>
          <li><code>Currency</code></li>
        </ul>
        <p>
          This file is useful for reading. But QuickBooks has its own import format. It expects specific column names, specific date formats, and specific structures.
        </p>
        <p>
          Stripe doesn't know about QuickBooks. QuickBooks doesn't know about Stripe. So when you try to import one into the other — it breaks.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">The 5 Most Common Reasons QuickBooks Rejects Your Stripe CSV</h2>
        
        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-2">1. The Date Format Is Wrong</h3>
        <p>
          Stripe exports dates like this: <code className="bg-slate-100 px-1 py-0.5 rounded">2024-03-15 10:42:33 UTC</code><br />
          QuickBooks wants dates like this: <code className="bg-slate-100 px-1 py-0.5 rounded">03/15/2024</code>
        </p>
        <p>
          That difference alone is enough for QuickBooks to reject the entire file.
        </p>
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-md my-4">
          <p className="font-medium text-indigo-900 m-0"><strong>Fix:</strong> Reformat the date column before importing. Or use a converter tool that does this automatically.</p>
        </div>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-2">2. The Column Names Don't Match</h3>
        <p>
          QuickBooks expects specific column headers like <code className="bg-slate-100 px-1 py-0.5 rounded">Date</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">Description</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">Amount</code>. Stripe uses different names like <code className="bg-slate-100 px-1 py-0.5 rounded">Created (UTC)</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">Net</code>.
        </p>
        <p>
          QuickBooks reads the header row first. If it doesn't recognize the column names, it won't know where to put the data.
        </p>
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-md my-4">
          <p className="font-medium text-indigo-900 m-0"><strong>Fix:</strong> Rename the columns manually in Excel, or use a tool built to handle this mapping automatically.</p>
        </div>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-2">3. You're Including the Fee Column</h3>
        <p>
          Stripe shows you three numbers:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li><strong>Amount</strong> — what the customer paid</li>
          <li><strong>Fee</strong> — what Stripe took</li>
          <li><strong>Net</strong> — what you actually received</li>
        </ul>
        <p>
          If you import the raw <code className="bg-slate-100 px-1 py-0.5 rounded">Amount</code>, your QuickBooks records won't match your actual bank deposits. This confuses your reconciliation.
        </p>
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-md my-4">
          <p className="font-medium text-indigo-900 m-0"><strong>Fix:</strong> Import the Net amount, not the Amount. Or import both and record the fee as a separate expense.</p>
        </div>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-2">4. Refunds Are Showing as Negative Numbers</h3>
        <p>
          Stripe lists refunds as negative values in the same CSV. QuickBooks sometimes doesn't handle negative transaction amounts the way you expect during import.
        </p>
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-md my-4">
          <p className="font-medium text-indigo-900 m-0"><strong>Fix:</strong> Separate refunds into their own entries or make sure your import template handles negative values correctly.</p>
        </div>

        <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-2">5. Currency Issues</h3>
        <p>
          If you accept payments in multiple currencies, Stripe will list them all in one CSV. QuickBooks may not handle multi-currency imports well unless your account is set up for it.
        </p>
        <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-md my-4">
          <p className="font-medium text-indigo-900 m-0"><strong>Fix:</strong> Filter by currency before exporting from Stripe, or make sure your QuickBooks plan supports multi-currency.</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">The Fastest Fix</h2>
        <p>
          The cleanest solution is to not import a raw Stripe CSV at all.
        </p>
        <p>
          Instead, convert your Stripe export into a QuickBooks-ready format before importing. This means:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-1">
          <li>Correct date format</li>
          <li>Correct column names</li>
          <li>Net amounts calculated</li>
          <li>Refunds handled properly</li>
        </ul>
        <p>
          You can do this manually in Excel — it takes about 20–30 minutes per export. Or you can use a free tool like <Link href="/" className="text-indigo-600 font-medium hover:underline">Stripe QB Converter</Link> that does it in seconds.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Step-by-Step: What to Do Right Now</h2>
        <ol className="list-decimal pl-6 mb-6 space-y-2">
          <li>Go to your Stripe Dashboard &rarr; Reports &rarr; Balance</li>
          <li>Export as CSV</li>
          <li>Open the CSV in Excel and check: are dates in <code className="bg-slate-100 px-1 py-0.5 rounded">YYYY-MM-DD</code> format? Rename <code className="bg-slate-100 px-1 py-0.5 rounded">Created (UTC)</code> &rarr; <code className="bg-slate-100 px-1 py-0.5 rounded">Date</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">Net</code> &rarr; <code className="bg-slate-100 px-1 py-0.5 rounded">Amount</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">Description</code> &rarr; <code className="bg-slate-100 px-1 py-0.5 rounded">Memo</code></li>
          <li>Delete columns QuickBooks doesn't need (<code className="bg-slate-100 px-1 py-0.5 rounded">id</code>, <code className="bg-slate-100 px-1 py-0.5 rounded">currency</code>, etc.)</li>
          <li>Save as CSV and re-import into QuickBooks</li>
        </ol>
        <p>
          Or skip steps 3–4 and run it through a converter.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Quick Summary</h2>
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left border-collapse rounded-lg overflow-hidden shadow-sm border border-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 border-b border-slate-200 font-semibold text-slate-900">Problem</th>
                <th className="px-4 py-3 border-b border-slate-200 font-semibold text-slate-900">Why It Happens</th>
                <th className="px-4 py-3 border-b border-slate-200 font-semibold text-slate-900">Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">Date format rejected</td>
                <td className="px-4 py-3 text-slate-600">Stripe uses UTC format, QB wants MM/DD/YYYY</td>
                <td className="px-4 py-3 text-slate-600">Reformat dates</td>
              </tr>
              <tr className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">Column names not recognized</td>
                <td className="px-4 py-3 text-slate-600">Stripe and QB use different names</td>
                <td className="px-4 py-3 text-slate-600">Rename headers</td>
              </tr>
              <tr className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">Bank balance doesn't match</td>
                <td className="px-4 py-3 text-slate-600">You imported Amount instead of Net</td>
                <td className="px-4 py-3 text-slate-600">Use Net column</td>
              </tr>
              <tr className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">Refunds causing errors</td>
                <td className="px-4 py-3 text-slate-600">Negative values confuse QB import</td>
                <td className="px-4 py-3 text-slate-600">Separate refunds</td>
              </tr>
              <tr className="bg-white hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">Multi-currency issues</td>
                <td className="px-4 py-3 text-slate-600">QB needs single currency per import</td>
                <td className="px-4 py-3 text-slate-600">Filter by currency</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-8 font-medium text-slate-900">
          The good news: once you fix this once, you know exactly what to do every time.
        </p>

        <div className="mt-12 bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Need to convert your Stripe CSV automatically?</h3>
          <p className="text-slate-600 mb-6">Try Stripe QB Converter — free, no signup needed.</p>
          <Link 
            href="/"
            className="inline-block bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all"
          >
            Go to Free Converter
          </Link>
        </div>

      </div>
    </article>
  );
}
