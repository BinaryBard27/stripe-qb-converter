import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import HowMuchStripeChargesClient from "./HowMuchStripeChargesClient";

export const metadata: Metadata = {
  title: "How Much Does Stripe Charge? — Complete Fee Calculator 2026",
  description:
    "See exactly how much Stripe charges for every transaction type — cards, ACH, international, manual entry. Calculate your exact cost with our free Stripe fee calculator.",
  keywords: [
    "how much does stripe charge",
    "how much does stripe charge per transaction",
    "how much do stripe charge per transaction",
    "stripe charges percentage",
    "stripe fee percentage",
    "stripe take percentage",
    "stripe cost per transaction",
    "stripe pricing 2024",
    "stripe pricing 2025",
    "stripe pricing 2026",
  ],
  openGraph: {
    title: "How Much Does Stripe Charge? — 2026 Fee Calculator",
    description: "See exactly how much Stripe charges for every transaction type and calculate your exact cost.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/how-much-does-stripe-charge",
  },
};

const faqs = [
  {
    q: "How much does Stripe charge per transaction?",
    a: "Stripe charges 2.9% + $0.30 per successful card transaction for US businesses on the standard plan. On a $100 sale, Stripe takes $3.20 and you receive $96.80. For international cards (non-US), the rate is 3.9% + $0.30.",
  },
  {
    q: "Does Stripe charge a monthly fee?",
    a: "No. Stripe's standard plan has no monthly fee, no setup fee, and no minimum transaction requirement. You only pay when you successfully process a payment. Some advanced Stripe features (Stripe Billing, Stripe Radar Advanced, Stripe Tax) have additional costs.",
  },
  {
    q: "How much does Stripe charge for ACH bank transfers?",
    a: "Stripe charges 0.8% for ACH direct debit payments, capped at $5.00 per transaction. This makes ACH significantly cheaper than card payments for large transactions — a $1,000 ACH payment costs only $5, versus $29.30 for a card payment.",
  },
  {
    q: "How much does Stripe charge for refunds?",
    a: "Stripe does not charge a fee for issuing refunds, but it does not return the original processing fee either. So if a customer paid $100 and you refund them $100, you lose the $3.20 processing fee permanently. Your net loss is $3.20 on top of the refunded amount.",
  },
  {
    q: "How much does Stripe charge for disputes/chargebacks?",
    a: "Stripe charges a $15 dispute fee when a customer files a chargeback. If you win the dispute, the $15 is refunded. If you lose, you pay the $15 plus forfeit the original transaction amount and processing fee. Using Stripe Radar can help reduce dispute rates.",
  },
  {
    q: "Does Stripe charge more for larger transactions?",
    a: "No. Stripe's 2.9% + $0.30 applies to every transaction regardless of size. However, the fixed $0.30 component means the effective rate is higher on small transactions. On a $1 transaction, the effective rate is 32%, while on a $1,000 transaction it's just 2.93%.",
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

export default function HowMuchStripeChargesPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="How Much Does Stripe Charge?"
        description="See every Stripe fee in one place — cards, ACH, international, disputes, and more. Enter your transaction amount to calculate your exact cost."
        faqs={faqs}
      >
        <HowMuchStripeChargesClient />
      </ToolLayout>
    </>
  );
}
