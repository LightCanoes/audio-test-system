<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
      <!-- 接続状態 -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div 
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-green-500': connectionStatus === 'connected',
              'bg-yellow-500': connectionStatus === 'connecting',
              'bg-red-500': connectionStatus === 'disconnected'
            }"
          ></div>
          <span class="text-sm">
            {{ connectionStatusText }}
          </span>
        </div>
        <div v-if="studentId" class="text-sm text-gray-500">
          ID: {{ studentId }}
        </div>
      </div>

      <!-- テスト進行中 -->
      <div v-if="testState === 'started'" class="mt-6 space-y-6">
        <!-- プログレスバー -->
        <div class="space-y-2">
          <div class="flex justify-between text-sm text-gray-600">
            <span>設問</span>
            <span>{{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- 解答 -->
        <div v-if="!hasAnswered" class="space-y-4">
          <div class="text-center">
            <h3 class="text-lg font-medium">答えを選んでください</h3>
            <p class="text-sm text-gray-500 mt-1">一度選択すると変更できません</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <button
              v-for="option in ['A', 'B', 'C', 'D']"
              :key="option"
              @click="submitAnswer(option)"
              class="p-4 text-center rounded-lg border-2 transition-colors hover:border-blue-500 hover:bg-blue-50"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-600">
          回答を送信しました。次の問題までお待ちください。
        </div>
      </div>

      <!-- テスト開始待ち -->
      <div v-else class="mt-6 text-center py-8 text-gray-600">
        テストを開始するまでお待ちください。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { WebSocketHandler } from './utils/websocket'

// ステータス管理
const connectionStatus = ref('connecting')
const studentId = ref('')
const testState = ref('waiting')
const currentQuestionIndex = ref(0)
const totalQuestions = ref(0)
const hasAnswered = ref(false)
let ws = null

// 現在の接続状態を表示
const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected': return '接続済み'
    case 'connecting': return '接続中...'
    case 'disconnected': return '接続が切断されました'
    default: return '未確認'
  }
})

onMounted(() => {
  ws = new WebSocketHandler('ws://localhost:8080')
  
  ws.on('student-id', (message) => {
    studentId.value = message.id
  })

  ws.on('test-start', (message) => {
    testState.value = 'started'
    currentQuestionIndex.value = 0
    totalQuestions.value = message.test.questions.length
    hasAnswered.value = false
  })

  ws.on('question-start', (message) => {
    currentQuestionIndex.value = message.questionIndex
    hasAnswered.value = false
  })

  ws.on('test-end', () => {
    testState.value = 'waiting'
    hasAnswered.value = false
  })

  ws.on('connection-status', (status) => {
    connectionStatus.value = status
  })

  ws.connect()
})

const submitAnswer = (option) => {
  if (!ws || hasAnswered.value) return

  ws.send({
    type: 'submit-answer',
    answer: {
      questionId: currentQuestionIndex.value,
      option,
      timestamp: Date.now()
    }
  })

  hasAnswered.value = true
}
</script>