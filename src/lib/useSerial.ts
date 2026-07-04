import { useCallback, useEffect, useRef, useState } from 'react'
import type { SerialPortInfo } from '../signerSerial'
import type { Translation } from '../i18n/translations'

export type LogDir = 'in' | 'out' | 'sys'
export type LogEntry = { id: number; ts: number; dir: LogDir; text: string }
export type ConnStatus = 'idle' | 'connecting' | 'connected'

// Espressif USB vendor id — used to auto-select the ESP32-S3 port.
const ESPRESSIF_VID = '303a'
const MAX_LOG = 250

export function useSerial(onLine?: (line: string) => void, t?: Translation) {
  const api = typeof window !== 'undefined' ? window.signerSerial : undefined
  const [ports, setPorts] = useState<SerialPortInfo[]>([])
  const [portPath, setPortPath] = useState('')
  const [status, setStatus] = useState<ConnStatus>('idle')
  const [refreshingPorts, setRefreshingPorts] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const idRef = useRef(0)
  const onLineRef = useRef(onLine)
  const tRef = useRef(t)
  const statusRef = useRef<ConnStatus>('idle')
  onLineRef.current = onLine
  tRef.current = t
  statusRef.current = status

  const append = useCallback((dir: LogDir, text: string) => {
    setLog((prev) => {
      const next = prev.concat({ id: idRef.current++, ts: Date.now(), dir, text })
      return next.length > MAX_LOG ? next.slice(next.length - MAX_LOG) : next
    })
  }, [])

  const refreshPorts = useCallback(async () => {
    if (!api) return
    setRefreshingPorts(true)
    try {
      const items = await api.listPorts()
      setPorts(items)
      setPortPath((cur) => {
        if (cur && items.some((p) => p.path === cur)) return cur
        const esp = items.find((p) => (p.vendorId || '').toLowerCase() === ESPRESSIF_VID)
        return esp?.path ?? items[0]?.path ?? ''
      })
    } finally {
      setRefreshingPorts(false)
    }
  }, [api])

  useEffect(() => {
    void refreshPorts()
  }, [refreshPorts])

  useEffect(() => {
    if (!api) return
    const off = api.onLine((line) => {
      append('in', line)
      onLineRef.current?.(line)
    })
    return off
  }, [api, append])

  const connect = useCallback(
    async (path?: string) => {
      const labels = tRef.current?.serial
      if (!api) throw new Error(labels?.bridgeUnavailable ?? 'Serial bridge unavailable.')
      const target = path ?? portPath
      if (!target) throw new Error(labels?.noPort ?? 'No serial port selected.')
      setStatus('connecting')
      try {
        await api.open(target)
        setStatus('connected')
        const msg = tRef.current?.log.connected(target) ?? `Connected ${target}`
        append('sys', msg)
      } catch (error) {
        setStatus('idle')
        throw error
      }
    },
    [api, portPath, append],
  )

  const disconnect = useCallback(async () => {
    if (!api) return
    await api.close()
    setStatus('idle')
    append('sys', tRef.current?.log.disconnected ?? 'Disconnected')
  }, [api, append])

  const send = useCallback(
    async (line: string) => {
      const labels = tRef.current?.serial
      if (!api) throw new Error(labels?.bridgeUnavailableSend ?? 'Serial bridge unavailable.')
      if (statusRef.current !== 'connected') {
        throw new Error(labels?.notConnected ?? 'Serial port not connected.')
      }
      await api.write(line)
      append('out', line.length > 160 ? `${line.slice(0, 157)}…` : line)
    },
    [api, append],
  )

  const sendUnsigned = useCallback(
    async (header: string, body: string) => {
      const labels = tRef.current?.serial
      if (!api?.writeUnsigned) throw new Error(labels?.bridgeUnavailableSend ?? 'Serial bridge unavailable.')
      if (statusRef.current !== 'connected') {
        throw new Error(labels?.notConnected ?? 'Serial port not connected.')
      }
      await api.writeUnsigned(header, body)
      append('out', `${header} + ${body.length} bytes`)
    },
    [api, append],
  )
  const clearLog = useCallback(() => setLog([]), [])

  return {
    available: !!api,
    ports,
    portPath,
    setPortPath,
    status,
    connect,
    disconnect,
    send,
    sendUnsigned,
    log,
    clearLog,
    refreshPorts,
    refreshingPorts,
  }
}
