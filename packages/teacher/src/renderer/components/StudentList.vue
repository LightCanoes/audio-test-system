<template>
    <div class="bg-white shadow rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">生徒解答状況</h2>
      
      <!-- 生徒リスト -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="student in students"
          :key="student.id"
          class="p-3 rounded-lg text-center"
          :class="getStatusClass(student)"
        >
          <div class="font-medium">{{ student.name || `生徒${student.id}` }}</div>
          <div class="text-sm mt-1">{{ getStatusText(student) }}</div>
          <div 
            v-if="student.lastAnswer"
            class="text-xs mt-1 text-gray-500"
          >
            所要時間: {{ ((student.lastAnswer.timestamp - student.lastAnswer.startTime) / 1000).toFixed(1) }}s
          </div>
        </div>
      </div>
  
      <!-- 生徒なし -->
      <div 
        v-if="students.length === 0" 
        class="text-center text-gray-500 py-8"
      >
        接続している生徒はいません
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { Student } from '../types'
  
  defineProps<{
    students: Student[]
    currentQuestionIndex: number
  }>()
  
  const getStatusClass = (student: Student) => {
    switch (student.status) {
      case 'waiting':
        return 'bg-gray-100'
      case 'answered':
        return student.lastAnswer?.isCorrect ? 'bg-green-100' : 'bg-red-100'
      default:
        return 'bg-gray-100'
    }
  }
  
  const getStatusText = (student: Student) => {
    switch (student.status) {
      case 'waiting':
        return '解答待ち'
      case 'answered':
        return student.lastAnswer?.isCorrect ? '正解' : '不正解'
      default:
        return '不明'
    }
  }
  </script>
  