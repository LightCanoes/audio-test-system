<template>
    <div class="bg-white shadow rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">答题统计</h2>
      
      <!-- 全体統計 -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-green-600">
            {{ correctRate }}%
          </div>
          <div class="text-sm text-gray-600">正答率</div>
        </div>
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">
            {{ averageTime }}s
          </div>
          <div class="text-sm text-gray-600">平均所要時間</div>
        </div>
      </div>
  
      <!-- 問題別統計 -->
      <div class="space-y-4">
        <div v-for="(stat, index) in questionStats" :key="index">
          <div class="flex justify-between text-sm mb-1">
            <span>問題 {{ index + 1 }} </span>
            <span>
              {{ stat.correct }}/{{ stat.total }}
              <span class="text-gray-500 text-xs ml-2">
                ({{ stat.total > 0 ? Math.round(stat.correct / stat.total * 100) : 0 }}%)
              </span>
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-green-600 h-2 rounded-full transition-all" 
              :style="{ width: `${stat.total > 0 ? (stat.correct / stat.total * 100) : 0}%` }"
            ></div>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            所要時間: {{ stat.averageTime.toFixed(1) }}s
          </div>
        </div>
      </div>
  
      <!-- 空状态 -->
      <div v-if="Object.keys(questionStats).length === 0" class="text-center text-gray-500 py-4">
        解答データがありません
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    correctRate: number
    averageTime: number
    questionStats: Record<number, {
      total: number
      correct: number
      averageTime: number
    }>
  }>()
  </script>