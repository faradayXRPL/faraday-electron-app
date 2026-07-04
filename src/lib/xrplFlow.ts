import {
  Client,
  decode,
  encodeForSigning,
  hashes,
  isValidClassicAddress,
  verifySignature,
  type SubmittableTransaction,
} from 'xrpl'

import { getMainnetUrl } from './settings'

export const MAINNET_URL = 'wss://s1.ripple.com/'
export const LEADERBOARD_SOURCE_TAG = 2606160005

// Kept in lockstep with the on-device strict allowlist in tx_signer.cpp. The
// signer rejects anything else, so we only let the console build what it can sign.
export const ALLOWLISTED_TYPES = [
  'Payment',
  'OfferCreate',
  'OfferCancel',
  'TrustSet',
  'AMMDeposit',
  'AMMWithdraw',
  'AccountSet',
] as const

export type AllowlistedType = (typeof ALLOWLISTED_TYPES)[number]

// Ready-to-edit starter JSON for each type that isn't the simple XRP Payment.
// Account/Fee/Sequence/LastLedgerSequence are filled in by autofill; the device
// re-derives and verifies every field before signing.
export const TX_TEMPLATES: Record<AllowlistedType, string> = {
  Payment: '',
  // Meme-coin buy on the DEX (auto-bridges AMM liquidity). You receive TakerPays
  // (the token) and pay TakerGets (XRP, in drops). For a market swap add "Flags":
  // 131072 (tfImmediateOrCancel) or 262144 (tfFillOrKill); 524288 (tfSell) sells.
  OfferCreate: JSON.stringify(
    {
      TransactionType: 'OfferCreate',
      TakerPays: { currency: 'MEME', issuer: 'rIssuerOfTheToken............', value: '1000' },
      TakerGets: '5000000',
    },
    null,
    2,
  ),
  OfferCancel: JSON.stringify({ TransactionType: 'OfferCancel', OfferSequence: 0 }, null, 2),
  TrustSet: JSON.stringify(
    {
      TransactionType: 'TrustSet',
      LimitAmount: { currency: 'MEME', issuer: 'rIssuerOfTheToken............', value: '1000000000' },
    },
    null,
    2,
  ),
  // Add liquidity. Asset/Asset2 identify the pool; Amount/Amount2 are the deposit
  // (XRP as a drops string, tokens as {currency,issuer,value}). Two-asset deposit
  // wants "Flags": 1048576 (tfTwoAsset).
  AMMDeposit: JSON.stringify(
    {
      TransactionType: 'AMMDeposit',
      Asset: { currency: 'XRP' },
      Asset2: { currency: 'MEME', issuer: 'rIssuerOfTheToken............' },
      Amount: '5000000',
      Amount2: { currency: 'MEME', issuer: 'rIssuerOfTheToken............', value: '1000' },
      Flags: 1048576,
    },
    null,
    2,
  ),
  // Remove liquidity. LPTokenIn redeems LP tokens; the LP token currency is a
  // 40-char hex code and the issuer is the AMM account. tfLPToken = 65536.
  AMMWithdraw: JSON.stringify(
    {
      TransactionType: 'AMMWithdraw',
      Asset: { currency: 'XRP' },
      Asset2: { currency: 'MEME', issuer: 'rIssuerOfTheToken............' },
      LPTokenIn: {
        currency: '03930D02208264E2E40EC1B0C09E4DB96EE197B1',
        issuer: 'rAMMPoolAccount.............',
        value: '100',
      },
      Flags: 65536,
    },
    null,
    2,
  ),
  AccountSet: JSON.stringify({ TransactionType: 'AccountSet', SetFlag: 8 }, null, 2),
}

export type BuildForm = {
  account: string
  type: AllowlistedType
  destination: string
  amountXrp: string
  rawJson: string
}

export function dropsFromXrp(xrp: string): string {
  const [whole, frac = ''] = xrp.trim().split('.')
  const normalized = `${whole || '0'}${frac.padEnd(6, '0').slice(0, 6)}`
  return String(BigInt(normalized))
}

export function withLeaderboardSourceTag<T extends Record<string, unknown>>(
  tx: T,
): T & { SourceTag: number } {
  return { ...tx, SourceTag: LEADERBOARD_SOURCE_TAG }
}

export function isAccountMissingOnLedger(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    const msg = error instanceof Error ? error.message : String(error ?? '')
    return /account not found|actNotFound/i.test(msg)
  }
  const err = error as { data?: { error?: string }; message?: string }
  if (err.data?.error === 'actNotFound') return true
  return /account not found|actNotFound/i.test(err.message ?? String(error))
}

export type AccountLookup = {
  exists: boolean
  balanceDrops?: string
}

/** Returns whether the classic address is activated on XRPL mainnet. */
export async function lookupAccountOnMainnet(
  address: string,
  nodeUrl = getMainnetUrl(),
): Promise<AccountLookup> {
  const client = new Client(nodeUrl)
  await client.connect()
  try {
    const res = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated',
    })
    return {
      exists: true,
      balanceDrops: String(res.result.account_data.Balance),
    }
  } catch (error) {
    if (isAccountMissingOnLedger(error)) return { exists: false }
    throw error
  } finally {
    await client.disconnect()
  }
}

export function buildDraftTransaction(form: BuildForm): SubmittableTransaction {
  if (!isValidClassicAddress(form.account)) throw new Error('Invalid signer address')
  if (form.type === 'Payment') {
    if (!isValidClassicAddress(form.destination)) throw new Error('Invalid destination')
    return withLeaderboardSourceTag({
      TransactionType: 'Payment',
      Account: form.account,
      Destination: form.destination,
      Amount: dropsFromXrp(form.amountXrp || '0'),
    }) as SubmittableTransaction
  }
  const parsed = JSON.parse(form.rawJson || '{}')
  if (parsed.TransactionType !== form.type) {
    parsed.TransactionType = form.type
  }
  parsed.Account = form.account
  return withLeaderboardSourceTag(parsed) as SubmittableTransaction
}

export async function autofillMainnet(
  tx: SubmittableTransaction,
  nodeUrl = getMainnetUrl(),
): Promise<SubmittableTransaction> {
  const client = new Client(nodeUrl)
  await client.connect()
  try {
    return await client.autofill(tx)
  } catch (error) {
    if (isAccountMissingOnLedger(error)) {
      throw new Error('ACCOUNT_NOT_FUNDED')
    }
    throw error
  } finally {
    await client.disconnect()
  }
}

export function makeUnsignedPayload(account: string, txJson: SubmittableTransaction) {
  return {
    protocol: 'XRPL-AQ/1',
    kind: 'unsigned',
    network: 'mainnet',
    account,
    tx_json: txJson,
    meta: {
      createdAt: new Date().toISOString(),
      signingPreviewHex: encodeForSigning(txJson).slice(0, 24),
    },
  }
}

/** Minimal JSON for ESP32 camera scan — fewer modules = easier to read. */
export function makeDeviceScanPayload(txJson: SubmittableTransaction) {
  return {
    network: 'mainnet',
    tx_json: txJson,
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== typeof b || a == null || b == null) return false
  if (typeof a !== 'object') return false
  const ka = Object.keys(a as object)
  const kb = Object.keys(b as object)
  if (ka.length !== kb.length) return false
  return ka.every((k) =>
    deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
  )
}

// Fields the device legitimately adds while signing.
const SIGNING_FIELDS = new Set(['SigningPubKey', 'TxnSignature'])

export function verifySignedPayload(
  payload: string,
  expectedAccount: string,
  expectedTx?: SubmittableTransaction | null,
) {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(payload) as Record<string, unknown>
  } catch {
    throw new Error('Signed payload JSON is incomplete or corrupted')
  }
  if (parsed.protocol !== 'XRPL-AQ/1' || parsed.kind !== 'signed') {
    throw new Error('Not a signed AQ payload')
  }
  const txBlob = String(parsed.tx_blob || '')
  let decoded: Record<string, unknown>
  try {
    decoded = decode(txBlob) as Record<string, unknown>
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(`Signed tx_blob is invalid (${detail})`)
  }
  if (decoded.Account !== expectedAccount) {
    throw new Error('Signed transaction account does not match signer')
  }
  if (!verifySignature(txBlob)) {
    throw new Error('Signature verification failed')
  }

  // Recompute the hash locally instead of trusting the device-reported value.
  const txHash = hashes.hashSignedTx(txBlob)
  const reportedHash = String(parsed.tx_hash || '')
  if (reportedHash && reportedHash.toUpperCase() !== txHash.toUpperCase()) {
    throw new Error('Device-reported tx hash does not match the signed blob')
  }

  // Field-by-field diff against what we sent: the signed content must be
  // exactly the reviewed transaction, nothing altered, nothing added.
  if (expectedTx) {
    const expected = expectedTx as unknown as Record<string, unknown>
    for (const [key, value] of Object.entries(expected)) {
      if (key === 'Flags' && !value && decoded[key] === undefined) continue
      if (!deepEqual(decoded[key], value)) {
        throw new Error(`Signed transaction field "${key}" differs from the built transaction`)
      }
    }
    for (const key of Object.keys(decoded)) {
      if (SIGNING_FIELDS.has(key)) continue
      if (key === 'Flags' && !decoded[key] && expected[key] === undefined) continue
      if (!(key in expected)) {
        throw new Error(`Signed transaction contains unexpected field "${key}"`)
      }
    }
  }

  return {
    txBlob,
    txHash,
    decoded,
  }
}

export async function submitSignedBlob(txBlob: string, nodeUrl = getMainnetUrl()) {
  const client = new Client(nodeUrl)
  await client.connect()
  try {
    return await client.submit(txBlob)
  } finally {
    await client.disconnect()
  }
}
