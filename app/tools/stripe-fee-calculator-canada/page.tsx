import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeFeeCanadaClient from "./StripeFeeCanadaClient";

export const metadata: Metadata = {
  title: "Stripe Fee Calculator Canada — CAD Transaction Fees 2026",
  description:
    "Calculate Stripe fees for Canadian businesses in CAD. Stripe Canada charges 2.9% + CA$0.30 for domestic cards. See your net payout instantly. Free, no signup.",
  keywords: [
    "stripe fee calculator canada",
    "stripe fees canada",
    "stripe canada pricing",
    "stripe cad fees",
    "stripe canada transaction fee",
    "stripe fee calculator cad",
    "how much does stripe charge canada",
    "stripe canada 2.9%",
    "stripe fees canadian dollars",
    "stripe canada calculator",
  ],
  openGraph: {
    title: "Stripe Fee Calculator Canada — CAD Fees 2026",
    description: "Calculate Stripe fees for Canadian businesses in CAD. 2.9% + CA$0.30 for domestic cards. Free, instant.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-canada",
  },
};

const faqs = [
  {
    q: "What are Stripe's fees in Canada?",
    a: "Stripe Canada charges 2.9% + CA$0.30 for domestic Canadian cards (Visa, Mastercard). For internationally-issued cards (non-Canadian), the rate is 3.9% + CA$0.30. American Express cards in Canada are also 2.9% + CA$0.30 on the standard plan.",
  },
  {
    q: "Does Stripe charge HST/GST in Canada?",
    a: "Stripe's processing fees are subject to Canadian HST or GST depending on your province. Stripe will apply the appropriate tax rate based on your business address. GST/HST-registered businesses can claim the tax back as an input tax credit. Stripe provides monthly invoices for this purpose.",
  },
  {
    q: "How do Stripe payouts work in Canada?",
    a: "Stripe Canada pays out to Canadian bank accounts in CAD on a 2-day rolling schedule for established accounts. New accounts start with a 7-day schedule. Payouts use EFT (Electronic Funds Transfer) and typically arrive within 1-2 business days of initiation.",
  },
  {
    q: "Can I use Stripe Interac payments in Canada?",
    a: "Stripe supports Interac for in-person payments via Stripe Terminal in Canada. For online payments, Stripe does not support Interac e-Transfer. Online transactions process through the card networks (Visa/Mastercard) at the standard 2.9% + CA$0.30 rate.",
  },
  {
    q: "Is Stripe better than Square or PayPal for Canadian businesses?",
    a: "Stripe Canada (2.9% + CA$0.30) and PayPal Canada (2.9% + CA$0.30) have identical rates for standard online card transactions. Square Canada charges 2.9% + CA$0.30 for online and 2.65% flat for in-person. Stripe has the best API and developer tools of the three.",
  },
  {
    q: "How do I record Stripe fees in QuickBooks Canada?",
    a: "In QuickBooks Canada, categorise Stripe fees as Bank Service Charges under operating expenses. Record the gross transaction amount as revenue, and the Stripe fee as a separate expense line. Our free Stripe → QuickBooks converter maps this correctly from your Stripe CSV export.",
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

const toolSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Stripe Fee Calculator Canada",
  description: "Calculate Stripe processing fees for Canadian businesses in CAD.",
  url: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-canada",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "CAD" },
};

export default function StripeFeeCanadaPage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Script id="tool-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <ToolLayout
        title="Stripe Fee Calculator Canada"
        description="Calculate Stripe fees for Canadian businesses in CAD. See your net payout after fees — and what to charge to receive a specific amount."
        faqs={faqs}
      >
        <StripeFeeCanadaClient />
      </ToolLayout>
    </>
  );
}
