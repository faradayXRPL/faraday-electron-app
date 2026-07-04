import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Settings, X } from 'lucide-react'
import { DEFAULT_MAINNET_URL, getMainnetUrl, resetMainnetUrl, setMainnetUrl } from '../lib/settings'
import type { Translation } from '../i18n/translations'

type Props = {
  t: Translation
}

export function SettingsButton({ t }: Props) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState(getMainnetUrl())
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setUrl(getMainnetUrl())
      setError('')
    }
  }, [open])

  function save() {
    try {
      setMainnetUrl(url)
      setOpen(false)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : t.settings.saveFailed)
    }
  }

  function reset() {
    resetMainnetUrl()
    setUrl(DEFAULT_MAINNET_URL)
    setError('')
  }

  return (
    <>
      <button
        type="button"
        className="icon-btn settings-btn"
        title={t.settings.title}
        aria-label={t.settings.title}
        onClick={() => setOpen(true)}
      >
        <Settings size={16} />
      </button>

      {open
        ? createPortal(
            <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
              <div
                className="modal-card settings-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="settings-head">
                  <h3 id="settings-title">{t.settings.title}</h3>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={t.settings.close}
                    onClick={() => setOpen(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="modal-lede">{t.settings.nodeHint}</p>
                <label>
                  {t.settings.nodeUrl}
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={DEFAULT_MAINNET_URL}
                    spellCheck={false}
                  />
                </label>
                <p className="settings-default">
                  {t.settings.defaultNode}: <code>{DEFAULT_MAINNET_URL}</code>
                </p>
                {error ? <p className="status danger">{error}</p> : null}
                <div className="modal-actions">
                  <button type="button" onClick={reset}>
                    {t.settings.reset}
                  </button>
                  <button type="button" className="primary" onClick={save}>
                    {t.settings.save}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
