<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { LayoutGrid, LogOut, Settings, Users, Bell, Search } from 'lucide-vue-next'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <!-- Background with subtle texture -->
  <div class="min-h-screen bg-slate-50/50 flex flex-col relative selection:bg-primary/20 selection:text-primary">
    <div class="fixed inset-0 z-0 pointer-events-none opacity-[0.02]"
         style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 32px 32px;">
    </div>

    <!-- Top Navigation Bar (Glassmorphism) -->
    <header class="sticky top-0 z-40 bg-card/60 backdrop-blur-2xl border-b border-border/60 supports-[backdrop-filter]:bg-card/40">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">

          <!-- Left: Branding & App Switcher -->
          <div class="flex items-center gap-6">
            <!-- App Switcher -->
            <Popover>
              <PopoverTrigger as-child>
                <button class="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 border border-transparent hover:border-border/50">
                  <LayoutGrid class="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent class="w-80 p-5 rounded-3xl shadow-2xl border-border/50 bg-card/95 backdrop-blur-2xl text-card-foreground" align="start">
                <h4 class="text-xs font-bold text-muted-foreground mb-4 px-1 uppercase tracking-wider">Aplikasi Terintegrasi</h4>
                <div class="grid grid-cols-3 gap-3">

                  <!-- Base ESS -->
                  <button @click="router.push('/ess')" class="group flex flex-col items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <Users class="w-6 h-6" />
                    </div>
                    <span class="text-[11px] font-semibold text-slate-600">ESS Portal</span>
                  </button>

                  <!-- SysAdmin -->
                  <button v-if="authStore.hasModuleAccess('sysadmin')" @click="router.push('/admin-portal')" class="group flex flex-col items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                    <div class="w-12 h-12 rounded-2xl bg-accent text-muted-foreground flex items-center justify-center group-hover:scale-105 transition-transform duration-300 border border-border/50">
                      <Settings class="w-6 h-6" />
                    </div>
                    <span class="text-[11px] font-semibold text-muted-foreground">SysAdmin</span>
                  </button>

                  <!-- HRIS -->
                  <button v-if="authStore.hasModuleAccess('hris')" @click="router.push('/hris')" class="group flex flex-col items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                    <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300 border border-primary/20">
                      <Users class="w-6 h-6" />
                    </div>
                    <span class="text-[11px] font-semibold text-muted-foreground">HRIS Core</span>
                  </button>

                </div>
              </PopoverContent>
            </Popover>

            <!-- Brand -->
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20 border border-primary/30">
                <span class="text-primary-foreground font-bold text-xs">A</span>
              </div>
              <span class="text-base font-bold text-foreground tracking-tight">Aorta ESS</span>
            </div>
          </div>

          <!-- Right: Search, Notifications & Profile -->
          <div class="flex items-center gap-1 sm:gap-3">

            <button class="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-transparent hover:border-border/50">
              <Search class="w-4 h-4" />
            </button>

            <button class="relative flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors border border-transparent hover:border-border/50">
              <Bell class="w-4 h-4" />
              <span class="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div class="h-5 w-px bg-border/60 mx-2"></div>

            <div class="flex items-center gap-3 pl-1">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-bold text-foreground leading-none">{{ authStore.user?.name || 'User' }}</p>
                <p class="text-[11px] font-medium text-muted-foreground mt-1">{{ authStore.roles[0] || 'Staff' }}</p>
              </div>

              <Popover>
                <PopoverTrigger as-child>
                  <button class="w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm hover:ring-2 hover:ring-primary/30 transition-all">
                    {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
                  </button>
                </PopoverTrigger>
                <PopoverContent class="w-56 p-2 rounded-3xl border-border/50 bg-card/95 backdrop-blur-2xl text-card-foreground shadow-2xl" align="end">
                  <div class="p-3 border-b border-border/50 mb-2">
                    <p class="text-sm font-bold text-foreground">{{ authStore.user?.name }}</p>
                    <p class="text-xs text-muted-foreground truncate">{{ authStore.user?.email || 'user@aorta.local' }}</p>
                  </div>
                  <button class="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-xl transition-colors">
                    <Settings class="w-4 h-4" />
                    Pengaturan Akun
                  </button>
                  <button @click="handleLogout" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors mt-1 font-medium">
                    <LogOut class="w-4 h-4" />
                    Keluar Sistem
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </div>

        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

      <!-- Fallback UI if roles extraction fails -->
      <div v-if="authStore.roles.length === 0" class="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-md mt-8">
        <div class="text-center space-y-4 max-w-sm p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60">
          <div class="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-900 tracking-tight">Validasi Sesi Gagal</h3>
          <p class="text-sm text-slate-500 leading-relaxed">
            Profil hak akses Anda tidak dapat dimuat dengan sempurna. Silakan login kembali untuk memperbarui sesi.
          </p>
          <button @click="handleLogout" class="mt-6 w-full h-11 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
            Kembali ke Login
          </button>
        </div>
      </div>

      <!-- Page Content Transition -->
      <router-view v-slot="{ Component }">
        <transition
          name="fade-slide"
          mode="out-in"
          appear
        >
          <component :is="Component" />
        </transition>
      </router-view>

    </main>
  </div>
</template>

<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
