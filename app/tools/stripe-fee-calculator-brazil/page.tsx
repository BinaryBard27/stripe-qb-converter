import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import StripeFeeBrazilClient from "./StripeFeeBrazilClient";
import { FaqSchema } from "@/components/FaqSchema";

export const metadata: Metadata = {
  title: "Calculadora de Taxas Stripe Brasil 2026 — Taxas em BRL | Grátis",
  description:
    "Calcule as taxas do Stripe para empresas brasileiras em BRL. O Stripe Brasil cobra 3.99% + R$0,39 por transação com cartão. Veja seu lucro líquido instantaneamente. Grátis, sem cadastro.",
  keywords: [
    "calculadora taxas stripe brasil",
    "stripe taxas brasil",
    "stripe brasil preços 2026",
    "stripe brl taxas",
    "stripe brasil taxa por transação",
    "quanto cobra o stripe brasil",
    "stripe fees brazil",
    "stripe fee calculator brazil",
    "stripe taxa brasil",
    "calculadora stripe brasil",
  ],
  openGraph: {
    title: "Calculadora de Taxas Stripe Brasil — BRL 2026",
    description: "Calcule as taxas do Stripe no Brasil. 3.99% + R$0,39 por transação. Grátis, sem cadastro.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-brazil",
    languages: {
      "pt-BR": "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-brazil",
      "en": "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator",
    },
  },
};

const faqs = [
  {
    q: "Quanto o Stripe cobra por transação no Brasil?",
    a: "O Stripe Brasil cobra 3.99% + R$0,39 por transação bem-sucedida com cartão de crédito ou débito. Para cartões internacionais (emitidos fora do Brasil), a taxa é de 4.99% + R$0,39. Não há taxa mensal no plano padrão.",
  },
  {
    q: "O Stripe cobra IOF nas transações no Brasil?",
    a: "Sim. Transações internacionais no Stripe estão sujeitas ao IOF (Imposto sobre Operações Financeiras) brasileiro. Para compras com cartão de crédito em moeda estrangeira, o IOF é de 5.38%. O Stripe pode incluir esse custo nas taxas de câmbio aplicadas.",
  },
  {
    q: "Como funciona o repasse (payout) do Stripe no Brasil?",
    a: "O Stripe Brasil faz repasses para contas bancárias brasileiras em BRL. Contas estabelecidas recebem em 2 dias úteis. Contas novas começam com 7 dias. Os repasses são feitos via TED/PIX e normalmente chegam no mesmo dia da transferência.",
  },
  {
    q: "O Stripe suporta PIX no Brasil?",
    a: "Sim. O Stripe oferece suporte ao PIX para empresas brasileiras. As taxas do PIX são diferentes das taxas de cartão — geralmente mais baixas. Consulte a página de preços do Stripe Brasil para as taxas atuais do PIX, pois podem variar.",
  },
  {
    q: "Como registrar as taxas do Stripe na contabilidade brasileira?",
    a: "As taxas do Stripe devem ser registradas como despesas financeiras ou tarifas bancárias no seu sistema contábil. O valor bruto da transação é sua receita, e a taxa do Stripe é uma despesa separada. Isso é importante para o correto cálculo do Simples Nacional, Lucro Presumido ou Lucro Real.",
  },
  {
    q: "O Stripe é melhor que o PagSeguro ou Mercado Pago no Brasil?",
    a: "Depende do caso. PagSeguro e Mercado Pago têm maior penetração no mercado brasileiro e são mais conhecidos pelos consumidores locais. O Stripe tem melhor API e documentação para desenvolvedores, e é ideal para empresas que vendem internacionalmente. Para vendas 100% domésticas, as soluções locais podem ser mais vantajosas.",
  },
];

const toolSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Calculadora de Taxas Stripe Brasil",
  description: "Calcule as taxas do Stripe para empresas brasileiras em BRL.",
  url: "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator-brazil",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
};

export default function StripeFeeBrazilPage() {
  return (
    <>
      <FaqSchema faqs={faqs} />
      <Script id="tool-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <ToolLayout
        title="Calculadora de Taxas Stripe Brasil"
        description="Calcule as taxas do Stripe para empresas brasileiras em BRL. Veja seu lucro líquido e quanto cobrar para receber um valor específico após as taxas."
        faqs={faqs}
      >
        <StripeFeeBrazilClient />
      </ToolLayout>
    </>
  );
}
