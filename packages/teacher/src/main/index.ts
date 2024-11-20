import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { AudioPlayer } from './audioPlayer'
import { InstructionManager } from './instructionManager'
import { SequenceManager } from './sequenceManager'

let mainWindow: BrowserWindow | null = null
let audioPlayer: AudioPlayer | null = null
let instructionManager: InstructionManager | null = null
let sequenceManager: SequenceManager | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js')
    }
  })

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  
  // Initialize all managers
  const userDataPath = app.getPath('userData')
  audioPlayer = new AudioPlayer(userDataPath)
  instructionManager = new InstructionManager(userDataPath)
  sequenceManager = new SequenceManager(userDataPath)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})