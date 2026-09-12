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

export default function ToolLayout({ title, description, children, faqs }: ToolLayoutProps) {
  return (
    <div className="tool-page-shell">
      <nav className="tool-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/tools">Free tools</Link><span aria-hidden="true">/</span><span>{title}</span>
      </nav>

      <section className="tool-workspace" aria-labelledby="tool-title">
        <div className="tool-workspace-label"><span className="hub-eyebrow-dot" /> Use the tool</div>
        <div className="tool-workspace-heading">
          <div>
            <h1 id="tool-title">{title}</h1>
          </div>
          <Link href="/tools" className="tool-change-link">Choose another tool ↗</Link>
        </div>
        <div className="tool-interactive-card">{children}</div>
      </section>

      <section className="tool-supporting-copy">
        <span className="hub-eyebrow">What this tool does</span>
        <h2>Get the result first.<br /><em>Read the details when you need them.</em></h2>
        <p>{description}</p>
      </section>

      <ConverterCTA />

      <nav aria-label="Related tools" className="tool-related-links">
        <p>Explore next</p>
        <div>
          <Link href="/tools/stripe-fee-calculator">Stripe fee calculator</Link>
          <Link href="/tools/stripe-mtd-bridging-formatter">MTD formatter</Link>
          <Link href="/tools/stripe-to-xero-converter">Stripe to Xero</Link>
          <Link href="/blog">Guides &amp; blogs</Link>
        </div>
      </nav>

      {faqs && faqs.length > 0 && (
        <section className="tool-faq" aria-labelledby="faq-heading">
          <div className="tool-faq-heading"><span className="hub-eyebrow">Still wondering?</span><h2 id="faq-heading">Frequently Asked Questions</h2></div>
          <div className="tool-faq-list">
            {faqs.map((faq, i) => (
              <details key={i}>
                <summary>{faq.q}<span aria-hidden="true">+</span></summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
