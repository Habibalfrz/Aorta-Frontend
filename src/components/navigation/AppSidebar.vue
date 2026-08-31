<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import NavUser from './NavUser.vue'

const route = useRoute()
</script>
<template>
  <aside>
    <div class="h-14 flex items-center px-6 font-bold text-lg border-b border-slate-200 dark:border-zinc-800">
      Aorta OS
    </div>
    <div class="flex-1 py-4 px-3 overflow-y-auto space-y-1">
      <RouterLink to="/ess" class="flex items-center px-3 py-2 text-sm rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors" :class="{ 'bg-slate-200 dark:bg-zinc-800 font-medium': route.path.startsWith('/ess') }">
        ESS Portal
      </RouterLink>
      <RouterLink to="/admin-portal" class="flex items-center px-3 py-2 text-sm rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors" :class="{ 'bg-slate-200 dark:bg-zinc-800 font-medium': route.path.startsWith('/admin-portal') }">
        SysAdmin
      </RouterLink>
      <RouterLink to="/hris" class="flex items-center px-3 py-2 text-sm rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors" :class="{ 'bg-slate-200 dark:bg-zinc-800 font-medium': route.path.startsWith('/hris') }">
        HRIS Module
      </RouterLink>
    </div>
    <NavUser />
  </aside>
</template>