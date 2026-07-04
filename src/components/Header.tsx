import { BrandLogo } from './BrandLogo'
import { SettingsButton } from './SettingsButton'
import { WindowControls } from './WindowControls'
import type { AppPage, Lang, Translation } from '../i18n/translations'

type Props = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translation
  page: AppPage
  setPage: (page: AppPage) => void
}

export function Header({ lang, setLang, t, page, setPage }: Props) {
  function onTitlebarDoubleClick() {
    void window.windowControls?.maximize()
  }

  return (
    <header className="topbar titlebar">
      <div className="titlebar-inner">
        <div className="titlebar-drag" onDoubleClick={onTitlebarDoubleClick}>
          <div className="brand-lockup" aria-label="FARADAY USB Signer">
            <BrandLogo variant="logo" className="brand-logo--titlebar" />
            <span className="brand-subtitle">{t.header.subtitle}</span>
          </div>
        </div>

        <div className="titlebar-status">
          <nav className="nav-tabs no-drag" aria-label={t.nav.howTo}>
            <button
              type="button"
              className={page === 'console' ? 'active' : ''}
              aria-current={page === 'console' ? 'page' : undefined}
              onClick={() => setPage('console')}
            >
              {t.nav.console}
            </button>
            <button
              type="button"
              className={page === 'howto' ? 'active' : ''}
              aria-current={page === 'howto' ? 'page' : undefined}
              onClick={() => setPage('howto')}
            >
              {t.nav.howTo}
            </button>
          </nav>
          <SettingsButton t={t} />
          <div className="lang-switch" role="group" aria-label="Language">
            <button type="button" className={lang === 'de' ? 'active' : ''} onClick={() => setLang('de')}>
              DE
            </button>
            <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
              EN
            </button>
          </div>
          <span className="pill accent">{t.header.mainnet}</span>
        </div>

        <WindowControls t={t} />
      </div>
    </header>
  )
}
