<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
}
</script>
<template>
  <div class="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
    <div class="flex items-center gap-3 overflow-hidden">
      <div class="h-8 w-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0">
        {{ authStore.user?.name?.charAt(0) || 'U' }}
      </div>
      <div class="truncate">
        <p class="text-sm font-medium truncate">{{ authStore.user?.name }}</p>
        <p class="text-xs text-slate-500 truncate">{{ authStore.user?.email }}</p>
      </div>
    </div>
    <button @click="handleLogout" class="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
    </button>
  </div>
</template>