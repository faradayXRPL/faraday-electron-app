export type SerialPortInfo = {
  path: string
  manufacturer: string
  vendorId: string
  productId: string
}

export type SignerSerialApi = {
  listPorts: () => Promise<SerialPortInfo[]>
  open: (portPath: string) => Promise<boolean>
  close: () => Promise<boolean>
  write: (line: string) => Promise<boolean>
  writeUnsigned: (header: string, body: string) => Promise<boolean>
  onLine: (callback: (line: string) => void) => () => void
}

declare global {
  interface Window {
    signerSerial?: SignerSerialApi
  }
}

export {}
