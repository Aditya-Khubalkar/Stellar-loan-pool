// src/components/LenderRow.jsx

import { isValidStellarAddress } from '../lib/stellar'

export default function LenderRow({ index, lender, removable, onAddressChange, onAmountChange, onRemove }) {
  const addrTyped = lender.address.length > 0
  const addrValid = isValidStellarAddress(lender.address)
  const amtNum    = parseFloat(lender.amount)
  const amtValid  = !isNaN(amtNum) && amtNum > 0
  const share     = lender.share ?? '0.0'
  const shareNum  = parseFloat(share)

  const addrBorder = addrTyped
    ? addrValid
      ? 'border-teal-500/50 focus:border-teal-400'
      : 'border-red-500/50  focus:border-red-400'
    : 'border-space-600 focus:border-violet-500/70'

  const amtBorder = lender.amount !== '' && !amtValid
    ? 'border-red-500/50 focus:border-red-400'
    : 'border-space-600 focus:border-violet-500/70'

  return (
    <div
      id={`lender-row-${index}`}
      className="group flex flex-col gap-2.5 rounded-xl border border-space-600/60 bg-space-750/50 p-3 shadow-sm transition-all duration-200 hover:border-space-500 hover:shadow-card sm:flex-row sm:items-center animate-fadeSlideIn"
    >
      {/* ── Index badge ───────────────────────────────────────────────────── */}
      <span
        aria-label={`Lender ${index + 1}`}
        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/15 font-mono text-xs font-bold text-violet-400 select-none"
      >
        {index + 1}
      </span>

      {/* ── Address field ─────────────────────────────────────────────────── */}
      <div className="relative min-w-0 flex-1">
        <input
          id={`lender-address-${index}`}
          type="text"
          value={lender.address}
          onChange={(e) => onAddressChange(e.target.value.trim())}
          placeholder="G… lender address"
          autoComplete="off"
          spellCheck={false}
          className={`w-full rounded-lg border bg-space-800 px-3 py-2 pr-7 font-mono text-xs text-white outline-none transition-colors duration-150 placeholder:text-mist/30 ${addrBorder}`}
        />
        {addrTyped && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold ${
              addrValid ? 'text-teal-400' : 'text-red-400'
            }`}
          >
            {addrValid ? '✓' : '✕'}
          </span>
        )}
      </div>

      {/* ── Amount field ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <input
          id={`lender-amount-${index}`}
          type="number"
          min="0"
          step="0.0001"
          value={lender.amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          className={`w-24 rounded-lg border bg-space-800 px-3 py-2 font-mono text-xs text-white outline-none transition-colors duration-150 placeholder:text-mist/30 ${amtBorder}`}
        />
        <span className="font-mono text-xs text-mist/50 select-none">XLM</span>
      </div>

      {/* ── Share badge ───────────────────────────────────────────────────── */}
      <div
        id={`lender-share-${index}`}
        title={`Lender ${index + 1}'s share of the pool`}
        className={`flex min-w-[4rem] flex-col items-center justify-center rounded-lg px-2.5 py-1.5 transition-all duration-300 ${
          shareNum > 0
            ? 'bg-gradient-to-b from-violet-500/20 to-violet-600/10 border border-violet-500/20'
            : 'bg-space-700/50 border border-space-600/40'
        }`}
      >
        <span className={`font-mono text-sm font-bold leading-none ${shareNum > 0 ? 'text-violet-300' : 'text-mist/30'}`}>
          {share}%
        </span>
        <span className="mt-0.5 text-[10px] uppercase tracking-wide text-mist/40 select-none">share</span>
      </div>

      {/* ── Delete button ─────────────────────────────────────────────────── */}
      {removable ? (
        <button
          id={`remove-lender-${index}`}
          onClick={onRemove}
          title={`Remove lender ${index + 1}`}
          aria-label={`Remove lender ${index + 1}`}
          className="flex-shrink-0 rounded-lg border border-transparent px-2.5 py-2 text-xs text-mist/30 transition-all duration-150 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 active:scale-90 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
        >
          ✕
        </button>
      ) : (
        <span className="w-9 flex-shrink-0 sm:block hidden" aria-hidden="true" />
      )}
    </div>
  )
}
