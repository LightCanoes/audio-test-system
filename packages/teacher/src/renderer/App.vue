<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex items-center">
              <h1 class="text-xl font-bold">音響テストシステム</h1>
            </div>
          </div>
          <div class="flex items-center">
            <button
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              @click="mode = mode === 'editor' ? 'test' : 'editor'"
            >
              {{ mode === 'editor' ? 'テスト実行' : 'シーケンス編集' }}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- エディター画面 -->
      <div v-if="mode === 'editor'" class="space-y-6">
        <TestSequence @sequence-ready="handleSequenceReady" />
        <div class="grid grid-cols-2 gap-6">
          <AudioFiles />
          <InstructionManager />
        </div>
      </div>

      <!-- テスト実行画面 -->
      <div v-else class="space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <TestControl
            :current-test="currentTest"
            :is-playing="isPlaying"
            :is-paused="isPaused"
            :current-question-index="currentQuestionIndex"
            @start-test="startTest"
            @pause-test="pauseTest"
            @stop-test="stopTest"
            @next-question="nextQuestion"
            @replay-audio="replayAudio"
            @toggle-light="toggleLight"
          />
          <AnswerStats
            :correct-rate="correctRate"
            :average-time="averageTime"
            :question-stats="questionStats"
          />
        </div>
        <StudentList :students="students" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TestSequence from './components/TestSequence.vue'
import AudioFiles from './components/AudioFiles.vue'
import InstructionManager from './components/InstructionManager.vue'
import TestControl from './components/TestControl.vue'
import AnswerStats from './components/AnswerStats.vue'
import StudentList from './components/StudentList.vue'
import type { Test, Student } from './types'

const mode = ref<'editor' | 'test'>('editor')
const currentTest = ref<Test>({ id: '', name: '', questions: [] })
const isPlaying = ref(false)
const isPaused = ref(false)
const currentQuestionIndex = ref(0)
const students = ref<Student[]>([])
const websocket = ref<WebSocket | null>(null)

// 統計データ
const correctRate = computed(() => {
  // TODO: 実装
  return 0
})

const averageTime = computed(() => {
  // TODO: 実装
  return 0
})

const questionStats = computed(() => {
  // TODO: 実装
  return {}
})

// テスト制御
const handleSequenceReady = (sequence: Test) => {
  currentTest.value = sequence
  mode.value = 'test'
}

const startTest = () => {
  isPlaying.value = true
  isPaused.value = false
  // TODO: WebSocket経由で開始通知
}

const pauseTest = () => {
  isPaused.value = true
  isPlaying.value = false
  // TODO: WebSocket経由で一時停止通知
}

const stopTest = () => {
  isPlaying.value = false
  isPaused.value = false
  // TODO: WebSocket経由で終了通知
}

const nextQuestion = () => {
  currentQuestionIndex.value++
  // TODO: WebSocket経由で次の問題通知
}

const replayAudio = () => {
  // TODO: 現在の問題の音声を再生
}

const toggleLight = (type: 'correct' | 'wrong' | 'almost') => {
  // TODO: WebSocket経由で提示灯状態を通知
}

// WebSocket接続
onMounted(() => {
  // TODO: WebSocket接続の確立
})

onUnmounted(() => {
  // TODO: WebSocket接続のクリーンアップ
})
</script>