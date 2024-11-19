"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // 音声ファイル関連
  getAudioFiles: () => electron.ipcRenderer.invoke("get-audio-files"),
  importAudioFiles: () => electron.ipcRenderer.invoke("import-audio-files"),
  deleteAudioFile: (fileId) => electron.ipcRenderer.invoke("delete-audio-file", fileId),
  playAudio: (path) => electron.ipcRenderer.invoke("play-audio", path),
  stopAudio: () => electron.ipcRenderer.invoke("stop-audio"),
  // テストシーケンス関連
  saveSequence: (sequence) => electron.ipcRenderer.invoke("save-sequence", sequence),
  loadSequence: () => electron.ipcRenderer.invoke("load-sequence"),
  // 教示文関連
  getInstructions: () => electron.ipcRenderer.invoke("get-instructions"),
  createInstruction: (instruction) => electron.ipcRenderer.invoke("create-instruction", instruction),
  updateInstruction: (instruction) => electron.ipcRenderer.invoke("update-instruction", instruction),
  deleteInstruction: (id) => electron.ipcRenderer.invoke("delete-instruction", id)
});
