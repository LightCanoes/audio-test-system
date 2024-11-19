"use strict";
const electron = require("electron");
const require$$1 = require("path");
const child_process = require("child_process");
const fs = require("fs");
const require$$0 = require("os");
var ffprobeStatic = {};
var os = require$$0;
var path = require$$1;
var platform = os.platform();
if (platform !== "darwin" && platform !== "linux" && platform !== "win32") {
  console.error("Unsupported platform.");
  process.exit(1);
}
var arch = os.arch();
if (platform === "darwin" && arch !== "x64" && arch !== "arm64") {
  console.error("Unsupported architecture.");
  process.exit(1);
}
var ffprobePath = path.join(
  __dirname,
  "bin",
  platform,
  arch,
  platform === "win32" ? "ffprobe.exe" : "ffprobe"
);
ffprobeStatic.path = ffprobePath;
class AudioPlayer {
  process = null;
  audioDir;
  constructor(appPath) {
    this.audioDir = require$$1.join(appPath, "assets/audio");
    this.initializeDirectory();
    this.setupIpcHandlers();
  }
  async initializeDirectory() {
    try {
      await fs.promises.access(this.audioDir);
    } catch {
      await fs.promises.mkdir(this.audioDir, { recursive: true });
    }
  }
  setupIpcHandlers() {
    electron.ipcMain.handle("get-audio-files", async () => {
      try {
        const files = await fs.promises.readdir(this.audioDir);
        const audioFiles = await Promise.all(
          files.map(async (filename) => {
            const path2 = require$$1.join(this.audioDir, filename);
            const stats = await fs.promises.stat(path2);
            const duration = await this.getAudioDuration(path2);
            return {
              id: Buffer.from(path2).toString("base64"),
              name: filename,
              path: path2,
              duration,
              size: stats.size
            };
          })
        );
        return audioFiles;
      } catch (error) {
        console.error("Failed to get audio files:", error);
        throw error;
      }
    });
    electron.ipcMain.handle("import-audio-files", async () => {
      try {
        const result = await electron.dialog.showOpenDialog({
          properties: ["openFile", "multiSelections"],
          filters: [
            { name: "Audio Files", extensions: ["mp3", "wav", "ogg"] }
          ]
        });
        if (!result.canceled && result.filePaths.length > 0) {
          const importedFiles = await Promise.all(
            result.filePaths.map(async (sourcePath) => {
              const filename = sourcePath.split(/[\\/]/).pop();
              const targetPath = require$$1.join(this.audioDir, filename);
              await fs.promises.copyFile(sourcePath, targetPath);
              const duration = await this.getAudioDuration(targetPath);
              const stats = await fs.promises.stat(targetPath);
              return {
                id: Buffer.from(targetPath).toString("base64"),
                name: filename,
                path: targetPath,
                duration,
                size: stats.size
              };
            })
          );
          return importedFiles;
        }
        return null;
      } catch (error) {
        console.error("Failed to import audio files:", error);
        throw error;
      }
    });
    electron.ipcMain.handle("delete-audio-file", async (event, fileId) => {
      try {
        const filePath = Buffer.from(fileId, "base64").toString();
        await fs.promises.unlink(filePath);
        return true;
      } catch (error) {
        console.error("Failed to delete audio file:", error);
        throw error;
      }
    });
    electron.ipcMain.handle("play-audio", async (event, path2) => {
      return this.play(path2);
    });
    electron.ipcMain.handle("stop-audio", async () => {
      return this.stop();
    });
  }
  async getAudioDuration(filePath) {
    try {
      const { stdout } = await this.executeCommand(
        `"${ffprobeStatic.path}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
      );
      return parseFloat(stdout.trim());
    } catch (error) {
      console.error("Failed to get audio duration:", error);
      return 0;
    }
  }
  executeCommand(command) {
    return new Promise((resolve, reject) => {
      const childProcess = child_process.spawn(command, { shell: true });
      let stdout = "";
      let stderr = "";
      childProcess.stdout.on("data", (data) => {
        stdout += data;
      });
      childProcess.stderr.on("data", (data) => {
        stderr += data;
      });
      childProcess.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
      childProcess.on("error", reject);
    });
  }
  async play(audioPath) {
    if (!await fs.promises.access(audioPath).then(() => true).catch(() => false)) {
      throw new Error(`Audio file not found: ${audioPath}`);
    }
    if (this.process) {
      await this.stop();
    }
    return new Promise((resolve, reject) => {
      const cmd = require$$0.platform() === "win32" ? "start" : "afplay";
      this.process = child_process.spawn(cmd, [audioPath]);
      this.process.on("close", (code) => {
        this.process = null;
        if (code === 0) resolve();
        else reject(new Error(`Process exited with code ${code}`));
      });
      this.process.on("error", (err) => {
        this.process = null;
        reject(err);
      });
    });
  }
  async stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}
let mainWindow = null;
const createWindow = () => {
  mainWindow = new electron.BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: require$$1.join(__dirname, "../preload/index.js")
    }
  });
  if (!electron.app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(require$$1.join(__dirname, "../renderer/index.html"));
  }
};
electron.app.whenReady().then(() => {
  createWindow();
  new AudioPlayer(electron.app.getPath("userData"));
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
