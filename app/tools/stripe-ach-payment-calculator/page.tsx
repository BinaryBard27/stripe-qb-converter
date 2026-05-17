import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeAchClient from "./StripeAchClient";

export const metadata: Metadata = {
  title: "Stripe ACH Payment Calculator — 0.8% Capped at $5 | Free",
  description:
    "Calculate Stripe ACH bank transfer fees. Stripe charges 0.8% capped at $5 per ACH transaction — much cheaper than card payments for large amounts. See exact savings. Free, instant.",
  keywords: [
    "stripe ach calculator",
    "stripe ach fees",
    "stripe ach payment fee",
    "stripe ach vs card fees",
    "stripe bank transfer fee",
    "stripe ach 0.8%",
    "stripe ach direct debit fee",
    "ach payment fee calculator",
    "stripe ach cost",
  ],
  openGraph: {
    title: "Stripe ACH Payment Calculator — 0.8% Capped at $5",
    description: "Calculate Stripe ACH fees and compare with card processing. See exact savings for your transaction amounts.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-ach-payment-calculator",
  },
};

const faqs = [
  {
    q: "How much does Stripe charge for ACH payments?",
    a: "Stripe charges 0.8% per ACH direct debit transaction, with a maximum cap of $5.00. There is no minimum fee. This means a $100 ACH payment costs $0.80, a $1,000 payment costs $5.00 (capped), and a $10,000 payment also costs just $5.00.",
  },
  {
    q: "When does ACH become cheaper than card payments?",
    a: "ACH becomes cheaper than standard card processing (2.9% + $0.30) for transactions above approximately $14. For a $100 payment, ACH costs $0.80 vs $3.20 for a card — saving $2.40. For a $1,000 payment, ACH costs $5.00 vs $29.30 for a card — saving $24.30.",
  },
  {
    q: "What is the difference between ACH debit and ACH credit on Stripe?",
    a: "ACH debit (Stripe charges your customer's bank account directly) costs 0.8% capped at $5. ACH credit (your customer initiates a bank transfer to you) is free to receive but requires manual reconciliation. Most businesses use ACH debit through Stripe for automated billing.",
  },
  {
    q: "How long do Stripe ACH payments take?",
    a: "Stripe ACH payments take 3-5 business days to process and settle. Unlike card payments which are near-instant, ACH has a delayed settlement window. Failed ACH payments (due to insufficient funds or incorrect account details) typically fail after 3-4 business days.",
  },
  {
    q: "Can I use Stripe ACH for recurring billing?",
    a: "Yes. Stripe supports ACH for recurring subscription billing. Customers authorise a mandate (like a direct debit agreement) and Stripe can automatically debit their bank account on schedule. This is significantly cheaper than monthly card charges for higher-priced subscriptions.",
  },
  {
    q: "How do I record Stripe ACH fees in QuickBooks?",
    a: "Stripe ACH fees should be recorded the same way as card processing fees — as a Bank Service Charges expense. The gross transaction amount is your revenue, and the 0.8% ACH fee is a separate expense line. Our free Stripe → QuickBooks converter handles this automatically.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function StripeAchPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Stripe ACH Payment Calculator"
        description="Calculate Stripe ACH bank transfer fees (0.8%, capped at $5) and compare with card processing costs. See exactly when ACH saves you money."
        faqs={faqs}
      >
        <StripeAchClient />
      </ToolLayout>
    </>
  );
}
