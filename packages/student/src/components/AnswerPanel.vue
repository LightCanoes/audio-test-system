<template>
  <div>
    <h3 class="text-lg font-medium text-center mb-4">
      答えを選んでください
    </h3>
    <div class="grid grid-cols-2 gap-4">
      <button
        v-for="option in options"
        :key="option"
        @click="$emit('submit', option)"
        :disabled="disabled"
        class="p-4 text-center rounded-lg border-2 transition-colors"
        :class="[
          disabled 
            ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
            : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
        ]"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: string[]
  disabled: boolean
}>()

defineEmits<{
  (e: 'submit', option: string): void
}>()
</script>
