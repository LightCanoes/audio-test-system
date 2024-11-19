/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  electronAPI: {
    playAudio: (file: string) => Promise<void>
    stopAudio: () => Promise<void>
  }
}
