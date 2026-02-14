import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronControls', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
  close: () => ipcRenderer.invoke('window:close'),
})
