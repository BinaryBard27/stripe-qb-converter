import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeFeeIndiaClient from "./StripeFeeIndiaClient";
import { FaqSchema } from "@/components/FaqSchema";

export const metadata: Metadata = {
  title: "Stripe Fee Calculator India 2026 — INR Transaction Fees | Free",
  description:
    "Calculate Stripe fees for Indian businesses in INR. Stripe India charges 2% for domestic cards and 3% for international cards. See net payout instantly. Free, no signup.",
  keywords: [
    "stripe fee calculator india",
    "stripe fees india",
    "stripe india pricing 2026",
    "stripe inr fees",
    "stripe india transaction fee",
    "stripe india 2%",
    "how much does stripe charge india",
    "stripe fees indian rupees",
    "stripe india calculator",
    "stripe payment gateway india fees",
  ],
  openGraph: {
    title: "Stripe Fee Calculator India — INR 2026",
    description: "Calculate Stripe India fees. 2% for domestic cards, 3% for international. Free, instant.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-india",
  },
};

const faqs = [
  {
    q: "What are Stripe's fees in India?",
    a: "Stripe India charges 2% for domestic Indian cards (Visa, Mastercard, RuPay) with no fixed fee per transaction. For internationally-issued cards, the rate is 3%. These are Stripe's standard rates for Indian accounts as of 2026. Note that Indian pricing uses percentage-only — there's no fixed per-transaction fee like the US $0.30.",
  },
  {
    q: "Does Stripe support UPI in India?",
    a: "Yes. Stripe supports UPI (Unified Payments Interface) for Indian businesses. UPI transactions may have different fee structures than card payments. Stripe also supports NetBanking, wallets (Paytm, PhonePe), and EMI options for Indian customers.",
  },
  {
    q: "Does Stripe charge GST in India?",
    a: "Yes. Stripe's processing fees are subject to Indian GST (18%). For GST-registered businesses, this can be claimed as input tax credit. Stripe provides tax invoices monthly. The effective cost of Stripe fees including GST is: domestic 2% × 1.18 = 2.36%, international 3% × 1.18 = 3.54%.",
  },
  {
    q: "How do Stripe payouts work in India?",
    a: "Stripe India pays out to Indian bank accounts in INR. Payouts typically arrive within 3-5 business days for new accounts and 2 business days for established accounts. Stripe uses NEFT/IMPS for Indian bank transfers.",
  },
  {
    q: "Is Stripe cheaper than Razorpay or PayU in India?",
    a: "Stripe India (2% domestic) is competitive with Razorpay (2% for most cards) and cheaper than PayU (up to 2.5%). However, Razorpay and PayU have wider support for Indian payment methods and may be easier to integrate for India-only businesses. Stripe is better if you need international payment acceptance.",
  },
  {
    q: "Can Indian businesses accept international payments on Stripe?",
    a: "Yes. Indian businesses can accept payments in multiple currencies through Stripe. International cards are charged at 3% plus any currency conversion fees. Payouts are settled in INR to your Indian bank account after currency conversion.",
  },
];

const toolSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Stripe Fee Calculator India",
  description: "Calculate Stripe processing fees for Indian businesses in INR.",
  url: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-india",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
};

export default function StripeFeeIndiaPage() {
  return (
    <>
      <FaqSchema faqs={faqs} />
      <Script id="tool-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <ToolLayout
        title="Stripe Fee Calculator India"
        description="Calculate Stripe fees for Indian businesses in INR. See your net payout after fees — and what to charge to receive a specific amount after Stripe's 2% domestic fee."
        faqs={faqs}
      >
        <StripeFeeIndiaClient />
      </ToolLayout>
    </>
  );
}
