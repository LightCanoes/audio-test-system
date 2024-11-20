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

  
  interface AudioFile {
    id: string
    name: string
    path: string
  }
  
  interface Sequence {
    id: string
    repeatCount: number
    initialWaitTime: number
    audio1: string
    pauseTime: number
    audio2: string
    answerTime: number
    correctOption: string
  }
  
  const sequences = ref<Sequence[]>([])
  const audioFiles = ref<AudioFile[]>([])
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
  
  const deleteSequence = (id: string) => {
    sequences.value = sequences.value.filter(seq => seq.id !== id)
  }
  
  const playSequence = async (sequence: Sequence) => {
    try {
      isPlaying.value = true
      
      // Play first audio
      await window.electronAPI.playAudio(sequence.audio1)
      await new Promise(resolve => setTimeout(resolve, sequence.pauseTime * 1000))
      
      // Play second audio
      await window.electronAPI.playAudio(sequence.audio2)
      
      isPlaying.value = false
    } catch (error) {
      console.error('Error playing sequence:', error)
      isPlaying.value = false
    }
  }
  
  const saveSequence = async () => {
    try {
      await window.electronAPI.saveSequence(sequences.value)
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