<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import { useTheme } from '@/composables/useTheme'

// Initialize theme globally
useTheme()
</script>

<template>
  <RouterView />
  <Toaster position="top-right" rich-colors />
</template>