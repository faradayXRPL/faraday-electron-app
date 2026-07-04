export type Lang = 'de' | 'en'

export type AppPage = 'console' | 'howto'

export type PhaseKey = 'idle' | 'sending' | 'awaiting' | 'reviewing' | 'signed' | 'rejected' | 'error'

export type Translation = {
  meta: { title: string; description: string }
  header: {
    subtitle: string
    mainnet: string
    conn: { idle: string; connecting: string; connected: string }
    windowMinimize: string
    windowMaximize: string
    windowRestore: string
    windowClose: string
  }
  nav: {
    console: string
    howTo: string
  }
  howTo: {
    title: string
    intro: string
    steps: { title: string; body: string }[]
  }
  hero: {
    title: string
    titleAccent: string
    lede: string
    ledeStrong: string
  }
  conn: {
    serialPort: string
    selectPort: string
    refreshPorts: string
    connect: string
    disconnect: string
    ping: string
    deviceStatus: string
    deviceUnlocked: string
    deviceLocked: string
    deviceUnknown: string
  }
  build: {
    step: string
    title: string
    heading: string
    signerAddress: string
    signerAddressSynced: string
    txType: string
    destination: string
    amountXrp: string
    typeJson: string
    buildBtn: string
    ready: string
    autofill: string
    built: () => string
    buildFailed: string
    accountNotFunded: string
    txJsonPlaceholder: string
    summaryTitle: string
    summaryEmpty: string
    showDetails: string
    hideDetails: string
    showRawJson: string
    hideRawJson: string
    fields: {
      youGive: string
      youReceive: string
      xrp: string
      token: string
      currency: string
      issuer: string
      amount: string
      offerSequence: string
      trustLimit: string
      poolTokenCurrency: string
      poolTokenIssuer: string
      depositXrp: string
      depositToken: string
      ammPoolHint: string
      lpCurrency: string
      lpIssuer: string
      lpAmount: string
      setFlag: string
      clearFlag: string
      optional: string
    }
  }
  send: {
    step: string
    title: string
    heading: string
    railConsole: string
    railUsb: string
    railSigner: string
    sendBtn: string
    payloadPlaceholder: string
    connectFirst: string
    buildFirst: string
    sendFailed: string
    noTxYet: string
    summaryTitle: string
    showDetails: string
    hideDetails: string
  }
  verify: {
    step: string
    title: string
    heading: string
    verified: string
    waiting: string
    signedBlob: string
    txHash: string
    submitBtn: string
    broadcasting: string
    submitResult: (code: string) => string
    submitFailed: string
    decodedPlaceholder: string
    summaryTitle: string
    showDetails: string
    hideDetails: string
  }
  confirm: {
    buildTitle: string
    buildMessage: string
    buildYes: string
    sendTitle: string
    sendMessage: string
    sendYes: string
    broadcastTitle: string
    broadcastMessage: string
    broadcastYes: string
    cancel: string
  }
  settings: {
    title: string
    close: string
    nodeUrl: string
    nodeHint: string
    defaultNode: string
    reset: string
    save: string
    saveFailed: string
  }
  phase: Record<PhaseKey, string>
  device: {
    ready: string
    signedOk: string
    verifyFailed: string
    rejected: string
    deviceError: (msg: string) => string
    connectFailed: string
    pingFailed: string
    timeout: string
  }
  log: {
    title: string
    clear: string
    empty: string
    bridgeUnavailable: string
    connected: (port: string) => string
    disconnected: string
  }
  serial: {
    bridgeUnavailable: string
    noPort: string
    bridgeUnavailableSend: string
    notConnected: string
  }
  footer: {
    statusBar: string
    usb: string
    device: string
  }
}

export const translations: Record<Lang, Translation> = {
  de: {
    meta: {
      title: 'Faraday · USB Signer',
      description:
        'FARADAY USB Console — XRPL-Mainnet-Transaktionen über USB an den Offline-Signer senden.',
    },
    header: {
      subtitle: 'USB Signer · v0.1',
      mainnet: 'Mainnet',
      conn: { idle: 'Getrennt', connecting: 'Verbinde…', connected: 'Verbunden' },
      windowMinimize: 'Fenster minimieren',
      windowMaximize: 'Fenster maximieren',
      windowRestore: 'Fenster wiederherstellen',
      windowClose: 'Fenster schließen',
    },
    nav: {
      console: 'Konsole',
      howTo: 'Anleitung',
    },
    howTo: {
      title: 'So funktioniert’s',
      intro: 'In wenigen Schritten von der Transaktion bis zur Signatur auf dem Gerät.',
      steps: [
        {
          title: 'Signer anschließen',
          body: 'FARADAY-Signer per USB mit dem PC verbinden und die App starten.',
        },
        {
          title: 'Verbinden',
          body: 'Seriellen Port wählen und auf „Verbinden“ klicken. Bei „Gerät gesperrt“ ist alles bereit.',
        },
        {
          title: 'Transaktion ausfüllen',
          body: 'Deine r-Adresse eintragen, Transaktionstyp wählen und Felder ausfüllen.',
        },
        {
          title: 'TX erzeugen',
          body: 'Auf „Unsignierte TX erzeugen“ klicken. Die App holt Sequence, Fee und weitere Mainnet-Daten.',
        },
        {
          title: 'An Gerät senden',
          body: 'Auf „Unsignierte TX senden“ klicken. Die Daten gehen per USB an den Signer.',
        },
        {
          title: 'Am Display prüfen & signieren',
          body: 'Alle Felder auf dem Gerät kontrollieren und zum Signieren gedrückt halten.',
        },
        {
          title: 'Broadcasten',
          body: 'Signierte TX prüfen und mit „Auf Mainnet broadcasten“ ins Ledger schicken.',
        },
      ],
    },
    hero: {
      title: 'XRPL signieren',
      titleAccent: 'über USB',
      lede:
        'Baue die Transaktion online, sende sie per USB an den FARADAY-Signer, prüfe jedes Feld am Display und broadcaste den signierten Blob —',
      ledeStrong: 'der Seed verlässt das Gerät nie.',
    },
    conn: {
      serialPort: 'Serieller Port',
      selectPort: 'Port wählen…',
      refreshPorts: 'Ports aktualisieren',
      connect: 'Verbinden',
      disconnect: 'Trennen',
      ping: 'Ping',
      deviceStatus: 'Gerätestatus',
      deviceUnlocked: 'Gerät entsperrt',
      deviceLocked: 'Gerät gesperrt',
      deviceUnknown: 'Gerätestatus unbekannt',
    },
    build: {
      step: 'Online bauen',
      title: 'Unsignierte Transaktion',
      heading: 'Unsignierte Transaktion',
      signerAddress: 'Signer-Adresse',
      signerAddressSynced: 'Vom Gerät übernommen — Gerät entsperrt lassen.',
      txType: 'Transaktionstyp',
      destination: 'Empfänger',
      amountXrp: 'Betrag XRP',
      typeJson: 'Typ-spezifisches JSON',
      buildBtn: 'Unsignierte TX erzeugen',
      ready: 'Mainnet-Builder bereit.',
      autofill: 'Autofill auf XRPL-Mainnet…',
      built: () => 'Transaktion vorbereitet — jetzt per USB an den Signer senden.',
      buildFailed: 'Erstellung fehlgeschlagen.',
      accountNotFunded:
        'Konto auf XRPL Mainnet noch nicht aktiviert — sende mindestens 10 XRP an diese Adresse, bevor du Transaktionen baust.',
      txJsonPlaceholder: 'Autofill-TX-JSON',
      summaryTitle: 'Transaktionsübersicht',
      summaryEmpty: 'Noch keine Transaktion erstellt.',
      showDetails: 'Technische Details anzeigen',
      hideDetails: 'Technische Details ausblenden',
      showRawJson: 'Raw JSON',
      hideRawJson: 'Formular-Ansicht',
      fields: {
        youGive: 'Du gibst',
        youReceive: 'Du erhältst',
        xrp: 'XRP',
        token: 'Token',
        currency: 'Währung',
        issuer: 'Issuer',
        amount: 'Betrag',
        offerSequence: 'Angebot-Sequenznummer',
        trustLimit: 'Trust-Limit',
        poolTokenCurrency: 'Pool-Token (Währung)',
        poolTokenIssuer: 'Pool-Token Issuer',
        depositXrp: 'XRP einzahlen',
        depositToken: 'Token-Betrag',
        ammPoolHint: 'XRP + Token-Pool auf dem DEX/AMM.',
        lpCurrency: 'LP-Token Währung',
        lpIssuer: 'LP-Token Issuer',
        lpAmount: 'LP-Menge',
        setFlag: 'SetFlag',
        clearFlag: 'ClearFlag',
        optional: 'optional',
      },
    },
    send: {
      step: 'Kalt übertragen',
      title: 'An Signer senden',
      heading: 'An Signer senden',
      railConsole: 'Konsole',
      railUsb: 'USB',
      railSigner: 'Signer',
      sendBtn: 'Unsignierte TX senden',
      payloadPlaceholder: 'Geräte-Payload (JSON)',
      connectFirst: 'Bitte zuerst per USB verbinden.',
      buildFirst: 'Bitte zuerst eine unsignierte TX erstellen.',
      sendFailed: 'Senden fehlgeschlagen.',
      noTxYet: 'Noch keine Transaktion gesendet.',
      summaryTitle: 'Wird an Gerät gesendet',
      showDetails: 'Technische Details anzeigen',
      hideDetails: 'Technische Details ausblenden',
    },
    verify: {
      step: 'Lokal verifizieren',
      title: 'Signiert & Broadcast',
      heading: 'Signiert & Broadcast',
      verified: 'Signatur lokal verifiziert',
      waiting: 'Nach „Halten zum Signieren" kommt die TX automatisch zurück.',
      signedBlob: 'Signierter Blob',
      txHash: 'TX-Hash',
      submitBtn: 'Auf Mainnet broadcasten',
      broadcasting: 'Broadcast auf XRPL-Mainnet…',
      submitResult: (code) => `Ergebnis: ${code}`,
      submitFailed: 'Broadcast fehlgeschlagen.',
      decodedPlaceholder: 'Dekodierte signierte TX',
      summaryTitle: 'Signierte Transaktion',
      showDetails: 'Technische Details anzeigen',
      hideDetails: 'Technische Details ausblenden',
    },
    confirm: {
      buildTitle: 'Transaktion erstellen?',
      buildMessage: 'Bitte prüfe die Angaben. Der Signer zeigt dieselben Felder auf dem Display.',
      buildYes: 'Ja, erstellen',
      sendTitle: 'An Signer senden?',
      sendMessage: 'Die unsignierte Transaktion wird per USB an das Gerät übertragen.',
      sendYes: 'Ja, senden',
      broadcastTitle: 'Auf Mainnet broadcasten?',
      broadcastMessage: 'Die signierte Transaktion wird unwiderruflich ins Ledger geschrieben.',
      broadcastYes: 'Ja, broadcasten',
      cancel: 'Nein, abbrechen',
    },
    settings: {
      title: 'Einstellungen',
      close: 'Schließen',
      nodeUrl: 'Mainnet-Node (WebSocket)',
      nodeHint: 'Standard ist der offizielle Ripple-Mainnet-Server. Eigene Node nur bei Bedarf eintragen.',
      defaultNode: 'Standard',
      reset: 'Zurücksetzen',
      save: 'Speichern',
      saveFailed: 'Speichern fehlgeschlagen.',
    },
    phase: {
      idle: 'Bereit',
      sending: 'Sende an Gerät…',
      awaiting: 'Warte auf Bestätigung…',
      reviewing: 'Auf dem Gerät prüfen & halten zum Signieren',
      signed: 'Signiert',
      rejected: 'Abgelehnt',
      error: 'Fehler',
    },
    device: {
      ready: 'Gerät bereit.',
      signedOk: 'Signierte Transaktion empfangen & lokal verifiziert.',
      verifyFailed: 'Verifikation fehlgeschlagen.',
      rejected: 'Transaktion am Gerät abgelehnt.',
      deviceError: (msg) => `Gerätefehler: ${msg}`,
      connectFailed: 'Verbindung fehlgeschlagen.',
      pingFailed: 'Ping fehlgeschlagen — Verbindung prüfen.',
      timeout: 'Keine Antwort vom Gerät — Verbindung prüfen und erneut senden.',
    },
    log: {
      title: 'USB-Protokoll',
      clear: 'Log leeren',
      empty: 'Noch keine USB-Kommunikation.',
      bridgeUnavailable:
        'Serielle Bridge nicht verfügbar — bitte die App über Electron starten (npm start).',
      connected: (port) => `Verbunden ${port}`,
      disconnected: 'Getrennt',
    },
    serial: {
      bridgeUnavailable: 'Serielle Bridge nicht verfügbar (über Electron starten).',
      noPort: 'Kein serieller Port ausgewählt.',
      bridgeUnavailableSend: 'Serielle Bridge nicht verfügbar.',
      notConnected: 'Serieller Port nicht verbunden.',
    },
    footer: {
      statusBar: 'Verbindungsstatus',
      usb: 'USB',
      device: 'Signer',
    },
  },
  en: {
    meta: {
      title: 'Faraday · USB Signer',
      description:
        'FARADAY USB Console — build XRPL mainnet transactions and sign them on the offline device over USB.',
    },
    header: {
      subtitle: 'USB Signer · v0.1',
      mainnet: 'Mainnet',
      conn: { idle: 'Disconnected', connecting: 'Connecting…', connected: 'Connected' },
      windowMinimize: 'Minimize window',
      windowMaximize: 'Maximize window',
      windowRestore: 'Restore window',
      windowClose: 'Close window',
    },
    nav: {
      console: 'Console',
      howTo: 'How to',
    },
    howTo: {
      title: 'How it works',
      intro: 'A short walkthrough from building a transaction to signing on the device.',
      steps: [
        {
          title: 'Connect the signer',
          body: 'Plug the FARADAY signer into your PC via USB and open the app.',
        },
        {
          title: 'Connect in the app',
          body: 'Pick the serial port and click Connect. “Device locked” means it is ready.',
        },
        {
          title: 'Fill in the transaction',
          body: 'Enter your r-address, choose the transaction type, and complete the fields.',
        },
        {
          title: 'Build the TX',
          body: 'Click “Build unsigned TX”. The app fetches sequence, fee, and other mainnet data.',
        },
        {
          title: 'Send to device',
          body: 'Click “Send unsigned TX”. The data is transferred to the signer over USB.',
        },
        {
          title: 'Review & sign on device',
          body: 'Check every field on the display and hold to sign.',
        },
        {
          title: 'Broadcast',
          body: 'Review the signed transaction and click “Broadcast to mainnet”.',
        },
      ],
    },
    hero: {
      title: 'Sign XRPL',
      titleAccent: 'over USB',
      lede:
        'Build the transaction online, send it to the FARADAY signer over USB, review every field on the display, then broadcast the signed blob —',
      ledeStrong: 'the seed never leaves the device.',
    },
    conn: {
      serialPort: 'Serial port',
      selectPort: 'Select port…',
      refreshPorts: 'Refresh ports',
      connect: 'Connect',
      disconnect: 'Disconnect',
      ping: 'Ping',
      deviceStatus: 'Device status',
      deviceUnlocked: 'Device unlocked',
      deviceLocked: 'Device locked',
      deviceUnknown: 'Device status unknown',
    },
    build: {
      step: 'Build online',
      title: 'Unsigned transaction',
      heading: 'Unsigned transaction',
      signerAddress: 'Signer address',
      signerAddressSynced: 'Pulled from device — keep the signer unlocked.',
      txType: 'Transaction type',
      destination: 'Destination',
      amountXrp: 'Amount XRP',
      typeJson: 'Type-specific JSON',
      buildBtn: 'Build unsigned TX',
      ready: 'Mainnet builder ready.',
      autofill: 'Autofilling on XRPL mainnet…',
      built: () => 'Transaction prepared — send to the signer over USB now.',
      buildFailed: 'Build failed.',
      accountNotFunded:
        'Account not activated on XRPL mainnet yet — send at least 10 XRP to this address before building transactions.',
      txJsonPlaceholder: 'Autofilled tx JSON',
      summaryTitle: 'Transaction overview',
      summaryEmpty: 'No transaction built yet.',
      showDetails: 'Show technical details',
      hideDetails: 'Hide technical details',
      showRawJson: 'Raw JSON',
      hideRawJson: 'Form view',
      fields: {
        youGive: 'You give',
        youReceive: 'You receive',
        xrp: 'XRP',
        token: 'Token',
        currency: 'Currency',
        issuer: 'Issuer',
        amount: 'Amount',
        offerSequence: 'Offer sequence number',
        trustLimit: 'Trust limit',
        poolTokenCurrency: 'Pool token (currency)',
        poolTokenIssuer: 'Pool token issuer',
        depositXrp: 'Deposit XRP',
        depositToken: 'Token amount',
        ammPoolHint: 'XRP + token pool on the DEX/AMM.',
        lpCurrency: 'LP token currency',
        lpIssuer: 'LP token issuer',
        lpAmount: 'LP amount',
        setFlag: 'SetFlag',
        clearFlag: 'ClearFlag',
        optional: 'optional',
      },
    },
    send: {
      step: 'Transfer cold',
      title: 'Send to signer',
      heading: 'Send to signer',
      railConsole: 'Console',
      railUsb: 'USB',
      railSigner: 'Signer',
      sendBtn: 'Send unsigned TX',
      payloadPlaceholder: 'Device payload (JSON)',
      connectFirst: 'Connect over USB first.',
      buildFirst: 'Build an unsigned transaction first.',
      sendFailed: 'Send failed.',
      noTxYet: 'No transaction sent yet.',
      summaryTitle: 'Sending to device',
      showDetails: 'Show technical details',
      hideDetails: 'Hide technical details',
    },
    verify: {
      step: 'Verify locally',
      title: 'Signed & broadcast',
      heading: 'Signed & broadcast',
      verified: 'Signature verified locally',
      waiting: 'After hold-to-sign on the device, the signed TX returns automatically.',
      signedBlob: 'Signed blob',
      txHash: 'TX hash',
      submitBtn: 'Broadcast to mainnet',
      broadcasting: 'Broadcasting to XRPL mainnet…',
      submitResult: (code) => `Result: ${code}`,
      submitFailed: 'Broadcast failed.',
      decodedPlaceholder: 'Decoded signed tx',
      summaryTitle: 'Signed transaction',
      showDetails: 'Show technical details',
      hideDetails: 'Hide technical details',
    },
    confirm: {
      buildTitle: 'Create this transaction?',
      buildMessage: 'Review the details below. The signer shows the same fields on its display.',
      buildYes: 'Yes, create',
      sendTitle: 'Send to signer?',
      sendMessage: 'The unsigned transaction will be transferred to the device over USB.',
      sendYes: 'Yes, send',
      broadcastTitle: 'Broadcast to mainnet?',
      broadcastMessage: 'The signed transaction will be submitted to the ledger — this cannot be undone.',
      broadcastYes: 'Yes, broadcast',
      cancel: 'No, cancel',
    },
    settings: {
      title: 'Settings',
      close: 'Close',
      nodeUrl: 'Mainnet node (WebSocket)',
      nodeHint: 'Default is the official Ripple mainnet server. Enter a custom node only if needed.',
      defaultNode: 'Default',
      reset: 'Reset',
      save: 'Save',
      saveFailed: 'Could not save.',
    },
    phase: {
      idle: 'Ready',
      sending: 'Sending to device…',
      awaiting: 'Waiting for acknowledgment…',
      reviewing: 'Review on device & hold to sign',
      signed: 'Signed',
      rejected: 'Rejected',
      error: 'Error',
    },
    device: {
      ready: 'Device ready.',
      signedOk: 'Signed transaction received & verified locally.',
      verifyFailed: 'Verification failed.',
      rejected: 'Transaction rejected on device.',
      deviceError: (msg) => `Device error: ${msg}`,
      connectFailed: 'Connection failed.',
      pingFailed: 'Ping failed — check the connection.',
      timeout: 'No response from device — check the connection and send again.',
    },
    log: {
      title: 'USB protocol log',
      clear: 'Clear log',
      empty: 'No USB traffic yet.',
      bridgeUnavailable: 'Serial bridge unavailable — run the app via Electron (npm start).',
      connected: (port) => `Connected ${port}`,
      disconnected: 'Disconnected',
    },
    serial: {
      bridgeUnavailable: 'Serial bridge unavailable (run via Electron).',
      noPort: 'No serial port selected.',
      bridgeUnavailableSend: 'Serial bridge unavailable.',
      notConnected: 'Serial port not connected.',
    },
    footer: {
      statusBar: 'Connection status',
      usb: 'USB',
      device: 'Signer',
    },
  },
}
