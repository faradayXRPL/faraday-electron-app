import type { Translation } from '../i18n/translations'

type Props = {
  t: Translation
}

export function HowToPage({ t }: Props) {
  return (
    <section className="howto glass-strong">
      <div className="howto-head">
        <h1>{t.howTo.title}</h1>
        <p>{t.howTo.intro}</p>
      </div>
      <ol className="howto-steps">
        {t.howTo.steps.map((step, index) => (
          <li key={step.title}>
            <span className="howto-step-num">{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
