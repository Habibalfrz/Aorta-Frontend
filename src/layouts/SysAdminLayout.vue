<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  ShieldCheck,
  LineChart,
  LogOut,
  ArrowLeft
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const navigation = [
  { name: 'Dashboard', path: '/admin-portal', icon: LayoutDashboard },
  { name: 'System Health', path: '/admin-portal/health', icon: Activity },
  { name: 'Error Logs', path: '/admin-portal/logs', icon: AlertTriangle },
  { name: 'Role Access', path: '/admin-portal/roles', icon: ShieldCheck },
  { name: 'API Metrics', path: '/admin-portal/metrics', icon: LineChart },
]

const handleLogout = () => {
  authStore.logout()
}

const backToESS = () => {
  router.push('/ess')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    
    <!-- Sidebar (Dark/Technical Theme) -->
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
      <!-- Branding Area -->
      <div class="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
        <ShieldCheck class="w-6 h-6 text-emerald-500 mr-3" />
        <span class="text-lg font-bold text-slate-100 tracking-tight">SysAdmin</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <button
          v-for="item in navigation"
          :key="item.name"
          @click="router.push(item.path)"
          :class="[
            route.path === item.path 
              ? 'bg-slate-800 text-white' 
              : 'hover:bg-slate-800/50 hover:text-white',
            'w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3 flex-shrink-0" :class="route.path === item.path ? 'text-emerald-500' : 'text-slate-400'" />
          {{ item.name }}
        </button>
      </nav>

      <!-- Bottom Actions -->
      <div class="p-4 border-t border-slate-800 space-y-2">
        <Button 
          variant="outline" 
          class="w-full justify-start bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          @click="backToESS"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to ESS
        </Button>
        <Button 
          variant="ghost" 
          class="w-full justify-start text-slate-400 hover:bg-red-950/30 hover:text-red-400"
          @click="handleLogout"
        >
          <LogOut class="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Header for Breadcrumbs -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm z-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin-portal">SysAdmin Portal</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{{ route.name || 'Dashboard' }}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-8 relative">
        <!-- Fallback UI if roles extraction fails -->
        <div v-if="authStore.roles.length === 0" class="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
          <div class="text-center space-y-4 max-w-md p-6 bg-white rounded-lg shadow-xl border border-slate-200">
            <AlertTriangle class="w-12 h-12 text-amber-500 mx-auto" />
            <h3 class="text-lg font-semibold text-slate-900">Data Autentikasi Tidak Lengkap</h3>
            <p class="text-sm text-slate-500">
              Kami mengalami kendala saat membaca hak akses Anda. Silakan coba muat ulang atau login kembali.
            </p>
            <Button variant="outline" @click="handleLogout" class="mt-4">Login Ulang</Button>
          </div>
        </div>

        <div class="max-w-7xl mx-auto" v-else>
          <slot />
        </div>
      </main>
    </div>
    
  </div>
</template>
