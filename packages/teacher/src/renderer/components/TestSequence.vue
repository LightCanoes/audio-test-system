<template>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">テスト再生順序の設定</h2>
        <div class="space-x-2">
          <button 
            @click="saveSequence"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            保存
          </button>
          <button 
            @click="loadSequence"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            読み込み
          </button>
          <button 
            @click="addNewSequence"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            新規追加
          </button>
        </div>
      </div>
  
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 border">繰り返し回数</th>
              <th class="p-2 border">開始待ち時間</th>
              <th class="p-2 border">音源1</th>
              <th class="p-2 border">休止時間</th>
              <th class="p-2 border">音源2</th>
              <th class="p-2 border">回答時間</th>
              <th class="p-2 border">正解選択肢</th>
              <th class="p-2 border">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sequence in sequences" :key="sequence.id">
              <td class="p-2 border">
                <input 
                  type="number" 
                  v-model="sequence.repeatCount"
                  class="w-20 p-1 border rounded"
                  min="1"
                />
              </td>
              <td class="p-2 border">
                <input 
                  type="number" 
                  v-model="sequence.initialWaitTime"
                  class="w-20 p-1 border rounded"
                  min="0"
                  step="0.1"
                />
              </td>
              <td class="p-2 border">
                <select 
                  v-model="sequence.audio1"
                  class="w-full p-1 border rounded"
                >
                  <option v-for="file in audioFiles" :key="file.id" :value="file.path">
                    {{ file.name }}
                  </option>
                </select>
              </td>
              <td class="p-2 border">
                <input 
                  type="number" 
                  v-model="sequence.pauseTime"
                  class="w-20 p-1 border rounded"
                  min="0"
                  step="0.1"
                />
              </td>
              <td class="p-2 border">
                <select 
                  v-model="sequence.audio2"
                  class="w-full p-1 border rounded"
                >
                  <option v-for="file in audioFiles" :key="file.id" :value="file.path">
                    {{ file.name }}
                  </option>
                </select>
              </td>
              <td class="p-2 border">
                <input 
                  type="number" 
                  v-model="sequence.answerTime"
                  class="w-20 p-1 border rounded"
                  min="0"
                  step="0.1"
                />
              </td>
              <td class="p-2 border">
                <select 
                  v-model="sequence.correctOption"
                  class="w-20 p-1 border rounded"
                >
                  <option v-for="option in ['A', 'B', 'C', 'D']" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </td>
              <td class="p-2 border">
                <div class="flex space-x-2">
                  <button 
                    @click="playSequence(sequence)"
                    class="p-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                    :disabled="isPlaying"
                  >
                    <PlayIcon v-if="!isPlaying" class="w-4 h-4" />
                    <PauseIcon v-else class="w-4 h-4" />
                  </button>
                  <button 
                    @click="deleteSequence(sequence.id)"
                    class="p-1 rounded bg-red-500 text-white hover:bg-red-600"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { PlayIcon, PauseIcon, TrashIcon } from '@heroicons/vue/solid'
  
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