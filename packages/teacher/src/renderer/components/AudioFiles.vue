<template>
    <div class="bg-white shadow rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">音声ファイル</h2>
      
      <!-- ファイルリスト -->
      <div class="space-y-2">
        <div 
          v-for="file in audioFiles" 
          :key="file.id"
          class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
          :class="{ 'bg-blue-50': currentFile === file.path }"
        >
          <span class="text-sm">{{ file.name }}</span>
          <div class="flex space-x-2">
            <!-- 試聴ボタン -->
            <button 
              @click="$emit('select-file', file)"
              class="text-blue-500 hover:text-blue-700 text-sm px-3 py-1 rounded-md border border-blue-500 hover:border-blue-700 transition-colors"
            >
              試聴
            </button>
          </div>
        </div>
      </div>
  
      <!-- 再生状態 -->
      <div v-if="currentFile" class="mt-4 text-sm text-gray-600">
        再生中: {{ audioFiles.find(f => f.path === currentFile)?.name }}
      </div>
  
      <!-- ファイルなし -->
      <div v-if="audioFiles.length === 0" class="text-center text-gray-500 py-4">
        音声ファイルがありません
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  interface AudioFile {
    id: number
    name: string
    path: string
  }
  
  defineProps<{
    audioFiles: AudioFile[]
    currentFile: string
  }>()
  
  defineEmits<{
    (e: 'select-file', file: AudioFile): void
  }>()
  </script>