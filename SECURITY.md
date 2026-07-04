# Security — FARADAY USB Console

This app runs on an **online** host PC. It builds XRPL transactions, talks to
the air-gapped signer over USB, verifies signed blobs, and broadcasts to mainnet.
It **never** stores or transmits the wallet seed.

## Reporting a vulnerability

**Do not** open public GitHub issues for security bugs.

Email **[faradayxrpl@pm.me](mailto:faradayxrpl@pm.me)** with:

- Description and impact
- App version (`package.json` → `version`)
- Steps to reproduce (OS, transaction type, USB sequence)
- Proof-of-concept if available

We aim to acknowledge within **72 hours**.

## In scope

- Broadcasting or verifying the wrong transaction after a valid device signature
- USB framing bugs that could confuse the host about device state
- Mainnet autofill or field substitution before the unsigned payload is sent
- Serial port handling that resets or interferes with the signer unexpectedly

## Out of scope

- Compromise of the host PC (malware, keyloggers) — expected threat model
- Seed extraction from the device firmware (report to
  [faraday-usb-signer](https://github.com/faradayXRPL/faraday-usb-signer))
- Physical theft of an unlocked signer
- XRPL network or public node bugs

## Development hygiene

- Never commit `.env` or local credentials (see `.gitignore`)
- Treat `dist/` and `release/` as build output only
- Pin dependency updates and review `serialport` / `xrpl` changes carefully
