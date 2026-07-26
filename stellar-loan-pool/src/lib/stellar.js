// src/lib/stellar.js
//
// All wallet + network logic lives here, separate from UI components.
// Network: Stellar TESTNET only.
//
// Exports
// ───────
//   checkFreighterInstalled()  — is the extension present?
//   connectWallet()            — request access + return public key
//   disconnectWallet()         — clear local state (no Freighter API)
//   fetchXlmBalance(key)       — XLM balance from Horizon
//   fundWithFriendbot(key)     — testnet-only faucet
//   sendSplitPayment(key, [])  — legacy multi-recipient payment
//   isValidStellarAddress(str) — regex validity check
//   buildLoanPoolTx(key, [], borrower) — ★ Loan Pool disbursement

import {
  isConnected,
  setAllowed,
  getAddress,
  signTransaction,
} from '@stellar/freighter-api'
import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  Memo,
} from '@stellar/stellar-sdk'

export const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org'
export const FRIENDBOT_URL = 'https://friendbot.stellar.org'

const server = new Horizon.Server(HORIZON_TESTNET_URL)

/**
 * Checks whether the Freighter browser extension is installed at all.
 */
export async function checkFreighterInstalled() {
  const result = await isConnected()
  // freighter-api returns { isConnected: boolean, error? }
  return !result.error && result.isConnected !== undefined
}

/**
 * Connects to Freighter: requests permission if not already granted,
 * then returns the active public key (address).
 */
export async function connectWallet() {
  const installed = await checkFreighterInstalled()
  if (!installed) {
    throw new Error(
      'Freighter wallet not found. Install the Freighter browser extension and refresh the page.'
    )
  }

  const access = await setAllowed()
  if (access.error) throw new Error(access.error)
  if (!access.isAllowed) {
    throw new Error('Permission to connect was denied in Freighter.')
  }

  const addressResult = await getAddress()
  if (addressResult.error) throw new Error(addressResult.error)

  return addressResult.address
}

/**
 * "Disconnect" — Freighter has no app-side disconnect API (the user
 * controls site access from inside the extension), so we just clear
 * local app state. This function exists for symmetry / clarity in the UI.
 */
export function disconnectWallet() {
  return true
}

/**
 * Fetches the XLM balance for a given public key on testnet.
 * Returns "0" (as a string) for unfunded accounts instead of throwing,
 * so the UI can prompt the user to fund via Friendbot.
 */
export async function fetchXlmBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey)
    const native = account.balances.find((b) => b.asset_type === 'native')
    return native ? native.balance : '0'
  } catch (err) {
    if (err?.response?.status === 404) {
      // Account exists on no ledger yet = unfunded testnet account.
      return '0'
    }
    throw err
  }
}

/**
 * Funds a brand-new testnet account using Friendbot.
 * Only works on TESTNET and only for accounts that don't exist yet.
 */
export async function fundWithFriendbot(publicKey) {
  const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Friendbot funding failed: ${body || res.statusText}`)
  }
  return res.json()
}

/**
 * Builds, signs (via Freighter), and submits a transaction that pays out
 * XLM to multiple recipients in a single ledger transaction.
 *
 * @param {string} senderPublicKey
 * @param {Array<{address: string, amount: string}>} recipients
 * @returns {Promise<{hash: string, ledger: number}>}
 */
export async function sendSplitPayment(senderPublicKey, recipients) {
  if (!recipients.length) throw new Error('Add at least one recipient.')

  const sourceAccount = await server.loadAccount(senderPublicKey)

  const txBuilder = new TransactionBuilder(sourceAccount, {
    fee: String(BASE_FEE * recipients.length),
    networkPassphrase: Networks.TESTNET,
  })

  for (const { address, amount } of recipients) {
    txBuilder.addOperation(
      Operation.payment({
        destination: address,
        asset: Asset.native(),
        amount: String(amount),
      })
    )
  }

  const transaction = txBuilder.setTimeout(60).build()
  const xdr = transaction.toXDR()

  const signResult = await signTransaction(xdr, {
    networkPassphrase: Networks.TESTNET,
  })
  if (signResult.error) throw new Error(signResult.error)

  const signedTx = TransactionBuilder.fromXDR(signResult.signedTxXdr, Networks.TESTNET)
  const submitResult = await server.submitTransaction(signedTx)

  return { hash: submitResult.hash, ledger: submitResult.ledger }
}

/**
 * Quick validity check for a Stellar public key (G... address), used for
 * inline form validation before attempting a transaction.
 */
export function isValidStellarAddress(address) {
  return typeof address === 'string' && /^G[A-Z0-9]{55}$/.test(address.trim())
}

// ─────────────────────────────────────────────────────────────────────────────
// Loan Pool
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildLoanPoolTx()
 *
 * WHAT IT DOES
 * ────────────
 * Builds, signs, and submits a Stellar transaction that disburses an entire
 * loan pool to a single borrower.
 *
 * ARCHITECTURE (Level 1 — single-sender model)
 * ─────────────────────────────────────────────
 * In this version, ONE connected wallet (the "pool operator") holds the
 * pooled XLM and sends the full total to the borrower in a SINGLE payment
 * operation.  Lender contributions are tracked off-chain in React state
 * (address + amount + share %) and recorded in the transaction memo so the
 * data is permanently anchored on-chain.
 *
 *   Lender A ─┐
 *   Lender B ─┤  (off-chain accounting)  Pool Operator ──► Borrower
 *   Lender C ─┘                            (1 tx, 1 op)
 *
 * WHY NOT one-op-per-lender?
 *   Each Stellar operation requires the SOURCE account to sign. In a true
 *   multi-sig pool each lender would need to co-sign before the transaction
 *   is submitted (requires a threshold multi-sig account or a smart contract).
 *   That is Level 2+.  For Level 1 we model the pool as a single operator
 *   sending the aggregated amount.
 *
 * PARAMETERS
 * ──────────
 * @param {string}   senderPublicKey   — The connected wallet (pool operator)
 * @param {Array<{
 *   address: string,   — Lender's Stellar address (stored in memo, not used on-chain)
 *   amount:  string,   — Lender's contribution in XLM
 *   share:   string,   — Lender's share % (display only, stored in memo)
 * }>} lenders          — Array of lender objects from React state
 * @param {string}   borrowerAddress   — Destination: the borrower's public key
 *
 * RETURN VALUE
 * ────────────
 * @returns {Promise<{
 *   hash:         string,   — Transaction hash (use to link to Stellar Expert)
 *   ledger:       number,   — Ledger number the tx was included in
 *   poolTotal:    number,   — Total XLM disbursed (sum of all lender amounts)
 *   lenderCount:  number,   — How many lenders were in the pool
 *   lenders:      Array,    — The lenders array (for UI confirmation display)
 *   borrower:     string,   — The borrower address (echoed for confirmation)
 * }>}
 *
 * ERRORS
 * ──────
 * Throws a plain Error with a human-readable message for:
 *   - No lenders in the pool
 *   - Invalid borrower address
 *   - Pool total is zero or negative
 *   - Any Freighter signing error
 *   - Any Horizon submission error (includes result_codes in the message)
 */
export async function buildLoanPoolTx(senderPublicKey, lenders, borrowerAddress) {
  // ── 1. Input validation ────────────────────────────────────────────────────
  if (!Array.isArray(lenders) || lenders.length === 0) {
    throw new Error('Loan pool must have at least one lender.')
  }

  if (!isValidStellarAddress(borrowerAddress)) {
    throw new Error('Borrower address is not a valid Stellar public key.')
  }

  if (!isValidStellarAddress(senderPublicKey)) {
    throw new Error('Sender public key is invalid. Please reconnect your wallet.')
  }

  // ── 2. Compute pool total ──────────────────────────────────────────────────
  // Sum all lender amounts, converting each to a float so non-numeric entries
  // contribute 0 instead of NaN.
  const poolTotal = lenders.reduce((sum, l) => {
    const amt = parseFloat(l.amount)
    return sum + (isNaN(amt) ? 0 : amt)
  }, 0)

  if (poolTotal <= 0) {
    throw new Error('Pool total must be greater than 0 XLM.')
  }

  // Stellar requires amounts as strings with up to 7 decimal places.
  // toFixed(7) covers the full stroop precision without scientific notation.
  const disbursementAmount = poolTotal.toFixed(7)

  // ── 3. Build a memo summarising lender contributions ──────────────────────
  // Stellar TEXT memos are limited to 28 bytes.
  // We store a compact summary: "Pool:<count>L/<total>XLM"
  // e.g. "Pool:3L/500.0000000XLM" — anchors the pool snapshot on-chain.
  const memoText = `Pool:${lenders.length}L/${disbursementAmount}XLM`
  // Truncate to 28 bytes if the total XLM is very large (safety net).
  const safeMemo = memoText.slice(0, 28)

  // ── 4. Fetch the sender's account (for sequence number) ───────────────────
  // server.loadAccount() returns a Stellar AccountResponse which contains the
  // current sequence number. TransactionBuilder increments it automatically.
  let sourceAccount
  try {
    sourceAccount = await server.loadAccount(senderPublicKey)
  } catch (err) {
    if (err?.response?.status === 404) {
      throw new Error(
        'Sender account not found on testnet. Fund it via Friendbot first.'
      )
    }
    throw new Error(`Failed to load sender account: ${err.message}`)
  }

  // ── 5. Build the transaction ───────────────────────────────────────────────
  // Fee: BASE_FEE (100 stroops) × 1 operation.
  // A single-operation tx is the cheapest possible; this is intentional
  // for the Level 1 single-sender model.
  const txBuilder = new TransactionBuilder(sourceAccount, {
    fee: String(BASE_FEE),                  // 100 stroops = 0.00001 XLM
    networkPassphrase: Networks.TESTNET,
  })

  // Single payment operation: pool operator → borrower for the full pool total.
  txBuilder.addOperation(
    Operation.payment({
      destination: borrowerAddress,
      asset: Asset.native(),                // XLM (native Stellar asset)
      amount: disbursementAmount,
    })
  )

  // Attach the memo so the pool snapshot is stored on the Stellar ledger.
  txBuilder.addMemo(Memo.text(safeMemo))

  // 60-second window: if the user takes longer than 60 s in Freighter,
  // the transaction will be rejected by validators (prevents stuck txs).
  const transaction = txBuilder.setTimeout(60).build()

  // ── 6. Sign via Freighter ──────────────────────────────────────────────────
  // toXDR() serialises the unsigned transaction to base64 XDR, which is the
  // format Freighter expects.  Freighter shows the user a human-readable
  // preview (destination, amount, memo) before they approve.
  const xdr = transaction.toXDR()

  let signResult
  try {
    signResult = await signTransaction(xdr, {
      networkPassphrase: Networks.TESTNET,
    })
  } catch (err) {
    throw new Error(`Freighter signing failed: ${err.message}`)
  }

  if (signResult.error) {
    throw new Error(`Freighter rejected the transaction: ${signResult.error}`)
  }

  // ── 7. Submit to Horizon ───────────────────────────────────────────────────
  // fromXDR() deserialises the signed XDR back into a Transaction object,
  // which is what server.submitTransaction() expects.
  const signedTx = TransactionBuilder.fromXDR(
    signResult.signedTxXdr,
    Networks.TESTNET
  )

  let submitResult
  try {
    submitResult = await server.submitTransaction(signedTx)
  } catch (err) {
    // Horizon wraps transaction failures in an AxiosError with a nested
    // extras.result_codes object.  We surface the clearest message available.
    const codes   = err?.response?.data?.extras?.result_codes
    const opCodes = codes?.operations?.join(', ')
    const txCode  = codes?.transaction

    const detail =
      opCodes  ? `Operation error(s): ${opCodes}` :
      txCode   ? `Transaction error: ${txCode}`   :
      err.message

    throw new Error(`Horizon submission failed — ${detail}`)
  }

  // ── 8. Return a rich result object ────────────────────────────────────────
  // The caller (App.jsx handleCreatePool) can use this to update the UI
  // without needing to re-derive these values from state.
  return {
    hash:        submitResult.hash,
    ledger:      submitResult.ledger,
    poolTotal,                          // number  — total XLM disbursed
    lenderCount: lenders.length,        // number  — for display
    lenders,                            // array   — for the success card breakdown
    borrower:    borrowerAddress,       // string  — echoed for confirmation
  }
}
