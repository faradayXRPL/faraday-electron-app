const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('signerSerial', {
  listPorts: () => ipcRenderer.invoke('serial:list'),
  open: (portPath) => ipcRenderer.invoke('serial:open', portPath),
  close: () => ipcRenderer.invoke('serial:close'),
  write: (line) => ipcRenderer.invoke('serial:write', line),
  writeUnsigned: (header, body) => ipcRenderer.invoke('serial:writeUnsigned', { header, body }),
  onLine: (callback) => {
    const handler = (_event, line) => callback(line)
    ipcRenderer.on('serial:line', handler)
    return () => ipcRenderer.removeListener('serial:line', handler)
  },
})

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onMaximized: (callback) => {
    const handler = (_event, maximized) => callback(Boolean(maximized))
    ipcRenderer.on('window:maximized', handler)
    return () => ipcRenderer.removeListener('window:maximized', handler)
  },
})
