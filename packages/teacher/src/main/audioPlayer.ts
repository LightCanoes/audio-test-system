import { ipcMain, dialog } from 'electron'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'
import { platform } from 'os'
import ffmpeg from 'ffmpeg-static'
import ffprobe from 'ffprobe-static'

export class AudioPlayer {
  private process: any = null
  private audioDir: string

  constructor(appPath: string) {
    this.audioDir = join(appPath, 'assets/audio')
    this.initializeDirectory()
    this.setupIpcHandlers()
  }

  private async initializeDirectory() {
    try {
      await fs.access(this.audioDir)
    } catch {
      await fs.mkdir(this.audioDir, { recursive: true })
    }
  }

  private setupIpcHandlers() {
    // 音声ファイル一覧の取得
    ipcMain.handle('get-audio-files', async () => {
      try {
        const files = await fs.readdir(this.audioDir)
        const audioFiles = await Promise.all(
          files.map(async (filename) => {
            const path = join(this.audioDir, filename)
            const stats = await fs.stat(path)
            const duration = await this.getAudioDuration(path)
            
            return {
              id: Buffer.from(path).toString('base64'),
              name: filename,
              path,
              duration,
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

    // 新しい音声ファイルのインポート
    ipcMain.handle('import-audio-files', async () => {
      try {
        const result = await dialog.showOpenDialog({
          properties: ['openFile', 'multiSelections'],
          filters: [
            { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg'] }
          ]
        })

        if (!result.canceled && result.filePaths.length > 0) {
          const importedFiles = await Promise.all(
            result.filePaths.map(async (sourcePath) => {
              const filename = sourcePath.split(/[\\/]/).pop() as string
              const targetPath = join(this.audioDir, filename)
              await fs.copyFile(sourcePath, targetPath)
              
              const duration = await this.getAudioDuration(targetPath)
              const stats = await fs.stat(targetPath)

              return {
                id: Buffer.from(targetPath).toString('base64'),
                name: filename,
                path: targetPath,
                duration,
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

    // 音声ファイルの削除
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

    // 音声再生
    ipcMain.handle('play-audio', async (event, path: string) => {
      return this.play(path)
    })

    // 音声停止
    ipcMain.handle('stop-audio', async () => {
      return this.stop()
    })
  }

  private async getAudioDuration(filePath: string): Promise<number> {
    try {
      const { stdout } = await this.executeCommand(
        `"${ffprobe.path}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
      )
      return parseFloat(stdout.trim())
    } catch (error) {
      console.error('Failed to get audio duration:', error)
      return 0
    }
  }

  private executeCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(command, { shell: true })
      let stdout = ''
      let stderr = ''

      childProcess.stdout.on('data', (data) => {
        stdout += data
      })

      childProcess.stderr.on('data', (data) => {
        stderr += data
      })

      childProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr })
        } else {
          reject(new Error(`Process exited with code ${code}`))
        }
      })

      childProcess.on('error', reject)
    })
  }

  async play(audioPath: string): Promise<void> {
    if (!await fs.access(audioPath).then(() => true).catch(() => false)) {
      throw new Error(`Audio file not found: ${audioPath}`)
    }

    if (this.process) {
      await this.stop()
    }

    return new Promise((resolve, reject) => {
      const cmd = platform() === 'win32' ? 'start' : 'afplay'
      this.process = spawn(cmd, [audioPath])

      this.process.on('close', (code: number) => {
        this.process = null
        if (code === 0) resolve()
        else reject(new Error(`Process exited with code ${code}`))
      })

      this.process.on('error', (err: Error) => {
        this.process = null
        reject(err)
      })
    })
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill()
      this.process = null
    }
  }
}