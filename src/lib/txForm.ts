import { isValidClassicAddress, type SubmittableTransaction } from 'xrpl'
import {
  LEADERBOARD_SOURCE_TAG,
  dropsFromXrp,
  withLeaderboardSourceTag,
  type AllowlistedType,
} from './xrplFlow'

export type TxFieldForm = {
  destination: string
  amountXrp: string
  giveIsToken: boolean
  giveXrp: string
  giveCurrency: string
  giveIssuer: string
  giveValue: string
  receiveIsToken: boolean
  receiveXrp: string
  receiveCurrency: string
  receiveIssuer: string
  receiveValue: string
  offerSequence: string
  trustCurrency: string
  trustIssuer: string
  trustLimit: string
  ammTokenCurrency: string
  ammTokenIssuer: string
  ammDepositXrp: string
  ammDepositToken: string
  lpCurrency: string
  lpIssuer: string
  lpValue: string
  setFlag: string
  clearFlag: string
}

export const EMPTY_TX_FIELD_FORM: TxFieldForm = {
  destination: '',
  amountXrp: '1',
  giveIsToken: false,
  giveXrp: '5',
  giveCurrency: '',
  giveIssuer: '',
  giveValue: '',
  receiveIsToken: true,
  receiveXrp: '',
  receiveCurrency: '',
  receiveIssuer: '',
  receiveValue: '',
  offerSequence: '0',
  trustCurrency: '',
  trustIssuer: '',
  trustLimit: '1000000000',
  ammTokenCurrency: '',
  ammTokenIssuer: '',
  ammDepositXrp: '5',
  ammDepositToken: '1000',
  lpCurrency: '',
  lpIssuer: '',
  lpValue: '100',
  setFlag: '8',
  clearFlag: '',
}

export function defaultFormForType(type: AllowlistedType): TxFieldForm {
  const base = { ...EMPTY_TX_FIELD_FORM }
  switch (type) {
    case 'Payment':
      return { ...base, amountXrp: '1' }
    case 'OfferCreate':
      return {
        ...base,
        giveIsToken: false,
        giveXrp: '5',
        receiveIsToken: true,
        receiveCurrency: 'USD',
        receiveIssuer: '',
        receiveValue: '100',
      }
    case 'OfferCancel':
      return { ...base, offerSequence: '0' }
    case 'TrustSet':
      return { ...base, trustCurrency: 'USD', trustLimit: '1000000000' }
    case 'AMMDeposit':
      return { ...base, ammDepositXrp: '5', ammDepositToken: '1000' }
    case 'AMMWithdraw':
      return { ...base, lpValue: '100' }
    case 'AccountSet':
      return { ...base, setFlag: '8', clearFlag: '' }
    default:
      return base
  }
}

function requireAddress(addr: string, label: string): string {
  if (!isValidClassicAddress(addr)) throw new Error(`Invalid ${label}`)
  return addr
}

function xrpAsset(xrp: string): string {
  return dropsFromXrp(xrp || '0')
}

function tokenAsset(currency: string, issuer: string, value: string) {
  if (!currency.trim()) throw new Error('Token currency required')
  requireAddress(issuer, 'token issuer')
  return { currency: currency.trim(), issuer: issuer.trim(), value: value || '0' }
}

function sideAsset(isToken: boolean, xrp: string, currency: string, issuer: string, value: string) {
  if (isToken) return tokenAsset(currency, issuer, value)
  return xrpAsset(xrp || '0')
}

export type BuildInput = {
  account: string
  type: AllowlistedType
  fields: TxFieldForm
  rawJson: string
  useRawJson: boolean
}

export function buildDraftFromForm(input: BuildInput): SubmittableTransaction {
  requireAddress(input.account, 'signer address')

  if (input.useRawJson) {
    const parsed = JSON.parse(input.rawJson || '{}') as Record<string, unknown>
    parsed.TransactionType = input.type
    parsed.Account = input.account
    return withLeaderboardSourceTag(parsed) as SubmittableTransaction
  }

  const f = input.fields

  switch (input.type) {
    case 'Payment':
      return {
        TransactionType: 'Payment',
        Account: input.account,
        Destination: requireAddress(f.destination, 'destination'),
        Amount: xrpAsset(f.amountXrp),
        SourceTag: LEADERBOARD_SOURCE_TAG,
      } as SubmittableTransaction

    case 'OfferCreate':
      return {
        TransactionType: 'OfferCreate',
        Account: input.account,
        TakerGets: sideAsset(f.giveIsToken, f.giveXrp, f.giveCurrency, f.giveIssuer, f.giveValue),
        TakerPays: sideAsset(
          f.receiveIsToken,
          f.receiveXrp,
          f.receiveCurrency,
          f.receiveIssuer,
          f.receiveValue,
        ),
        SourceTag: LEADERBOARD_SOURCE_TAG,
      } as SubmittableTransaction

    case 'OfferCancel':
      return {
        TransactionType: 'OfferCancel',
        Account: input.account,
        OfferSequence: Number(f.offerSequence || 0),
        SourceTag: LEADERBOARD_SOURCE_TAG,
      } as SubmittableTransaction

    case 'TrustSet':
      return {
        TransactionType: 'TrustSet',
        Account: input.account,
        LimitAmount: tokenAsset(f.trustCurrency, f.trustIssuer, f.trustLimit),
        SourceTag: LEADERBOARD_SOURCE_TAG,
      } as SubmittableTransaction

    case 'AMMDeposit':
      if (!f.ammTokenCurrency.trim() || !isValidClassicAddress(f.ammTokenIssuer)) {
        throw new Error('Pool token currency and issuer required')
      }
      return {
        TransactionType: 'AMMDeposit',
        Account: input.account,
        Asset: { currency: 'XRP' },
        Asset2: { currency: f.ammTokenCurrency.trim(), issuer: f.ammTokenIssuer.trim() },
        Amount: xrpAsset(f.ammDepositXrp),
        Amount2: {
          currency: f.ammTokenCurrency.trim(),
          issuer: f.ammTokenIssuer.trim(),
          value: f.ammDepositToken || '0',
        },
        Flags: 1048576,
        SourceTag: LEADERBOARD_SOURCE_TAG,
      } as SubmittableTransaction

    case 'AMMWithdraw':
      if (!f.ammTokenCurrency.trim() || !isValidClassicAddress(f.ammTokenIssuer)) {
        throw new Error('Pool token currency and issuer required')
      }
      if (!f.lpCurrency.trim() || !isValidClassicAddress(f.lpIssuer)) {
        throw new Error('LP token currency and issuer required')
      }
      return {
        TransactionType: 'AMMWithdraw',
        Account: input.account,
        Asset: { currency: 'XRP' },
        Asset2: { currency: f.ammTokenCurrency.trim(), issuer: f.ammTokenIssuer.trim() },
        LPTokenIn: {
          currency: f.lpCurrency.trim(),
          issuer: f.lpIssuer.trim(),
          value: f.lpValue || '0',
        },
        Flags: 65536,
        SourceTag: LEADERBOARD_SOURCE_TAG,
      } as SubmittableTransaction

    case 'AccountSet': {
      const tx: Record<string, unknown> = {
        TransactionType: 'AccountSet',
        Account: input.account,
        SourceTag: LEADERBOARD_SOURCE_TAG,
      }
      if (f.setFlag.trim()) tx.SetFlag = Number(f.setFlag)
      if (f.clearFlag.trim()) tx.ClearFlag = Number(f.clearFlag)
      if (!f.setFlag.trim() && !f.clearFlag.trim()) throw new Error('SetFlag or ClearFlag required')
      return tx as SubmittableTransaction
    }

    default:
      throw new Error('Unsupported transaction type')
  }
}
