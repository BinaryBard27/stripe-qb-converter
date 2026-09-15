import { completeMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = completeMetadata({
  title: "Free Stripe & QuickBooks Tools — Calculators & Converters",
  description:
    "Free tools for Stripe and QuickBooks users. Calculate fees, reconcile transactions, fix CSV imports, and more. No signup required.",
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools",
  },
});

type Tool = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  tone: string;
};

const calculators: Tool[] = [
  { slug: "stripe-fee-calculator", name: "Stripe Fee Calculator", description: "Work out the fee and the amount to charge to get paid in full.", icon: "%", badge: "Most popular", tone: "violet" },
  { slug: "stripe-fees-vs-square", name: "Stripe Fees vs Square", description: "Compare estimated processing fees for online payments.", icon: "⇄", badge: "New", tone: "blue" },
  { slug: "stripe-vs-paypal-fee-comparison", name: "Stripe vs PayPal Fees", description: "See which payment processor keeps more money in your business.", icon: "↔", tone: "orange" },
  { slug: "stripe-refund-impact-calculator", name: "Refund Impact Calculator", description: "See the true cost of refunding a Stripe payment.", icon: "↩", tone: "rose" },
  { slug: "stripe-processing-fee-calculator", name: "Processing Fee Calculator", description: "Project fees across monthly volume and annual totals.", icon: "▥", tone: "blue" },
  { slug: "stripe-credit-card-fee-calculator", name: "Credit Card Fee Calculator", description: "Compare fees by card type, including Amex and international cards.", icon: "▣", tone: "violet" },
  { slug: "stripe-international-fee-calculator", name: "International Fee Calculator", description: "Estimate cross-border and currency conversion charges.", icon: "◎", tone: "teal" },
  { slug: "stripe-currency-conversion-calculator", name: "Currency Conversion Calculator", description: "Calculate fees for multi-currency Stripe transactions.", icon: "◌", tone: "green" },
  { slug: "stripe-subscription-cost-calculator", name: "Subscription Cost Calculator", description: "Compare the cost of monthly and annual billing plans.", icon: "◷", tone: "orange" },
  { slug: "stripe-revenue-forecaster", name: "Stripe Revenue Forecaster", description: "Project the next 12 months from MRR and growth rate.", icon: "↗", tone: "green" },
  { slug: "bookkeeping-hours-saved-calculator", name: "Hours Saved Calculator", description: "See how much time bookkeeping automation could save.", icon: "◴", tone: "teal" },
  { slug: "annual-bookkeeping-cost-calculator", name: "Annual Bookkeeping Cost", description: "Compare DIY, bookkeeper, and software costs.", icon: "⌁", tone: "blue" },
  { slug: "stripe-nonprofit-pricing", name: "Nonprofit Pricing Checker", description: "Check basic signals before requesting nonprofit pricing.", icon: "♡", badge: "New", tone: "rose" },
  { slug: "stripe-ach-payment-calculator", name: "ACH Payment Calculator", description: "Calculate ACH fees and compare savings against card payments.", icon: "🏦", tone: "green" },
  { slug: "how-much-does-stripe-charge", name: "How Much Does Stripe Charge?", description: "A complete guide to Stripe fees with a live calculator.", icon: "?", tone: "violet" },
  { slug: "calculadora-comisiones-stripe", name: "Calculadora de Comisiones Stripe", description: "Calcula las comisiones de Stripe por transacción.", icon: "%", tone: "orange" },
  { slug: "stripe-fee-calculator-uk", name: "Stripe Fee Calculator UK", description: "Calculate Stripe fees in GBP with UK card rates.", icon: "£", tone: "blue" },
  { slug: "stripe-fee-calculator-australia", name: "Stripe Fee Calculator Australia", description: "Calculate Stripe fees in AUD with GST options.", icon: "A$", tone: "teal" },
  { slug: "stripe-fee-calculator-canada", name: "Stripe Fee Calculator Canada", description: "Calculate Stripe fees in CAD with provincial tax options.", icon: "C$", tone: "rose" },
  { slug: "stripe-fee-calculator-new-zealand", name: "Stripe Fee Calculator New Zealand", description: "Calculate Stripe fees in NZD for domestic cards.", icon: "NZ$", tone: "green" },
  { slug: "stripe-fee-calculator-singapore", name: "Stripe Fee Calculator Singapore", description: "Calculate Stripe fees in SGD for Singapore businesses.", icon: "S$", tone: "violet" },
  { slug: "stripe-fee-calculator-india", name: "Stripe Fee Calculator India", description: "Calculate Stripe fees in INR for domestic and international cards.", icon: "₹", tone: "orange" },
  { slug: "stripe-fee-calculator-brazil", name: "Calculadora de Taxas Stripe Brasil", description: "Calcule as taxas do Stripe para empresas brasileiras em BRL.", icon: "R$", tone: "green" },
];

const converters: Tool[] = [
  { slug: "stripe-to-xero-converter", name: "Stripe to Xero Converter", description: "Turn a Stripe export into a Xero-ready bank import file.", icon: "↗", badge: "Popular", tone: "blue" },
  { slug: "stripe-to-freeagent-converter", name: "Stripe to FreeAgent Converter", description: "Convert Stripe CSV data into FreeAgent import format.", icon: "↗", tone: "teal" },
  { slug: "stripe-mtd-bridging-formatter", name: "MTD Bridging Formatter", description: "Format Stripe transactions for Making Tax Digital.", icon: "⌘", tone: "violet" },
  { slug: "csv-column-mapper", name: "CSV Column Mapper", description: "Rename columns and download a QuickBooks-ready CSV.", icon: "▤", tone: "orange" },
  { slug: "quickbooks-chart-of-accounts-generator", name: "Chart of Accounts Generator", description: "Generate a QuickBooks import template for your business.", icon: "▦", tone: "green" },
  { slug: "bank-statement-to-excel", name: "Bank Statement to Excel", description: "Turn a bank statement into a clean spreadsheet.", icon: "▤", tone: "blue" },
];

const errorChecking: Tool[] = [
  { slug: "quickbooks-import-error-checker", name: "QuickBooks Import Error Checker", description: "Find why QuickBooks rejects your CSV and get a specific fix.", icon: "✓", badge: "High intent", tone: "green" },
];

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={`/tools/${tool.slug}`} className="hub-tool-card group">
      <div className={`hub-tool-icon hub-tool-icon-${tool.tone}`} aria-hidden="true">{tool.icon}</div>
      <div className="hub-tool-card-body">
        <div className="hub-tool-card-title-row">
          <h3>{tool.name}</h3>
          {tool.badge && <span className="hub-tool-badge">{tool.badge}</span>}
        </div>
        <p>{tool.description}</p>
        <span className="hub-tool-arrow" aria-hidden="true">↗</span>
      </div>
    </Link>
  );
}

function ToolSection({ title, eyebrow, tools }: { title: string; eyebrow: string; tools: Tool[] }) {
  return (
    <section className="hub-section" aria-labelledby={`${title}-heading`}>
      <div className="hub-section-heading">
        <div>
          <span className="hub-eyebrow">{eyebrow}</span>
          <h2 id={`${title}-heading`}>{title}</h2>
        </div>
        <span className="hub-count">{tools.length} tools</span>
      </div>
      <div className="hub-tool-grid">{tools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div>
    </section>
  );
}

export default function ToolsIndexPage() {
  return (
    <div className="tools-hub-page">
      <div className="tools-hub-wrap">
        <section className="hub-hero" aria-labelledby="tools-heading">
          <div className="hub-hero-copy">
            <span className="hub-eyebrow"><span className="hub-eyebrow-dot" /> Free tools for Stripe + QuickBooks</span>
            <h1 id="tools-heading">Pick a tool.<br /><em>Get unstuck.</em></h1>
            <p>Fast, focused tools for fees, files, and financial admin. No sign-up and no data stored.</p>
          </div>
          <Link href="/" className="hub-primary-action">
            <span className="hub-primary-icon">↗</span>
            <span><strong>Start with the Stripe → QuickBooks converter</strong><small>Turn your export into an import-ready file</small></span>
            <span className="hub-primary-arrow">→</span>
          </Link>
        </section>

        <nav className="hub-category-nav" aria-label="Tool categories">
          <a href="#calculators">Calculators <span>{calculators.length}</span></a>
          <a href="#converters">Converters <span>{converters.length}</span></a>
          <a href="#error-checking">Error checking <span>{errorChecking.length}</span></a>
        </nav>

        <div className="hub-sections">
          <div id="calculators"><ToolSection title="Fee calculators" eyebrow="Know your numbers" tools={calculators} /></div>
          <div id="converters"><ToolSection title="Converters & formatters" eyebrow="Move your data" tools={converters} /></div>
          <div id="error-checking"><ToolSection title="Error checking" eyebrow="Fix it faster" tools={errorChecking} /></div>
        </div>

        <section className="hub-bottom-cta">
          <div><span className="hub-eyebrow">Ready when you are</span><h2>One file in.<br /><em>Books up to date.</em></h2></div>
          <Link href="/" className="hub-cta-button">Open the converter <span>→</span></Link>
        </section>
      </div>
    </div>
  );
}
