# Stellar Loan Pool 🪐

A testnet dApp where multiple lenders pool XLM together and send it in one
transaction to a single borrower — like a mini community loan, settled
on-chain in one shot.

Built for **Level 1 — White Belt** of Stellar Journey to Mastery.

![status](https://img.shields.io/badge/network-Stellar%20Testnet-4F9DFF)
![status](https://img.shields.io/badge/wallet-Freighter-FFB100)

---

## ✨ What it does

- Connects to the **Freighter** wallet (Stellar Testnet only)
- Fetches and displays the connected wallet's **XLM balance**
- Lets you add any number of **lenders**, each with their own contribution amount
- Shows a **real-time pool total** and each lender's calculated **share %**
- Builds **one Stellar transaction** that sends the full pool amount to a
  single borrower address and submits it after the user signs in Freighter
- Attaches an on-chain **memo** summarising the pool (lender count + total XLM)
- Shows clear **success / failure feedback**, including the **transaction hash**
  and a link to view it on Stellar Expert
- One-click **Friendbot funding** for brand-new, empty testnet accounts

## 🧱 Tech stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [`@stellar/stellar-sdk`](https://www.npmjs.com/package/@stellar/stellar-sdk) — building & submitting transactions
- [`@stellar/freighter-api`](https://www.npmjs.com/package/@stellar/freighter-api) — talking to the Freighter wallet extension

## 🚀 Setup instructions (run locally)

### 1. Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Freighter wallet](https://www.freighter.app/) installed as a browser extension
- Freighter set to **Testnet** (open the Freighter extension → network
  switcher in the top right → choose **Testnet**)

### 2. Clone and install

```bash
git clone https://github.com/<your-username>/stellar-loan-pool.git
cd stellar-loan-pool
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`) in your browser.

### 4. Fund your testnet wallet

If your Freighter testnet account has 0 XLM, click **"Fund via Friendbot"**
in the app after connecting — it requests free testnet XLM automatically.
You can also do this manually at the
[Friendbot endpoint](https://friendbot.stellar.org) or via the
[Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test).

### 5. Try a loan pool

1. Click **Connect Freighter** and approve the connection.
2. Add one or more **lenders** using testnet `G...` addresses and XLM amounts.
3. Enter the **borrower's** testnet address in the Borrower field.
4. Click **Send Pool Payment**.
5. Approve the transaction in the Freighter popup.
6. Watch the result panel for the success state and transaction hash.

## 📂 Project structure

```
src/
  lib/stellar.js           # All wallet + Horizon/Stellar SDK logic
                           # includes buildLoanPoolTx()
  components/
    WalletPanel.jsx        # Connect / disconnect / balance display
    PoolStatus.jsx         # Dashboard card: pool total, lender count, borrower, status
    LenderRow.jsx          # Single lender input row (address + amount + share %)
    BorrowerInput.jsx      # Borrower address field with live validation
    TxResult.jsx           # Success / failure / pending transaction feedback
    RecipientRow.jsx       # (legacy — retained from original tip-splitter)
    SplitBeam.jsx          # (legacy — retained from original tip-splitter)
  App.jsx                  # Wires everything together, manages pool state
```

## 🖼️ Screenshots

**Wallet connected state**

`screenshots/wallet-connected.png`

**Balance displayed**

`screenshots/balance-displayed.png`

**Successful testnet transaction**

`screenshots/transaction-success.png`

**Transaction result shown to user**

`screenshots/transaction-result.png`

## ⚠️ Notes

- This app runs exclusively on **Stellar Testnet**. It will not work with
  mainnet funds, and Freighter must be switched to Testnet mode.
- In Level 1, the **connected wallet acts as the pool operator** — it holds
  the pooled XLM and sends the full total to the borrower in a single payment.
  Lender contributions are tracked off-chain in the UI. A proper multi-sig
  escrow model is a Level 2+ concern.
- Freighter has no programmatic "disconnect" call — disconnecting in this
  app clears local app state. To fully revoke site access, do so from
  inside the Freighter extension's connected-sites settings.

## 📄 License

MIT
