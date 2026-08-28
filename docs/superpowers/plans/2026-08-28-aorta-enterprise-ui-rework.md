# Aorta Enterprise UI & Multi-World Architecture Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Aorta Frontend to feature a premium Enterprise look (Landing/Login) and implement a "Multi-World" layout architecture where the SysAdmin portal and business modules (like HRIS) exist in completely isolated, distinct UI shells.

**Architecture:** Vue Router will handle root-level layout swapping. We move away from a single unified sidebar and instead use distinct layout components (`SysAdminLayout.vue` and `HrisLayout.vue`) to represent different "worlds". Pinia handles permissions.

**Tech Stack:** Vue 3 (Composition API), TypeScript, Tailwind CSS v4, Vue Router, Lucide Icons.

## Global Constraints
- **Tailwind:** Use Tailwind v4 standard classes. No generic backgrounds; rely on high-contrast `#050505` for dark themes and crisp `#ffffff` for light themes.
- **Routing:** `<RouterView>` must be isolated per "world". 
- **Isolation:** SysAdmin UI must NOT bleed into HRIS UI. They are visually and structurally distinct.

---

### Task 1: Enterprise Landing & Login Views

**Files:**
- Modify: `src/modules/Public/views/LandingView.vue`
- Modify: `src/layouts/AuthSimpleLayout.vue`
- Modify: `src/modules/Auth/views/LoginView.vue`

**Interfaces:**
- Produces: A premium, trust-inspiring entry experience.

- [ ] **Step 1: Redesign Auth Layout (Split Screen)**

```vue
<!-- src/layouts/AuthSimpleLayout.vue -->
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-[#050505] flex items-center justify-center p-4 sm:p-8">
    <div class="w-full max-w-6xl bg-[#0a0a0a] rounded-3xl shadow-2xl border border-zinc-800/80 flex flex-col md:flex-row overflow-hidden">
      <!-- Left Panel: Branding & Abstract Tech -->
      <div class="hidden md:flex flex-col w-1/2 p-12 relative overflow-hidden bg-gradient-to-br from-slate-900 to-[#050505]">
        <!-- Decorative SVG Pattern -->
        <div class="absolute inset-0 opacity-20 pointer-events-none">
          <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div class="z-10 relative flex-1 flex flex-col justify-between">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-xl">A</span>
             </div>
             <h2 class="text-2xl font-bold text-white tracking-tight">Aorta OS</h2>
          </div>
          <div class="space-y-4">
            <h3 class="text-4xl font-extrabold text-white leading-tight">Enterprise <br/>Hospital Management.</h3>
            <p class="text-slate-400 text-lg">Secure, scalable, and decoupled architecture for modern healthcare facilities.</p>
          </div>
        </div>
      </div>
      <!-- Right Panel: Form Area -->
      <div class="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white dark:bg-[#0a0a0a]">
        <slot />
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Update Login View Styles**

Adjust `LoginView.vue` to match the new container. Ensure inputs look premium (subtle borders, focus rings). (Keep existing form logic).

- [ ] **Step 3: Redesign Landing Page**

Update `LandingView.vue` to use a dark, premium aesthetic similar to the Auth left panel, featuring large typography and high-contrast glowing buttons.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/AuthSimpleLayout.vue src/modules/Auth/views/LoginView.vue src/modules/Public/views/LandingView.vue
git commit -m "feat(ui): redesign landing and login pages to enterprise dark theme"
```

### Task 2: SysAdmin World (Routing & Layout)

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/layouts/SysAdminLayout.vue`

**Interfaces:**
- Produces: The isolated routing branch `/admin` and its dedicated dark/tech layout.

- [ ] **Step 1: Implement SysAdminLayout**

```vue
<!-- src/layouts/SysAdminLayout.vue -->
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { LayoutDashboard, Users, Shield, Key, Activity, Layers, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const navigation = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'User Management', path: '/admin/users', icon: Users },
  { name: 'Role Management', path: '/admin/roles', icon: Shield },
  { name: 'Permission Builder', path: '/admin/permissions', icon: Key },
  { name: 'Resource Monitor', path: '/admin/monitor', icon: Activity },
  { name: 'Modules Explorer', path: '/admin/modules', icon: Layers },
]
</script>

<template>
  <div class="flex h-screen bg-[#050505] text-slate-300 font-sans">
    <!-- SysAdmin Dark Sidebar -->
    <aside class="w-72 bg-[#0a0a0a] border-r border-zinc-800 flex flex-col">
      <div class="h-16 flex items-center px-6 border-b border-zinc-800">
        <div class="w-8 h-8 bg-emerald-500/20 text-emerald-500 rounded flex items-center justify-center mr-3">
          <Shield class="w-5 h-5" />
        </div>
        <span class="font-bold text-white text-lg tracking-wide">SysAdmin Portal</span>
      </div>
      <nav class="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <button v-for="item in navigation" :key="item.name" @click="router.push(item.path)"
          class="w-full flex items-center px-3 py-2.5 rounded-lg transition-colors"
          :class="route.path.startsWith(item.path) && (item.path !== '/admin' || route.path === '/admin') ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-slate-400 hover:bg-zinc-800/50 hover:text-white'">
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </button>
      </nav>
      <div class="p-4 border-t border-zinc-800">
        <div class="flex items-center gap-3 mb-4 px-2">
           <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white">SA</div>
           <div class="text-left">
              <p class="text-sm text-white font-medium">{{ authStore.user?.name || 'Superadmin' }}</p>
           </div>
        </div>
        <button @click="authStore.logout()" class="w-full flex items-center px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut class="w-5 h-5 mr-3" /> Logout
        </button>
      </div>
    </aside>

    <!-- Main SysAdmin Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur flex items-center px-8 z-10">
        <span class="text-white font-medium">{{ route.name || 'SysAdmin Dashboard' }}</span>
      </header>
      <div class="flex-1 overflow-auto p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
```

- [ ] **Step 2: Update Router definitions in `src/router/index.ts`**
Update routes to match `/admin/...` pointing to `SysAdminLayout` and generating the appropriate children routes.

- [ ] **Step 3: Commit**
```bash
git add src/layouts/SysAdminLayout.vue src/router/index.ts
git commit -m "feat(sysadmin): implement isolated dark tech layout for sysadmin world"
```

### Task 3: Module Explorer View

**Files:**
- Create: `src/modules/SysAdmin/views/ModuleExplorerView.vue`

**Interfaces:**
- Consumes: Hardcoded array of modules (for now) or from `authStore`.
- Produces: The jumping-off point for Superadmin to enter other worlds.

- [ ] **Step 1: Create Module Explorer View**

```vue
<!-- src/modules/SysAdmin/views/ModuleExplorerView.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Users, Ticket, Package } from 'lucide-vue-next'

const router = useRouter()

const modules = [
  { id: 'hris', name: 'HRIS System', description: 'Human Resource Information System. Manage employees, payroll, and attendance.', icon: Users, path: '/hris', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'ticketing', name: 'IT Ticketing', description: 'Helpdesk and issue tracking for hospital staff.', icon: Ticket, path: '/admin/modules', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'inventory', name: 'Inventory', description: 'Medical and non-medical asset tracking.', icon: Package, path: '/admin/modules', color: 'text-purple-500', bg: 'bg-purple-500/10' },
]

function enterModule(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="space-y-6 max-w-6xl">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Modules Explorer</h1>
      <p class="text-slate-400 mt-2">Access and simulate standalone business modules as Superadmin.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <div v-for="mod in modules" :key="mod.id" 
           @click="enterModule(mod.path)"
           class="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-all cursor-pointer group hover:-translate-y-1 shadow-lg">
        <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors', mod.bg, mod.color]">
          <component :is="mod.icon" class="w-6 h-6" />
        </div>
        <h3 class="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">{{ mod.name }}</h3>
        <p class="text-slate-400 text-sm leading-relaxed">{{ mod.description }}</p>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**
```bash
git add src/modules/SysAdmin/views/ModuleExplorerView.vue
git commit -m "feat(sysadmin): create module explorer cards for cross-world navigation"
```

### Task 4: HRIS World (Isolated Corporate Layout)

**Files:**
- Modify: `src/layouts/HrisLayout.vue`

**Interfaces:**
- Produces: The isolated `/hris` routing branch, featuring a completely different aesthetic (clean, light, corporate).

- [ ] **Step 1: Implement HrisLayout**

```vue
<!-- src/layouts/HrisLayout.vue -->
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { LayoutDashboard, Users, CalendarDays, FileClock, Banknote, Settings, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const navigation = [
  { name: 'HR Dashboard', path: '/hris', icon: LayoutDashboard },
  { name: 'Data Pegawai', path: '/hris/employees', icon: Users },
  { name: 'Manajemen Shift', path: '/hris/shifts', icon: CalendarDays },
  { name: 'Pengajuan Cuti', path: '/hris/leaves', icon: FileClock },
  { name: 'Payroll', path: '/hris/payroll', icon: Banknote },
  { name: 'HR Settings', path: '/hris/settings', icon: Settings },
]
</script>

<template>
  <div class="flex h-screen bg-slate-50 text-slate-900 font-sans">
    <!-- HRIS Corporate Sidebar (Light Mode) -->
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20">
      <div class="h-16 flex items-center px-6 border-b border-slate-100">
        <div class="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center mr-3 font-bold">HR</div>
        <span class="font-bold text-slate-800 text-lg">HRIS Portal</span>
      </div>
      
      <nav class="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <button v-for="item in navigation" :key="item.name" @click="router.push(item.path)"
          class="w-full flex items-center px-3 py-2.5 rounded-md transition-colors"
          :class="route.path === item.path ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
          <component :is="item.icon" class="w-5 h-5 mr-3" :class="route.path === item.path ? 'text-blue-600' : 'text-slate-400'" />
          {{ item.name }}
        </button>
      </nav>

      <div class="p-4 border-t border-slate-100 bg-slate-50/50">
        <!-- Superadmin Escape Hatch -->
        <button v-if="authStore.hasRole('superadmin')" @click="router.push('/admin/modules')" 
          class="w-full flex items-center justify-center px-3 py-2 mb-4 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft class="w-3 h-3 mr-2" /> Back to SysAdmin
        </button>
        
        <div class="flex items-center gap-3 px-2">
           <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
             {{ authStore.user?.name?.charAt(0) || 'U' }}
           </div>
           <div class="text-left overflow-hidden">
              <p class="text-sm text-slate-900 font-medium truncate">{{ authStore.user?.name || 'HR Manager' }}</p>
           </div>
        </div>
      </div>
    </aside>

    <!-- Main HRIS Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-10 shadow-sm">
        <h1 class="text-xl font-semibold text-slate-800">{{ route.name || 'HRIS Dashboard' }}</h1>
        <div class="flex items-center gap-4">
           <!-- Placeholder for HR notifications/search -->
           <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200"></div>
        </div>
      </header>
      <div class="flex-1 overflow-auto p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
```

- [ ] **Step 2: Commit**
```bash
git add src/layouts/HrisLayout.vue
git commit -m "feat(hris): implement isolated corporate light layout for HRIS world"
```
