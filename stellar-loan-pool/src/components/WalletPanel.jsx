// src/components/WalletPanel.jsx

import { useState } from 'react'

function truncate(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function Spinner() {
  return (
    <span className="inline-block h-3.5 w-3.5 animate-spin-slow rounded-full border-2 border-white/30 border-t-white" />
  )
}

export default function WalletPanel({
  publicKey, balance, balanceLoading, lenderCount = 0,
  onConnect, onDisconnect, onFund, funding, connecting,
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!publicKey) return
    await navigator.clipboard.writeText(publicKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  /* ── disconnected ─────────────────────────────────────────────────────────── */
  if (!publicKey) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-space-600/60 bg-space-800/80 px-5 py-4 shadow-card">
        <div className="flex items-center gap-3">
          {/* dim indicator */}
          <span className="h-2 w-2 rounded-full bg-space-500" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-mist/60">Wallet</p>
            <p className="mt-0.5 text-sm text-mist">Not connected</p>
          </div>
        </div>
        <button
          id="connect-wallet-btn"
          onClick={onConnect}
          disabled={connecting}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-glow-violet transition-all duration-200 hover:bg-violet-500 hover:shadow-glow-violet active:scale-95 disabled:cursor-not-allowed disabled:bg-space-600 disabled:text-mist/50 disabled:shadow-none"
        >
          {connecting ? <><Spinner /> Connecting…</> : 'Connect Freighter'}
        </button>
      </div>
    )
  }

  /* ── connected ────────────────────────────────────────────────────────────── */
  const balanceNum = Number(balance)
  const balanceLow = balanceNum < 10 && balanceNum > 0

  return (
    <div className="rounded-2xl border border-space-600/60 bg-space-800/80 px-5 py-4 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Left: status dot + address + balance */}
        <div className="flex items-center gap-3">
          {/* live pulse */}
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60 animate-pulseSlow" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-400" />
          </span>

          <div>
            {/* address + copy */}
            <button
              id="copy-address-btn"
              onClick={handleCopy}
              title="Copy full address"
              className="group flex items-center gap-1.5 font-mono text-sm font-medium text-white transition-colors hover:text-violet-300"
            >
              {truncate(publicKey)}
              <span className="text-mist/40 transition-colors group-hover:text-violet-400">
                {copied ? '✓' : '⧉'}
              </span>
              {copied && <span className="ml-1 text-xs font-normal text-teal-400">copied</span>}
            </button>

            {/* balance */}
            <p className="font-mono text-xs text-mist">
              {balanceLoading ? (
                <span className="inline-block w-20 h-3 rounded shimmer-bg" />
              ) : (
                <span className={balanceLow ? 'text-amber-400' : ''}>
                  {balanceNum.toLocaleString(undefined, { maximumFractionDigits: 7 })} XLM
                  {balanceLow && ' · low balance'}
                </span>
              )}
            </p>
          </div>

          {/* lender-count pill */}
          <div
            id="lender-count-pill"
            title="Lenders currently in pool"
            className="ml-1 hidden items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 sm:flex"
          >
            <svg className="h-3 w-3 text-violet-400 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H2zm10-6a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm2 5.5h1s1 0 1-1-1-3.5-4-3.5c-.65 0-1.22.1-1.72.26C11.7 10.2 12 11.2 12 12v1.5z"/>
            </svg>
            <span className="font-mono text-xs font-semibold text-violet-400">{lenderCount}</span>
            <span className="text-[11px] text-mist/60">{lenderCount === 1 ? 'lender' : 'lenders'}</span>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {balanceNum === 0 && !balanceLoading && (
            <button
              id="friendbot-fund-btn"
              onClick={onFund}
              disabled={funding}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-all hover:bg-amber-500/20 hover:text-amber-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {funding ? <><Spinner /> Funding…</> : '⚡ Fund via Friendbot'}
            </button>
          )}
          <button
            id="disconnect-wallet-btn"
            onClick={onDisconnect}
            className="rounded-lg border border-space-600 px-3 py-1.5 text-xs font-semibold text-mist transition-all hover:border-red-500/40 hover:bg-red-500/8 hover:text-red-400 active:scale-95"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  )
}
