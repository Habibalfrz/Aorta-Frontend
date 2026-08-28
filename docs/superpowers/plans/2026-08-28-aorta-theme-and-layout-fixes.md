# Aorta Theme System & Layout Fixes Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a natural, elegant, semantic Theme System (Light, Dark, Ocean) resolving the "unnatural dark background" issue, and fix the overlapping layout bugs between SysAdmin and HRIS views.

**Architecture:** Use CSS custom properties (HSL) mapped to Tailwind v4 theme variables. Remove all hardcoded `#050505` and `#0a0a0a` colors. Fix Vue Router layout components to use proper DOM flow (flex min-h-screen) without breaking unmount cycles.

**Tech Stack:** Vue 3, Tailwind CSS v4, Vue Router.

## Global Constraints
- **Theming:** Use semantic classes ONLY (`bg-background`, `text-foreground`, `bg-card`, `border-border`). Absolutely NO hardcoded hex colors like `bg-[#050505]` in the UI components.
- **Layout Flow:** Root layout containers must use `flex min-h-screen w-full flex-col` or `flex-row`. Avoid using `z-index` hacks or `absolute` positioning that bleeds outside the router view.

---

### Task 1: Establish Semantic Theme System

**Files:**
- Modify: `src/assets/tailwind.css`
- Create: `src/composables/useTheme.ts`
- Modify: `src/App.vue`

**Interfaces:**
- Produces: A robust CSS variable system and a Vue composable for switching themes.

- [ ] **Step 1: Define CSS Variables in `app.css`**

```css
/* src/assets/tailwind.css */
@import 'tailwindcss';
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-border: hsl(var(--border));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
}

@layer base {
  :root {
    /* Elegant Light Theme */
    --background: 0 0% 100%;
    --foreground: 222.2 47.4% 11.2%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
  }

  .dark {
    /* Natural Dark Theme */
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;
    --card: 222 47% 7%;
    --card-foreground: 213 31% 91%;
    --border: 216 34% 17%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 1.2%;
    --muted: 223 47% 11%;
    --muted-foreground: 215.4 16.3% 56.9%;
  }

  .theme-ocean {
    /* Soft Ocean Theme */
    --background: 210 50% 98%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --border: 214 32% 91%;
    --primary: 221 83% 53%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
  }

  body {
    @apply bg-background text-foreground antialiased transition-colors duration-300;
  }
}
```

- [ ] **Step 2: Create Theme Composable**

```typescript
// src/composables/useTheme.ts
import { ref, onMounted } from 'vue'

export function useTheme() {
  const currentTheme = ref('light')

  const setTheme = (theme: 'light' | 'dark' | 'theme-ocean') => {
    currentTheme.value = theme
    const html = document.documentElement
    
    html.classList.remove('dark', 'theme-ocean')
    if (theme !== 'light') {
      html.classList.add(theme)
    }
    localStorage.setItem('aorta-theme', theme)
  }

  onMounted(() => {
    const saved = localStorage.getItem('aorta-theme') as any
    if (saved) {
      setTheme(saved)
    } else {
      // Auto detect OS preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark')
      }
    }
  })

  return { currentTheme, setTheme }
}
```

- [ ] **Step 3: Initialize Theme in App.vue**

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
import { useTheme } from '@/composables/useTheme'

// Initialize theme globally
useTheme()
</script>

<template>
  <RouterView />
  <Toaster position="top-right" rich-colors />
</template>
```

- [ ] **Step 4: Commit**
```bash
git add src/assets/tailwind.css src/composables/useTheme.ts src/App.vue
git commit -m "feat(theme): implement semantic css variable theme system"
```

### Task 2: Refactor Landing & Auth Views (Semantic Styling)

**Files:**
- Modify: `src/modules/Public/views/LandingView.vue`
- Modify: `src/layouts/AuthSimpleLayout.vue`

**Interfaces:**
- Produces: Elegant, theme-responsive views without hardcoded dark colors.

- [ ] **Step 1: Refactor LandingView**

```vue
<!-- src/modules/Public/views/LandingView.vue -->
<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col justify-center items-center relative overflow-hidden">
    
    <div class="z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border mb-8">
        <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aorta Enterprise V2.0</span>
      </div>

      <h1 class="text-5xl md:text-7xl tracking-tight leading-tight font-extrabold mb-6">
        Hospital OS <br/> Reimagined.
      </h1>
      <p class="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl font-light">
        A completely decoupled, module-based architecture designed for high-performance healthcare environments.
      </p>

      <div v-if="authStore.isAuthenticated">
        <RouterLink :to="authStore.determineLandingRoute()" class="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-primary text-primary-foreground h-12 px-10 hover:opacity-90 transition-opacity shadow-md">
          Masuk ke Portal
        </RouterLink>
      </div>
      <div v-else>
        <RouterLink to="/login" class="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-primary text-primary-foreground h-12 px-10 hover:opacity-90 transition-opacity shadow-md">
          Login ke Sistem
        </RouterLink>
      </div>

      <!-- Feature Cards -->
      <div class="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div class="bg-card text-card-foreground border border-border rounded-2xl p-8 text-left hover:border-primary/50 transition-colors shadow-sm">
          <div class="h-12 w-12 bg-muted rounded-xl flex items-center justify-center mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h3 class="font-semibold text-lg mb-2">Billing System</h3>
          <p class="text-muted-foreground text-sm leading-relaxed">Efficient transaction handling and patient billing with robust logging.</p>
        </div>
        <div class="bg-card text-card-foreground border border-border rounded-2xl p-8 text-left hover:border-primary/50 transition-colors shadow-sm">
          <div class="h-12 w-12 bg-muted rounded-xl flex items-center justify-center mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h3 class="font-semibold text-lg mb-2">HRIS Integration</h3>
          <p class="text-muted-foreground text-sm leading-relaxed">Isolated enterprise module for unified staff management and payroll.</p>
        </div>
        <div class="bg-card text-card-foreground border border-border rounded-2xl p-8 text-left hover:border-primary/50 transition-colors shadow-sm">
          <div class="h-12 w-12 bg-muted rounded-xl flex items-center justify-center mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <h3 class="font-semibold text-lg mb-2">Medical Records</h3>
          <p class="text-muted-foreground text-sm leading-relaxed">Secure and fast access to patient medical histories with granular permissions.</p>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Refactor Auth Layout**

```vue
<!-- src/layouts/AuthSimpleLayout.vue -->
<script setup lang="ts">
</script>
<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
    <div class="w-full max-w-6xl bg-card rounded-3xl shadow-xl border border-border flex flex-col md:flex-row overflow-hidden">
      <!-- Left Panel: Clean Corporate Branding -->
      <div class="hidden md:flex flex-col w-1/2 p-12 bg-muted relative">
        <div class="z-10 relative flex-1 flex flex-col justify-between">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span class="text-primary-foreground font-bold text-xl">A</span>
             </div>
             <h2 class="text-2xl font-bold text-foreground tracking-tight">Aorta OS</h2>
          </div>
          <div class="space-y-4">
            <h3 class="text-4xl font-extrabold text-foreground leading-tight">Enterprise <br/>Hospital Management.</h3>
            <p class="text-muted-foreground text-lg">Secure, scalable, and decoupled architecture for modern healthcare facilities.</p>
          </div>
        </div>
      </div>
      <!-- Right Panel: Form Area -->
      <div class="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-card text-card-foreground">
        <slot />
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Commit**
```bash
git add src/modules/Public/views/LandingView.vue src/layouts/AuthSimpleLayout.vue
git commit -m "style: refactor landing and auth views to use semantic theme tokens"
```

### Task 3: Fix Layout Overlap Bug (SysAdmin & HRIS)

**Files:**
- Modify: `src/layouts/SysAdminLayout.vue`
- Modify: `src/layouts/HrisLayout.vue`

**Interfaces:**
- Produces: Clean, standard DOM structures that prevent overlapping during Vue Router transitions.

- [ ] **Step 1: Fix SysAdmin Layout**

Ensure `min-h-screen` and `bg-background` are properly set without absolute hacks. Remove hardcoded dark colors.

```vue
<!-- src/layouts/SysAdminLayout.vue -->
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { LayoutDashboard, Users, Shield, Key, Activity, Layers, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/store/auth'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { currentTheme, setTheme } = useTheme()

const navigation = [
  { name: 'Dashboard', path: '/admin-portal', icon: LayoutDashboard },
  { name: 'User Management', path: '/admin-portal/users', icon: Users },
  { name: 'Role Management', path: '/admin-portal/roles', icon: Shield },
  { name: 'Permission Builder', path: '/admin-portal/permissions', icon: Key },
  { name: 'Resource Monitor', path: '/admin-portal/monitor', icon: Activity },
  { name: 'Modules Explorer', path: '/admin-portal/modules', icon: Layers },
]
</script>

<template>
  <div class="flex h-screen bg-background text-foreground font-sans overflow-hidden">
    <!-- SysAdmin Sidebar -->
    <aside class="w-72 bg-card border-r border-border flex flex-col flex-shrink-0">
      <div class="h-16 flex items-center px-6 border-b border-border">
        <div class="w-8 h-8 bg-primary text-primary-foreground rounded flex items-center justify-center mr-3">
          <Shield class="w-5 h-5" />
        </div>
        <span class="font-bold text-lg tracking-wide">SysAdmin Portal</span>
      </div>
      <nav class="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <button v-for="item in navigation" :key="item.name" @click="router.push(item.path)"
          class="w-full flex items-center px-3 py-2.5 rounded-lg transition-colors"
          :class="route.path === item.path || (item.path !== '/admin-portal' && route.path.startsWith(item.path)) ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'">
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </button>
      </nav>
      
      <!-- Theme Switcher (Bonus for Enterprise) -->
      <div class="px-4 py-2 border-t border-border flex items-center justify-between text-sm">
        <span class="text-muted-foreground font-medium">Tema:</span>
        <select class="bg-transparent border border-border rounded px-2 py-1 text-xs" :value="currentTheme" @change="e => setTheme((e.target as HTMLSelectElement).value as any)">
           <option value="light">Light</option>
           <option value="dark">Dark</option>
           <option value="theme-ocean">Ocean</option>
        </select>
      </div>

      <div class="p-4 border-t border-border">
        <div class="flex items-center gap-3 mb-4 px-2">
           <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground font-bold">SA</div>
           <div class="text-left overflow-hidden">
              <p class="text-sm font-medium truncate">{{ authStore.user?.name || 'Superadmin' }}</p>
           </div>
        </div>
        <button @click="authStore.logout()" class="w-full flex items-center px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
          <LogOut class="w-5 h-5 mr-3" /> Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 bg-background">
      <header class="h-16 border-b border-border bg-card flex items-center px-8 z-10 flex-shrink-0">
        <span class="font-medium">{{ route.name || 'Dashboard' }}</span>
      </header>
      <div class="flex-1 overflow-y-auto p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
```

- [ ] **Step 2: Fix HRIS Layout**

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
  <div class="flex h-screen bg-background text-foreground font-sans overflow-hidden">
    <!-- HRIS Sidebar -->
    <aside class="w-64 bg-card border-r border-border flex flex-col shadow-sm flex-shrink-0">
      <div class="h-16 flex items-center px-6 border-b border-border">
        <div class="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center mr-3 font-bold">HR</div>
        <span class="font-bold text-lg">HRIS Portal</span>
      </div>

      <nav class="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <button v-for="item in navigation" :key="item.name" @click="router.push(item.path)"
          class="w-full flex items-center px-3 py-2.5 rounded-md transition-colors"
          :class="route.path === item.path ? 'bg-blue-50 text-blue-700 font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'">
          <component :is="item.icon" class="w-5 h-5 mr-3" :class="route.path === item.path ? 'text-blue-600' : ''" />
          {{ item.name }}
        </button>
      </nav>

      <div class="p-4 border-t border-border bg-muted/30">
        <!-- Superadmin Escape Hatch -->
        <button v-if="authStore.hasRole('superadmin')" @click="router.push('/admin-portal/modules')"
          class="w-full flex items-center justify-center px-3 py-2 mb-4 rounded-md border border-border bg-card text-xs font-medium text-muted-foreground hover:bg-muted transition-colors shadow-sm">
          <ArrowLeft class="w-3 h-3 mr-2" /> Back to SysAdmin
        </button>

        <div class="flex items-center gap-3 px-2">
           <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
             {{ authStore.user?.name?.charAt(0) || 'U' }}
           </div>
           <div class="text-left overflow-hidden">
              <p class="text-sm font-medium truncate">{{ authStore.user?.name || 'HR Manager' }}</p>
           </div>
        </div>
      </div>
    </aside>

    <!-- Main HRIS Content -->
    <main class="flex-1 flex flex-col min-w-0 bg-background">
      <header class="h-16 border-b border-border bg-card flex items-center justify-between px-8 z-10 flex-shrink-0 shadow-sm">
        <h1 class="text-xl font-semibold">{{ route.name || 'HR Dashboard' }}</h1>
        <div class="flex items-center gap-4">
           <div class="w-8 h-8 rounded-full bg-muted border border-border"></div>
        </div>
      </header>
      <div class="flex-1 overflow-y-auto p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
```

- [ ] **Step 3: Update Module Explorer styling**
Update `ModuleExplorerView.vue` to use semantic colors.

```vue
<!-- src/modules/SysAdmin/views/ModuleExplorerView.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Users, Ticket, Package } from 'lucide-vue-next'

const router = useRouter()

const modules = [
  { id: 'hris', name: 'HRIS System', description: 'Human Resource Information System. Manage employees, payroll, and attendance.', icon: Users, path: '/hris', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'ticketing', name: 'IT Ticketing', description: 'Helpdesk and issue tracking for hospital staff.', icon: Ticket, path: '/admin-portal/modules', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'inventory', name: 'Inventory', description: 'Medical and non-medical asset tracking.', icon: Package, path: '/admin-portal/modules', color: 'text-purple-500', bg: 'bg-purple-500/10' },
]

function enterModule(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="space-y-6 max-w-6xl">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Modules Explorer</h1>
      <p class="text-muted-foreground mt-2">Access and simulate standalone business modules as Superadmin.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <div v-for="mod in modules" :key="mod.id"
           @click="enterModule(mod.path)"
           class="bg-card text-card-foreground border border-border rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer group hover:-translate-y-1 shadow-sm">
        <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors', mod.bg, mod.color]">
          <component :is="mod.icon" class="w-6 h-6" />
        </div>
        <h3 class="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{{ mod.name }}</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">{{ mod.description }}</p>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Commit**
```bash
git add src/layouts/SysAdminLayout.vue src/layouts/HrisLayout.vue src/modules/SysAdmin/views/ModuleExplorerView.vue
git commit -m "fix(layout): resolve layout overlap bugs and convert to semantic styles"
```
