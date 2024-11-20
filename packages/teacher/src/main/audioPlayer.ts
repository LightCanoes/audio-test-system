import { ipcMain, dialog } from 'electron'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'
import { platform } from 'os'

export class AudioPlayer {
  private process: any = null
  private isPaused: boolean = false
  private audioDir: string

  constructor(appPath: string) {
    this.audioDir = join(appPath, 'assets/audio')
    this.initializeDirectory()
    this.setupIpcHandlers()
  }

  private async initializeDirectory() {
    try {
      await fs.mkdir(this.audioDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create audio directory:', error)
    }
  }

  private setupIpcHandlers() {
    // Get audio files list
    ipcMain.handle('get-audio-files', async () => {
      try {
        const files = await fs.readdir(this.audioDir)
        const audioFiles = await Promise.all(
          files.map(async (filename) => {
            const path = join(this.audioDir, filename)
            const stats = await fs.stat(path)
            return {
              id: Buffer.from(path).toString('base64'),
              name: filename,
              path,
              duration: 0, // TODO: implement duration calculation if needed
              size: stats.size
            }
          })
        )
        return audioFiles
      } catch (error) {
        console.error('Failed to get audio files:', error)
        throw error
      }
    })

    // Import audio files
    ipcMain.handle('import-audio-files', async () => {
      try {
        const result = await dialog.showOpenDialog({
          properties: ['openFile', 'multiSelections'],
          filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] }]
        })

        if (!result.canceled && result.filePaths.length > 0) {
          const importedFiles = await Promise.all(
            result.filePaths.map(async (sourcePath) => {
              const filename = sourcePath.split(/[\\/]/).pop() as string
              const targetPath = join(this.audioDir, filename)
              await fs.copyFile(sourcePath, targetPath)
              const stats = await fs.stat(targetPath)
              
              return {
                id: Buffer.from(targetPath).toString('base64'),
                name: filename,
                path: targetPath,
                duration: 0, // TODO: implement duration calculation if needed
                size: stats.size
              }
            })
          )
          return importedFiles
        }
        return null
      } catch (error) {
        console.error('Failed to import audio files:', error)
        throw error
      }
    })

    // Delete audio file
    ipcMain.handle('delete-audio-file', async (event, fileId: string) => {
      try {
        const filePath = Buffer.from(fileId, 'base64').toString()
        await fs.unlink(filePath)
        return true
      } catch (error) {
        console.error('Failed to delete audio file:', error)
        throw error
      }
    })

    // Play audio
    ipcMain.handle('play-audio', async (event, audioPath: string) => {
      return this.play(audioPath)
    })

    // Pause audio
    ipcMain.handle('pause-audio', async () => {
      return this.pause()
    })

    // Resume audio
    ipcMain.handle('resume-audio', async () => {
      return this.resume()
    })

    // Stop audio
    ipcMain.handle('stop-audio', async () => {
      return this.stop()
    })
  }

  // Play audio
  private async play(audioPath: string): Promise<void> {
    if (this.process) {
      await this.stop()
    }

    return new Promise((resolve, reject) => {
      try {
        const cmd = platform() === 'win32' ? 'start' : 'afplay'
        this.process = spawn(cmd, [audioPath])
        this.isPaused = false

        this.process.on('close', (code: number) => {
          this.process = null
          if (code === 0) resolve()
          else reject(new Error(`Process exited with code ${code}`))
        })

        this.process.on('error', (err: Error) => {
          this.process = null
          reject(err)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  // Pause audio
  private async pause(): Promise<void> {
    if (this.process && !this.isPaused) {
      if (platform() === 'win32') {
        this.process.kill('SIGSTOP')
      } else {
        process.kill(this.process.pid, 'SIGSTOP')
      }
      this.isPaused = true
    }
  }

  // Resume audio
  private async resume(): Promise<void> {
    if (this.process && this.isPaused) {
      if (platform() === 'win32') {
        this.process.kill('SIGCONT')
      } else {
        process.kill(this.process.pid, 'SIGCONT')
      }
      this.isPaused = false
    }
  }

  // Stop audio
  private async stop(): Promise<void> {
    if (this.process) {
      this.process.kill()
      this.process = null
      this.isPaused = false
    }
  }
}