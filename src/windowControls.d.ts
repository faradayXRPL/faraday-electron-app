export type WindowControlsApi = {
  minimize: () => Promise<void>
  maximize: () => Promise<boolean>
  close: () => Promise<void>
  isMaximized: () => Promise<boolean>
  onMaximized: (callback: (maximized: boolean) => void) => () => void
}

declare global {
  interface Window {
    windowControls?: WindowControlsApi
  }
}

export {}
