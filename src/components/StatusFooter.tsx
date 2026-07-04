import { Plug, Power, RefreshCw } from 'lucide-react'
import type { SerialPortInfo } from '../signerSerial'
import type { ConnStatus } from '../lib/useSerial'
import type { DeviceState } from '../lib/serialProtocol'
import type { Translation } from '../i18n/translations'

export type SerialFooterControls = {
  ports: SerialPortInfo[]
  portPath: string
  setPortPath: (path: string) => void
  refreshPorts: () => void | Promise<void>
  refreshingPorts?: boolean
  status: ConnStatus
  onConnect: () => void
  onDisconnect: () => void
  onPing: () => void
}

type Props = {
  status: ConnStatus
  deviceState: DeviceState
  serial: SerialFooterControls | null
  t: Translation
}

export function StatusFooter({ status, deviceState, serial, t }: Props) {
  const usbLed =
    status === 'connected' ? 'green' : status === 'connecting' ? 'amber' : 'red'

  const deviceLed =
    status !== 'connected'
      ? 'off'
      : deviceState === 'unlocked'
        ? 'green'
        : deviceState === 'locked'
          ? 'red'
          : 'off'

  const usbText = t.header.conn[status]
  const deviceText =
    status !== 'connected'
      ? t.conn.deviceUnknown
      : deviceState === 'unlocked'
        ? t.conn.deviceUnlocked
        : deviceState === 'locked'
          ? t.conn.deviceLocked
          : t.conn.deviceUnknown

  const connected = status === 'connected'
  const connStatus = serial?.status ?? status

  return (
    <footer className="app-footer glass" aria-label={t.footer.statusBar}>
      <div className="footer-status-row">
        <div className="footer-status-item">
          <span className={`footer-led footer-led--${usbLed}`} aria-hidden="true" />
          <span className="footer-status-label">{t.footer.usb}</span>
          <span className="footer-status-text">{usbText}</span>
        </div>

        {serial ? (
          <div className="footer-controls">
            <select
              className="footer-port-select"
              value={serial.portPath}
              onChange={(e) => serial.setPortPath(e.target.value)}
              disabled={connected}
              aria-label={t.conn.serialPort}
            >
              <option value="">{t.conn.selectPort}</option>
              {serial.ports.map((port) => (
                <option key={port.path} value={port.path}>
                  {port.path}
                  {port.manufacturer ? ` · ${port.manufacturer}` : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={`footer-icon-btn${serial.refreshingPorts ? ' footer-icon-btn--spin' : ''}`}
              title={t.conn.refreshPorts}
              onClick={() => void serial.refreshPorts()}
            >
              <RefreshCw size={14} />
            </button>
            {!connected ? (
              <button
                type="button"
                className="footer-action-btn footer-action-btn--primary"
                disabled={!serial.portPath || connStatus === 'connecting'}
                onClick={serial.onConnect}
              >
                <Plug size={14} />
                {t.conn.connect}
              </button>
            ) : (
              <button type="button" className="footer-action-btn" onClick={serial.onDisconnect}>
                <Power size={14} />
                {t.conn.disconnect}
              </button>
            )}
            <button
              type="button"
              className="footer-action-btn"
              disabled={!connected}
              onClick={serial.onPing}
            >
              {t.conn.ping}
            </button>
          </div>
        ) : null}

        <div className="footer-status-item footer-status-item--device">
          <span className={`footer-led footer-led--${deviceLed}`} aria-hidden="true" />
          <span className="footer-status-label">{t.footer.device}</span>
          <span className="footer-status-text">{deviceText}</span>
        </div>
      </div>
    </footer>
  )
}
