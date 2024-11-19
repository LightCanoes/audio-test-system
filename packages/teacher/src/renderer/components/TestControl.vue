<template>
  <div class="bg-white shadow rounded-lg p-4">
    <h2 class="text-xl font-bold mb-4">テスト制御</h2>
    
    <!-- テスト情報 -->
    <div class="mb-4">
      <div class="flex justify-between items-center text-sm text-gray-600">
        <span>現在のテスト：{{ currentTest.name }}</span>
        <span>問題：{{ currentQuestionIndex + 1 }} / {{ currentTest.questions.length }}</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all" 
          :style="{ width: `${(currentQuestionIndex + 1) / currentTest.questions.length * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- 制御ボタン -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <button
        @click="$emit('start-test')"
        :disabled="isPlaying"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        テスト開始
      </button>
      <button
        @click="$emit('pause-test')"
        :disabled="!isPlaying"
        class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        一時停止
      </button>
      <button
        @click="$emit('stop-test')"
        :disabled="!isPlaying && !isPaused"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        テスト終了
      </button>
    </div>

    <!-- 現在の問題コントロール -->
    <div v-if="isPlaying || isPaused" class="space-y-4">
      <div class="font-medium text-sm mb-2">問題の制御</div>
      <div class="grid grid-cols-2 gap-4">
        <button
          @click="$emit('replay-audio')"
          class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          音声再生
        </button>
        <button
          @click="$emit('next-question')"
          :disabled="currentQuestionIndex >= currentTest.questions.length - 1"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          次の問題
        </button>
      </div>
    </div>

    <!-- 回答提示灯制御 -->
    <div class="mt-4">
      <div class="font-medium text-sm mb-2">回答提示灯</div>
      <div class="grid grid-cols-3 gap-4">
        <button
          v-for="(label, type) in lightLabels"
          :key="type"
          @click="toggleLight(type)"
          :class="[
            'px-4 py-2 rounded-md text-white',
            getLightClass(type),
            lights[type] ? 'opacity-100' : 'opacity-50'
          ]"
        >
          {{ label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Test } from '../types'

const props = defineProps<{
  currentTest: Test
  isPlaying: boolean
  isPaused: boolean
  currentQuestionIndex: number
}>()

const emit = defineEmits<{
  (e: 'start-test'): void
  (e: 'pause-test'): void
  (e: 'stop-test'): void
  (e: 'next-question'): void
  (e: 'replay-audio'): void
  (e: 'toggle-light', type: 'correct' | 'wrong' | 'almost'): void
}>()

const lights = ref({
  correct: false,
  wrong: false,
  almost: false
})

const lightLabels = {
  correct: '正解',
  wrong: '不正解',
  almost: 'おしい'
}

const getLightClass = (type: string) => {
  const classes = {
    correct: 'bg-green-500 hover:bg-green-600',
    wrong: 'bg-red-500 hover:bg-red-600',
    almost: 'bg-yellow-500 hover:bg-yellow-600'
  }
  return classes[type as keyof typeof classes]
}

const toggleLight = (type: 'correct' | 'wrong' | 'almost') => {
  lights.value[type] = !lights.value[type]
  emit('toggle-light', type)
}
</script>
