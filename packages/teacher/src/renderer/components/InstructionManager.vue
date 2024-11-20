
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon
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