<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- ヘッダー -->
      <header class="bg-white shadow rounded-lg mb-6 p-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">音声テストシステム - 教師用</h1>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-500">
              接続生徒数: {{ connectedStudents.length }}
            </div>
            <div 
              class="text-sm px-2 py-1 rounded"
              :class="wsStatusClass"
            >
              {{ wsStatusText }}
            </div>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 左側コントロールパネル -->
        <div class="space-y-6">
          <TestControl 
            :currentTest="currentTest"
            :isPlaying="isPlaying"
            :currentQuestionIndex="currentQuestionIndex"
            @start-test="startTest"
            @stop-test="stopTest"
            @next-question="nextQuestion"
          />
          <AudioFiles 
            :audioFiles="audioFiles"
            :currentFile="currentAudioFile"
            @select-file="handleFileSelect"
          />
        </div>

        <!-- 右側解答状況 -->
        <div class="space-y-6">
          <StudentList
            :students="connectedStudents"
            :currentQuestionIndex="currentQuestionIndex"
          ></StudentList>
          <AnswerStats
            :correctRate="correctRate"
            :averageTime="averageTime"
            :questionStats="questionStats"
          ></AnswerStats>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TestControl from './components/TestControl.vue'
import AudioFiles from './components/AudioFiles.vue'
import StudentList from './components/StudentList.vue'
import AnswerStats from './components/AnswerStats.vue'
import type { Student, Test, Answer } from './types'

// ステート管理
const isPlaying = ref(false)
const currentQuestionIndex = ref(0)
const currentAudioFile = ref('')
const connectedStudents = ref<Student[]>([])
const wsStatus = ref<'connecting' | 'connected' | 'disconnected'>('disconnected')
let ws: WebSocket | null = null
let reconnectTimeout: NodeJS.Timeout | null = null

// テスト設定
const currentTest = ref<Test>({
  id: 'test-1',
  name: '基本音声テスト',
  questions: [
    { id: 1, audioFile: 'test1.wav', correctOption: 'A' },
    { id: 2, audioFile: 'test2.wav', correctOption: 'B' },
    { id: 3, audioFile: 'test3.wav', correctOption: 'C' }
  ]
})

// 音声ファイル一覧
const audioFiles = ref([
  { id: 1, name: 'テスト音声1', path: 'test1.wav' },
  { id: 2, name: 'テスト音声2', path: 'test2.wav' },
  { id: 3, name: 'テスト音声3', path: 'test3.wav' }
])

// 問題統計データ
const questionStats = ref<Record<number, { total: number, correct: number, averageTime: number }>>({})

// WebSocket设置
function setupWebSocket() {
  if (ws) {
    ws.close()
  }

  // 修复 WebSocket URL
  ws = new WebSocket('ws://localhost:8080?type=teacher')

  ws.onopen = () => {
    console.log('WebSocket接続成功')
    wsStatus.value = 'connected'
  }

  ws.onclose = () => {
    console.log('WebSocket接続切断')
    wsStatus.value = 'disconnected'
    scheduleReconnect()
  }

  ws.onerror = (error) => {
    console.error('WebSocketエラー:', error)
    wsStatus.value = 'disconnected'
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log('受信メッセージ:', data)  // デバッグ用ログ
    handleWebSocketMessage(data)
  }
}

// 再接続スケジュール
function scheduleReconnect() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
  }
  reconnectTimeout = setTimeout(() => {
    console.log('WebSocket再接続試行')
    wsStatus.value = 'connecting'
    setupWebSocket()
  }, 3000)
}

// WebSocketステータス表示
const wsStatusClass = computed(() => {
  switch (wsStatus.value) {
    case 'connected':
      return 'bg-green-100 text-green-800'
    case 'connecting':
      return 'bg-yellow-100 text-yellow-800'
    case 'disconnected':
      return 'bg-red-100 text-red-800'
  }
})

const wsStatusText = computed(() => {
  switch (wsStatus.value) {
    case 'connected':
      return 'サーバー接続中'
    case 'connecting':
      return '接続試行中'
    case 'disconnected':
      return '未接続'
  }
})

// 統計計算
const correctRate = computed(() => {
  if (currentQuestionIndex.value < 0 || !questionStats.value[currentQuestionIndex.value]) return 0
  const stats = questionStats.value[currentQuestionIndex.value]
  return stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
})

const averageTime = computed(() => {
  if (currentQuestionIndex.value < 0 || !questionStats.value[currentQuestionIndex.value]) return 0
  return questionStats.value[currentQuestionIndex.value].averageTime
})

// WebSocketメッセージ処理
function handleWebSocketMessage(message: any) {
  console.log('メッセージ処理:', message)  // デバッグ用ログ

  switch (message.type) {
    case 'student-connected':
      console.log('生徒接続:', message.student)  // デバッグ用ログ
      connectedStudents.value.push({
        id: message.student.id,
        name: message.student.name || `生徒${message.student.id}`,
        status: message.student.status || 'waiting'
      })
      console.log('現在の生徒リスト:', connectedStudents.value)  // デバッグ用ログ
      break

    case 'student-disconnected':
      connectedStudents.value = connectedStudents.value.filter(
        student => student.id !== message.studentId
      )
      break

    case 'answer-submitted':
      handleStudentAnswer(message.studentId, message.answer)
      break
  }
}

// 生徒の解答処理
function handleStudentAnswer(studentId: string, answer: Answer) {
  const student = connectedStudents.value.find(s => s.id === studentId)
  if (student) {
    student.status = 'answered'
    student.lastAnswer = answer
  }

  if (!questionStats.value[currentQuestionIndex.value]) {
    questionStats.value[currentQuestionIndex.value] = {
      total: 0,
      correct: 0,
      averageTime: 0
    }
  }

  const stats = questionStats.value[currentQuestionIndex.value]
  stats.total++
  if (answer.option === currentTest.value.questions[currentQuestionIndex.value].correctOption) {
    stats.correct++
  }
  
  const answerTime = (answer.timestamp - answer.startTime) / 1000
  stats.averageTime = ((stats.averageTime * (stats.total - 1)) + answerTime) / stats.total
}

// テスト制御
async function startTest() {
  try {
    isPlaying.value = true
    currentQuestionIndex.value = 0
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'start-test',
        test: currentTest.value
      }))
    }

    await window.electronAPI.playAudio(
      currentTest.value.questions[currentQuestionIndex.value].audioFile
    )
  } catch (error) {
    console.error('テスト開始エラー:', error)
  }
}

async function stopTest() {
  try {
    isPlaying.value = false
    await window.electronAPI.stopAudio()
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'stop-test'
      }))
    }
  } catch (error) {
    console.error('テスト停止エラー:', error)
  }
}

async function nextQuestion() {
  try {
    if (currentQuestionIndex.value < currentTest.value.questions.length - 1) {
      currentQuestionIndex.value++
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'next-question',
          questionIndex: currentQuestionIndex.value
        }))
      }

      await window.electronAPI.playAudio(
        currentTest.value.questions[currentQuestionIndex.value].audioFile
      )
    }
  } catch (error) {
    console.error('次の問題への移動エラー:', error)
  }
}

// 音声ファイル選択
async function handleFileSelect(file: { path: string }) {
  currentAudioFile.value = file.path
  try {
    await window.electronAPI.playAudio(file.path)
  } catch (error) {
    console.error('音声ファイル再生エラー:', error)
  }
}

// ライフサイクルフック
onMounted(() => {
  setupWebSocket()
})

onUnmounted(() => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
  }
  if (ws) {
    ws.close()
  }
})
</script>