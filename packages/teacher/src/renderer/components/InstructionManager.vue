<template>
    <div class="bg-white shadow rounded-lg p-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">教示文管理</h2>
        <button
          @click="openDialog(null)"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          <span class="flex items-center">
            <PlusIcon class="w-4 h-4 mr-2" />
            新規作成
          </span>
        </button>
      </div>
  
      <div class="space-y-4">
        <div
          v-for="instruction in instructions"
          :key="instruction.id"
          class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="font-medium">{{ instruction.title }}</h3>
              <p class="mt-2 text-sm text-gray-600 whitespace-pre-line">
                {{ instruction.content }}
              </p>
            </div>
            <div class="flex space-x-2 ml-4">
              <button
                @click="openDialog(instruction)"
                class="p-2 rounded text-gray-600 hover:bg-gray-200"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                @click="deleteInstruction(instruction.id)"
                class="p-2 rounded text-red-600 hover:bg-red-100"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
  
        <div v-if="instructions.length === 0" class="text-center py-8 text-gray-500">
          教示文がありません
        </div>
      </div>
  
      <!-- 編集ダイアログ -->
      <div
        v-if="showDialog"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        @click.self="closeDialog"
      >
        <div class="bg-white rounded-lg max-w-lg w-full p-6">
          <h3 class="text-lg font-medium mb-4">
            {{ editingInstruction ? '教示文の編集' : '新規教示文の作成' }}
          </h3>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                タイトル
              </label>
              <input
                v-model="formData.title"
                type="text"
                required
                class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="教示文のタイトルを入力"
              />
            </div>
  
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                内容
              </label>
              <textarea
                v-model="formData.content"
                required
                rows="8"
                class="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="教示文の内容を入力"
              ></textarea>
            </div>
  
            <div class="flex justify-end space-x-2">
              <button
                type="button"
                @click="closeDialog"
                class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/outline'
  
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