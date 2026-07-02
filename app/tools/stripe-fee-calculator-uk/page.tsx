import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeFeesUKClient from "./StripeFeesUKClient";
import { FaqSchema } from "@/components/FaqSchema";

export const metadata: Metadata = {
  title: "Stripe Fee Calculator UK 2026 — 1.5% + 20p | Free GBP Calculator",
  description:
    "Calculate Stripe UK fees in GBP. 1.5% + £0.20 for UK cards, 2.5% + £0.20 for international. See net payout instantly. Free, HMRC compliant, no signup.",
  keywords: [
    "stripe fee calculator uk",
    "stripe fees uk",
    "stripe uk pricing",
    "stripe uk transaction fee",
    "stripe fees gbp",
    "stripe uk charges",
    "stripe 1.5% + 20p",
    "stripe fee calculator pounds",
  ],
  openGraph: {
    title: "Stripe Fee Calculator UK — GBP (£)",
    description: "Calculate Stripe UK fees instantly. See net payout in GBP and what to charge to receive a specific amount.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-uk",
  },
};

const faqs = [
  {
    q: "What are Stripe's fees in the UK?",
    a: "Stripe UK charges 1.5% + 20p for UK-issued cards and 2.5% + 20p for internationally-issued cards (non-UK). For European Economic Area (EEA) cards, the rate is 2.5% + 20p. These are Stripe's standard published rates — high-volume merchants can negotiate custom pricing.",
  },
  {
    q: "Does Stripe charge VAT in the UK?",
    a: "Stripe's processing fees are subject to UK VAT (20%) for UK businesses that are VAT registered. This means the effective cost is higher than the published rate. Stripe will issue a VAT invoice that you can use to reclaim the VAT if your business is VAT registered.",
  },
  {
    q: "Is Stripe cheaper than PayPal in the UK?",
    a: "For standard UK card transactions, Stripe (1.5% + 20p) is generally cheaper than PayPal (2.9% + 30p fixed fee equivalent). For international cards, they're more comparable. Stripe also has more transparent, consistent pricing than PayPal UK.",
  },
  {
    q: "How do Stripe payouts work in the UK?",
    a: "Stripe UK pays out on a 7-day rolling schedule for new accounts, moving to 2-day once your account is established. Payouts are in GBP to your UK bank account. Stripe uses Faster Payments for UK payouts, which typically arrive within hours of initiation.",
  },
  {
    q: "How do I record Stripe fees in UK accounting software?",
    a: "Stripe fees should be recorded as a bank service charge or merchant fee expense. In Xero or QuickBooks UK, categorise them under 'Bank Charges & Interest' or create a specific 'Stripe Processing Fees' expense account. The gross transaction amount is your revenue; the fee is a separate expense.",
  },
];

const toolSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Stripe Fee Calculator UK",
  description: "Calculate Stripe processing fees for UK businesses in GBP.",
  url: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-uk",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
};

export default function StripeFeesUKPage() {
  return (
    <>
      <FaqSchema faqs={faqs} />
      <Script id="tool-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <ToolLayout
        title="Stripe Fee Calculator UK"
        description="Calculate Stripe fees for UK businesses in GBP. See your net payout after fees — and what to charge to receive a specific amount."
        faqs={faqs}
      >
        <StripeFeesUKClient />
      </ToolLayout>
    </>
  );
}
