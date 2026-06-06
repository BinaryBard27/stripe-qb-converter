import Link from "next/link";

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-slate-50 w-full">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 w-full">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Blog</h1>
      <div className="space-y-8">
        <article className="group relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:ring-indigo-500/50">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
              <Link href="/blog/why-quickbooks-wont-accept-my-stripe-csv" className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                Why QuickBooks Won't Accept My Stripe CSV (And How to Fix It)
              </Link>
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">
              You exported your Stripe transactions. You downloaded the CSV. You tried to import it into QuickBooks. And then QuickBooks just... rejected it. Find out why and how to fix it in minutes.
            </p>
            <div className="flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">
              Read article
              <svg className="ml-1.5 h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </article>
      </div>
      </div>
    </div>
  );
}
