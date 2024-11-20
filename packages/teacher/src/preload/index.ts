import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 音声ファイル関連
  getAudioFiles: () => ipcRenderer.invoke('get-audio-files'),
  importAudioFiles: () => ipcRenderer.invoke('import-audio-files'),
  deleteAudioFile: (fileId: string) => ipcRenderer.invoke('delete-audio-file', fileId),
  playAudio: (path: string) => ipcRenderer.invoke('play-audio', path),
  pauseAudio: () => ipcRenderer.invoke('pause-audio'),
  resumeAudio: () => ipcRenderer.invoke('resume-audio'),
  stopAudio: () => ipcRenderer.invoke('stop-audio'),

  // テストシーケンス関連
  saveSequence: (sequence: any) => ipcRenderer.invoke('save-sequence', sequence),
  loadSequence: () => ipcRenderer.invoke('load-sequence'),

  // 教示文関連
  getInstructions: () => ipcRenderer.invoke('get-instructions'),
  createInstruction: (instruction: any) => ipcRenderer.invoke('create-instruction', instruction),
  updateInstruction: (instruction: any) => ipcRenderer.invoke('update-instruction', instruction),
  deleteInstruction: (id: string) => ipcRenderer.invoke('delete-instruction', id)
})

export type ElectronAPI = {
  getAudioFiles: () => Promise<Array<{
    id: string
    name: string
    path: string
    duration: number
    size: number
  }>>
  importAudioFiles: () => Promise<Array<{
    id: string
    name: string
    path: string
    duration: number
    size: number
  }> | null>
  deleteAudioFile: (fileId: string) => Promise<boolean>
  playAudio: (path: string) => Promise<void>
  stopAudio: () => Promise<void>
  saveSequence: (sequence: any) => Promise<void>
  loadSequence: () => Promise<any>
  getInstructions: () => Promise<any[]>
  createInstruction: (instruction: any) => Promise<any>
  updateInstruction: (instruction: any) => Promise<any>
  deleteInstruction: (id: string) => Promise<boolean>
}

declare global {
  interface Window {
    electronAPI: {
      // ... 其他类型 ...
      playAudio: (path: string) => Promise<void>
      pauseAudio: () => Promise<void>
      resumeAudio: () => Promise<void>
      stopAudio: () => Promise<void>
    }
  }
}