<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string | number | null
  label: string
  error?: string
  type?: string
  placeholder?: string
  id?: string
}>(), {
  type: 'text'
})

defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <div class="mb-4">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :class="[
        'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm',
        error
          ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-300'
          : 'border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
      ]"
    />
    <p v-if="error" class="mt-1 text-sm text-red-500">
      {{ error }}
    </p>
  </div>
</template>
