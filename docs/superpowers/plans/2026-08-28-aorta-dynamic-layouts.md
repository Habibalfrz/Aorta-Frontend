# Aorta Dynamic Layouts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the static layout shells (`SysAdminLayout` and `HrisLayout`) into highly dynamic, flexible, and screen-agnostic wrappers. Introduce off-canvas navigation drawers (Sheets) for small screens and refine layout boundaries to prevent overlapping or clipping.

**Architecture:** We will leverage the Shadcn-vue `Sheet` component to render the navigation sidebar dynamically on smaller screens, triggered by a hamburger menu in the header. Desktop retains the fixed sidebar. Active state checking for navigation will be refined.

**Tech Stack:** Vue 3, Tailwind CSS v4, Lucide Icons, Shadcn-vue (`Sheet`).

## Global Constraints
- **Responsiveness:** Use `hidden lg:flex` to hide the static sidebar on small screens, and `lg:hidden` to show the hamburger menu.
- **Scroll Handling:** Keep `h-screen overflow-hidden` on the root, but ensure `<main>` manages `overflow-y-auto` smoothly.
- **DRY Sidebar Content:** Since the sidebar content must be rendered twice (once for desktop, once inside the mobile Sheet), encapsulate the navigation link rendering logic into a reusable block or render it gracefully without massive code duplication.

---

### Task 1: Make SysAdminLayout Dynamic & Responsive

**Files:**
- Modify: `src/layouts/SysAdminLayout.vue`

**Interfaces:**
- Produces: A highly dynamic SysAdmin shell with a collapsible off-canvas sidebar on smaller screens.

- [ ] **Step 1: Import Sheet Primitives & Refactor Layout**

```vue
<!-- src/layouts/SysAdminLayout.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LayoutDashboard, Users, Shield, Key, Activity, Layers, LogOut, Settings, User, Menu } from 'lucide-vue-next'
import { useAuthStore } from '@/store/auth'
import { useTheme } from '@/composables/useTheme'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu'
import {
  Sheet, SheetContent, SheetTrigger
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { currentTheme, setTheme } = useTheme()

const isMobileOpen = ref(false)

const navigation = [
  { name: 'Dashboard', path: '/admin-portal', exact: true, icon: LayoutDashboard },
  { name: 'User Management', path: '/admin-portal/users', icon: Users },
  { name: 'Role Management', path: '/admin-portal/roles', icon: Shield },
  { name: 'Permission Builder', path: '/admin-portal/permissions', icon: Key },
  { name: 'Resource Monitor', path: '/admin-portal/monitor', icon: Activity },
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
  isMobileOpen.value = false // Close mobile sheet on navigate
}
</script>

<template>
  <div class="flex h-screen bg-background text-foreground font-sans overflow-hidden">
    
    <!-- Desktop Sidebar (Hidden on < lg) -->
    <aside class="hidden lg:flex w-72 bg-card border-r border-border flex-col flex-shrink-0 z-20 transition-all duration-300">
      <div class="h-16 flex items-center px-6 border-b border-border">
        <div class="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center mr-3">
          <Shield class="w-5 h-5" />
        </div>
        <span class="font-bold text-lg tracking-wide">SysAdmin Portal</span>
      </div>
      <nav class="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <button v-for="item in navigation" :key="item.name" @click="handleNavigation(item.path)"
          class="w-full flex items-center px-3 py-2.5 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
          :class="isRouteActive(item.path, item.exact) ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'">
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </button>
      </nav>

      <div class="p-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {{ authStore.user?.name?.charAt(0).toUpperCase() || 'S' }}
                </div>
                <div class="text-left truncate">
                  <p class="text-sm font-semibold truncate">{{ authStore.user?.name || 'Superadmin' }}</p>
                  <p class="text-xs text-muted-foreground truncate">{{ authStore.user?.email || 'admin@aorta.com' }}</p>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" class="w-56 mb-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User class="w-4 h-4 mr-2" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings class="w-4 h-4 mr-2" />
                <span>Theme Preference</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup :model-value="currentTheme" @update:model-value="setTheme">
                  <DropdownMenuRadioItem value="light">Terang</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">Gelap</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="theme-ocean">Soft Ocean</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem @click="authStore.logout()" class="text-red-500 focus:text-red-500 focus:bg-red-500/10">
              <LogOut class="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
      <!-- Ambient Background glow for SysAdmin tech feel -->
      <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Dynamic Header -->
      <header class="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center px-4 lg:px-8 z-10 flex-shrink-0 gap-4">
        <!-- Mobile Sidebar Trigger -->
        <Sheet v-model:open="isMobileOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="lg:hidden shrink-0">
              <Menu class="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-72 p-0 flex flex-col border-r border-border bg-card">
            <!-- Mobile Sidebar Content (Same logic) -->
            <div class="h-16 flex items-center px-6 border-b border-border shrink-0">
              <div class="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center mr-3">
                <Shield class="w-5 h-5" />
              </div>
              <span class="font-bold text-lg tracking-wide">SysAdmin Portal</span>
            </div>
            <nav class="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
              <button v-for="item in navigation" :key="item.name" @click="handleNavigation(item.path)"
                class="w-full flex items-center px-3 py-2.5 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
                :class="isRouteActive(item.path, item.exact) ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'">
                <component :is="item.icon" class="w-5 h-5 mr-3" />
                {{ item.name }}
              </button>
            </nav>
            <div class="p-4 border-t border-border shrink-0">
               <button @click="authStore.logout()" class="w-full flex items-center px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
                  <LogOut class="w-5 h-5 mr-3" /> Logout
               </button>
            </div>
          </SheetContent>
        </Sheet>
        
        <span class="font-semibold text-lg text-foreground truncate">{{ route.name || 'Dashboard' }}</span>
      </header>

      <!-- Scrollable View -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 z-10">
        <RouterView />
      </div>
    </main>
  </div>
</template>
```

- [ ] **Step 2: Commit**
```bash
git add src/layouts/SysAdminLayout.vue
git commit -m "feat(layout): make sysadmin layout dynamic with mobile sheet drawer"
```

### Task 2: Make HrisLayout Dynamic & Responsive

**Files:**
- Modify: `src/layouts/HrisLayout.vue`

**Interfaces:**
- Produces: Dynamic HRIS shell adapting to any screen size without clipping.

- [ ] **Step 1: Refactor HrisLayout**

```vue
<!-- src/layouts/HrisLayout.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useTheme } from '@/composables/useTheme'
import { LayoutDashboard, Users, CalendarDays, FileClock, Banknote, Settings, ArrowLeft, User, LogOut, Menu } from 'lucide-vue-next'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu'
import {
  Sheet, SheetContent, SheetTrigger
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { currentTheme, setTheme } = useTheme()

const isMobileOpen = ref(false)

const navigation = [
  { name: 'HR Dashboard', path: '/hris', exact: true, icon: LayoutDashboard },
  { name: 'Data Pegawai', path: '/hris/employees', icon: Users },
  { name: 'Manajemen Shift', path: '/hris/shifts', icon: CalendarDays },
  { name: 'Pengajuan Cuti', path: '/hris/leaves', icon: FileClock },
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
  isMobileOpen.value = false // Close mobile sheet on navigate
}
</script>

<template>
  <div class="flex h-screen bg-background text-foreground font-sans overflow-hidden">
    
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:flex w-64 bg-card border-r border-border flex-col shadow-sm flex-shrink-0 z-20">
      <div class="h-16 flex items-center px-6 border-b border-border">
        <div class="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center mr-3 font-bold">HR</div>
        <span class="font-bold text-lg">HRIS Portal</span>
      </div>

      <nav class="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <button v-for="item in navigation" :key="item.name" @click="handleNavigation(item.path)"
          class="w-full flex items-center px-3 py-2.5 rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          :class="isRouteActive(item.path, item.exact) ? 'bg-blue-500/10 text-blue-600 font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'">
          <component :is="item.icon" class="w-5 h-5 mr-3" :class="isRouteActive(item.path, item.exact) ? 'text-blue-600' : ''" />
          {{ item.name }}
        </button>
      </nav>

      <div class="p-4 border-t border-border bg-muted/30">
        <button v-if="authStore.hasRole('superadmin')" @click="router.push('/admin-portal/modules')"
          class="w-full flex items-center justify-center px-3 py-2 mb-4 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:bg-muted transition-colors shadow-sm">
          <ArrowLeft class="w-3 h-3 mr-2" /> Back to SysAdmin
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                  {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
                </div>
                <div class="text-left truncate">
                  <p class="text-sm font-semibold truncate">{{ authStore.user?.name || 'HR Manager' }}</p>
                  <p class="text-xs text-muted-foreground truncate">{{ authStore.user?.email || 'hr@aorta.com' }}</p>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" class="w-56 mb-2">
            <DropdownMenuLabel>Akun Pegawai</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User class="w-4 h-4 mr-2" />
              <span>Profil Saya</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings class="w-4 h-4 mr-2" />
                <span>Preferensi Tema</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup :model-value="currentTheme" @update:model-value="setTheme">
                  <DropdownMenuRadioItem value="light">Terang</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">Gelap</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="theme-ocean">Soft Ocean</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem @click="authStore.logout()" class="text-red-500 focus:text-red-500 focus:bg-red-500/10">
              <LogOut class="w-4 h-4 mr-2" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>

    <!-- Main HRIS Content -->
    <main class="flex-1 flex flex-col min-w-0 bg-background relative z-10">
      <header class="h-16 border-b border-border bg-card flex items-center px-4 lg:px-8 z-10 flex-shrink-0 shadow-sm gap-4">
        <!-- Mobile Sidebar Trigger -->
        <Sheet v-model:open="isMobileOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="lg:hidden shrink-0">
              <Menu class="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-64 p-0 flex flex-col border-r border-border bg-card">
            <div class="h-16 flex items-center px-6 border-b border-border shrink-0">
              <div class="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center mr-3 font-bold">HR</div>
              <span class="font-bold text-lg">HRIS Portal</span>
            </div>
            <nav class="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
              <button v-for="item in navigation" :key="item.name" @click="handleNavigation(item.path)"
                class="w-full flex items-center px-3 py-2.5 rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                :class="isRouteActive(item.path, item.exact) ? 'bg-blue-500/10 text-blue-600 font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'">
                <component :is="item.icon" class="w-5 h-5 mr-3" :class="isRouteActive(item.path, item.exact) ? 'text-blue-600' : ''" />
                {{ item.name }}
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      
        <div class="flex-1 flex items-center justify-between min-w-0">
          <h1 class="text-xl font-semibold truncate">{{ route.name || 'HR Dashboard' }}</h1>
          <div class="flex items-center gap-4 shrink-0">
             <div class="w-8 h-8 rounded-full bg-muted border border-border"></div>
          </div>
        </div>
      </header>
      
      <div class="flex-1 overflow-y-auto p-4 md:p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
```

- [ ] **Step 2: Commit**
```bash
git add src/layouts/HrisLayout.vue
git commit -m "feat(layout): make hris layout dynamic and responsive with mobile sheet"
```
