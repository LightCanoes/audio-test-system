<template>
  <div class="bg-white shadow rounded-lg p-4">
    <!-- ... その他のテンプレート内容 ... -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <button
        @click="$emit('start-test')"
        :disabled="isPlaying"
        class="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        <PlayCircleIcon class="w-4 h-4 mr-2" />
        テスト開始
      </button>
      <button
        @click="$emit('pause-test')"
        :disabled="!isPlaying"
        class="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        <PauseCircleIcon class="w-4 h-4 mr-2" />
        一時停止
      </button>
      <button
        @click="$emit('stop-test')"
        :disabled="!isPlaying && !isPaused"
        class="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        <StopCircleIcon class="w-4 h-4 mr-2" />
        テスト終了
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  PlayCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/solid'
  
  interface Instruction {
    id: string
    title: string
    content: string
  }
  
  const instructions = ref<Instruction[]>([])
  const showDialog = ref(false)
  const editingInstruction = ref<Instruction | null>(null)
  const formData = reactive({
    title: '',
    content: ''
  })
  
  // 初期化時に教示文一覧を取得
  onMounted(async () => {
    try {
      const saved = await window.electronAPI.getInstructions()
      instructions.value = saved
    } catch (error) {
      console.error('Failed to load instructions:', error)
    }
  })
  
  const openDialog = (instruction: Instruction | null) => {
    editingInstruction.value = instruction
    if (instruction) {
      formData.title = instruction.title
      formData.content = instruction.content
    } else {
      formData.title = ''
      formData.content = ''
    }
    showDialog.value = true
  }
  
  const closeDialog = () => {
    showDialog.value = false
    editingInstruction.value = null
    formData.title = ''
    formData.content = ''
  }
  
  const handleSubmit = async () => {
    try {
      if (editingInstruction.value) {
        // 既存の教示文を更新
        const updated = await window.electronAPI.updateInstruction({
          ...editingInstruction.value,
          title: formData.title,
          content: formData.content
        })
        instructions.value = instructions.value.map(item => 
          item.id === updated.id ? updated : item
        )
      } else {
        // 新規教示文を作成
        const newInstruction = await window.electronAPI.createInstruction({
          id: Date.now().toString(),
          title: formData.title,
          content: formData.content
        })
        instructions.value.push(newInstruction)
      }
      closeDialog()
    } catch (error) {
      console.error('Failed to save instruction:', error)
    }
  }
  
  const deleteInstruction = async (id: string) => {
    if (!confirm('本当に削除しますか？')) return
    
    try {
      await window.electronAPI.deleteInstruction(id)
      instructions.value = instructions.value.filter(item => item.id !== id)
    } catch (error) {
      console.error('Failed to delete instruction:', error)
    }
  }
  </script>