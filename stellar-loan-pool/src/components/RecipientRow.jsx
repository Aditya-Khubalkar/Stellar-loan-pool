// src/components/RecipientRow.jsx
import { isValidStellarAddress } from '../lib/stellar'

export default function RecipientRow({ index, recipient, onChange, onRemove, removable }) {
  const addressTouched = recipient.address.length > 0
  const addressValid = isValidStellarAddress(recipient.address)

  return (
    <div className="flex items-center gap-2">
      <span className="w-5 flex-shrink-0 font-mono text-xs text-mist">{index + 1}</span>
      <input
        value={recipient.address}
        onChange={(e) => onChange({ ...recipient, address: e.target.value })}
        placeholder="G… recipient address"
        className={`min-w-0 flex-1 rounded-lg border bg-space-900 px-3 py-2 font-mono text-xs text-white placeholder:text-mist/50 focus:outline-none focus:ring-2 ${
          addressTouched && !addressValid
            ? 'border-red-500/60 focus:ring-red-500/40'
            : 'border-space-600 focus:ring-stellarblue-500/50'
        }`}
      />
      <input
        value={recipient.amount}
        onChange={(e) => onChange({ ...recipient, amount: e.target.value })}
        placeholder="0.00"
        inputMode="decimal"
        className="w-24 flex-shrink-0 rounded-lg border border-space-600 bg-space-900 px-3 py-2 text-right font-mono text-xs text-white placeholder:text-mist/50 focus:outline-none focus:ring-2 focus:ring-stellarblue-500/50"
      />
      <span className="w-8 flex-shrink-0 font-mono text-xs text-mist">XLM</span>
      <button
        onClick={onRemove}
        disabled={!removable}
        title="Remove recipient"
        className="flex-shrink-0 rounded-lg px-2 py-1 text-mist transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
      >
        ✕
      </button>
    </div>
  )
}
