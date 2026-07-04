import type { TxSummaryLine } from '../lib/txSummary'

type Props = {
  title: string
  lines: TxSummaryLine[]
  empty?: string
}

export function TxSummaryCard({ title, lines, empty }: Props) {
  if (lines.length === 0) {
    return empty ? <p className="tx-summary-empty">{empty}</p> : null
  }

  return (
    <div className="tx-summary-card">
      <p className="tx-summary-title">{title}</p>
      <dl className="tx-summary">
        {lines.map((line) => (
          <div key={line.label} className="tx-summary-row">
            <dt>{line.label}</dt>
            <dd>{line.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
