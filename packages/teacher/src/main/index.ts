import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { AudioPlayer } from './audioPlayer'

let win: BrowserWindow | null = null
let audioPlayer: AudioPlayer | null = null

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,  // ノード統合を無効化
      contextIsolation: true,  // コンテキスト分離を有効化
      preload: join(__dirname, '../preload/index.js')  // プリロードスクリプトのパス
    }
  })

  // 開発モードの場合
  if (!app.isPackaged) {
    await win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(__dirname, '../../dist/index.html'))
  }

  // オーディオプレイヤーの初期化
  audioPlayer = new AudioPlayer()

  // IPCハンドラーの設定
  setupIPCHandlers()
}

// IPCハンドラーの設定
function setupIPCHandlers() {
  ipcMain.handle('play-audio', async (event, audioFile) => {
    console.log('音声再生リクエスト:', audioFile)
    try {
      const audioPath = join(app.getAppPath(), 'assets/audio', audioFile)
      console.log('音声ファイルパス:', audioPath)
      await audioPlayer?.play(audioPath)
    } catch (error) {
      console.error('音声再生エラー:', error)
      throw error
    }
  })

  ipcMain.handle('stop-audio', async () => {
    console.log('音声停止リクエスト')
    try {
      await audioPlayer?.stop()
    } catch (error) {
      console.error('音声停止エラー:', error)
      throw error
    }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})