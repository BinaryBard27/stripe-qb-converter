import type { Metadata } from "next";
import Script from "next/script";
import ToolLayout from "@/components/ToolLayout";
import CalculadoraStripeClient from "./CalculadoraStripeClient";

export const metadata: Metadata = {
  title: "Calculadora de Comisiones Stripe — Calcula Tus Tarifas Gratis",
  description:
    "Calcula exactamente cuánto cobra Stripe por cada transacción (2.9% + $0.30). Ve tu pago neto al instante. Gratis, sin registro, sin datos almacenados.",
  keywords: [
    "calculadora comisiones stripe",
    "calculadora stripe",
    "comisiones stripe",
    "tarifas stripe",
    "stripe cuanto cobra",
    "stripe tarifa por transaccion",
    "calcular comision stripe",
    "stripe fees español",
    "stripe precio por transaccion",
    "calculadora stripe españa",
  ],
  openGraph: {
    title: "Calculadora de Comisiones Stripe — Gratis e Instantáneo",
    description: "Calcula las comisiones de Stripe al instante. Ve tu pago neto y cuánto cobrar para recibir una cantidad específica.",
  },
  alternates: {
    canonical: "https://stripe-qb-converter.vercel.app/tools/calculadora-comisiones-stripe",
    languages: {
      "es": "https://stripe-qb-converter.vercel.app/tools/calculadora-comisiones-stripe",
      "en": "https://stripe-qb-converter.vercel.app/tools/stripe-fee-calculator",
    },
  },
};

const faqs = [
  {
    q: "¿Cuánto cobra Stripe por transacción?",
    a: "Stripe cobra el 2.9% + $0.30 por transacción exitosa con tarjeta en Estados Unidos. Para tarjetas internacionales (no estadounidenses), la tarifa es del 3.9% + $0.30. En Europa, las tarifas varían: para tarjetas europeas es 1.5% + €0.25, y para tarjetas internacionales 2.5% + €0.25.",
  },
  {
    q: "¿Cómo calculo cuánto cobrar para recibir una cantidad específica?",
    a: "Para recibir exactamente $X después de las comisiones de Stripe, debes cobrar: (X + $0.30) / (1 - 0.029). Por ejemplo, para recibir $100, debes cobrar $103.09. Usa la calculadora inversa en esta página para hacerlo automáticamente.",
  },
  {
    q: "¿Stripe cobra comisión sobre los reembolsos?",
    a: "Stripe no devuelve la comisión de procesamiento cuando emites un reembolso. Si un cliente pagó $100 y lo reembolsas, Stripe retiene los $3.20 de comisión. Tu pérdida neta es $3.20 además del importe reembolsado.",
  },
  {
    q: "¿Cuáles son las tarifas de Stripe en España y Latinoamérica?",
    a: "En España y la UE, Stripe cobra 1.5% + €0.25 para tarjetas europeas y 2.5% + €0.25 para tarjetas internacionales. En México, las tarifas son 3.6% + $3.00 MXN. En Brasil, 3.99% + R$0.39. Consulta stripe.com/pricing para las tarifas exactas de tu país.",
  },
  {
    q: "¿Stripe tiene tarifas mensuales además de las comisiones?",
    a: "No. El plan estándar de Stripe no tiene cuota mensual, ni tarifa de configuración, ni mínimo de transacciones. Solo pagas cuando procesas un pago exitoso. Algunas funciones avanzadas como Stripe Billing o Stripe Radar tienen costos adicionales.",
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

export default function CalculadoraStripePage() {
  return (
    <>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ToolLayout
        title="Calculadora de Comisiones Stripe"
        description="Calcula exactamente cuánto cobra Stripe por cada transacción. Ve tu pago neto al instante y cuánto debes cobrar para recibir una cantidad específica."
        faqs={faqs}
      >
        <CalculadoraStripeClient />
      </ToolLayout>
    </>
  );
}
