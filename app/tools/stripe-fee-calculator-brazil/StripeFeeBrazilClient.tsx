"use client";
import { useState } from "react";

const CARD_TYPES = [
  { id: "domestic", label: "🇧🇷 Cartão brasileiro (Visa/MC)", pct: 0.0399, fixed: 0.39, badge: "3.99% + R$0,39" },
  { id: "international", label: "🌍 Cartão internacional", pct: 0.0499, fixed: 0.39, badge: "4.99% + R$0,39" },
  { id: "amex", label: "💳 American Express", pct: 0.0399, fixed: 0.39, badge: "3.99% + R$0,39" },
];

function fmt(n: number) {
  return "R$" + n.toFixed(2).replace(".", ",");
}
function parse(raw: string) {
  return parseFloat(raw.replace(/[^0-9,.]/, "").replace(",", ".")) || 0;
}

export default function StripeFeeBrazilClient() {
  const [modo, setModo] = useState<"cobrar" | "receber">("cobrar");
  const [valorRaw, setValorRaw] = useState("");
  const [cardTypeId, setCardTypeId] = useState("domestic");
  const [qtdMesRaw, setQtdMesRaw] = useState("");

  const card = CARD_TYPES.find((c) => c.id === cardTypeId)!;
  const valor = parse(valorRaw);
  const qtdMes = parseInt(qtdMesRaw) || 0;

  const taxa = valor * card.pct + card.fixed;
  const liquido = Math.max(0, valor - taxa);

  const valorACobrar = valor > 0 ? (valor + card.fixed) / (1 - card.pct) : 0;
  const taxaInversa = valorACobrar - valor;

  const hasResult = valor > 0;

  return (
    <div className="space-y-6">

      <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
        <span className="text-xl">🇧🇷</span>
        <div>
          <p className="font-semibold text-green-800">Preços Stripe Brasil 2026</p>
          <p className="text-green-700 text-xs mt-0.5">Cartões brasileiros: <strong>3.99% + R$0,39</strong> · Cartões internacionais: <strong>4.99% + R$0,39</strong></p>
        </div>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        {(["cobrar", "receber"] as const).map((m) => (
          <button key={m} onClick={() => setModo(m)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${modo === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            {m === "cobrar" ? "Vou cobrar..." : "Quero receber..."}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {modo === "cobrar" ? "Valor que você cobra (BRL)" : "Valor que quer receber (BRL)"}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
          <input type="text" inputMode="decimal" value={valorRaw}
            onChange={(e) => setValorRaw(e.target.value.replace(/[^0-9,.]/g, ""))}
            placeholder="0,00"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg font-mono text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de cartão</label>
        <div className="space-y-2">
          {CARD_TYPES.map((c) => (
            <button key={c.id} onClick={() => setCardTypeId(c.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${cardTypeId === c.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              <span className="font-medium">{c.label}</span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${cardTypeId === c.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{c.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {hasResult && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-2.5">
          {modo === "cobrar" ? (
            <>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Você cobra</span><span className="font-mono text-gray-700">{fmt(valor)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Taxa Stripe ({(card.pct * 100).toFixed(2)}% + R$0,39)</span><span className="font-mono text-red-500">− {fmt(taxa)}</span></div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Você recebe</span>
                <span className="font-mono font-bold text-xl text-green-600">{fmt(liquido)}</span>
              </div>
              <p className="text-xs text-gray-400">O Stripe fica com {((taxa / valor) * 100).toFixed(2)}% desta transação</p>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Quer receber</span><span className="font-mono text-gray-700">{fmt(valor)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Taxa Stripe adicionada</span><span className="font-mono text-red-500">+ {fmt(taxaInversa)}</span></div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Cobrar do cliente</span>
                <span className="font-mono font-bold text-xl text-blue-600">{fmt(valorACobrar)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {hasResult && modo === "cobrar" && (
        <div className="border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Projeção mensal (opcional)</h3>
          <div className="flex items-center gap-3 mb-4">
            <input type="text" inputMode="numeric" value={qtdMesRaw}
              onChange={(e) => setQtdMesRaw(e.target.value.replace(/\D/g, ""))}
              placeholder="ex: 50"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-sm text-gray-500">transações por mês</span>
          </div>
          {qtdMes > 0 && (
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Volume mensal", value: fmt(valor * qtdMes), color: "text-gray-700" },
                { label: "Taxas Stripe", value: fmt(taxa * qtdMes), color: "text-red-500" },
                { label: "Você recebe", value: fmt(liquido * qtdMes), color: "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <details className="text-sm text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700 font-medium">Como é calculado?</summary>
        <div className="mt-3 pl-2 border-l-2 border-gray-100 space-y-2 text-xs leading-relaxed">
          <p><strong>Direto:</strong> Taxa = (valor × 3.99%) + R$0,39. Líquido = valor − taxa.</p>
          <p><strong>Inverso:</strong> Para receber X, cobrar (X + R$0,39) ÷ (1 − 3.99%).</p>
          <p>Taxas baseadas nos preços publicados pelo Stripe Brasil em 2026. Verifique stripe.com/br/pricing para confirmar.</p>
        </div>
      </details>
    </div>
  );
}
