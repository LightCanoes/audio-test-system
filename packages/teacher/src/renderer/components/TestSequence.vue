<template>
  <div class="p-6 space-y-6">
    <!-- 序列管理 -->
    <div class="bg-white rounded-lg shadow p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">テスト再生順序の設定</h2>
        <div class="space-x-2">
          <button 
            @click="handleSaveAll"
            class="inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
            保存
          </button>
          <button 
            @click="handleLoadAll"
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
          <button 
            @click="startTest"
            class="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <PlayIcon class="w-4 h-4 mr-2" />
            テスト実行
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-2 border">順序</th>
              <th class="p-2 border">繰り返し回数</th>
              <th class="p-2 border">開始待ち時間</th>
              <th class="p-2 border">音源1</th>
              <th class="p-2 border">休止時間</th>
              <th class="p-2 border">音源2</th>
              <th class="p-2 border">回答時間</th>
              <th class="p-2 border">正解選択肢</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(sequence, index) in sequences" 
              :key="sequence.id"
              :class="{ 'bg-gray-50': index % 2 === 0 }"
            >
              <td class="p-2 border text-center">{{ index + 1 }}</td>
              <td class="p-2 border">
                <input 
                  type="number" 
                  v-model.number="sequence.repeatCount"
                  class="w-20 p-1 border rounded"
                  min="1"
                />
              </td>
              <td class="p-2 border">
                <input 
                  type="number" 
                  v-model.number="sequence.initialWaitTime"
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
                  <option value="">選択してください</option>
                  <option v-for="file in audioFiles" :key="file.id" :value="file.path">
                    {{ file.name }}
                  </option>
                </select>
              </td>
              <td class="p-2 border">
                <input 
                  type="number" 
                  v-model.number="sequence.pauseTime"
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
                  <option value="">選択してください</option>
                  <option v-for="file in audioFiles" :key="file.id" :value="file.path">
                    {{ file.name }}
                  </option>
                </select>
              </td>
              <td class="p-2 border">
                <input 
                  type="number" 
                  v-model.number="sequence.answerTime"
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
                  <option v-for="option in answerOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 下半部分布局 -->
    <div class="grid grid-cols-2 gap-6">
      <!-- 音声ファイル管理 -->
      <AudioFiles />

      <!-- 基本設定（タブ付き） -->
      <div class="bg-white rounded-lg shadow">
        <div class="border-b">
          <nav class="flex">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              class="px-4 py-2 border-b-2 font-medium text-sm"
              :class="[
                currentTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <div class="p-4">
          <!-- 回答選択肢設定 -->
          <div v-if="currentTab === 'options'" class="space-y-2">
            <div v-for="(option, index) in answerOptions" :key="option.value" 
                 class="flex items-center gap-2">
              <input
                type="text"
                v-model="option.label"
                class="w-32 p-2 border rounded"
                :placeholder="option.value"
              />
              <button
                v-if="answerOptions.length > 2"
                @click="removeAnswerOption(index)"
                class="px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600"
              >
                削除
              </button>
            </div>
            <button
              @click="addAnswerOption"
              class="w-full py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <PlusIcon class="w-5 h-5" />
              選択肢を追加
            </button>
          </div>

          <!-- 教示文設定 -->
          <div v-if="currentTab === 'instruction'" class="space-y-2">
            <textarea
              v-model="instruction"
              rows="8"
              class="w-full p-2 border rounded"
              placeholder="教示文の内容"
            ></textarea>
          </div>

          <!-- 提示灯設定 -->
          <div v-if="currentTab === 'lights'" class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="block text-sm">
                音源提示灯（音源1/音源2）
              </label>
              <input
                type="checkbox"
                v-model="lightSettings.showPlayingIndicator"
                class="form-checkbox h-5 w-5"
              />
            </div>
            <div class="flex items-center justify-between">
              <label class="block text-sm">
                正解提示灯
              </label>
              <input
                type="checkbox"
                v-model="lightSettings.showCorrectLight"
                class="form-checkbox h-5 w-5"
              />
            </div>
            <div class="flex items-center justify-between">
              <label class="block text-sm">
                不正解提示灯
              </label>
              <input
                type="checkbox"
                v-model="lightSettings.showWrongLight"
                class="form-checkbox h-5 w-5"
              />
            </div>
            <div class="flex items-center justify-between">
              <label class="block text-sm">
                おしい提示灯
              </label>
              <input
                type="checkbox"
                v-model="lightSettings.showAlmostLight"
                class="form-checkbox h-5 w-5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  PlayIcon,
  DocumentArrowDownIcon,
  FolderOpenIcon,
  PlusIcon
} from '@heroicons/vue/24/solid'
import AudioFiles from '../components/AudioFiles.vue'

interface AudioFile {
  id: string
  name: string
  path: string
  duration: number
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

interface AnswerOption {
  value: string
  label: string
}

// 状态管理
const sequences = ref<Sequence[]>([])
const audioFiles = ref<AudioFile[]>([])
const answerOptions = ref<AnswerOption[]>([
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' }
])

// 选项卡管理
const tabs = [
  { id: 'options', name: '回答選択肢' },
  { id: 'instruction', name: '教示文' },
  { id: 'lights', name: '提示灯' }
]
const currentTab = ref('options')

// 教示文
const instruction = ref('')

// 提示灯设置
const lightSettings = ref({
  showPlayingIndicator: true,
  showCorrectLight: true,
  showWrongLight: true,
  showAlmostLight: true
})

// 选项管理
const addAnswerOption = () => {
  const lastOption = answerOptions.value[answerOptions.value.length - 1]
  const lastValue = lastOption.value
  let nextValue: string
  
  if (lastValue === 'Z') {
    nextValue = '1'
  } else if (/^\d+$/.test(lastValue)) {
    nextValue = String(parseInt(lastValue) + 1)
  } else {
    nextValue = String.fromCharCode(lastValue.charCodeAt(0) + 1)
  }
  
  answerOptions.value.push({ value: nextValue, label: nextValue })
}

const removeAnswerOption = (index: number) => {
  if (answerOptions.value.length > 2) {
    answerOptions.value.splice(index, 1)
  }
}

// 序列管理
const addNewSequence = () => {
  sequences.value.push({
    id: Date.now().toString(),
    repeatCount: 1,
    initialWaitTime: 3,
    audio1: '',
    pauseTime: 2,
    audio2: '',
    answerTime: 5,
    correctOption: answerOptions.value[0].value
  })
}

const handleSaveAll = async () => {
  try {
    const data = {
      sequences: sequences.value,
      options: answerOptions.value,
      instruction,
      lightSettings: lightSettings.value
    }
    await window.electronAPI.saveSequence(data)
  } catch (error) {
    console.error('Error saving data:', error)
  }
}

const handleLoadAll = async () => {
  try {
    const data = await window.electronAPI.loadSequence()
    if (data) {
      sequences.value = data.sequences || []
      answerOptions.value = data.options || [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' }
      ]
      instruction.value = data.instruction || ''
      lightSettings.value = data.lightSettings || {
        showPlayingIndicator: true,
        showCorrectLight: true,
        showWrongLight: true,
        showAlmostLight: true
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

const startTest = async () => {
  try {
    const testData = {
      sequences: sequences.value,
      options: answerOptions.value,
      instruction: instruction.value,
      lightSettings: lightSettings.value
    }
    await window.electronAPI.createTestWindow(testData)
  } catch (error) {
    console.error('Error starting test:', error)
  }
}

// 初始化
onMounted(async () => {
  try {
    const files = await window.electronAPI.getAudioFiles()
    audioFiles.value = files
  } catch (error) {
    console.error('Error loading audio files:', error)
  }
})
</script>