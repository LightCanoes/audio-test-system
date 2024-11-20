<template>
  <div class="bg-white shadow rounded-lg p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">音声ファイル</h2>
      <button
        @click="importAudioFiles"
        :disabled="isImporting"
        class="inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        <span v-if="isImporting">インポート中...</span>
        <span v-else>ファイル追加</span>
      </button>
    </div>

    <div class="space-y-2">
      <div 
        v-for="file in audioFiles"
        :key="file.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
      >
        <div class="flex-1">
          <div class="font-medium">{{ file.name }}</div>
          <div class="text-sm text-gray-500">
            長さ: {{ formatDuration(file.duration) }}
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <div class="flex space-x-1">
            <button 
              v-if="isPaused && currentlyPlaying === file.id"
              @click="resumeAudio"
              class="p-2 rounded bg-green-500 text-white hover:bg-green-600"
              title="再生"
            >
              <PlayCircleIcon class="w-4 h-4" />
            </button>
            <button 
              v-else-if="currentlyPlaying === file.id"
              @click="pauseAudio"
              class="p-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
              title="一時停止"
            >
              <PauseCircleIcon class="w-4 h-4" />
            </button>
            <button
              v-if="currentlyPlaying === file.id"
              @click="stopAudio"
              class="p-2 rounded bg-red-500 text-white hover:bg-red-600"
              title="停止"
            >
              <StopCircleIcon class="w-4 h-4" />
            </button>
            <button
              v-else
              @click="playAudio(file)"
              class="p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              title="再生"
            >
              <PlayCircleIcon class="w-4 h-4" />
            </button>
          </div>
          <button
            @click="deleteAudioFile(file.id)"
            class="p-2 rounded bg-red-500 text-white hover:bg-red-600"
            title="削除"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div v-if="audioFiles.length === 0" class="text-center py-8 text-gray-500">
        音声ファイルがありません
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  PlayCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/vue/24/solid'

interface AudioFile {
  id: string
  name: string
  path: string
  duration: number
}

// 初期化
const audioFiles = ref<AudioFile[]>([])
const isImporting = ref(false)
const currentlyPlaying = ref<string | null>(null)
const isPaused = ref(false)

// 音声ファイル一覧の取得
onMounted(async () => {
  try {
    audioFiles.value = await window.electronAPI.getAudioFiles()
  } catch (error) {
    console.error('Failed to load audio files:', error)
  }
})

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const importAudioFiles = async () => {
  if (isImporting.value) return
  
  try {
    isImporting.value = true
    const newFiles = await window.electronAPI.importAudioFiles()
    if (newFiles) {
      audioFiles.value = [...audioFiles.value, ...newFiles]
    }
  } catch (error) {
    console.error('Failed to import audio files:', error)
  } finally {
    isImporting.value = false
  }
}

const playAudio = async (file: AudioFile) => {
  try {
    currentlyPlaying.value = file.id
    isPaused.value = false
    await window.electronAPI.playAudio(file.path)
    // 播放完成后重置状态
    currentlyPlaying.value = null
    isPaused.value = false
  } catch (error) {
    console.error('Failed to play audio:', error)
    currentlyPlaying.value = null
    isPaused.value = false
  }
}
const pauseAudio = async () => {
  try {
    isPaused.value = true
    await window.electronAPI.pauseAudio()
  } catch (error) {
    console.error('Failed to pause audio:', error)
  }
}

const resumeAudio = async () => {
  try {
    isPaused.value = false
    await window.electronAPI.resumeAudio()
  } catch (error) {
    console.error('Failed to resume audio:', error)
  }
}

const stopAudio = async () => {
  try {
    await window.electronAPI.stopAudio()
    currentlyPlaying.value = null
    isPaused.value = false
  } catch (error) {
    console.error('Failed to stop audio:', error)
  }
}

const deleteAudioFile = async (fileId: string) => {
  try {
    await window.electronAPI.deleteAudioFile(fileId)
    audioFiles.value = audioFiles.value.filter(file => file.id !== fileId)
  } catch (error) {
    console.error('Failed to delete audio file:', error)
  }
}
</script>