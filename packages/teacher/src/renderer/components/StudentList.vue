<template>
  <div class="bg-white shadow rounded-lg p-4">
    <h2 class="text-xl font-bold mb-4">学生解答状況</h2>
    
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="student in students"
        :key="student.id"
        :class="[
          'p-3 rounded-lg text-center',
          getStatusClass(student)
        ]"
      >
        <div class="font-medium">{{ student.name || `学生${student.id}` }}</div>
        <div class="text-sm mt-1">{{ getStatusText(student) }}</div>
        <div 
          v-if="student.lastAnswer"
          class="text-xs mt-1 text-gray-500"
        >
          所要時間: {{ getAnswerTime(student) }}s
        </div>
      </div>
    </div>

    <div 
      v-if="students.length === 0" 
      class="text-center text-gray-500 py-8"
    >
      接続している学生はいません
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Student } from '../types'

defineProps<{
  students: Student[]
}>()

const getStatusClass = (student: Student) => {
  switch (student.status) {
    case 'answered':
      return student.lastAnswer?.isCorrect 
        ? 'bg-green-100' 
        : 'bg-red-100'
    case 'answering':
      return 'bg-yellow-100'
    default:
      return 'bg-gray-100'
  }
}

const getStatusText = (student: Student) => {
  switch (student.status) {
    case 'answered':
      return student.lastAnswer?.isCorrect ? '正解' : '不正解'
    case 'answering':
      return '回答中'
    default:
      return '待機中'
  }
}

const getAnswerTime = (student: Student) => {
  if (!student.lastAnswer) return ''
  return ((student.lastAnswer.timestamp - student.lastAnswer.startTime) / 1000).toFixed(1)
}
</script>