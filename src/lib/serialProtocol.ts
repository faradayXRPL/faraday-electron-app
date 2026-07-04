/** Build length-prefixed USB frames for the ESP32 signer. */
export function buildUnsignedFrames(json: string): [header: string, body: string] {
  return [`UNSIGNED ${json.length}`, json]
}

/** Legacy single-line command (small payloads only). */
export function buildUnsignedLine(devicePayload: unknown): string {
  const json =
    typeof devicePayload === 'string' ? devicePayload : JSON.stringify(devicePayload)
  return `UNSIGNED ${json}`
}

export type DeviceLine =
  | { kind: 'ready'; text: string }
  | { kind: 'ack' }
  | { kind: 'signed'; payload: string }
  | { kind: 'rejected' }
  | { kind: 'error'; message: string }
  | { kind: 'pong'; unlocked: boolean }
  | { kind: 'address'; address: string | 'locked' | 'none' }
  | { kind: 'unknown'; text: string }

export type DeviceState = 'unknown' | 'locked' | 'unlocked'

export function parseDeviceLine(line: string): DeviceLine {
  const trimmed = line.trim()
  if (trimmed.startsWith('READY')) return { kind: 'ready', text: trimmed }
  if (trimmed === 'ACK') return { kind: 'ack' }
  if (trimmed.startsWith('SIGNED ')) {
    return { kind: 'signed', payload: trimmed.slice('SIGNED '.length).trim() }
  }
  if (trimmed === 'REJECTED') return { kind: 'rejected' }
  if (trimmed.startsWith('ERROR ')) {
    return { kind: 'error', message: trimmed.slice('ERROR '.length).trim() }
  }
  if (trimmed.startsWith('PONG ')) {
    return { kind: 'pong', unlocked: trimmed.includes('unlocked') }
  }
  if (trimmed.startsWith('ADDRESS ')) {
    const value = trimmed.slice('ADDRESS '.length).trim()
    if (value === 'locked' || value === 'none') {
      return { kind: 'address', address: value }
    }
    return { kind: 'address', address: value }
  }
  return { kind: 'unknown', text: trimmed }
}
