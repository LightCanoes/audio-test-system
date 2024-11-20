<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">テスト再生順序の設定</h2>
      <div class="space-x-2">
        <button 
          @click="saveSequence"
          class="inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
          保存
        </button>
        <button 
          @click="loadSequence"
          class="inline-flex items-center bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          <FolderOpenIcon class="w-4 h-4 mr-2" />
          読み込み
        </button>
        <button 
          @click="addNewSequence"
          class="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          新規追加
        </button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <!-- ... テーブルの内容は同じ ... -->
      <td class="p-2 border">
        <div class="flex space-x-2">
          <button 
            @click="playSequence(sequence)"
            class="p-1 rounded text-white"
            :class="[
              isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            ]"
            :disabled="isPlaying"
          >
            <PlayCircleIcon v-if="!isPlaying" class="w-4 h-4" />
            <StopCircleIcon v-else class="w-4 h-4" />
          </button>
          <button 
            @click="deleteSequence(sequence.id)"
            class="p-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
      </td>
    </div>
  </div>
  <div 
    v-for="sequence in sequences" 
    :key="sequence.id"
    class="p-2 border-b last:border-b-0"
  >
    <!-- ... 其他内容不变 ... -->
    <button 
      @click="playSequence(sequence)"
      :disabled="isPlaying || !sequence.audio1 || !sequence.audio2"
      class="p-1 rounded text-white"
      :class="[
        isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600',
        (!sequence.audio1 || !sequence.audio2) ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    >
      <PlayCircleIcon v-if="!isPlaying" class="w-4 h-4" />
      <StopCircleIcon v-else class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  PlayCircleIcon,
  StopCircleIcon,
  TrashIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  FolderOpenIcon
} from '@heroicons/vue/24/solid'

const sequences = ref<Array<{
  id: string
  repeatCount: number
  initialWaitTime: number
  audio1: string
  pauseTime: number
  audio2: string
  answerTime: number
  correctOption: string
}>>([])

const isPlaying = ref(false)

const addNewSequence = () => {
  sequences.value.push({
    id: Date.now().toString(),
    repeatCount: 1,
    initialWaitTime: 3,
    audio1: '',
    pauseTime: 2,
    audio2: '',
    answerTime: 5,
    correctOption: 'A'
  })
}

const playSequence = async (sequence: (typeof sequences.value)[0]) => {
  if (!sequence.audio1 || !sequence.audio2) return
  
  try {
    isPlaying.value = true
    // Play first audio
    await window.electronAPI.playAudio(sequence.audio1)
    // Wait for pause time
    await new Promise(resolve => setTimeout(resolve, sequence.pauseTime * 1000))
    // Play second audio
    await window.electronAPI.playAudio(sequence.audio2)
  } catch (error) {
    console.error('Error playing sequence:', error)
  } finally {
    isPlaying.value = false
  }
}

const saveSequence = async () => {
  try {
    // Convert sequences to a simpler structure before saving
    const sequenceData = sequences.value.map(seq => ({
      ...seq,
      audio1: seq.audio1 || '',
      audio2: seq.audio2 || ''
    }))
    await window.electronAPI.saveSequence(sequenceData)
  } catch (error) {
    console.error('Error saving sequence:', error)
  }
}
  
  const loadSequence = async () => {
    try {
      const loaded = await window.electronAPI.loadSequence()
      if (loaded) {
        sequences.value = loaded
      }
    } catch (error) {
      console.error('Error loading sequence:', error)
    }
  }
  
  // 初期化時に音声ファイル一覧を取得
  onMounted(async () => {
    try {
      audioFiles.value = await window.electronAPI.getAudioFiles()
    } catch (error) {
      console.error('Error loading audio files:', error)
    }
  })
  </script>