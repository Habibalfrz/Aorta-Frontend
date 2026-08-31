<script setup lang="ts">
import AppSidebar from '@/components/navigation/AppSidebar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background">
    <!-- Sidebar -->
    <AppSidebar class="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#0a0a0a]" />

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-x-hidden overflow-y-auto">
      <header class="h-14 border-b border-slate-200 dark:border-zinc-800 flex items-center px-4 bg-white dark:bg-[#0a0a0a]/90 backdrop-blur-sm sticky top-0 z-10">
         <!-- Breadcrumbs placeholder -->
         <span class="text-sm font-medium">Dashboard</span>
      </header>
      <div class="p-6">
        <RouterView />
      </div>
    </main>
  </div>
</template>