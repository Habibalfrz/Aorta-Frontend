<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { LayoutGrid, LogOut, Settings, Users, Bell } from 'lucide-vue-next'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Top Navigation Bar -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          
          <!-- Left: Branding & App Switcher -->
          <div class="flex items-center gap-4">
            <!-- App Switcher (9-dots) -->
            <Popover>
              <PopoverTrigger as-child>
                <Button variant="ghost" size="icon" class="text-slate-600 hover:bg-slate-100">
                  <LayoutGrid class="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-80 p-4" align="start">
                <h4 class="font-medium text-sm text-slate-500 mb-4 px-2">Aplikasi Terintegrasi</h4>
                <div class="grid grid-cols-3 gap-2">
                  
                  <!-- Base ESS (Selalu ada) -->
                  <Button variant="ghost" class="h-auto flex-col gap-2 p-3" @click="router.push('/ess')">
                    <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Users class="w-5 h-5" />
                    </div>
                    <span class="text-xs font-medium">ESS Portal</span>
                  </Button>

                  <!-- SysAdmin (Superadmin only) -->
                  <Button 
                    v-if="authStore.hasRole('Superadmin')"
                    variant="ghost" 
                    class="h-auto flex-col gap-2 p-3"
                  >
                    <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Settings class="w-5 h-5" />
                    </div>
                    <span class="text-xs font-medium">SysAdmin</span>
                  </Button>

                  <!-- HRIS (HR_Manager only) -->
                  <Button 
                    v-if="authStore.hasRole('HR_Manager')"
                    variant="ghost" 
                    class="h-auto flex-col gap-2 p-3"
                  >
                    <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Users class="w-5 h-5" />
                    </div>
                    <span class="text-xs font-medium">HRIS</span>
                  </Button>

                </div>
              </PopoverContent>
            </Popover>

            <span class="text-xl font-bold text-blue-900 tracking-tight">AORTA ESS</span>
          </div>

          <!-- Right: Profile & Actions -->
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="icon" class="text-slate-600 relative">
              <Bell class="w-5 h-5" />
              <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </Button>
            
            <div class="h-6 w-px bg-slate-200 mx-2"></div>
            
            <div class="flex items-center gap-3 px-2">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium text-slate-900">{{ authStore.user?.name || 'User' }}</p>
                <p class="text-xs text-slate-500">{{ authStore.roles[0] || 'Staff' }}</p>
              </div>
              <Button variant="ghost" size="icon" @click="handleLogout" class="text-slate-500 hover:text-red-600">
                <LogOut class="w-5 h-5" />
              </Button>
            </div>
          </div>

        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>
