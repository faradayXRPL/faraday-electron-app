import { useEffect, useState } from 'react'
import type { Translation } from '../i18n/translations'

type Props = { t: Translation }

function MaximizeGlyph({ restore }: { restore: boolean }) {
  if (restore) {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <rect x="3.5" y="0.5" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <rect x="0.5" y="3.5" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    )
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="1.5" y="1.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

const CONTROLS_WIDTH = 138

export function WindowControls({ t }: Props) {
  const api = window.windowControls
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty('--titlebar-controls-width', `${CONTROLS_WIDTH}px`)
  }, [])

  useEffect(() => {
    if (!api) return
    const apply = (value: boolean) => {
      setMaximized(value)
      document.documentElement.classList.toggle('window-maximized', value)
    }
    void api.isMaximized().then(apply)
    return api.onMaximized(apply)
  }, [api])

  if (!api) return null

  async function toggleMaximize() {
    const next = await api!.maximize()
    setMaximized(next)
    document.documentElement.classList.toggle('window-maximized', next)
  }

  return (
    <div className="window-controls" role="toolbar" aria-label="Window">
      <button
        type="button"
        className="win-btn"
        aria-label={t.header.windowMinimize}
        onClick={() => void api.minimize()}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 6h8" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </button>
      <button
        type="button"
        className="win-btn"
        aria-label={maximized ? t.header.windowRestore : t.header.windowMaximize}
        onClick={() => void toggleMaximize()}
      >
        <MaximizeGlyph restore={maximized} />
      </button>
      <button
        type="button"
        className="win-btn close"
        aria-label={t.header.windowClose}
        onClick={() => void api.close()}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </button>
    </div>
  )
}
