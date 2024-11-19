import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { platform } from 'os'

export class AudioPlayer {
  private process: any = null

  async play(audioPath: string) {
    if (!existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`)
    }

    if (this.process) {
      await this.stop()
    }

    return new Promise((resolve, reject) => {
      const cmd = platform() === 'darwin' ? 'afplay' : 'start'
      this.process = spawn(cmd, [audioPath])

      this.process.on('close', (code: number) => {
        this.process = null
        if (code === 0) resolve(null)
        else reject(new Error(`Process exited with code ${code}`))
      })

      this.process.on('error', (err: Error) => {
        this.process = null
        reject(err)
      })
    })
  }

  async stop() {
    if (this.process) {
      this.process.kill()
      this.process = null
    }
  }
}
