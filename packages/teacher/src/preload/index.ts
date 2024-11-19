import { contextBridge, ipcRenderer } from 'electron'

// メインプロセスとレンダラープロセス間の安全なAPI橋渡し
contextBridge.exposeInMainWorld('electronAPI', {
  // 音声再生API
  playAudio: (file: string) => {
    console.log('再生リクエスト:', file)
    return ipcRenderer.invoke('play-audio', file)
  },
  // 音声停止API
  stopAudio: () => {
    console.log('停止リクエスト')
    return ipcRenderer.invoke('stop-audio')
  }
})

// TypeScript型定義
declare global {
  interface Window {
    electronAPI: {
      playAudio: (file: string) => Promise<void>
      stopAudio: () => Promise<void>
    }
  }
}