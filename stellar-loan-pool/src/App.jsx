// src/App.jsx  —  Stellar Loan Pool dApp

import { useEffect, useState, useCallback } from 'react'
import WalletPanel   from './components/WalletPanel'
import PoolStatus    from './components/PoolStatus'
import LenderRow     from './components/LenderRow'
import BorrowerInput from './components/BorrowerInput'
import {
  connectWallet,
  disconnectWallet,
  fetchXlmBalance,
  fundWithFriendbot,
  buildLoanPoolTx,
  isValidStellarAddress,
} from './lib/stellar'

// ─── helpers ──────────────────────────────────────────────────────────────────

const emptyLender = () => ({ address: '', amount: '' })

function withShares(lenders) {
  const total = lenders.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)
  return lenders.map((l) => {
    const amt   = parseFloat(l.amount) || 0
    const share = total > 0 ? ((amt / total) * 100).toFixed(1) : '0.0'
    return { ...l, share }
  })
}

// ─── component ────────────────────────────────────────────────────────────────

export default function App() {
  // wallet
  const [publicKey,      setPublicKey]      = useState(null)
  const [connecting,     setConnecting]     = useState(false)
  const [connectError,   setConnectError]   = useState('')
  const [balance,        setBalance]        = useState('0')
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [funding,        setFunding]        = useState(false)

  // pool
  const [lenders,         setLenders]         = useState([emptyLender()])
  const [borrowerAddress, setBorrowerAddress] = useState('')
  const [sending,         setSending]         = useState(false)
  const [txResult,        setTxResult]        = useState(null)

  // derived
  const lendersWithShares = withShares(lenders)
  const poolTotal = lenders.reduce((s, l) => s + (parseFloat(l.amount) || 0), 0)
  const lendersValid = lenders.length > 0 && lenders.every(
    (l) => isValidStellarAddress(l.address) && parseFloat(l.amount) > 0
  )
  const borrowerValid = isValidStellarAddress(borrowerAddress)
  const canCreate = publicKey && lendersValid && borrowerValid && poolTotal > 0
    && poolTotal <= Number(balance) && !sending

  // ── wallet handlers ──────────────────────────────────────────────────────────
  const refreshBalance = useCallback(async (key) => {
    if (!key) return
    setBalanceLoading(true)
    try { setBalance(await fetchXlmBalance(key)) }
    catch (err) { console.error('Balance fetch failed:', err) }
    finally { setBalanceLoading(false) }
  }, [])

  useEffect(() => { if (publicKey) refreshBalance(publicKey) }, [publicKey, refreshBalance])

  const handleConnect = async () => {
    setConnecting(true); setConnectError('')
    try   { setPublicKey(await connectWallet()) }
    catch (err) { setConnectError(err.message || 'Failed to connect wallet.') }
    finally { setConnecting(false) }
  }

  const handleDisconnect = () => {
    disconnectWallet(); setPublicKey(null); setBalance('0'); setTxResult(null)
  }

  const handleFund = async () => {
    setFunding(true)
    try   { await fundWithFriendbot(publicKey); await refreshBalance(publicKey) }
    catch (err) { setConnectError(err.message || 'Friendbot funding failed.') }
    finally { setFunding(false) }
  }

  // ── lender CRUD ──────────────────────────────────────────────────────────────
  const addLender    = () => setLenders((p) => [...p, emptyLender()])
  const removeLender = (i) => setLenders((p) => p.filter((_, idx) => idx !== i))
  const updateLender = (i, field, val) =>
    setLenders((p) => p.map((l, idx) => idx === i ? { ...l, [field]: val } : l))

  // ── submit ───────────────────────────────────────────────────────────────────
  const handleCreatePool = async () => {
    setTxResult({ status: 'pending' }); setSending(true)
    try {
      const result = await buildLoanPoolTx(publicKey, lendersWithShares, borrowerAddress)
      setTxResult({ status: 'success', ...result })
      await refreshBalance(publicKey)
    } catch (err) {
      setTxResult({ status: 'error', message: err.message || 'Unknown error.' })
    } finally { setSending(false) }
  }

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-space-900 text-white selection:bg-violet-500/30">

      {/* ── Page shell ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="mb-8 animate-fadeSlideIn">
          <div className="mb-3 flex items-center gap-2">
            {/* Logo mark */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-teal-500 shadow-glow-violet">
              <svg viewBox="0 0 16 16" className="h-4 w-4 fill-white" aria-hidden="true">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM4.5 8.5l1.5-3 1.5 1.5L9 4l2.5 4.5H4.5Z"/>
              </svg>
            </div>
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-violet-400">
              Stellar · Testnet
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Loan{' '}
            <span className="bg-gradient-to-r from-violet-400 via-teal-400 to-stellarblue-400 bg-clip-text text-transparent">
              Pool
            </span>
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist">
            Multiple lenders contribute XLM to a shared pool. The borrower
            receives the full amount in one on-chain transaction.
          </p>
        </header>

        {/* ── Wallet panel ───────────────────────────────────────────────── */}
        <section className="mb-5 animate-fadeSlideIn" style={{ animationDelay: '60ms' }}>
          <WalletPanel
            publicKey={publicKey}
            balance={balance}
            balanceLoading={balanceLoading}
            lenderCount={lenders.length}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onFund={handleFund}
            funding={funding}
            connecting={connecting}
          />
          {connectError && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 animate-fadeSlideIn">
              <span className="mt-0.5 text-red-400" aria-hidden="true">⚠</span>
              <p className="font-mono text-xs text-red-400">{connectError}</p>
            </div>
          )}
        </section>

        {/* ── Pool status dashboard ──────────────────────────────────────── */}
        <section className="mb-5 animate-fadeSlideIn" style={{ animationDelay: '120ms' }}>
          <PoolStatus
            poolTotal={poolTotal}
            lenderCount={lenders.length}
            borrower={borrowerAddress}
            txStatus={txResult?.status ?? 'idle'}
            balance={Number(balance)}
          />
        </section>

        {/* ── Lenders panel ──────────────────────────────────────────────── */}
        <section
          className="mb-4 rounded-2xl border border-space-600/60 bg-space-800/80 p-5 shadow-card sm:p-6 animate-fadeSlideIn"
          style={{ animationDelay: '180ms' }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-sm">
                🏦
              </span>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-mist-light">
                Lenders
              </h2>
              <span className="rounded-full bg-violet-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-violet-400">
                {lenders.length}
              </span>
            </div>
            <span className="font-mono text-xs text-mist">
              Pool&nbsp;
              <span className="font-semibold text-teal-400">{poolTotal.toFixed(2)} XLM</span>
            </span>
          </div>

          {/* Lender rows */}
          <div className="space-y-3">
            {lendersWithShares.map((lender, i) => (
              <LenderRow
                key={i}
                index={i}
                lender={lender}
                removable={lenders.length > 1}
                onAddressChange={(v) => updateLender(i, 'address', v)}
                onAmountChange={(v)  => updateLender(i, 'amount',  v)}
                onRemove={() => removeLender(i)}
              />
            ))}
          </div>

          {/* Add lender */}
          <button
            id="add-lender-btn"
            onClick={addLender}
            className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-space-500 py-2.5 text-xs font-semibold text-mist transition-all duration-200 hover:border-violet-500/60 hover:bg-violet-500/5 hover:text-violet-400 active:scale-[0.98]"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] leading-none transition-transform duration-200 group-hover:rotate-90">
              +
            </span>
            Add lender
          </button>
        </section>

        {/* ── Borrower input ─────────────────────────────────────────────── */}
        <div className="mb-4 animate-fadeSlideIn" style={{ animationDelay: '240ms' }}>
          <BorrowerInput
            value={borrowerAddress}
            onChange={setBorrowerAddress}
            onClear={() => setBorrowerAddress('')}
          />
        </div>

        {/* ── Submit button ──────────────────────────────────────────────── */}
        <section className="animate-fadeSlideIn" style={{ animationDelay: '300ms' }}>
          <button
            id="create-loan-pool-btn"
            onClick={handleCreatePool}
            disabled={!canCreate}
            className={`
              group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold tracking-wide
              transition-all duration-200 active:scale-[0.98]
              ${canCreate
                ? 'bg-gradient-to-r from-violet-600 to-teal-600 text-white shadow-glow-violet hover:from-violet-500 hover:to-teal-500 hover:shadow-glow-teal'
                : 'cursor-not-allowed bg-space-700 text-mist/50'
              }
            `}
          >
            {/* shimmer sweep on hover */}
            {canCreate && (
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            )}

            <span className="relative flex items-center justify-center gap-2">
              {sending ? (
                <>
                  <Spinner size={4} />
                  Submitting to Stellar…
                </>
              ) : !publicKey ? (
                'Connect wallet to create pool'
              ) : !borrowerValid ? (
                'Enter a valid borrower address'
              ) : !lendersValid ? (
                'Fill in all lender fields'
              ) : poolTotal > Number(balance) ? (
                'Insufficient balance'
              ) : (
                <>
                  <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM5 8.5l2 2 4-4-.7-.7L7 9.1 5.7 7.8 5 8.5Z"/>
                  </svg>
                  Create Loan Pool · {poolTotal.toFixed(2)} XLM
                </>
              )}
            </span>
          </button>

          {poolTotal > Number(balance) && publicKey && (
            <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/8 px-3 py-2 animate-fadeSlideIn">
              <span className="text-xs text-red-400" aria-hidden="true">⚠</span>
              <p className="text-xs text-red-400">
                Pool total <span className="font-semibold">{poolTotal.toFixed(2)} XLM</span> exceeds your balance of{' '}
                <span className="font-semibold">{Number(balance).toFixed(2)} XLM</span>.
              </p>
            </div>
          )}
        </section>

        {/* ── Transaction result ────────────────────────────────────────── */}
        {txResult && (
          <section className="mt-5 animate-scalePop">
            <LoanPoolTxResult result={txResult} />
          </section>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="mt-14 flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-1.5 font-mono text-xs text-mist/50">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500/60 animate-pulseSlow" />
            Stellar Testnet · Requires Freighter wallet extension
          </div>
        </footer>

      </div>
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ size = 4 }) {
  return (
    <span
      className={`inline-block h-${size} w-${size} animate-spin-slow rounded-full border-2 border-white/30 border-t-white`}
      role="status"
      aria-label="Loading"
    />
  )
}

// ─── Transaction result card ──────────────────────────────────────────────────

function LoanPoolTxResult({ result }) {
  if (result.status === 'pending') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-violet-500/30 bg-violet-500/8 px-4 py-4">
        <Spinner size={5} />
        <div>
          <p className="text-sm font-semibold text-violet-300">Signing &amp; broadcasting…</p>
          <p className="mt-0.5 text-xs text-mist">Freighter will ask you to approve the transaction</p>
        </div>
      </div>
    )
  }

  if (result.status === 'error') {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/8 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">✕</span>
          <p className="font-semibold text-red-400">Transaction failed</p>
        </div>
        <p className="mt-2 break-words rounded-lg bg-red-500/10 px-3 py-2 font-mono text-xs text-red-300/90">
          {result.message}
        </p>
      </div>
    )
  }

  if (result.status === 'success') {
    const { hash, poolTotal, lenders = [], borrower } = result
    return (
      <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-teal-500/8 to-violet-500/5 px-5 py-5">

        {/* success header */}
        <div className="flex items-center gap-2 text-teal-400">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/20 text-base">✓</span>
          <p className="font-semibold">
            Loan disbursed · <span className="font-mono">{poolTotal?.toFixed(2) ?? '—'} XLM</span> sent
          </p>
        </div>

        {/* lender breakdown */}
        {lenders.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 font-mono text-xs uppercase tracking-wider text-mist">Lender breakdown</p>
            <div className="space-y-1.5">
              {lenders.map((l, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-space-700/60 px-3 py-1.5">
                  <span className="font-mono text-xs text-mist">{l.address.slice(0,6)}…{l.address.slice(-4)}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-white">{parseFloat(l.amount).toFixed(2)} XLM</span>
                    <span className="rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-[10px] text-violet-400">{l.share}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* borrower */}
        <div className="mt-4">
          <p className="font-mono text-xs uppercase tracking-wider text-mist">Borrower</p>
          <p className="mt-1 break-all font-mono text-xs text-white">{borrower}</p>
        </div>

        {/* tx hash */}
        <div className="mt-3">
          <p className="font-mono text-xs uppercase tracking-wider text-mist">Transaction hash</p>
          <p className="mt-1 break-all font-mono text-xs text-mist-light">{hash}</p>
        </div>

        <a
          href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-400 transition-colors hover:bg-teal-500/20 hover:text-teal-300"
        >
          View on Stellar Expert
          <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current" aria-hidden="true">
            <path d="M3.5 1H1v10h10V8.5h-1V10H2V2h1.5V1ZM6 1v1h3.29L4.65 6.65l.7.7L10 2.71V6h1V1H6Z"/>
          </svg>
        </a>
      </div>
    )
  }

  return null
}
