"use client";

import { useState, useCallback } from "react";

// ── Stripe fee tiers ──────────────────────────────────────────────────────────
const FEE_TIERS = [
  {
    id: "standard",
    label: "Standard (US cards)",
    description: "Most transactions",
    pct: 0.029,
    fixed: 0.30,
  },
  {
    id: "international",
    label: "International cards",
    description: "Non-US issued cards",
    pct: 0.039,
    fixed: 0.30,
  },
  {
    id: "manual",
    label: "Manually entered",
    description: "Card number typed in",
    pct: 0.034,
    fixed: 0.30,
  },
] as const;

type TierId = (typeof FEE_TIERS)[number]["id"];

// ── Pure calculation helpers ─────────────────────────────────────────────────
function calcFee(amount: number, pct: number, fixed: number) {
  const fee = amount * pct + fixed;
  const net = amount - fee;
  return { fee, net };
}

function calcReverse(desiredNet: number, pct: number, fixed: number) {
  // To receive `desiredNet`, charge: (desiredNet + fixed) / (1 - pct)
  const chargeNeeded = (desiredNet + fixed) / (1 - pct);
  const fee = chargeNeeded - desiredNet;
  return { chargeNeeded, fee };
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StripeFeeCalculatorClient() {
  const [mode, setMode] = useState<"forward" | "reverse">("forward");
  const [rawInput, setRawInput] = useState("");
  const [tierId, setTierId] = useState<TierId>("standard");
  const [monthlyTxCount, setMonthlyTxCount] = useState("");

  const tier = FEE_TIERS.find((t) => t.id === tierId)!;
  const amount = parseAmount(rawInput);
  const txCount = parseInt(monthlyTxCount) || 0;

  // Forward: given charge amount → fee + net
  const forward = amount > 0 ? calcFee(amount, tier.pct, tier.fixed) : null;

  // Reverse: given desired net → what to charge
  const reverse =
    mode === "reverse" && amount > 0
      ? calcReverse(amount, tier.pct, tier.fixed)
      : null;

  // Monthly projection
  const monthlyFee =
    forward && txCount > 0 ? forward.fee * txCount : null;

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow numbers and a single decimal point
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setRawInput(val);
  }, []);

  return (
    <div className="space-y-6">

      {/* ── Mode toggle ── */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode("forward")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "forward"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          I'm charging…
        </button>
        <button
          onClick={() => setMode("reverse")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "reverse"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          I want to receive…
        </button>
      </div>

      {/* ── Amount input ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {mode === "forward"
            ? "Transaction amount (what you charge the customer)"
            : "Amount you want to receive after Stripe fees"}
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            $
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={rawInput}
            onChange={handleInput}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* ── Fee tier selector ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card type
        </label>
        <div className="grid sm:grid-cols-3 gap-2">
          {FEE_TIERS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTierId(t.id)}
              className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                tierId === t.id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <div className="font-medium">{t.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {(t.pct * 100).toFixed(1)}% + ${t.fixed.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ── */}
      {(forward || reverse) && (
        <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-100">
          {mode === "forward" && forward && (
            <>
              <ResultRow
                label="You charge the customer"
                value={fmt(amount)}
                muted
              />
              <ResultRow
                label={`Stripe fee (${(tier.pct * 100).toFixed(1)}% + $${tier.fixed.toFixed(2)})`}
                value={`- ${fmt(forward.fee)}`}
                valueColor="text-red-500"
              />
              <div className="h-px bg-gray-200" />
              <ResultRow
                label="You receive"
                value={fmt(forward.net)}
                bold
                valueColor="text-green-600"
              />
              <div className="text-xs text-gray-400 pt-1">
                Stripe takes{" "}
                <span className="font-semibold text-gray-600">
                  {((forward.fee / amount) * 100).toFixed(2)}%
                </span>{" "}
                of this transaction.
              </div>
            </>
          )}

          {mode === "reverse" && reverse && (
            <>
              <ResultRow
                label="You need to receive"
                value={fmt(amount)}
                muted
              />
              <ResultRow
                label={`Stripe fee (${(tier.pct * 100).toFixed(1)}% + $${tier.fixed.toFixed(2)})`}
                value={`+ ${fmt(reverse.fee)}`}
                valueColor="text-red-500"
              />
              <div className="h-px bg-gray-200" />
              <ResultRow
                label="Charge the customer"
                value={fmt(reverse.chargeNeeded)}
                bold
                valueColor="text-blue-600"
              />
              <div className="text-xs text-gray-400 pt-1">
                Charge exactly{" "}
                <span className="font-semibold text-gray-700 font-mono">
                  {fmt(reverse.chargeNeeded)}
                </span>{" "}
                to land{" "}
                <span className="font-semibold text-gray-700 font-mono">
                  {fmt(amount)}
                </span>{" "}
                in your account.
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Monthly projection ── */}
      {mode === "forward" && forward && (
        <div className="border border-gray-200 rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Monthly fee projection (optional)
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              inputMode="numeric"
              value={monthlyTxCount}
              onChange={(e) =>
                setMonthlyTxCount(e.target.value.replace(/\D/g, ""))
              }
              placeholder="e.g. 50"
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-500">transactions per month</span>
          </div>

          {monthlyFee !== null && txCount > 0 && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <StatBox
                label="Monthly volume"
                value={fmt(amount * txCount)}
              />
              <StatBox
                label="Stripe fees/month"
                value={fmt(monthlyFee)}
                highlight
              />
              <StatBox
                label="Monthly net"
                value={fmt(forward.net * txCount)}
                positive
              />
            </div>
          )}
        </div>
      )}

      {/* ── How it's calculated (transparency = trust) ── */}
      <details className="text-sm text-gray-500">
        <summary className="cursor-pointer hover:text-gray-700 transition-colors font-medium">
          How is this calculated?
        </summary>
        <div className="mt-3 space-y-2 text-gray-500 leading-relaxed pl-2 border-l-2 border-gray-100">
          <p>
            Stripe&apos;s standard rate is{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
              2.9% + $0.30
            </code>{" "}
            per transaction.
          </p>
          <p>
            <strong>Forward:</strong> Fee = (amount × 0.029) + $0.30. Net = amount − fee.
          </p>
          <p>
            <strong>Reverse:</strong> To receive <em>N</em> after fees, charge{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
              (N + $0.30) / (1 − 0.029)
            </code>
            .
          </p>
          <p>
            Rates shown are Stripe&apos;s published US pricing as of 2024. International
            cards add +1% (3.9% + $0.30). Manually entered cards are 3.4% + $0.30.
            Stripe may charge additional fees for currency conversion, disputes, or Radar.
          </p>
        </div>
      </details>
    </div>
  );
}

// ── Small sub-components ─────────────────────────────────────────────────────

function ResultRow({
  label,
  value,
  bold = false,
  muted = false,
  valueColor = "text-gray-900",
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  valueColor?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span
        className={`text-sm ${
          muted ? "text-gray-400" : "text-gray-600"
        } ${bold ? "font-semibold" : ""}`}
      >
        {label}
      </span>
      <span
        className={`font-mono ${bold ? "text-lg font-bold" : "text-sm"} ${valueColor}`}
      >
        {value}
      </span>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight = false,
  positive = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-3 ${
        highlight
          ? "bg-red-50 border border-red-100"
          : positive
          ? "bg-green-50 border border-green-100"
          : "bg-gray-50 border border-gray-100"
      }`}
    >
      <div
        className={`text-lg font-bold font-mono ${
          highlight
            ? "text-red-600"
            : positive
            ? "text-green-600"
            : "text-gray-900"
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}
