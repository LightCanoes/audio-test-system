import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { AudioManager } from './audioManager'
import { TestManager } from './testManager'

let mainWindow: BrowserWindow | null = null
let testWindow: BrowserWindow | null = null
let audioManager: AudioManager | null = null
let testManager: TestManager | null = null

const createMainWindow = () => {
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

const createTestWindow = async (testData: any) => {
  if (testWindow) {
    testWindow.focus()
    return
  }

  testWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js')
    }
  })

  if (!app.isPackaged) {
    await testWindow.loadURL('http://localhost:5173/#/test')
    testWindow.webContents.openDevTools()
  } else {
    await testWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: 'test'
    })
  }

  // 发送测试数据到新窗口
  testWindow.webContents.send('init-test-data', testData)

  testWindow.on('closed', () => {
    testWindow = null
    // 通知服务器测试结束
    testManager?.endTest()
  })
}

app.whenReady().then(() => {
  createMainWindow()
  
  // 初始化管理器
  audioManager = new AudioManager(app.getPath('userData'))
  testManager = new TestManager()
  
  // 设置IPC处理程序
  setupIpcHandlers()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

const setupIpcHandlers = () => {
  // 创建测试窗口
  ipcMain.handle('create-test-window', async (event, testData) => {
    await createTestWindow(testData)
  })

  // 广播测试状态更新
  ipcMain.handle('broadcast-test-state', (event, state) => {
    if (testWindow) {
      testWindow.webContents.send('test-state-update', state)
    }
  })
}