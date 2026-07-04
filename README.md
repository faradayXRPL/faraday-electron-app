# FARADAY USB Console — v0.1

Desktop companion for the **Faraday USB XRPL signer**. Builds mainnet transactions
online, sends them over USB to the offline device, verifies the signed blob, and
broadcasts.

**The seed never leaves the device.**

| Property | Detail |
|----------|--------|
| Network | XRPL **mainnet** only |
| Signing | On-device — console never sees the seed |
| Connection | USB serial @ 115200 baud to [faraday-usb-signer](https://github.com/faradayXRPL/faraday-usb-signer) firmware |
| Stack | Electron + React + [xrpl.js](https://js.xrpl.org/) |

Part of the [Faraday](https://github.com/faradayXRPL) air-gapped signing stack.

## Prerequisites

- **Node.js 20+** and npm
- **Faraday signer** flashed with [faraday-usb-signer](https://github.com/faradayXRPL/faraday-usb-signer) firmware
- USB data cable (ESP32-S3 CDC serial)

## Quick start

```bash
git clone https://github.com/faradayXRPL/faraday-electron-app.git
cd faraday-electron-app
npm install
npm start                # Vite dev server + Electron
```

Build an installer:

```bash
npm run dist             # → release/ (NSIS / DMG / AppImage per OS)
```

> This app also lives in the monorepo
> [faraday-v0.1](https://github.com/faradayXRPL/faraday-v0.1) at
> `apps/faraday-electron-app` (`npm run dev:console` from the root).

## Signing flow

1. **Connect** — select serial port (ESP32-S3 auto-detected by USB vendor id)
2. **Build** — transaction type + fields, autofill on mainnet
3. **Send** — unsigned tx over USB (length-prefixed frames)
4. **Sign** — review on device display, hold to sign
5. **Broadcast** — verify locally, submit to mainnet

Supported types (v0.1): `Payment`, `OfferCreate`, `OfferCancel`, `TrustSet`,
`AMMDeposit`, `AMMWithdraw`, `AccountSet` — same allowlist as firmware.

## USB protocol

115200 baud, line-based — matches firmware:

```
► UNSIGNED <byteLength>
► <json>
◄ ACK
◄ SIGNED { "protocol": "XRPL-AQ/1", "kind": "signed", "network": "mainnet",
           "tx_blob": "…", "tx_hash": "…" }
```

Small payloads may use inline `UNSIGNED {json}` on one line.

## Architecture

| Path | Purpose |
|------|---------|
| `electron/main.cjs` | Serial IPC; DTR/RTS low (no board reset on connect) |
| `electron/serialFramer.cjs` | Length-prefixed frame writer |
| `electron/preload.cjs` | `window.signerSerial` bridge |
| `src/lib/useSerial.ts` | Ports, connection, USB log |
| `src/lib/serialProtocol.ts` | Frame builder + line parser |
| `src/lib/xrplFlow.ts` | Autofill, verify, submit |
| `src/lib/txForm.ts` | Form → unsigned `tx_json` |
| `src/pages/ConsolePage.tsx` | Main signing UI |
| `src/pages/HowToPage.tsx` | In-app setup guide |

## Security

The console runs on an **online** machine. It builds and broadcasts transactions
but never handles the seed. Report vulnerabilities privately — see
[SECURITY.md](SECURITY.md).

## License

[PolyForm Noncommercial License 1.0.0](LICENSE) — Copyright (c) 2026 Faraday.

Public source for **non-commercial** use. Commercial use:
[faradayxrpl@pm.me](mailto:faradayxrpl@pm.me).
