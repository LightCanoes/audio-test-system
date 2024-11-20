import { ipcMain, dialog } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'

interface TestSequence {
  id: string
  repeatCount: number
  initialWaitTime: number
  audio1: string
  pauseTime: number
  audio2: string
  answerTime: number
  correctOption: string
}

export class SequenceManager {
  private sequencesDir: string

  constructor(appPath: string) {
    this.sequencesDir = join(appPath, 'data', 'sequences')
    this.initializeDirectory()
    this.setupIpcHandlers()
  }

  private async initializeDirectory() {
    try {
      await fs.mkdir(this.sequencesDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create sequences directory:', error)
    }
  }

  private setupIpcHandlers() {
    ipcMain.handle('save-sequence', async (event, sequence: TestSequence) => {
      try {
        const { filePath } = await dialog.showSaveDialog({
          defaultPath: join(this.sequencesDir, `sequence-${Date.now()}.json`),
          filters: [{ name: 'JSON', extensions: ['json'] }]
        })

        if (filePath) {
          await fs.writeFile(filePath, JSON.stringify(sequence, null, 2), 'utf-8')
          return { success: true, path: filePath }
        }
        return { success: false }
      } catch (error) {
        console.error('Failed to save sequence:', error)
        throw error
      }
    })

    ipcMain.handle('load-sequence', async () => {
      try {
        const { filePaths } = await dialog.showOpenDialog({
          defaultPath: this.sequencesDir,
          filters: [{ name: 'JSON', extensions: ['json'] }],
          properties: ['openFile']
        })

        if (filePaths[0]) {
          const content = await fs.readFile(filePaths[0], 'utf-8')
          return JSON.parse(content)
        }
        return null
      } catch (error) {
        console.error('Failed to load sequence:', error)
        throw error
      }
    })
  }
}