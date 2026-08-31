<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useTheme } from '@/composables/useTheme'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileClock,
  Banknote,
  Settings,
  ArrowLeft,
  User,
  LogOut,
  Menu,
  UserCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { currentTheme, setTheme } = useTheme()

const isMobileOpen = ref(false)

onMounted(() => {
  if (authStore.isSuperadmin && !authStore.isSimulating) {
    authStore.fetchSimulatableRoles('HRIS')
  }
})

const navigation = [
  { name: 'HR Dashboard', path: '/hris', exact: true, icon: LayoutDashboard },
  { name: 'Data Pegawai', path: '/hris/employees', icon: Users },
  { name: 'Manajemen Shift', path: '/hris/shifts', icon: CalendarDays },
  { name: 'Log Kehadiran', path: '/hris/attendance', icon: FileClock },
  { name: 'Pengajuan Cuti', path: '/hris/leaves', icon: CalendarDays },
  { name: 'Payroll', path: '/hris/payroll', icon: Banknote },
  { name: 'HR Settings', path: '/hris/settings', icon: Settings },
]

function isRouteActive(itemPath: string, exact?: boolean) {
  if (exact) {
    return route.path === itemPath
  }
  return route.path.startsWith(itemPath) && itemPath !== '/hris'
}

function handleNavigation(path: string) {
  router.push(path)
  isMobileOpen.value = false
}
</script>

<template>
  <div class="flex h-screen bg-background text-foreground font-sans overflow-hidden selection:bg-primary/20 selection:text-primary relative">
    <div class="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
         style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 24px 24px;"></div>

    <aside class="hidden lg:flex w-72 bg-card/60 backdrop-blur-2xl border-r border-border/60 flex-col flex-shrink-0 z-20 relative">
      <div class="h-16 flex items-center px-6 shrink-0">
        <div class="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mr-3 shadow-md shadow-primary/20">
          <Users class="w-4 h-4" />
        </div>
        <div>
          <h2 class="font-bold text-base tracking-tight text-foreground leading-none">HRIS Portal</h2>
        </div>
      </div>

      <nav class="flex-1 py-4 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <button
          v-for="item in navigation"
          :key="item.name"
          @click="handleNavigation(item.path)"
          class="w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary group"
          :class="isRouteActive(item.path, item.exact) ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
        >
          <div class="relative w-6 h-6 mr-2 flex items-center justify-center">
            <span v-if="!isRouteActive(item.path, item.exact)" class="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out opacity-0 group-hover:opacity-100"></span>
            <component
              :is="item.icon"
              class="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110"
              :class="isRouteActive(item.path, item.exact) ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'"
            />
          </div>
          <span class="text-sm">{{ item.name }}</span>
        </button>
      </nav>

      <div class="p-4 shrink-0 border-t border-border/60">
        <button
          v-if="authStore.hasRole('superadmin')"
          @click="router.push('/admin-portal/modules')"
          class="w-full flex items-center justify-center px-3 py-2 mb-4 rounded-xl border border-border/60 bg-card/80 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
        >
          <ArrowLeft class="w-3 h-3 mr-2" /> Back to SysAdmin
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="w-full flex items-center justify-between p-2 rounded-xl bg-transparent hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary group">
              <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm shrink-0 border border-border group-hover:border-primary/30 transition-colors">
                  {{ authStore.user?.name?.charAt(0).toUpperCase() || 'H' }}
                </div>
                <div class="text-left truncate">
                  <p class="text-sm font-semibold text-foreground truncate">{{ authStore.user?.name || 'HR Manager' }}</p>
                  <p class="text-xs text-muted-foreground truncate">{{ authStore.user?.email || 'hr@aorta.com' }}</p>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" :side-offset="20" class="w-64 rounded-2xl border-border/50 shadow-2xl p-1 bg-card/95 backdrop-blur-xl text-card-foreground">
            <DropdownMenuLabel class="text-xs font-semibold text-muted-foreground px-2 py-1.5">Akun Pegawai</DropdownMenuLabel>
            <DropdownMenuSeparator class="bg-border/50" />
            <DropdownMenuItem class="rounded-xl cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors">
              <User class="w-4 h-4 mr-2 text-muted-foreground" />
              <span>Profil Saya</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger class="rounded-xl cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors">
                <Settings class="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Preferensi Tema</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent :side-offset="12" class="rounded-2xl shadow-2xl border-border/50 p-1 bg-card/95 backdrop-blur-xl text-card-foreground z-50">
                  <DropdownMenuRadioGroup :model-value="currentTheme" @update:model-value="setTheme">
                    <DropdownMenuRadioItem value="light" class="rounded-lg cursor-pointer transition-colors">Terang</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark" class="rounded-lg cursor-pointer transition-colors">Gelap</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="theme-ocean" class="rounded-lg cursor-pointer transition-colors">Soft Ocean</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub v-if="authStore.isSuperadmin && !authStore.isSimulating">
              <DropdownMenuSubTrigger class="rounded-xl cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors text-amber-600 focus:text-amber-600 data-[state=open]:text-amber-600">
                <UserCircle2 class="w-4 h-4 mr-2" />
                <span>Simulasikan Peran</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent class="rounded-2xl shadow-2xl border-border/50 p-1 bg-card/95 backdrop-blur-xl text-card-foreground z-50 max-h-64 overflow-y-auto">
                  <div class="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Peran Modul HRIS</div>
                  <DropdownMenuSeparator class="bg-border/50" />
                  <div v-if="authStore.simulatableRoles.length === 0" class="px-2 py-3 text-xs text-muted-foreground text-center">
                    Tidak ada peran tersedia.
                  </div>
                  <DropdownMenuItem
                    v-for="role in authStore.simulatableRoles"
                    :key="role.id"
                    @click="authStore.simulateRole(role.name)"
                    class="cursor-pointer rounded-lg text-xs font-semibold hover:bg-accent focus:bg-accent transition-colors"
                  >
                    {{ role.name }}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator class="bg-border/50" />
            <DropdownMenuItem @click="authStore.logout()" class="rounded-xl cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-500/10 hover:bg-red-500/10 hover:text-red-600 font-medium transition-colors">
              <LogOut class="w-4 h-4 mr-2" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 h-full">
      <div v-if="authStore.isSimulating" class="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 lg:px-8 py-2.5 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 text-amber-600" />
          <p class="text-xs font-bold text-amber-700 tracking-tight">
            MODE SIMULASI AKTIF: <span class="uppercase tracking-widest text-amber-900 ml-1">{{ authStore.roles?.[0] || 'TIDAK DIKETAHUI' }}</span>
          </p>
        </div>
        <button @click="authStore.stopSimulation()" class="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm">
          <XCircle class="w-3 h-3" /> Hentikan
        </button>
      </div>

      <header class="h-16 border-b border-border/60 bg-card/60 backdrop-blur-2xl flex items-center px-4 lg:px-8 shrink-0 gap-4 supports-[backdrop-filter]:bg-card/40 sticky top-0 z-30">
        <Sheet v-model:open="isMobileOpen">
          <SheetTrigger as-child>
            <button class="lg:hidden shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-card border border-border text-foreground hover:bg-accent transition-colors">
              <Menu class="w-4 h-4" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" class="w-[85vw] max-w-[280px] p-0 flex flex-col border-r border-border bg-card/95 backdrop-blur-2xl">
            <SheetTitle class="sr-only">Menu Navigasi</SheetTitle>
            <div class="h-16 flex items-center px-6 border-b border-border shrink-0">
              <div class="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mr-3 shadow-md shadow-primary/20">
                <Users class="w-4 h-4" />
              </div>
              <span class="font-bold text-base tracking-tight text-foreground">HRIS Portal</span>
            </div>
            <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              <button
                v-for="item in navigation"
                :key="item.name"
                @click="handleNavigation(item.path)"
                class="w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                :class="isRouteActive(item.path, item.exact) ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'"
              >
                <component :is="item.icon" class="w-4 h-4 mr-3" :class="isRouteActive(item.path, item.exact) ? 'text-primary' : 'text-muted-foreground'" />
                <span class="text-sm">{{ item.name }}</span>
              </button>
            </nav>
            <div class="p-4 shrink-0 border-t border-border">
              <button @click="authStore.logout()" class="w-full flex items-center px-3 py-2.5 rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut class="w-4 h-4 mr-3" /> Log Out
              </button>
            </div>
          </SheetContent>
        </Sheet>

        <h1 class="font-semibold text-lg text-foreground tracking-tight truncate">{{ route.name || 'HR Dashboard' }}</h1>
      </header>

      <div class="flex-1 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
        <div class="p-6 lg:p-8 w-full max-w-[1400px] mx-auto min-h-full">
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in" appear>
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1), transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.3);
  border-radius: 10px;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.5);
}
</style>
