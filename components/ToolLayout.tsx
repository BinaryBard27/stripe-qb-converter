// components/ToolLayout.tsx
// Wrap every free tool page with this for consistent header + breadcrumb + FAQ.

import Link from "next/link";
import ConverterCTA from "./ConverterCTA";

interface FAQ {
  q: string;
  a: string;
}

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  faqs?: FAQ[];
}

export default function ToolLayout({
  title,
  description,
  children,
  faqs,
}: ToolLayoutProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

      {/* Breadcrumb — Google loves this for site structure */}
      <nav className="text-sm text-gray-400 mb-8 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-gray-700 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-gray-700 transition-colors">
          Free Tools
        </Link>
        <span>/</span>
        <span className="text-gray-600">{title}</span>
      </nav>

      {/* Tool header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          {title}
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">{description}</p>
      </div>

      {/* The interactive tool */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        {children}
      </div>

      {/* CTA — the whole reason this page exists */}
      <ConverterCTA />

      {/* FAQ section — targets long-tail keywords, eligible for Google rich results */}
      {faqs && faqs.length > 0 && (
        <div className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border-b border-gray-100 pb-6 last:border-0"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
