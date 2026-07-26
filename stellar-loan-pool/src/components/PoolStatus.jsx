// src/components/PoolStatus.jsx
//
// Dashboard-style summary card shown prominently above the lender inputs.
// Includes a "pool fill" bar and animated flow-dots when the pool is ready.

import { isValidStellarAddress } from '../lib/stellar'

export default function PoolStatus({ poolTotal = 0, lenderCount = 0, borrower = '', txStatus = 'idle', balance = 0 }) {
  const borrowerValid = isValidStellarAddress(borrower)
  const status = deriveStatus(poolTotal, lenderCount, borrowerValid, txStatus)
  const fillPct = Math.min((poolTotal / Math.max(balance, poolTotal, 1)) * 100, 100)

  return (
    <section
      id="pool-status-card"
      aria-label="Loan pool status"
      className="relative overflow-hidden rounded-2xl border border-space-600/60 bg-space-800/80 shadow-card"
    >
      {/* Subtle gradient tint based on status */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
        status === 'ready' || status === 'sent'
          ? 'opacity-100'
          : 'opacity-0'
        } bg-gradient-to-br from-violet-500/5 via-transparent to-teal-500/5`}
      />

      <div className="relative px-5 py-5 sm:px-6">

        {/* ── Header row ─────────────────────────────────────────────────── */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-teal-500/20 text-sm">
              📊
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-mist-light">
              Pool Status
            </h2>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* ── Metric grid ────────────────────────────────────────────────── */}
        <div className="mb-5 grid grid-cols-2 gap-3">

          {/* Pool Total */}
          <div className="flex flex-col justify-between rounded-xl border border-space-600/60 bg-space-750/60 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-mist/70">Pool Total</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span
                id="pool-total-amount"
                className={`font-mono text-2xl font-bold leading-none transition-colors duration-300 ${
                  poolTotal > 0 ? 'text-teal-400' : 'text-space-500'
                }`}
              >
                {poolTotal.toFixed(2)}
              </span>
              <span className="font-mono text-sm text-mist/60">XLM</span>
            </div>
          </div>

          {/* Lender count */}
          <div className="flex flex-col justify-between rounded-xl border border-space-600/60 bg-space-750/60 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-mist/70">Lenders</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span
                id="pool-lender-count"
                className={`font-mono text-2xl font-bold leading-none transition-colors duration-300 ${
                  lenderCount > 0 ? 'text-violet-400' : 'text-space-500'
                }`}
              >
                {lenderCount}
              </span>
              <span className="font-mono text-sm text-mist/60">{lenderCount === 1 ? 'lender' : 'lenders'}</span>
            </div>
          </div>
        </div>

        {/* ── Pool fill bar with flow animation ─────────────────────────── */}
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-widest text-mist/60">Pool fill</p>
            {balance > 0 && (
              <p className="font-mono text-[11px] text-mist/60">
                {fillPct.toFixed(0)}% of wallet balance
              </p>
            )}
          </div>

          {/* Track */}
          <div className="relative h-2 overflow-hidden rounded-full bg-space-700">
            {/* Fill bar */}
            <div
              id="pool-progress-bar"
              role="progressbar"
              aria-valuenow={Math.round(fillPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                status === 'sent'    ? 'bg-gradient-to-r from-teal-500 to-teal-400' :
                status === 'ready'   ? 'bg-gradient-to-r from-violet-500 to-teal-500' :
                status === 'partial' ? 'bg-gradient-to-r from-violet-600 to-violet-400' :
                status === 'error'   ? 'bg-red-500' :
                'bg-space-600'
              }`}
              style={{ width: `${fillPct || (status === 'empty' ? 0 : 4)}%` }}
            />
            {/* Flow dots when ready */}
            {(status === 'ready' || status === 'sent') && (
              <>
                <span className="absolute top-0 left-[30%] h-full w-1.5 bg-white/30 rounded-full animate-flowDot" style={{ animationDelay: '0s' }} />
                <span className="absolute top-0 left-[30%] h-full w-1.5 bg-white/20 rounded-full animate-flowDot" style={{ animationDelay: '0.6s' }} />
                <span className="absolute top-0 left-[30%] h-full w-1.5 bg-white/15 rounded-full animate-flowDot" style={{ animationDelay: '1.2s' }} />
              </>
            )}
          </div>
        </div>

        {/* ── Borrower address ───────────────────────────────────────────── */}
        <div className={`rounded-xl border px-4 py-3 transition-colors duration-300 ${
          borrowerValid
            ? 'border-teal-500/30 bg-teal-500/5'
            : 'border-space-600/60 bg-space-750/40'
        }`}>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-mist/70">Borrower</p>
          {borrower ? (
            borrowerValid ? (
              <p id="pool-borrower-address" className="break-all font-mono text-xs text-white">
                {borrower}
              </p>
            ) : (
              <p className="font-mono text-xs text-amber-400">⚠ Invalid Stellar address</p>
            )
          ) : (
            <p className="font-mono text-xs italic text-mist/40">Not set</p>
          )}
        </div>

      </div>
    </section>
  )
}

/* ── Status badge ──────────────────────────────────────────────────────────── */

function StatusBadge({ status }) {
  const map = {
    empty:   { cls: 'border-space-500     bg-space-700      text-mist/60',           label: '○ Empty' },
    partial: { cls: 'border-violet-500/40 bg-violet-500/10  text-violet-400',         label: '◑ Building' },
    ready:   { cls: 'border-teal-500/40   bg-teal-500/10    text-teal-400',           label: '✦ Ready' },
    sent:    { cls: 'border-teal-400/50   bg-teal-400/10    text-teal-300',           label: '✓ Sent' },
    error:   { cls: 'border-red-500/40    bg-red-500/10     text-red-400',            label: '✕ Failed' },
  }
  const { cls, label } = map[status] ?? map.empty

  return (
    <span
      id="pool-status-badge"
      className={`rounded-full border px-3 py-0.5 font-mono text-xs font-semibold transition-all duration-300 ${cls}`}
    >
      {label}
    </span>
  )
}

/* ── Status derivation ─────────────────────────────────────────────────────── */

function deriveStatus(poolTotal, lenderCount, borrowerValid, txStatus) {
  if (txStatus === 'success') return 'sent'
  if (txStatus === 'error')   return 'error'
  if (txStatus === 'pending') return 'partial'
  if (lenderCount === 0 || poolTotal === 0) return 'empty'
  if (!borrowerValid) return 'partial'
  return 'ready'
}
