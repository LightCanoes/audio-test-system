<template>
    <div class="bg-white shadow rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">テスト管理</h2>
      
      <!-- テスト情報 -->
      <div class="mb-4">
        <div class="flex justify-between items-center text-sm text-gray-600">
          <span>現在のテスト：{{ currentTest.name }}</span>
          <span>問題：{{ currentQuestionIndex + 1 }} / {{ currentTest.questions.length }}</span>
        </div>
        <!-- プログレスバー -->
        <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all" 
            :style="{ width: `${(currentQuestionIndex + 1) / currentTest.questions.length * 100}%` }"
          ></div>
        </div>
      </div>
  
      <!-- 制御ボタン -->
      <div class="flex space-x-4">
        <button
          @click="$emit('start-test')"
          :disabled="isPlaying"
          class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          テスト開始
        </button>
        <button
          @click="$emit('stop-test')"
          :disabled="!isPlaying" 
          class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          テスト終了
        </button>
        <button
          @click="$emit('next-question')"
          :disabled="!isPlaying || currentQuestionIndex >= currentTest.questions.length - 1"
          class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          次の問題
        </button>
      </div>
  
      <!-- 操作ガイド -->
      <div class="mt-4 text-sm text-gray-500">
        <p v-if="!isPlaying">「テスト開始」をクリックしてテストを開始してください</p>
        <p v-else-if="currentQuestionIndex >= currentTest.questions.length - 1">
          最後の問題です
        </p>
        <p v-else>「次の問題」をクリックして続けてください</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { Test } from '../types'
  
  defineProps<{
    currentTest: Test
    isPlaying: boolean
    currentQuestionIndex: number
  }>()
  
  defineEmits<{
    (e: 'start-test'): void
    (e: 'stop-test'): void
    (e: 'next-question'): void
  }>()
  </script>
  