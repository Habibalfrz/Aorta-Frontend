<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileClock,
  Banknote,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeft,
  Bell,
  Search
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isSidebarCollapsed = ref(false)

const navigation = [
  { name: 'Dashboard HR', path: '/hris', icon: LayoutDashboard },
  { name: 'Data Pegawai', path: '/hris/employees', icon: Users },
  { name: 'Manajemen Shift', path: '/hris/shifts', icon: CalendarDays },
  { name: 'Pengajuan Cuti', path: '/hris/leaves', icon: FileClock },
  { name: 'Payroll', path: '/hris/payroll', icon: Banknote },
]

const backToESS = () => {
  router.push('/ess')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex overflow-hidden">
    
    <!-- Sidebar (Light Theme, Collapsible) -->
    <aside 
      :class="[
        isSidebarCollapsed ? 'w-20' : 'w-64',
        'bg-white border-r border-slate-200 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out relative z-20'
      ]"
    >
      <!-- Branding Area -->
      <div class="h-16 flex items-center px-4 border-b border-slate-200 bg-white" :class="isSidebarCollapsed ? 'justify-center' : 'justify-between'">
        <div class="flex items-center" v-if="!isSidebarCollapsed">
          <div class="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center font-bold mr-3">HR</div>
          <span class="text-lg font-bold text-slate-800 tracking-tight">HRIS Portal</span>
        </div>
        <div v-else class="w-10 h-10 rounded bg-indigo-600 text-white flex items-center justify-center font-bold">HR</div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <button
          v-for="item in navigation"
          :key="item.name"
          @click="router.push(item.path)"
          :class="[
            route.path === item.path 
              ? 'bg-indigo-50 text-indigo-700' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            'w-full flex items-center p-2.5 rounded-lg transition-colors group relative'
          ]"
          :title="isSidebarCollapsed ? item.name : undefined"
        >
          <component 
            :is="item.icon" 
            class="w-5 h-5 flex-shrink-0" 
            :class="[route.path === item.path ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600', isSidebarCollapsed ? 'mx-auto' : 'mr-3']" 
          />
          <span v-if="!isSidebarCollapsed" class="text-sm font-medium">{{ item.name }}</span>
        </button>
      </nav>

      <!-- Bottom Actions -->
      <div class="p-3 border-t border-slate-200 flex flex-col gap-2">
        <Button 
          variant="outline" 
          class="w-full bg-slate-50 border-slate-200 text-slate-600"
          :class="isSidebarCollapsed ? 'justify-center px-0' : 'justify-start'"
          @click="backToESS"
          :title="isSidebarCollapsed ? 'Back to ESS' : undefined"
        >
          <ArrowLeft class="w-4 h-4" :class="!isSidebarCollapsed && 'mr-2'" />
          <span v-if="!isSidebarCollapsed">Back to ESS</span>
        </Button>
      </div>
      
      <!-- Collapse Toggle Button (Floating) -->
      <button 
        @click="isSidebarCollapsed = !isSidebarCollapsed"
        class="absolute -right-3.5 top-20 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-sm z-30"
      >
        <PanelLeftOpen v-if="isSidebarCollapsed" class="w-4 h-4" />
        <PanelLeftClose v-else class="w-4 h-4" />
      </button>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 h-screen">
      
      <!-- Top Header -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
        <!-- Search Bar -->
        <div class="flex-1 max-w-md relative hidden md:block">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Cari data pegawai, NIK..." class="pl-9 bg-slate-50 border-slate-200 h-9" />
        </div>
        
        <!-- User Menu -->
        <div class="flex items-center gap-4 ml-auto">
          <Button variant="ghost" size="icon" class="text-slate-500 relative">
            <Bell class="w-5 h-5" />
            <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </Button>
          
          <div class="h-6 w-px bg-slate-200"></div>
          
          <div class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-medium text-slate-900">{{ authStore.user?.name || 'HR Admin' }}</p>
              <p class="text-xs text-slate-500">Human Resources</p>
            </div>
            <Avatar class="w-8 h-8">
              <AvatarFallback class="bg-indigo-100 text-indigo-700 text-xs">
                {{ authStore.user?.name?.charAt(0).toUpperCase() || 'H' }}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <!-- Page Content (Scrollable) -->
      <main class="flex-1 overflow-auto bg-slate-50 p-6">
        <slot />
      </main>

    </div>
  </div>
</template>
