import Link from "next/link";

export default function BlogIndex() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Blog</h1>
      <div className="space-y-8">
        <article className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            <Link href="/blog/why-quickbooks-wont-accept-my-stripe-csv" className="hover:text-indigo-600 transition-colors">
              Why QuickBooks Won't Accept My Stripe CSV (And How to Fix It)
            </Link>
          </h2>
          <p className="text-slate-600 mb-4">
            You exported your Stripe transactions. You downloaded the CSV. You tried to import it into QuickBooks. And then QuickBooks just... rejected it. Find out why and how to fix it in minutes.
          </p>
          <Link 
            href="/blog/why-quickbooks-wont-accept-my-stripe-csv"
            className="text-indigo-600 font-medium hover:text-indigo-700 inline-flex items-center"
          >
            Read more &rarr;
          </Link>
        </article>
      </div>
    </div>
  );
}
