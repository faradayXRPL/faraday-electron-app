import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CircleCheck,
  CircleX,
  ChevronDown,
  ChevronUp,
  Send,
  Signature,
  Trash2,
  Usb,
} from 'lucide-react'
import type { SubmittableTransaction } from 'xrpl'
import { useSerial } from '../lib/useSerial'
import type { ConnStatus } from '../lib/useSerial'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { TxSummaryCard } from '../components/TxSummaryCard'
import { TxTypeFields } from '../components/TxTypeFields'
import { buildUnsignedFrames, parseDeviceLine, type DeviceState } from '../lib/serialProtocol'
import { summarizeDraft, summarizeTransaction } from '../lib/txSummary'
import { buildDraftFromForm, defaultFormForType, type TxFieldForm } from '../lib/txForm'
import {
  ALLOWLISTED_TYPES,
  TX_TEMPLATES,
  autofillMainnet,
  lookupAccountOnMainnet,
  makeDeviceScanPayload,
  submitSignedBlob,
  verifySignedPayload,
  type AllowlistedType,
} from '../lib/xrplFlow'
import type { Lang, PhaseKey, Translation } from '../i18n/translations'
import type { SerialFooterControls } from '../components/StatusFooter'

type Phase = PhaseKey
type ConfirmKind = 'build' | 'send' | 'broadcast' | null

type Props = {
  lang: Lang
  t: Translation
  onSerialStatus?: (status: ConnStatus, portPath: string) => void
  onDeviceState?: (state: DeviceState) => void
  onFooterSerial?: (controls: SerialFooterControls | null) => void
}

export function ConsolePage({ lang, t, onSerialStatus, onDeviceState, onFooterSerial }: Props) {
  const [account, setAccount] = useState('')
  const [accountSynced, setAccountSynced] = useState(false)
  const [accountOnLedger, setAccountOnLedger] = useState<boolean | null>(null)
  const [type, setType] = useState<AllowlistedType>('Payment')
  const [txFields, setTxFields] = useState<TxFieldForm>(() => defaultFormForType('Payment'))
  const [rawJson, setRawJson] = useState('')
  const [showRawJson, setShowRawJson] = useState(false)
  const [builtTx, setBuiltTx] = useState<SubmittableTransaction | null>(null)
  const [txJson, setTxJson] = useState('')
  const [devicePayload, setDevicePayload] = useState('')
  const [buildStatus, setBuildStatus] = useState('')
  const [buildError, setBuildError] = useState(false)
  const [showBuildDetails, setShowBuildDetails] = useState(false)
  const [showSendDetails, setShowSendDetails] = useState(false)
  const [showVerifyDetails, setShowVerifyDetails] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmKind>(null)

  const [phase, setPhase] = useState<Phase>('idle')
  const [linkStatus, setLinkStatus] = useState('')

  const [signedBlob, setSignedBlob] = useState('')
  const [signedHash, setSignedHash] = useState('')
  const [signedTx, setSignedTx] = useState<SubmittableTransaction | null>(null)
  const [decodedSigned, setDecodedSigned] = useState('')
  const [submitStatus, setSubmitStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const accountRef = useRef(account)
  accountRef.current = account
  const tRef = useRef(t)
  tRef.current = t
  const builtTxRef = useRef(builtTx)
  builtTxRef.current = builtTx
  const serialSendRef = useRef<(line: string) => Promise<void>>(async () => {})

  const requestDeviceAddress = useCallback(() => {
    void serialSendRef.current('ADDRESS')
  }, [])

  const refreshAccountOnLedger = useCallback(async (address: string) => {
    try {
      const lookup = await lookupAccountOnMainnet(address)
      setAccountOnLedger(lookup.exists)
      if (!lookup.exists) {
        setBuildError(true)
        setBuildStatus(tRef.current.build.accountNotFunded)
      } else {
        setBuildError(false)
        setBuildStatus(tRef.current.build.ready)
      }
    } catch {
      setAccountOnLedger(null)
    }
  }, [])

  const setDeviceStateSafe = useCallback(
    (state: DeviceState) => {
      onDeviceState?.(state)
    },
    [onDeviceState],
  )

  // If the device never answers (unplugged, hung), fail instead of waiting forever.
  const ackTimeoutRef = useRef<number | null>(null)
  const clearAckTimeout = useCallback(() => {
    if (ackTimeoutRef.current !== null) {
      window.clearTimeout(ackTimeoutRef.current)
      ackTimeoutRef.current = null
    }
  }, [])
  useEffect(() => clearAckTimeout, [clearAckTimeout])

  useEffect(() => {
    setBuildStatus(t.build.ready)
    setLinkStatus(t.send.noTxYet)
  }, [lang, t.build.ready, t.send.noTxYet])

  const handleLine = useCallback((line: string) => {
    const tr = tRef.current
    const parsed = parseDeviceLine(line)
    switch (parsed.kind) {
      case 'ready':
        setLinkStatus(tr.device.ready)
        break
      case 'pong':
        setDeviceStateSafe(parsed.unlocked ? 'unlocked' : 'locked')
        if (parsed.unlocked) {
          requestDeviceAddress()
        } else {
          setAccountSynced(false)
        }
        break
      case 'address':
        if (parsed.address === 'locked') {
          setDeviceStateSafe('locked')
          setAccountSynced(false)
        } else if (parsed.address !== 'none' && parsed.address.startsWith('r')) {
          setAccount(parsed.address)
          setAccountSynced(true)
          void refreshAccountOnLedger(parsed.address)
        }
        break
      case 'ack':
        clearAckTimeout()
        setPhase('reviewing')
        setLinkStatus(tr.phase.reviewing)
        break
      case 'signed':
        clearAckTimeout()
        try {
          const verified = verifySignedPayload(parsed.payload, accountRef.current, builtTxRef.current)
          setSignedBlob(verified.txBlob)
          setSignedHash(verified.txHash)
          setSignedTx(verified.decoded as SubmittableTransaction)
          setDecodedSigned(JSON.stringify(verified.decoded, null, 2))
          setPhase('signed')
          setLinkStatus(tr.device.signedOk)
        } catch (error) {
          setPhase('error')
          setLinkStatus(error instanceof Error ? error.message : tr.device.verifyFailed)
        }
        break
      case 'rejected':
        clearAckTimeout()
        setPhase('rejected')
        setLinkStatus(tr.device.rejected)
        break
      case 'error':
        clearAckTimeout()
        setPhase('error')
        setLinkStatus(tr.device.deviceError(parsed.message))
        break
      default:
        break
    }
  }, [clearAckTimeout, refreshAccountOnLedger, requestDeviceAddress, setDeviceStateSafe])

  const serial = useSerial(handleLine, t)
  serialSendRef.current = serial.send
  const connected = serial.status === 'connected'

  const pingDevice = useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        await serial.send('PING')
      } catch (error) {
        if (!opts?.silent) {
          setLinkStatus(error instanceof Error ? error.message : tRef.current.device.pingFailed)
        }
      }
    },
    [serial.send],
  )

  const connect = useCallback(async () => {
    try {
      await serial.connect()
      await pingDevice({ silent: true })
    } catch (error) {
      setLinkStatus(error instanceof Error ? error.message : tRef.current.device.connectFailed)
    }
  }, [serial.connect, pingDevice])

  const disconnect = useCallback(async () => {
    await serial.disconnect()
    setDeviceStateSafe('unknown')
    setAccountSynced(false)
    setAccountOnLedger(null)
  }, [serial.disconnect, setDeviceStateSafe])

  const connectRef = useRef(connect)
  const disconnectRef = useRef(disconnect)
  const pingRef = useRef(pingDevice)
  connectRef.current = connect
  disconnectRef.current = disconnect
  pingRef.current = pingDevice

  useEffect(() => {
    onSerialStatus?.(serial.status, serial.portPath)
  }, [serial.status, serial.portPath, onSerialStatus])

  useEffect(() => {
    onFooterSerial?.({
      ports: serial.ports,
      portPath: serial.portPath,
      setPortPath: serial.setPortPath,
      refreshPorts: serial.refreshPorts,
      refreshingPorts: serial.refreshingPorts,
      status: serial.status,
      onConnect: () => {
        void connectRef.current()
      },
      onDisconnect: () => {
        void disconnectRef.current()
      },
      onPing: () => {
        void pingRef.current()
      },
    })
  }, [
    serial.ports,
    serial.portPath,
    serial.setPortPath,
    serial.refreshPorts,
    serial.refreshingPorts,
    serial.status,
    onFooterSerial,
  ])

  useEffect(() => {
    return () => onFooterSerial?.(null)
  }, [onFooterSerial])

  const DEVICE_HEARTBEAT_MS = 2500

  useEffect(() => {
    if (serial.status !== 'connected') return

    const tick = () => {
      if (document.visibilityState === 'visible') {
        void pingRef.current({ silent: true })
      }
    }

    tick()
    const id = window.setInterval(tick, DEVICE_HEARTBEAT_MS)
    const onFocus = () => tick()
    window.addEventListener('focus', onFocus)

    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', onFocus)
    }
  }, [serial.status])

  const logRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [serial.log])

  const draftSummary = useMemo(
    () => summarizeDraft(account, type, txFields, lang),
    [account, type, txFields, lang],
  )

  const builtSummary = useMemo(
    () => (builtTx ? summarizeTransaction(builtTx, lang) : []),
    [builtTx, lang],
  )

  const signedSummary = useMemo(
    () => (signedTx ? summarizeTransaction(signedTx, lang) : []),
    [signedTx, lang],
  )

  function changeType(next: AllowlistedType) {
    setType(next)
    setTxFields(defaultFormForType(next))
    setRawJson(TX_TEMPLATES[next] || '{}')
    setShowRawJson(false)
  }

  async function buildUnsigned() {
    setBuildError(false)
    try {
      setBuildStatus(t.build.autofill)
      const draft = buildDraftFromForm({
        account,
        type,
        fields: txFields,
        rawJson,
        useRawJson: showRawJson,
      })
      const autofilled = await autofillMainnet(draft)
      const scanJson = JSON.stringify(makeDeviceScanPayload(autofilled))
      setBuiltTx(autofilled)
      setTxJson(JSON.stringify(autofilled, null, 2))
      setDevicePayload(scanJson)
      setPhase('idle')
      setSignedBlob('')
      setSignedHash('')
      setSignedTx(null)
      setDecodedSigned('')
      setSubmitStatus('')
      setShowBuildDetails(false)
      setBuildStatus(t.build.built())
    } catch (error) {
      setBuildError(true)
      const msg = error instanceof Error ? error.message : t.build.buildFailed
      setBuildStatus(msg === 'ACCOUNT_NOT_FUNDED' ? t.build.accountNotFunded : msg || t.build.buildFailed)
    }
  }

  async function sendUnsigned() {
    if (!connected) {
      setLinkStatus(t.send.connectFirst)
      return
    }
    if (!devicePayload) {
      setLinkStatus(t.send.buildFirst)
      return
    }
    try {
      setPhase('sending')
      setLinkStatus(t.phase.sending)
      const [header, body] = buildUnsignedFrames(devicePayload)
      await serial.sendUnsigned(header, body)
      setPhase('awaiting')
      setLinkStatus(t.phase.awaiting)
      clearAckTimeout()
      ackTimeoutRef.current = window.setTimeout(() => {
        ackTimeoutRef.current = null
        setPhase('error')
        setLinkStatus(tRef.current.device.timeout)
      }, 15_000)
    } catch (error) {
      setPhase('error')
      setLinkStatus(error instanceof Error ? error.message : t.send.sendFailed)
    }
  }

  async function submit() {
    setSubmitting(true)
    try {
      setSubmitStatus(t.verify.broadcasting)
      const result = await submitSignedBlob(signedBlob)
      setSubmitStatus(t.verify.submitResult(result.result.engine_result ?? 'submitted'))
    } catch (error) {
      setSubmitStatus(error instanceof Error ? error.message : t.verify.submitFailed)
    } finally {
      setSubmitting(false)
    }
  }

  function onConfirm() {
    const kind = confirm
    setConfirm(null)
    if (kind === 'build') void buildUnsigned()
    else if (kind === 'send') void sendUnsigned()
    else if (kind === 'broadcast') void submit()
  }

  const confirmProps =
    confirm === 'build'
      ? {
          title: t.confirm.buildTitle,
          message: t.confirm.buildMessage,
          lines: draftSummary,
          confirmLabel: t.confirm.buildYes,
        }
      : confirm === 'send'
        ? {
            title: t.confirm.sendTitle,
            message: t.confirm.sendMessage,
            lines: builtSummary,
            confirmLabel: t.confirm.sendYes,
          }
        : confirm === 'broadcast'
          ? {
              title: t.confirm.broadcastTitle,
              message: t.confirm.broadcastMessage,
              lines: signedSummary,
              confirmLabel: t.confirm.broadcastYes,
              danger: true,
            }
          : null

  return (
    <div className="console-page">
      <ConfirmDialog
        open={confirm !== null}
        title={confirmProps?.title ?? ''}
        message={confirmProps?.message}
        lines={confirmProps?.lines}
        confirmLabel={confirmProps?.confirmLabel ?? ''}
        cancelLabel={t.confirm.cancel}
        danger={confirmProps?.danger}
        onConfirm={onConfirm}
        onCancel={() => setConfirm(null)}
      />

      <section className="workspace">
        <div className="pane glass">
          <div className="pane-head">
            <span className="step">01</span>
            <div className="text">
              <p>{t.build.step}</p>
              <h2>{t.build.heading}</h2>
            </div>
          </div>
          <label>
            {t.build.signerAddress}
            <input
              value={account}
              onChange={(e) => {
                setAccount(e.target.value)
                setAccountSynced(false)
              }}
              placeholder="r…"
              readOnly={accountSynced}
              className={accountSynced ? 'input-synced' : undefined}
            />
          </label>
          {accountSynced ? <p className="field-hint">{t.build.signerAddressSynced}</p> : null}
          {accountOnLedger === false ? (
            <p className="status danger account-funding-hint">{t.build.accountNotFunded}</p>
          ) : null}
          <label>
            {t.build.txType}
            <select value={type} onChange={(e) => changeType(e.target.value as AllowlistedType)}>
              {ALLOWLISTED_TYPES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          {showRawJson ? null : (
            <TxTypeFields type={type} fields={txFields} onChange={setTxFields} t={t} />
          )}
          <div className="raw-toggle-row">
            <button
              type="button"
              className="btn-ghost btn-ghost-sm"
              onClick={() => setShowRawJson((v) => !v)}
            >
              {showRawJson ? t.build.hideRawJson : t.build.showRawJson}
            </button>
          </div>
          {showRawJson ? (
            <label>
              {t.build.typeJson}
              <textarea value={rawJson} onChange={(e) => setRawJson(e.target.value)} rows={7} />
            </label>
          ) : null}
          <button className="primary" onClick={() => setConfirm('build')}>
            <Signature size={16} />
            {t.build.buildBtn}
          </button>
          <p className={`status${buildError ? ' danger' : ''}`}>{buildStatus}</p>
          <TxSummaryCard
            title={t.build.summaryTitle}
            lines={builtSummary}
            empty={t.build.summaryEmpty}
          />
          {txJson ? (
            <button
              type="button"
              className="details-toggle"
              onClick={() => setShowBuildDetails((v) => !v)}
            >
              {showBuildDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showBuildDetails ? t.build.hideDetails : t.build.showDetails}
            </button>
          ) : null}
          {showBuildDetails && txJson ? (
            <textarea className="tx-json" value={txJson} readOnly rows={6} />
          ) : null}
        </div>

        <div className="pane glass">
          <div className="pane-head">
            <span className="step">02</span>
            <div className="text">
              <p>{t.send.step}</p>
              <h2>{t.send.heading}</h2>
            </div>
          </div>
          <div className="flow-rail">
            <span>{t.send.railConsole}</span>
            <span>{t.send.railUsb}</span>
            <span>{t.send.railSigner}</span>
          </div>
          <TxSummaryCard
            title={t.send.summaryTitle}
            lines={builtSummary}
            empty={t.send.buildFirst}
          />
          <button
            className="primary"
            disabled={!connected || !devicePayload || phase === 'sending' || phase === 'awaiting'}
            onClick={() => setConfirm('send')}
          >
            <Send size={16} />
            {t.send.sendBtn}
          </button>
          <div className={`phase-card phase-${phase}`}>
            <span className="phase-dot" />
            <div>
              <strong>{t.phase[phase]}</strong>
              <p>{linkStatus}</p>
            </div>
          </div>
          {devicePayload ? (
            <button
              type="button"
              className="details-toggle"
              onClick={() => setShowSendDetails((v) => !v)}
            >
              {showSendDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showSendDetails ? t.send.hideDetails : t.send.showDetails}
            </button>
          ) : null}
          {showSendDetails && devicePayload ? (
            <textarea className="chunk-box" value={devicePayload} readOnly rows={5} />
          ) : null}
        </div>

        <div className="pane glass">
          <div className="pane-head">
            <span className="step">03</span>
            <div className="text">
              <p>{t.verify.step}</p>
              <h2>{t.verify.heading}</h2>
            </div>
          </div>
          <div className="signed-state">
            {phase === 'signed' ? (
              <span className="ok"><CircleCheck size={16} /> {t.verify.verified}</span>
            ) : phase === 'rejected' || phase === 'error' ? (
              <span className="bad"><CircleX size={16} /> {linkStatus}</span>
            ) : (
              <span className="muted">{t.verify.waiting}</span>
            )}
          </div>
          <TxSummaryCard
            title={t.verify.summaryTitle}
            lines={signedSummary}
            empty={t.verify.waiting}
          />
          {signedHash ? (
            <div className="hash-row">
              <span className="hash-label">{t.verify.txHash}</span>
              <code className="hash-value">{signedHash}</code>
            </div>
          ) : null}
          <button
            className="primary danger-submit"
            disabled={!signedBlob || submitting}
            onClick={() => setConfirm('broadcast')}
          >
            <Send size={16} />
            {t.verify.submitBtn}
          </button>
          {submitStatus ? <p className="status">{submitStatus}</p> : null}
          {decodedSigned ? (
            <button
              type="button"
              className="details-toggle"
              onClick={() => setShowVerifyDetails((v) => !v)}
            >
              {showVerifyDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showVerifyDetails ? t.verify.hideDetails : t.verify.showDetails}
            </button>
          ) : null}
          {showVerifyDetails && decodedSigned ? (
            <textarea className="tx-json" value={decodedSigned} readOnly rows={5} />
          ) : null}
        </div>
      </section>

      <section className="log-pane glass">
        <div className="log-head">
          <span><Usb size={14} /> {t.log.title}</span>
          <button className="icon-btn" title={t.log.clear} onClick={serial.clearLog}>
            <Trash2 size={15} />
          </button>
        </div>
        <div className="log-list" ref={logRef}>
          {serial.log.length === 0 ? (
            <p className="log-empty">{t.log.empty}</p>
          ) : (
            serial.log.map((entry) => (
              <div key={entry.id} className={`log-row log-${entry.dir}`}>
                <span className="log-ts">{new Date(entry.ts).toLocaleTimeString()}</span>
                <span className="log-dir">
                  {entry.dir === 'in' ? '◄ RX' : entry.dir === 'out' ? '► TX' : '· SYS'}
                </span>
                <span className="log-text">{entry.text}</span>
              </div>
            ))
          )}
        </div>
        {!serial.available ? (
          <p className="status danger">{t.log.bridgeUnavailable}</p>
        ) : null}
      </section>
    </div>
  )
}
