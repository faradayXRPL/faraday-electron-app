import { useState } from 'react'
import { ConsolePage } from './pages/ConsolePage'
import { HowToPage } from './pages/HowToPage'
import { Header } from './components/Header'
import { StatusFooter, type SerialFooterControls } from './components/StatusFooter'
import { useLang } from './i18n/useLang'
import type { AppPage } from './i18n/translations'
import type { ConnStatus } from './lib/useSerial'
import type { DeviceState } from './lib/serialProtocol'
import './styles/app.css'

function App() {
  const { lang, setLang, t } = useLang()
  const [page, setPage] = useState<AppPage>('console')
  const [serialStatus, setSerialStatus] = useState<ConnStatus>('idle')
  const [deviceState, setDeviceState] = useState<DeviceState>('unknown')
  const [footerSerial, setFooterSerial] = useState<SerialFooterControls | null>(null)

  return (
    <main className="app-shell">
      <Header
        lang={lang}
        setLang={setLang}
        t={t}
        page={page}
        setPage={setPage}
      />

      <div className={page === 'console' ? undefined : 'page-hidden'} aria-hidden={page !== 'console'}>
        <ConsolePage
          lang={lang}
          t={t}
          onSerialStatus={(status) => {
            setSerialStatus(status)
          }}
          onDeviceState={setDeviceState}
          onFooterSerial={setFooterSerial}
        />
      </div>

      {page === 'howto' ? <HowToPage t={t} /> : null}

      <StatusFooter
        status={serialStatus}
        deviceState={deviceState}
        serial={footerSerial}
        t={t}
      />
    </main>
  )
}

export default App
