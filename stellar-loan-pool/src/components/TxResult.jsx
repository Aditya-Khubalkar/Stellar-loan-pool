// src/components/TxResult.jsx

export default function TxResult({ result }) {
  if (!result) return null

  if (result.status === 'pending') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-stellarblue-500/40 bg-stellarblue-500/10 px-4 py-3">
        <span className="h-3 w-3 flex-shrink-0 animate-spin rounded-full border-2 border-stellarblue-400 border-t-transparent" />
        <p className="text-sm text-stellarblue-400">Submitting split payment to the network…</p>
      </div>
    )
  }

  if (result.status === 'error') {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3">
        <p className="text-sm font-semibold text-red-400">Transaction failed</p>
        <p className="mt-1 break-words font-mono text-xs text-red-300/90">{result.message}</p>
      </div>
    )
  }

  if (result.status === 'success') {
    return (
      <div className="rounded-xl border border-flare-500/50 bg-flare-500/10 px-4 py-3">
        <p className="text-sm font-semibold text-flare-400">Split payment confirmed ✅</p>
        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-mist">Transaction hash</p>
        <p className="mt-1 break-all font-mono text-xs text-white">{result.hash}</p>
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-stellarblue-400 hover:text-stellarblue-300"
        >
          View on Stellar Expert →
        </a>
      </div>
    )
  }

  return null
}
