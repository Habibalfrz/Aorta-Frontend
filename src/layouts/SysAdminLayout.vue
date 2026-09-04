<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LayoutDashboard, Users, Shield, Key, Layers, LogOut, Settings, User, Menu } from 'lucide-vue-next'
import { useAuthStore } from '@/store/auth'
import { useTheme } from '@/composables/useTheme'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuPortal
} from '@/components/ui/dropdown-menu'
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle
} from '@/components/ui/sheet'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { currentTheme, setTheme } = useTheme()

const isMobileOpen = ref(false)

const navigation = [
  { name: 'Dashboard', path: '/admin-portal', exact: true, icon: LayoutDashboard },
  { name: 'User Management', path: '/admin-portal/users', icon: Users },
  { name: 'Permission Builder', path: '/admin-portal/permissions', icon: Key },
  { name: 'Role Management', path: '/admin-portal/roles', icon: Shield },
  { name: 'Modules Explorer', path: '/admin-portal/modules', icon: Layers },
]

function isRouteActive(itemPath: string, exact?: boolean) {
  if (exact) {
    return route.path === itemPath
  }
  return route.path.startsWith(itemPath) && itemPath !== '/admin-portal'
}

function handleNavigation(path: string) {
  router.push(path)
  isMobileOpen.value = false
}
</script>

<template>
  <!-- Background utama untuk seluruh halaman (Sekarang murni menggunakan bg-background agar tema bisa bekerja natural) -->
  <div class="flex h-screen bg-background text-foreground font-sans overflow-hidden selection:bg-primary/20 selection:text-primary relative">

    <!-- Seamless background pattern -->
    <div class="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
         style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 24px 24px;">
    </div>

    <!-- Desktop Sidebar (Hidden on < lg) -->
    <!-- Transparan dengan blur agar menyatu dengan background utama saat resize/overlap -->
    <aside class="hidden lg:flex w-72 bg-card/60 backdrop-blur-2xl border-r border-border/60 flex-col flex-shrink-0 z-20 relative">
      <div class="h-16 flex items-center px-6 shrink-0">
        <div class="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mr-3 shadow-md shadow-primary/20">
          <Shield class="w-4 h-4" />
        </div>
        <div>
          <h2 class="font-bold text-base tracking-tight text-foreground leading-none">SysAdmin Portal</h2>
        </div>
      </div>

      <nav class="flex-1 py-4 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <button v-for="item in navigation" :key="item.name" @click="handleNavigation(item.path)"
          class="w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary group"
          :class="isRouteActive(item.path, item.exact) ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'">

          <!-- Animated hover container for the icon -->
          <div class="relative w-6 h-6 mr-2 flex items-center justify-center">
            <!-- Ping animation on hover for active items or just scale for inactive -->
            <span v-if="!isRouteActive(item.path, item.exact)" class="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out opacity-0 group-hover:opacity-100"></span>
            <component :is="item.icon" class="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:scale-110" :class="isRouteActive(item.path, item.exact) ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'" />
          </div>

          <span class="text-sm">{{ item.name }}</span>
        </button>
      </nav>

      <div class="p-4 shrink-0 border-t border-border/60">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="w-full flex items-center justify-between p-2 rounded-xl bg-transparent hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary group">
              <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm shrink-0 border border-border group-hover:border-primary/30 transition-colors">
                  {{ authStore.user?.name?.charAt(0).toUpperCase() || 'S' }}
                </div>
                <div class="text-left truncate">
                  <p class="text-sm font-semibold text-foreground truncate">{{ authStore.user?.name || 'Superadmin' }}</p>
                  <p class="text-xs text-muted-foreground truncate">{{ authStore.user?.email || 'admin@aorta.local' }}</p>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" :side-offset="20" class="w-64 rounded-2xl border-border/50 shadow-2xl p-1 bg-card/95 backdrop-blur-xl text-card-foreground">
            <DropdownMenuLabel class="text-xs font-semibold text-muted-foreground px-2 py-1.5">Administrator</DropdownMenuLabel>
            <DropdownMenuSeparator class="bg-border/50" />
            <DropdownMenuItem @click="router.push('/admin-portal/profile')" class="rounded-xl cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors">
              <User class="w-4 h-4 mr-2 text-muted-foreground" />
              <span>Profil Saya</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger class="rounded-xl cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors">
                <Settings class="w-4 h-4 mr-2 text-muted-foreground" />
                <span>Tema Tampilan</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent :side-offset="12" class="rounded-2xl shadow-2xl border-border/50 p-1 bg-card/95 backdrop-blur-xl text-card-foreground z-50">
                  <DropdownMenuRadioGroup :model-value="currentTheme" @update:model-value="(val) => setTheme(val as any)">
                    <DropdownMenuRadioItem value="light" class="rounded-lg cursor-pointer transition-colors">Terang</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark" class="rounded-lg cursor-pointer transition-colors">Gelap</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="theme-ocean" class="rounded-lg cursor-pointer transition-colors">Soft Ocean</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator class="bg-border/50" />
            <DropdownMenuItem @click="authStore.logout()" class="rounded-xl cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-500/10 hover:bg-red-500/10 hover:text-red-600 font-medium transition-colors">
              <LogOut class="w-4 h-4 mr-2" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 h-full">

      <!-- Dynamic Header -->
      <!-- Menggunakan bg transparan dengan blur agar menyatu dengan konten saat discroll -->
      <header class="h-16 border-b border-border/60 bg-card/60 backdrop-blur-2xl flex items-center px-4 lg:px-8 shrink-0 gap-4 supports-[backdrop-filter]:bg-card/40 sticky top-0 z-30">
        <!-- Mobile Sidebar Trigger -->
        <Sheet v-model:open="isMobileOpen">
          <SheetTrigger as-child>
            <button class="lg:hidden shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-card border border-border text-foreground hover:bg-accent transition-colors">
              <Menu class="w-4 h-4" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" class="w-[85vw] max-w-[280px] p-0 flex flex-col border-r border-border bg-card">
            <SheetTitle class="sr-only">Menu Navigasi</SheetTitle>
            <div class="h-16 flex items-center px-6 border-b border-border shrink-0">
              <div class="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mr-3 shadow-md shadow-primary/20">
                <Shield class="w-4 h-4" />
              </div>
              <span class="font-bold text-base tracking-tight text-foreground">SysAdmin Portal</span>
            </div>
            <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              <button v-for="item in navigation" :key="item.name" @click="handleNavigation(item.path)"
                class="w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                :class="isRouteActive(item.path, item.exact) ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'">
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

        <h1 class="font-semibold text-lg text-foreground tracking-tight truncate">{{ route.name || 'Dashboard' }}</h1>
      </header>

      <!-- Scrollable View -->
      <div class="flex-1 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">
        <div class="p-6 lg:p-8 w-full max-w-[1400px] mx-auto min-h-full">
          <router-view v-slot="{ Component }">
            <transition
              name="fade-slide"
              mode="out-in"
              appear
            >
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
/* Smooth transition for router view */
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

/* Custom modern scrollbar for the dashboard */
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