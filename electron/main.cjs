const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const { SerialPort } = require('serialport')
const { createSerialFramer } = require('./serialFramer.cjs')

/** @type {import('serialport').SerialPort | null} */
let port = null
/** @type {ReturnType<typeof createSerialFramer> | null} */
let framer = null
/** @type {import('electron').BrowserWindow | null} */
let mainWindow = null

function sendMaximizedState() {
  if (!mainWindow) return
  const maximized = mainWindow.isMaximized() || mainWindow.isFullScreen()
  mainWindow.webContents.send('window:maximized', maximized)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    show: false,
    frame: false,
    thickFrame: true,
    roundedCorners: false,
    title: 'FARADAY USB Console',
    backgroundColor: '#020305',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.setMenu(null)
  mainWindow.setMenuBarVisibility(false)

  mainWindow.on('maximize', sendMaximizedState)
  mainWindow.on('unmaximize', sendMaximizedState)
  mainWindow.on('enter-full-screen', sendMaximizedState)
  mainWindow.on('leave-full-screen', sendMaximizedState)
  mainWindow.on('resize', sendMaximizedState)

  const isDev = !app.isPackaged
  if (isDev) {
    void mainWindow.loadURL('http://localhost:5173')
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })
}

async function writeLine(line) {
  if (!port?.isOpen) throw new Error('Serial port not open')
  await new Promise((resolve, reject) => {
    port.write(`${line}\n`, (err) => (err ? reject(err) : resolve(undefined)))
  })
  await new Promise((resolve, reject) => {
    port.drain((err) => (err ? reject(err) : resolve(undefined)))
  })
}

/** Write a length-prefixed UNSIGNED frame (header line + raw JSON body + newline). */
async function writeUnsignedFrame(header, body) {
  if (!port?.isOpen) throw new Error('Serial port not open')
  await new Promise((resolve, reject) => {
    port.write(`${header}\n${body}\n`, (err) => (err ? reject(err) : resolve(undefined)))
  })
  await new Promise((resolve, reject) => {
    port.drain((err) => (err ? reject(err) : resolve(undefined)))
  })
}

ipcMain.handle('serial:list', async () => {
  const ports = await SerialPort.list()
  return ports.map((entry) => ({
    path: entry.path,
    manufacturer: entry.manufacturer ?? '',
    vendorId: entry.vendorId ?? '',
    productId: entry.productId ?? '',
  }))
})

ipcMain.handle('serial:open', async (_event, portPath) => {
  if (port?.isOpen) {
    await new Promise((resolve, reject) => {
      port.close((err) => (err ? reject(err) : resolve(undefined)))
    })
  }

  port = new SerialPort({
    path: portPath,
    baudRate: 115200,
    autoOpen: false,
    dtr: false,
    rts: false,
    highWaterMark: 65536,
  })
  framer = createSerialFramer((line) => {
    mainWindow?.webContents.send('serial:line', line)
  })
  port.on('data', (chunk) => {
    framer?.push(chunk)
  })
  port.on('error', (err) => {
    console.error('[serial]', err.message)
    mainWindow?.webContents.send('serial:line', `ERROR ${err.message}`)
  })

  await new Promise((resolve, reject) => {
    port.open((err) => (err ? reject(err) : resolve(undefined)))
  })
  await new Promise((resolve) => setTimeout(resolve, 400))
  return true
})

ipcMain.handle('serial:close', async () => {
  if (port?.isOpen) {
    await new Promise((resolve, reject) => {
      port.close((err) => (err ? reject(err) : resolve(undefined)))
    })
  }
  framer?.reset()
  port = null
  framer = null
  return true
})

ipcMain.handle('serial:write', async (_event, line) => {
  await writeLine(line)
  return true
})

ipcMain.handle('serial:writeUnsigned', async (_event, { header, body }) => {
  await writeUnsignedFrame(header, body)
  return true
})

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

function isWindowExpanded() {
  if (!mainWindow) return false
  return mainWindow.isMaximized() || mainWindow.isFullScreen()
}

ipcMain.handle('window:maximize', () => {
  if (!mainWindow) return false
  if (mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false)
  } else if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
  sendMaximizedState()
  return isWindowExpanded()
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('window:isMaximized', () => isWindowExpanded())

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
