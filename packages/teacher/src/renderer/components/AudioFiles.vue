<template>
  <!-- template 内容保持不变，只需更新图标名称 -->
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
          <button
            @click="playAudio(file)"
            class="p-2 rounded text-white"
            :class="[
              currentlyPlaying === file.id
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            ]"
          >
            <StopCircleIcon v-if="currentlyPlaying === file.id" class="w-4 h-4" />
            <PlayCircleIcon v-else class="w-4 h-4" />
          </button>
          <button
            @click="deleteAudioFile(file.id)"
            class="p-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  PlayCircleIcon,
  StopCircleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/vue/24/solid'

interface AudioFile {
  id: string
  name: string
  path: string
  duration: number
}

const audioFiles = ref<AudioFile[]>([])
const currentlyPlaying = ref<string | null>(null)
const isImporting = ref(false)

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
    if (currentlyPlaying.value === file.id) {
      await window.electronAPI.stopAudio()
      currentlyPlaying.value = null
    } else {
      if (currentlyPlaying.value) {
        await window.electronAPI.stopAudio()
      }
      await window.electronAPI.playAudio(file.path)
      currentlyPlaying.value = file.id
    }
  } catch (error) {
    console.error('Failed to play audio:', error)
    currentlyPlaying.value = null
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

onMounted(async () => {
  try {
    const files = await window.electronAPI.getAudioFiles()
    audioFiles.value = files
  } catch (error) {
    console.error('Failed to load audio files:', error)
  }
})
</script>