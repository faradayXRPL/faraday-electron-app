import { dropsToXrp, type SubmittableTransaction } from 'xrpl'
import type { Lang } from '../i18n/translations'
import type { TxFieldForm } from './txForm'
import type { AllowlistedType } from './xrplFlow'

export type TxSummaryLine = { label: string; value: string }

function dropsToXrpDisplay(drops: string | number): string {
  try {
    return `${dropsToXrp(String(drops))} XRP`
  } catch {
    return `${drops} drops`
  }
}

function assetLabel(asset: unknown): string {
  if (asset === 'XRP' || asset === undefined) return 'XRP'
  if (typeof asset === 'string') return dropsToXrpDisplay(asset)
  if (asset && typeof asset === 'object') {
    const a = asset as { currency?: string; issuer?: string; value?: string }
    if (a.currency === 'XRP' || !a.currency) return dropsToXrpDisplay(a.value ?? '0')
    const issuer = a.issuer ? ` · ${shortAddr(a.issuer)}` : ''
    return `${a.value ?? '?'} ${a.currency}${issuer}`
  }
  return String(asset)
}

function shortAddr(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function summarizeTransaction(tx: SubmittableTransaction, lang: Lang): TxSummaryLine[] {
  const t = lang === 'de'
  const lines: TxSummaryLine[] = []
  const rec = tx as Record<string, unknown>
  const type = String(rec.TransactionType ?? '?')

  lines.push({ label: t ? 'Typ' : 'Type', value: type })
  if (rec.Account) lines.push({ label: t ? 'Von' : 'From', value: String(rec.Account) })

  switch (type) {
    case 'Payment':
      if (rec.Destination) lines.push({ label: t ? 'An' : 'To', value: String(rec.Destination) })
      if (rec.Amount !== undefined) lines.push({ label: t ? 'Betrag' : 'Amount', value: assetLabel(rec.Amount) })
      if (rec.DestinationTag !== undefined) {
        lines.push({ label: 'Destination Tag', value: String(rec.DestinationTag) })
      }
      break
    case 'OfferCreate':
      if (rec.TakerGets !== undefined) lines.push({ label: t ? 'Du gibst' : 'You give', value: assetLabel(rec.TakerGets) })
      if (rec.TakerPays !== undefined) lines.push({ label: t ? 'Du erhältst' : 'You receive', value: assetLabel(rec.TakerPays) })
      break
    case 'OfferCancel':
      if (rec.OfferSequence !== undefined) {
        lines.push({ label: t ? 'Angebot-Sequenz' : 'Offer sequence', value: String(rec.OfferSequence) })
      }
      break
    case 'TrustSet':
      if (rec.LimitAmount !== undefined) {
        lines.push({ label: t ? 'Trust-Limit' : 'Trust limit', value: assetLabel(rec.LimitAmount) })
      }
      break
    case 'AMMDeposit':
    case 'AMMWithdraw':
      if (rec.Asset !== undefined) lines.push({ label: t ? 'Asset 1' : 'Asset 1', value: assetLabel(rec.Asset) })
      if (rec.Asset2 !== undefined) lines.push({ label: t ? 'Asset 2' : 'Asset 2', value: assetLabel(rec.Asset2) })
      if (rec.Amount !== undefined) lines.push({ label: t ? 'Betrag 1' : 'Amount 1', value: assetLabel(rec.Amount) })
      if (rec.Amount2 !== undefined) lines.push({ label: t ? 'Betrag 2' : 'Amount 2', value: assetLabel(rec.Amount2) })
      break
    case 'AccountSet':
      if (rec.SetFlag !== undefined) lines.push({ label: 'SetFlag', value: String(rec.SetFlag) })
      if (rec.ClearFlag !== undefined) lines.push({ label: 'ClearFlag', value: String(rec.ClearFlag) })
      break
    default:
      break
  }

  if (rec.Fee !== undefined) lines.push({ label: 'Fee', value: dropsToXrpDisplay(String(rec.Fee)) })
  if (rec.Sequence !== undefined) lines.push({ label: 'Sequence', value: String(rec.Sequence) })
  if (rec.LastLedgerSequence !== undefined) {
    lines.push({ label: 'Last Ledger', value: String(rec.LastLedgerSequence) })
  }

  return lines
}

function sideLabel(
  isToken: boolean,
  xrp: string,
  currency: string,
  issuer: string,
  value: string,
): string {
  if (!isToken) return `${xrp || '0'} XRP`
  const iss = issuer ? ` · ${shortAddr(issuer)}` : ''
  return `${value || '0'} ${currency || '?'}${iss}`
}

export function summarizeDraft(
  account: string,
  type: AllowlistedType,
  fields: TxFieldForm,
  lang: Lang,
): TxSummaryLine[] {
  const de = lang === 'de'
  const lines: TxSummaryLine[] = [
    { label: de ? 'Typ' : 'Type', value: type },
    { label: de ? 'Von' : 'From', value: account || '—' },
  ]

  switch (type) {
    case 'Payment':
      lines.push({ label: de ? 'An' : 'To', value: fields.destination || '—' })
      lines.push({ label: de ? 'Betrag' : 'Amount', value: `${fields.amountXrp || '0'} XRP` })
      break
    case 'OfferCreate':
      lines.push({
        label: de ? 'Du gibst' : 'You give',
        value: sideLabel(fields.giveIsToken, fields.giveXrp, fields.giveCurrency, fields.giveIssuer, fields.giveValue),
      })
      lines.push({
        label: de ? 'Du erhältst' : 'You receive',
        value: sideLabel(
          fields.receiveIsToken,
          fields.receiveXrp,
          fields.receiveCurrency,
          fields.receiveIssuer,
          fields.receiveValue,
        ),
      })
      break
    case 'OfferCancel':
      lines.push({ label: de ? 'Angebot-Sequenz' : 'Offer sequence', value: fields.offerSequence || '0' })
      break
    case 'TrustSet':
      lines.push({
        label: de ? 'Trust-Limit' : 'Trust limit',
        value: `${fields.trustLimit || '0'} ${fields.trustCurrency || '?'}${
          fields.trustIssuer ? ` · ${shortAddr(fields.trustIssuer)}` : ''
        }`,
      })
      break
    case 'AMMDeposit':
      lines.push({ label: de ? 'Pool-Token' : 'Pool token', value: fields.ammTokenCurrency || '—' })
      lines.push({ label: de ? 'XRP' : 'XRP', value: `${fields.ammDepositXrp || '0'} XRP` })
      lines.push({ label: de ? 'Token-Betrag' : 'Token amount', value: fields.ammDepositToken || '0' })
      break
    case 'AMMWithdraw':
      lines.push({ label: de ? 'Pool-Token' : 'Pool token', value: fields.ammTokenCurrency || '—' })
      lines.push({
        label: de ? 'LP-Token' : 'LP token',
        value: `${fields.lpValue || '0'} ${fields.lpCurrency || '?'}`,
      })
      break
    case 'AccountSet':
      if (fields.setFlag) lines.push({ label: 'SetFlag', value: fields.setFlag })
      if (fields.clearFlag) lines.push({ label: 'ClearFlag', value: fields.clearFlag })
      break
    default:
      break
  }

  return lines
}
