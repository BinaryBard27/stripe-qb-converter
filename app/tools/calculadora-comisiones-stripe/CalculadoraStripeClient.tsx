"use client";
import { useState } from "react";

const REGIONES = [
  { id: "us", label: "🇺🇸 Estados Unidos", pct: 0.029, fixed: 0.30, currency: "$", symbol: "USD" },
  { id: "eu", label: "🇪🇺 Europa / España", pct: 0.015, fixed: 0.25, currency: "€", symbol: "EUR" },
  { id: "eu_intl", label: "🌍 Tarjeta internacional (EU)", pct: 0.025, fixed: 0.25, currency: "€", symbol: "EUR" },
  { id: "mx", label: "🇲🇽 México", pct: 0.036, fixed: 3.00, currency: "$", symbol: "MXN" },
  { id: "br", label: "🇧🇷 Brasil", pct: 0.0399, fixed: 0.39, currency: "R$", symbol: "BRL" },
];

function fmtCurrency(n: number, symbol: string) {
  return symbol + n.toFixed(2);
}

function parse(raw: string) {
  return parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;
}

export default function CalculadoraStripeClient() {
  const [modo, setModo] = useState<"cobrar" | "recibir">("cobrar");
  const [montoRaw, setMontoRaw] = useState("");
  const [regionId, setRegionId] = useState("us");
  const [cantidadMesRaw, setCantidadMesRaw] = useState("");

  const region = REGIONES.find((r) => r.id === regionId)!;
  const monto = parse(montoRaw);
  const cantidadMes = parseInt(cantidadMesRaw) || 0;

  const comision = monto * region.pct + region.fixed;
  const neto = Math.max(0, monto - comision);

  // Calculadora inversa
  const montoACobrar = monto > 0 ? (monto + region.fixed) / (1 - region.pct) : 0;
  const comisionInversa = montoACobrar - monto;

  const hasResult = monto > 0;

  return (
    <div className="space-y-6">

      {/* Modo */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        {([["cobrar", "Estoy cobrando..."], ["recibir", "Quiero recibir..."]] as const).map(([m, label]) => (
          <button key={m} onClick={() => setModo(m)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${modo === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Monto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {modo === "cobrar" ? "Cantidad que cobras al cliente" : "Cantidad que quieres recibir"}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{region.currency}</span>
          <input type="text" inputMode="decimal" value={montoRaw}
            onChange={(e) => setMontoRaw(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg font-mono text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300" />
        </div>
      </div>

      {/* Región */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tu región</label>
        <div className="space-y-2">
          {REGIONES.map((r) => (
            <button key={r.id} onClick={() => setRegionId(r.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${regionId === r.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              <span className="font-medium">{r.label}</span>
              <span className="text-xs font-mono text-gray-500">{(r.pct * 100).toFixed(1)}% + {r.currency}{r.fixed.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resultado */}
      {hasResult && (
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-2.5">
          {modo === "cobrar" ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Cobras al cliente</span>
                <span className="font-mono text-gray-700">{fmtCurrency(monto, region.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Comisión Stripe ({(region.pct * 100).toFixed(1)}% + {region.currency}{region.fixed.toFixed(2)})</span>
                <span className="font-mono text-red-500">− {fmtCurrency(comision, region.currency)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Recibes tú</span>
                <span className="font-mono font-bold text-xl text-green-600">{fmtCurrency(neto, region.currency)}</span>
              </div>
              <p className="text-xs text-gray-400">
                Stripe se queda con el {((comision / monto) * 100).toFixed(2)}% de esta transacción
              </p>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quieres recibir</span>
                <span className="font-mono text-gray-700">{fmtCurrency(monto, region.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Comisión Stripe añadida</span>
                <span className="font-mono text-red-500">+ {fmtCurrency(comisionInversa, region.currency)}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Debes cobrar</span>
                <span className="font-mono font-bold text-xl text-blue-600">{fmtCurrency(montoACobrar, region.currency)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Proyección mensual */}
      {hasResult && modo === "cobrar" && (
        <div className="border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Proyección mensual (opcional)</h3>
          <div className="flex items-center gap-3 mb-4">
            <input type="text" inputMode="numeric" value={cantidadMesRaw}
              onChange={(e) => setCantidadMesRaw(e.target.value.replace(/\D/g, ""))}
              placeholder="ej. 50"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-sm text-gray-500">transacciones por mes</span>
          </div>
          {cantidadMes > 0 && (
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Volumen mensual", value: fmtCurrency(monto * cantidadMes, region.currency), color: "text-gray-700" },
                { label: "Comisiones Stripe", value: fmtCurrency(comision * cantidadMes, region.currency), color: "text-red-500" },
                { label: "Recibes tú", value: fmtCurrency(neto * cantidadMes, region.currency), color: "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <p className={`text-base font-bold font-mono ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cómo se calcula */}
      <details className="text-sm text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700 font-medium">¿Cómo se calcula?</summary>
        <div className="mt-3 pl-2 border-l-2 border-gray-100 space-y-2 text-xs leading-relaxed">
          <p><strong>Directo:</strong> Comisión = (monto × {(region.pct * 100).toFixed(1)}%) + {region.currency}{region.fixed.toFixed(2)}. Neto = monto − comisión.</p>
          <p><strong>Inverso:</strong> Para recibir X, cobra (X + {region.currency}{region.fixed.toFixed(2)}) ÷ (1 − {(region.pct * 100).toFixed(1)}%).</p>
          <p>Las tarifas mostradas son las estándar publicadas por Stripe. Los comercios de alto volumen pueden negociar tarifas personalizadas.</p>
        </div>
      </details>
    </div>
  );
}
