// src/components/BorrowerInput.jsx

import { isValidStellarAddress } from '../lib/stellar'

export default function BorrowerInput({ value, onChange, onClear }) {
  const typed    = value.length > 0
  const isValid  = isValidStellarAddress(value)

  const borderClass = typed
    ? isValid
      ? 'border-teal-500/50  focus:border-teal-400'
      : 'border-red-500/50   focus:border-red-400'
    : 'border-space-600     focus:border-violet-500/70'

  const statusColour = typed
    ? isValid ? 'text-teal-400' : 'text-red-400'
    : 'text-mist/40'

  const dotColour = typed
    ? isValid ? 'bg-teal-400' : 'bg-red-400'
    : 'bg-space-600'

  const statusLabel = typed
    ? isValid
      ? 'Valid Stellar address'
      : 'Invalid — must start with G and be 56 characters'
    : "Enter the borrower's Stellar public key"

  return (
    <section
      id="borrower-input-card"
      aria-label="Borrower address"
      className="rounded-2xl border border-space-600/60 bg-space-800/80 p-5 shadow-card sm:p-6"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15 text-sm">
            🎯
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-mist-light">
            Borrower
          </h2>
        </div>

        {typed && (
          <button
            id="clear-borrower-btn"
            onClick={onClear}
            title="Clear borrower address"
            aria-label="Clear borrower address"
            className="rounded-lg border border-space-600 px-2.5 py-1 text-xs font-semibold text-mist transition-all hover:border-red-500/40 hover:bg-red-500/8 hover:text-red-400 active:scale-95"
          >
            Clear
          </button>
        )}
      </div>

      {/* Label */}
      <label htmlFor="borrower-address" className="mb-1.5 block text-xs font-medium text-mist">
        Borrower Stellar Address
      </label>

      {/* Input */}
      <div className="relative">
        <input
          id="borrower-address"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.trim())}
          placeholder="G… (56-character Stellar public key)"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="borrower-status"
          className={`w-full rounded-xl border bg-space-750 px-4 py-3 pr-9 font-mono text-xs text-white outline-none transition-colors duration-150 placeholder:text-mist/25 ${borderClass}`}
        />
        {typed && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${statusColour}`}
          >
            {isValid ? '✓' : '✕'}
          </span>
        )}
      </div>

      {/* Status line */}
      <p
        id="borrower-status"
        role="status"
        aria-live="polite"
        className={`mt-2 flex items-center gap-1.5 text-xs transition-colors duration-200 ${statusColour}`}
      >
        <span aria-hidden="true" className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${dotColour} transition-colors duration-200`} />
        {statusLabel}
      </p>

      {/* Confirmed address preview */}
      {isValid && (
        <div className="mt-3 rounded-xl border border-teal-500/25 bg-teal-500/5 px-4 py-3 animate-fadeSlideIn">
          <p className="font-mono text-[10px] uppercase tracking-widest text-teal-400/60">Confirmed destination</p>
          <p className="mt-1 break-all font-mono text-xs text-white/90">{value}</p>
        </div>
      )}
    </section>
  )
}
