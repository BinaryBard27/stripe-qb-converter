import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeFeeNZClient from "./StripeFeeNZClient";
import { FaqSchema } from "@/components/FaqSchema";

export const metadata: Metadata = {
  title: "Stripe Fee Calculator New Zealand 2026 — NZD Fees | Free",
  description:
    "Calculate Stripe fees for New Zealand businesses in NZD. Stripe NZ charges 2.7% + NZ$0.30 for domestic cards. See net payout instantly. Free, no signup, no data stored.",
  keywords: [
    "stripe fee calculator new zealand",
    "stripe fees new zealand",
    "stripe nz pricing 2026",
    "stripe nzd fees",
    "stripe new zealand transaction fee",
    "stripe nz 2.7%",
    "how much does stripe charge new zealand",
    "stripe fees nzd calculator",
  ],
  openGraph: {
    title: "Stripe Fee Calculator New Zealand — NZD 2026",
    description: "Calculate Stripe NZ fees instantly. 2.7% + NZ$0.30 for domestic cards. Free, no signup.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-new-zealand",
  },
};

const faqs = [
  {
    q: "What are Stripe's fees in New Zealand?",
    a: "Stripe New Zealand charges 2.7% + NZ$0.30 for domestic NZ cards (Visa, Mastercard) and 3.7% + NZ$0.30 for internationally-issued cards. American Express is also 2.7% + NZ$0.30 on the standard plan. These are Stripe's published rates for NZ accounts as of 2026.",
  },
  {
    q: "Does Stripe charge GST in New Zealand?",
    a: "Stripe's processing fees are subject to NZ GST (15%) for GST-registered businesses. GST-registered businesses can claim this back as an input tax credit. Stripe provides monthly tax invoices you can use for GST returns.",
  },
  {
    q: "How do Stripe payouts work in New Zealand?",
    a: "Stripe NZ pays out to New Zealand bank accounts in NZD on a 2-day rolling schedule for established accounts. New accounts start with 7-day payouts. Payouts use NZ bank transfers and typically arrive same or next business day after initiation.",
  },
  {
    q: "How do I record Stripe fees in Xero New Zealand?",
    a: "In Xero NZ, categorise Stripe fees as Bank Service Charges. Record the gross transaction as revenue and the Stripe fee as a separate expense. This ensures your GST is treated correctly and your P&L is accurate. Make sure your Stripe account in Xero is set to NZD.",
  },
  {
    q: "What's the difference between Stripe NZ and Stripe AU fees?",
    a: "Stripe NZ charges 2.7% + NZ$0.30 for domestic cards, while Stripe AU charges 1.7% + A$0.30. The percentage rate is 1% higher for NZ. Both have the same international card surcharge (+1%) on top of the domestic rate.",
  },
];

export default function StripeFeeNZPage() {
  return (
    <>
      <FaqSchema faqs={faqs} />
      <ToolLayout
        title="Stripe Fee Calculator New Zealand"
        description="Calculate Stripe fees for New Zealand businesses in NZD. See your net payout after fees — and what to charge to receive a specific amount after Stripe's 2.7% + NZ$0.30."
        faqs={faqs}
      >
        <StripeFeeNZClient />
      </ToolLayout>
    </>
  );
}
