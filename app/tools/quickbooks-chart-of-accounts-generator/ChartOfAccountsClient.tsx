"use client";
import { useState } from "react";
import Papa from "papaparse";

type BizType = "saas" | "ecommerce" | "freelance" | "retail" | "service";
type AccountType = "Income" | "Expense" | "Bank" | "Accounts Receivable" | "Other Current Asset" | "Other Current Liability" | "Equity";

interface Account {
  name: string;
  type: AccountType;
  subtype?: string;
  description: string;
  stripeRelevant?: boolean;
}

const ACCOUNTS: Record<BizType, Account[]> = {
  saas: [
    { name: "Stripe Account", type: "Bank", description: "Stripe balance — transfer to bank on payout", stripeRelevant: true },
    { name: "Business Checking", type: "Bank", description: "Primary business bank account" },
    { name: "Accounts Receivable", type: "Accounts Receivable", description: "Outstanding invoices" },
    { name: "Subscription Revenue", type: "Income", description: "Monthly/annual subscription payments", stripeRelevant: true },
    { name: "One-Time Revenue", type: "Income", description: "Setup fees, one-time purchases", stripeRelevant: true },
    { name: "Refunds & Discounts", type: "Income", description: "Refunds issued to customers (contra revenue)", stripeRelevant: true },
    { name: "Stripe Processing Fees", type: "Expense", description: "2.9% + $0.30 per transaction", stripeRelevant: true },
    { name: "Software & Subscriptions", type: "Expense", description: "SaaS tools, hosting, infrastructure" },
    { name: "Contractor Payments", type: "Expense", description: "Freelancers, developers, designers" },
    { name: "Marketing & Advertising", type: "Expense", description: "Ads, sponsorships, content" },
    { name: "Office & Admin", type: "Expense", description: "Office supplies, postage, misc" },
    { name: "Professional Services", type: "Expense", description: "Accountant, lawyer, consultant fees" },
    { name: "Owner Equity", type: "Equity", description: "Owner's investment and retained earnings" },
  ],
  ecommerce: [
    { name: "Stripe Account", type: "Bank", description: "Stripe balance", stripeRelevant: true },
    { name: "Business Checking", type: "Bank", description: "Primary bank account" },
    { name: "Inventory Asset", type: "Other Current Asset", description: "Value of inventory on hand" },
    { name: "Product Sales", type: "Income", description: "Revenue from product sales", stripeRelevant: true },
    { name: "Shipping Revenue", type: "Income", description: "Shipping fees charged to customers" },
    { name: "Returns & Refunds", type: "Income", description: "Refunds to customers (contra)", stripeRelevant: true },
    { name: "Stripe Processing Fees", type: "Expense", description: "Payment processing fees", stripeRelevant: true },
    { name: "Cost of Goods Sold", type: "Expense", description: "Direct cost of products sold" },
    { name: "Shipping & Fulfillment", type: "Expense", description: "Outbound shipping, packaging" },
    { name: "Platform Fees", type: "Expense", description: "Shopify, Amazon, marketplace fees" },
    { name: "Marketing & Ads", type: "Expense", description: "Facebook, Google ads, influencers" },
    { name: "Returns Processing", type: "Expense", description: "Return shipping, restocking costs" },
    { name: "Owner Equity", type: "Equity", description: "Owner's investment" },
  ],
  freelance: [
    { name: "Stripe Account", type: "Bank", description: "Stripe balance", stripeRelevant: true },
    { name: "Business Checking", type: "Bank", description: "Primary bank account" },
    { name: "Accounts Receivable", type: "Accounts Receivable", description: "Outstanding invoices" },
    { name: "Consulting Revenue", type: "Income", description: "Client project fees", stripeRelevant: true },
    { name: "Retainer Revenue", type: "Income", description: "Monthly retainer payments", stripeRelevant: true },
    { name: "Stripe Processing Fees", type: "Expense", description: "Payment processing fees", stripeRelevant: true },
    { name: "Home Office", type: "Expense", description: "Home office deduction" },
    { name: "Software & Tools", type: "Expense", description: "Design tools, dev tools, subscriptions" },
    { name: "Professional Development", type: "Expense", description: "Courses, books, conferences" },
    { name: "Marketing", type: "Expense", description: "Website, portfolio, ads" },
    { name: "Travel & Transport", type: "Expense", description: "Client meetings, travel" },
    { name: "Owner Equity", type: "Equity", description: "Owner's investment" },
  ],
  retail: [
    { name: "Stripe Account", type: "Bank", description: "Stripe/POS balance", stripeRelevant: true },
    { name: "Business Checking", type: "Bank", description: "Primary bank account" },
    { name: "Inventory", type: "Other Current Asset", description: "Retail inventory value" },
    { name: "Retail Sales", type: "Income", description: "In-store and online sales", stripeRelevant: true },
    { name: "Returns & Allowances", type: "Income", description: "Customer returns (contra)", stripeRelevant: true },
    { name: "Stripe Processing Fees", type: "Expense", description: "Card processing fees", stripeRelevant: true },
    { name: "Cost of Goods Sold", type: "Expense", description: "Wholesale cost of items sold" },
    { name: "Rent & Utilities", type: "Expense", description: "Store rent, electricity, internet" },
    { name: "Payroll", type: "Expense", description: "Staff wages and salaries" },
    { name: "Supplies", type: "Expense", description: "Store supplies, bags, packaging" },
    { name: "Owner Equity", type: "Equity", description: "Owner's investment" },
  ],
  service: [
    { name: "Stripe Account", type: "Bank", description: "Stripe balance", stripeRelevant: true },
    { name: "Business Checking", type: "Bank", description: "Primary bank account" },
    { name: "Accounts Receivable", type: "Accounts Receivable", description: "Outstanding invoices" },
    { name: "Service Revenue", type: "Income", description: "Revenue from services rendered", stripeRelevant: true },
    { name: "Stripe Processing Fees", type: "Expense", description: "Payment processing fees", stripeRelevant: true },
    { name: "Labor & Wages", type: "Expense", description: "Employee or contractor labor" },
    { name: "Equipment & Tools", type: "Expense", description: "Tools, equipment, supplies" },
    { name: "Vehicle & Transport", type: "Expense", description: "Business vehicle costs" },
    { name: "Insurance", type: "Expense", description: "Liability, business insurance" },
    { name: "Marketing", type: "Expense", description: "Advertising, website" },
    { name: "Owner Equity", type: "Equity", description: "Owner's investment" },
  ],
};

const BIZ_TYPES: { id: BizType; label: string; icon: string }[] = [
  { id: "saas", label: "SaaS / Software", icon: "💻" },
  { id: "ecommerce", label: "E-commerce", icon: "🛒" },
  { id: "freelance", label: "Freelance", icon: "👤" },
  { id: "retail", label: "Retail", icon: "🏪" },
  { id: "service", label: "Service Business", icon: "🔧" },
];

const TYPE_COLORS: Record<AccountType, string> = {
  "Bank": "bg-blue-50 text-blue-700 border-blue-200",
  "Income": "bg-green-50 text-green-700 border-green-200",
  "Expense": "bg-red-50 text-red-700 border-red-200",
  "Accounts Receivable": "bg-purple-50 text-purple-700 border-purple-200",
  "Other Current Asset": "bg-amber-50 text-amber-700 border-amber-200",
  "Other Current Liability": "bg-orange-50 text-orange-700 border-orange-200",
  "Equity": "bg-gray-50 text-gray-700 border-gray-200",
};

export default function ChartOfAccountsClient() {
  const [bizType, setBizType] = useState<BizType>("saas");
  const [stripeOnly, setStripeOnly] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const accounts = ACCOUNTS[bizType].filter((a) => !stripeOnly || a.stripeRelevant);

  const handleDownload = () => {
    const rows = accounts.map((a) => ({
      "Account Name": a.name,
      "Account Type": a.type,
      "Description": a.description,
      "Stripe Relevant": a.stripeRelevant ? "Yes" : "No",
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quickbooks-chart-of-accounts-${bizType}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  return (
    <div className="space-y-6">

      {/* Business type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your business type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BIZ_TYPES.map((bt) => (
            <button
              key={bt.id}
              onClick={() => { setBizType(bt.id); setDownloaded(false); }}
              className={`flex items-center gap-2 py-2.5 px-3 rounded-lg border text-sm transition-all ${
                bizType === bt.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <span style={{ fontSize: "16px" }}>{bt.icon}</span>
              <span className="font-medium">{bt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStripeOnly(!stripeOnly)}
          className={`relative w-10 h-5 rounded-full transition-colors ${stripeOnly ? "bg-blue-600" : "bg-gray-200"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${stripeOnly ? "translate-x-5" : ""}`} />
        </button>
        <span className="text-sm text-gray-600">Show Stripe-relevant accounts only</span>
      </div>

      {/* Account list */}
      <div className="space-y-2">
        {accounts.map((account) => (
          <div
            key={account.name}
            className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            <span className={`text-xs font-medium px-2 py-0.5 rounded border flex-shrink-0 ${TYPE_COLORS[account.type]}`}>
              {account.type}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{account.name}</p>
              <p className="text-xs text-gray-400 truncate">{account.description}</p>
            </div>
            {account.stripeRelevant && (
              <span className="text-xs text-indigo-500 flex-shrink-0">⚡ Stripe</span>
            )}
          </div>
        ))}
      </div>

      {/* Download */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download as CSV ({accounts.length} accounts)
      </button>

      {downloaded && (
        <p className="text-sm text-green-600 text-center">
          ✓ Downloaded — go to QuickBooks → Accounting → Chart of Accounts → Import
        </p>
      )}
    </div>
  );
}
