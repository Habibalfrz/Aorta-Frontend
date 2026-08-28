# Aorta Frontend Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Aorta Hospital OS UI from Laravel/Inertia to a standalone Vue 3 + TypeScript SPA powered by ASP.NET, maintaining 100% visual parity.

**Architecture:** We will replace Inertia's data fetching and routing with Vue Router and Pinia (`useAuthStore`). The UI will rely on Tailwind v4, Shadcn-vue, and `tw-animate-css` as specified in the blueprint. Forms will be refactored to standard Axios calls.

**Tech Stack:** Vue 3 (Composition API), TypeScript, Tailwind CSS v4, Vue Router, Pinia, Axios, Shadcn-vue.

**Spec:** `docs/superpowers/specs/2026-08-28-aorta-frontend-migration-design.md`

## Global Constraints
- **Tailwind:** Use Tailwind v4 `@theme inline` in CSS, do not use `tailwind.config.js` for colors.
- **Routing:** Use `<RouterLink>` exclusively, no Inertia `<Link>`.
- **State:** Read user/permissions from Pinia `useAuthStore()`, never `usePage().props`.

---

### Task 1: Global Theming & Foundation Setup

**Files:**
- Modify: `src/assets/tailwind.css`
- Modify: `src/App.vue`

**Interfaces:**
- Produces: CSS variables and base theme required by all subsequent UI tasks.

- [ ] **Step 1: Configure Tailwind v4 Theme Variables**

```css
/* src/assets/tailwind.css */
@import 'tailwindcss';
/* Make sure tw-animate-css is installed or mapped if needed */
/* @import 'tw-animate-css'; */
@custom-variant dark (&:is(.dark *));

@theme inline {
    --font-sans: Instrument Sans, ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-primary: var(--primary);
    --color-sidebar: var(--sidebar-background);
}

@layer base {
    body { @apply bg-background text-foreground; }
}
```

- [ ] **Step 2: Add Global Components in App.vue**

Ensure the app root can display toasts.

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <RouterView />
  <Toaster position="top-right" rich-colors />
</template>
```

- [ ] **Step 3: Commit**

```bash
git add src/assets/tailwind.css src/App.vue
git commit -m "chore: setup tailwind v4 theming and global toaster"
```

### Task 2: Auth Container & Login Refactor

**Files:**
- Create: `src/layouts/AuthSimpleLayout.vue`
- Modify: `src/modules/Auth/views/LoginView.vue`

**Interfaces:**
- Consumes: `useAuthStore.login()` from `src/store/auth.ts`.
- Produces: A functional login page using Vue standard reactives.

- [ ] **Step 1: Create Auth Layout**

```vue
<!-- src/layouts/AuthSimpleLayout.vue -->
<script setup lang="ts">
// Auth container as described in blueprint
</script>
<template>
  <div class="min-h-screen bg-slate-100 dark:bg-[#050505] flex items-center justify-center p-4">
    <div class="max-w-5xl w-full bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200/60 dark:border-zinc-800/80 flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <!-- Left Panel Brand -->
      <div class="hidden md:flex flex-col bg-slate-900 text-white w-1/2 p-8 relative">
        <div class="z-10 relative h-full flex flex-col justify-between">
            <h2 class="text-3xl font-bold">Aorta OS</h2>
            <p class="text-slate-300">Enterprise Hospital Management</p>
        </div>
      </div>
      <!-- Right Panel Form -->
      <div class="w-full md:w-1/2 p-8">
        <slot />
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Refactor Login Form Logic**

Replace any Inertia form logic in `LoginView.vue` with native Vue reactive state.

```vue
<!-- src/modules/Auth/views/LoginView.vue -->
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import AuthSimpleLayout from '@/layouts/AuthSimpleLayout.vue'
import { toast } from 'vue-sonner'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const isLoading = ref(false)

async function handleLogin() {
  isLoading.value = true
  try {
    await authStore.login(form)
    router.push(authStore.determineLandingRoute())
  } catch (error) {
    toast.error('Login Failed', { description: 'Please check your credentials.' })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthSimpleLayout>
    <div class="space-y-6">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Welcome back</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">Enter your credentials to access your account</p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="email">Email</label>
          <input id="email" v-model="form.email" type="email" class="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 dark:border-slate-800 dark:placeholder:text-slate-400" required />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="password">Password</label>
          <input id="password" v-model="form.password" type="password" class="flex h-10 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 dark:border-slate-800 dark:placeholder:text-slate-400" required />
        </div>
        <button type="submit" :disabled="isLoading" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-white hover:bg-slate-900/90 h-10 px-4 py-2 w-full dark:bg-slate-50 dark:text-slate-900">
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </AuthSimpleLayout>
</template>
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/AuthSimpleLayout.vue src/modules/Auth/views/LoginView.vue
git commit -m "feat(auth): refactor login view to use vue reactive and auth store"
```

### Task 3: Landing Page Adaption

**Files:**
- Modify: `src/modules/Public/views/LandingView.vue`

**Interfaces:**
- Consumes: `authStore.isAuthenticated` to toggle CTAs.

- [ ] **Step 1: Implement Landing Page UI**

```vue
<!-- src/modules/Public/views/LandingView.vue -->
<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 class="text-4xl md:text-6xl tracking-tight leading-tight font-extrabold mb-6">
        Aorta Hospital OS
      </h1>
      <p class="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl">
        A modernized, decoupled approach to hospital management. Built for performance and reliability.
      </p>
      
      <div v-if="authStore.isAuthenticated">
        <RouterLink :to="authStore.determineLandingRoute()" class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white h-11 px-8 dark:bg-slate-50 dark:text-slate-900">
          Ke Dashboard
        </RouterLink>
      </div>
      <div v-else>
        <RouterLink to="/login" class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 text-white h-11 px-8 dark:bg-slate-50 dark:text-slate-900">
          Masuk
        </RouterLink>
      </div>
      
      <div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div class="border border-slate-200 dark:border-zinc-800 rounded-xl p-6 text-left hover:border-slate-300 dark:hover:border-zinc-700 transition-colors">
          <div class="h-10 w-10 bg-slate-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center mb-4">
             <!-- Icon placeholder -->
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-700 dark:text-slate-300"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <h3 class="font-semibold text-lg mb-2">Billing System</h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm">Efficient transaction handling and patient billing.</p>
        </div>
        <!-- Add more feature cards as needed to match 100% UI -->
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/Public/views/LandingView.vue
git commit -m "feat(landing): implement welcome page UI with dynamic auth routing"
```

### Task 4: Sidebar Shell & Navigation Setup

**Files:**
- Create: `src/layouts/AppSidebarLayout.vue`
- Create: `src/components/navigation/AppSidebar.vue`
- Create: `src/components/navigation/NavUser.vue`

**Interfaces:**
- Consumes: `useAuthStore()` to show user details in the footer.
- Produces: The main shell used by HRIS and Admin layout configs.

- [ ] **Step 1: Create Sidebar Layout**

```vue
<!-- src/layouts/AppSidebarLayout.vue -->
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
```

- [ ] **Step 2: Create AppSidebar & NavUser**

```vue
<!-- src/components/navigation/AppSidebar.vue -->
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
    </div>
    <NavUser />
  </aside>
</template>
```

```vue
<!-- src/components/navigation/NavUser.vue -->
<script setup lang="ts">
import { useAuthStore } from '@/store/auth'
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
}
</script>
<template>
  <div class="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
    <div class="flex items-center gap-3 overflow-hidden">
      <div class="h-8 w-8 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0">
        {{ authStore.user?.name?.charAt(0) || 'U' }}
      </div>
      <div class="truncate">
        <p class="text-sm font-medium truncate">{{ authStore.user?.name }}</p>
        <p class="text-xs text-slate-500 truncate">{{ authStore.user?.email }}</p>
      </div>
    </div>
    <button @click="handleLogout" class="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
    </button>
  </div>
</template>
```

- [ ] **Step 3: Update Main Layouts to Use Sidebar Shell**

Update `src/layouts/SysAdminLayout.vue` and `src/layouts/HrisLayout.vue` to simply wrap `AppSidebarLayout`.

```vue
<!-- src/layouts/SysAdminLayout.vue -->
<script setup lang="ts">
import AppSidebarLayout from './AppSidebarLayout.vue'
</script>
<template>
  <AppSidebarLayout />
</template>
```

- [ ] **Step 4: Commit**

```bash
git add src/layouts/ src/components/navigation/
git commit -m "feat(ui): implement sidebar shell and user navigation components"
```
