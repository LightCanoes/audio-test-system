<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-2">
      <div 
        class="w-3 h-3 rounded-full"
        :class="statusClass"
      ></div>
      <span class="text-sm font-medium">{{ statusText }}</span>
    </div>
    <div v-if="studentId" class="text-sm text-gray-500">
      ID: {{ studentId }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConnectionStatus } from '../types'

const props = defineProps<{
  status: ConnectionStatus
  studentId: string
}>()

const statusClass = computed(() => ({
  'bg-green-500': props.status === 'connected',
  'bg-yellow-500': props.status === 'connecting',
  'bg-red-500': props.status === 'disconnected'
}))

const statusText = computed(() => {
  switch (props.status) {
    case 'connected': return '接続済み'
    case 'connecting': return '接続中...'
    case 'disconnected': return '接続が切断されました'
    default: return '未確認'
  }
})
</script>
