const STORAGE_KEY = 'faraday_usb_mainnet_url'

/** Ripple-operated public mainnet server (default). */
export const DEFAULT_MAINNET_URL = 'wss://s1.ripple.com/'

export function getMainnetUrl(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)?.trim()
    if (stored && isValidWsUrl(stored)) return stored
  } catch {
    /* ignore */
  }
  return DEFAULT_MAINNET_URL
}

export function setMainnetUrl(url: string): void {
  const trimmed = url.trim()
  if (!isValidWsUrl(trimmed)) {
    throw new Error('Invalid WebSocket URL (must start with wss://)')
  }
  localStorage.setItem(STORAGE_KEY, trimmed)
}

export function resetMainnetUrl(): void {
  localStorage.removeItem(STORAGE_KEY)
}

function isValidWsUrl(url: string): boolean {
  return /^wss:\/\/.+/i.test(url)
}
