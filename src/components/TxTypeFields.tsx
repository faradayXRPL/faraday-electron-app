import type { TxFieldForm } from '../lib/txForm'
import type { AllowlistedType } from '../lib/xrplFlow'
import type { Translation } from '../i18n/translations'

type Props = {
  type: AllowlistedType
  fields: TxFieldForm
  onChange: (next: TxFieldForm) => void
  t: Translation
}

function set<K extends keyof TxFieldForm>(fields: TxFieldForm, key: K, value: TxFieldForm[K]): TxFieldForm {
  return { ...fields, [key]: value }
}

function AssetSide({
  label,
  isToken,
  xrp,
  currency,
  issuer,
  value,
  onTokenChange,
  onXrpChange,
  onCurrencyChange,
  onIssuerChange,
  onValueChange,
  t,
}: {
  label: string
  isToken: boolean
  xrp: string
  currency: string
  issuer: string
  value: string
  onTokenChange: (token: boolean) => void
  onXrpChange: (v: string) => void
  onCurrencyChange: (v: string) => void
  onIssuerChange: (v: string) => void
  onValueChange: (v: string) => void
  t: Translation
}) {
  const f = t.build.fields
  return (
    <fieldset className="asset-side">
      <legend>{label}</legend>
      <div className="asset-kind">
        <button
          type="button"
          className={!isToken ? 'active' : ''}
          onClick={() => onTokenChange(false)}
        >
          {f.xrp}
        </button>
        <button
          type="button"
          className={isToken ? 'active' : ''}
          onClick={() => onTokenChange(true)}
        >
          {f.token}
        </button>
      </div>
      {!isToken ? (
        <label>
          {t.build.amountXrp}
          <input value={xrp} onChange={(e) => onXrpChange(e.target.value)} inputMode="decimal" />
        </label>
      ) : (
        <div className="field-grid three">
          <label>
            {f.currency}
            <input value={currency} onChange={(e) => onCurrencyChange(e.target.value)} placeholder="USD" />
          </label>
          <label>
            {f.issuer}
            <input value={issuer} onChange={(e) => onIssuerChange(e.target.value)} placeholder="r…" />
          </label>
          <label>
            {f.amount}
            <input value={value} onChange={(e) => onValueChange(e.target.value)} inputMode="decimal" />
          </label>
        </div>
      )}
    </fieldset>
  )
}

export function TxTypeFields({ type, fields, onChange, t }: Props) {
  const f = t.build.fields

  switch (type) {
    case 'Payment':
      return (
        <div className="field-grid">
          <label>
            {t.build.destination}
            <input
              value={fields.destination}
              onChange={(e) => onChange(set(fields, 'destination', e.target.value))}
              placeholder="r…"
            />
          </label>
          <label>
            {t.build.amountXrp}
            <input
              value={fields.amountXrp}
              onChange={(e) => onChange(set(fields, 'amountXrp', e.target.value))}
              inputMode="decimal"
            />
          </label>
        </div>
      )

    case 'OfferCreate':
      return (
        <div className="tx-type-fields">
          <AssetSide
            label={f.youGive}
            isToken={fields.giveIsToken}
            xrp={fields.giveXrp}
            currency={fields.giveCurrency}
            issuer={fields.giveIssuer}
            value={fields.giveValue}
            onTokenChange={(token) => onChange(set(fields, 'giveIsToken', token))}
            onXrpChange={(v) => onChange(set(fields, 'giveXrp', v))}
            onCurrencyChange={(v) => onChange(set(fields, 'giveCurrency', v))}
            onIssuerChange={(v) => onChange(set(fields, 'giveIssuer', v))}
            onValueChange={(v) => onChange(set(fields, 'giveValue', v))}
            t={t}
          />
          <AssetSide
            label={f.youReceive}
            isToken={fields.receiveIsToken}
            xrp={fields.receiveXrp}
            currency={fields.receiveCurrency}
            issuer={fields.receiveIssuer}
            value={fields.receiveValue}
            onTokenChange={(token) => onChange(set(fields, 'receiveIsToken', token))}
            onXrpChange={(v) => onChange(set(fields, 'receiveXrp', v))}
            onCurrencyChange={(v) => onChange(set(fields, 'receiveCurrency', v))}
            onIssuerChange={(v) => onChange(set(fields, 'receiveIssuer', v))}
            onValueChange={(v) => onChange(set(fields, 'receiveValue', v))}
            t={t}
          />
        </div>
      )

    case 'OfferCancel':
      return (
        <label>
          {f.offerSequence}
          <input
            value={fields.offerSequence}
            onChange={(e) => onChange(set(fields, 'offerSequence', e.target.value))}
            inputMode="numeric"
          />
        </label>
      )

    case 'TrustSet':
      return (
        <div className="field-grid three">
          <label>
            {f.currency}
            <input
              value={fields.trustCurrency}
              onChange={(e) => onChange(set(fields, 'trustCurrency', e.target.value))}
              placeholder="USD"
            />
          </label>
          <label>
            {f.issuer}
            <input
              value={fields.trustIssuer}
              onChange={(e) => onChange(set(fields, 'trustIssuer', e.target.value))}
              placeholder="r…"
            />
          </label>
          <label>
            {f.trustLimit}
            <input
              value={fields.trustLimit}
              onChange={(e) => onChange(set(fields, 'trustLimit', e.target.value))}
              inputMode="decimal"
            />
          </label>
        </div>
      )

    case 'AMMDeposit':
      return (
        <div className="tx-type-fields">
          <p className="field-hint">{f.ammPoolHint}</p>
          <div className="field-grid">
            <label>
              {f.poolTokenCurrency}
              <input
                value={fields.ammTokenCurrency}
                onChange={(e) => onChange(set(fields, 'ammTokenCurrency', e.target.value))}
              />
            </label>
            <label>
              {f.poolTokenIssuer}
              <input
                value={fields.ammTokenIssuer}
                onChange={(e) => onChange(set(fields, 'ammTokenIssuer', e.target.value))}
                placeholder="r…"
              />
            </label>
          </div>
          <div className="field-grid">
            <label>
              {f.depositXrp}
              <input
                value={fields.ammDepositXrp}
                onChange={(e) => onChange(set(fields, 'ammDepositXrp', e.target.value))}
                inputMode="decimal"
              />
            </label>
            <label>
              {f.depositToken}
              <input
                value={fields.ammDepositToken}
                onChange={(e) => onChange(set(fields, 'ammDepositToken', e.target.value))}
                inputMode="decimal"
              />
            </label>
          </div>
        </div>
      )

    case 'AMMWithdraw':
      return (
        <div className="tx-type-fields">
          <p className="field-hint">{f.ammPoolHint}</p>
          <div className="field-grid">
            <label>
              {f.poolTokenCurrency}
              <input
                value={fields.ammTokenCurrency}
                onChange={(e) => onChange(set(fields, 'ammTokenCurrency', e.target.value))}
              />
            </label>
            <label>
              {f.poolTokenIssuer}
              <input
                value={fields.ammTokenIssuer}
                onChange={(e) => onChange(set(fields, 'ammTokenIssuer', e.target.value))}
                placeholder="r…"
              />
            </label>
          </div>
          <div className="field-grid three">
            <label>
              {f.lpCurrency}
              <input
                value={fields.lpCurrency}
                onChange={(e) => onChange(set(fields, 'lpCurrency', e.target.value))}
              />
            </label>
            <label>
              {f.lpIssuer}
              <input
                value={fields.lpIssuer}
                onChange={(e) => onChange(set(fields, 'lpIssuer', e.target.value))}
                placeholder="r…"
              />
            </label>
            <label>
              {f.lpAmount}
              <input
                value={fields.lpValue}
                onChange={(e) => onChange(set(fields, 'lpValue', e.target.value))}
                inputMode="decimal"
              />
            </label>
          </div>
        </div>
      )

    case 'AccountSet':
      return (
        <div className="field-grid">
          <label>
            {f.setFlag}
            <input
              value={fields.setFlag}
              onChange={(e) => onChange(set(fields, 'setFlag', e.target.value))}
              inputMode="numeric"
            />
          </label>
          <label>
            {f.clearFlag} <span className="optional">({f.optional})</span>
            <input
              value={fields.clearFlag}
              onChange={(e) => onChange(set(fields, 'clearFlag', e.target.value))}
              inputMode="numeric"
            />
          </label>
        </div>
      )

    default:
      return null
  }
}
