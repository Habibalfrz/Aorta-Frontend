<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Users, FileClock, CalendarDays, TrendingUp, UserPlus, Building2 } from 'lucide-vue-next'
import api from '@/api/axios'
import { Card } from '@/components/ui/card'

const stats = ref<any>(null)
const isLoading = ref(true)
const isLoaded = ref(false)

const fetchDashboardStats = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/hris/dashboard/stats')
    stats.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch HR dashboard stats:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDashboardStats()
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})
</script>

<template>
  <div class="space-y-8 max-w-[1400px]">
    <!-- Page Title -->
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">HRIS Dashboard</h1>
      <p class="text-sm text-muted-foreground mt-1 font-medium">Ringkasan aktivitas kepegawaian, kehadiran, dan pengajuan hari ini.</p>
    </div>

    <!-- Quick Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      <!-- Total Employees -->
      <Card class="bg-card/60 backdrop-blur-3xl rounded-[2rem] p-6 border border-border/50 shadow-sm relative overflow-hidden transition-all duration-700 delay-100 ease-out group"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="flex justify-between items-start mb-6">
          <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Users class="w-5 h-5" />
          </div>
          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            <TrendingUp class="w-3 h-3" /> +12%
          </span>
        </div>
        <div class="space-y-1">
          <h3 class="text-3xl font-bold text-foreground tracking-tight">
            <span v-if="isLoading" class="animate-pulse bg-slate-200 text-transparent rounded w-16 inline-block">000</span>
            <span v-else>{{ stats?.totalEmployees || 0 }}</span>
          </h3>
          <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Pegawai</p>
        </div>
      </Card>

      <!-- Today's Attendance -->
      <Card class="bg-card/60 backdrop-blur-3xl rounded-[2rem] p-6 border border-border/50 shadow-sm relative overflow-hidden transition-all duration-700 delay-200 ease-out group"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="flex justify-between items-start mb-6">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
            <CalendarDays class="w-5 h-5" />
          </div>
        </div>
        <div class="space-y-1">
          <h3 class="text-3xl font-bold text-foreground tracking-tight">
            <span v-if="isLoading" class="animate-pulse bg-slate-200 text-transparent rounded w-16 inline-block">000</span>
            <span v-else>{{ stats?.attendanceToday || 0 }}</span>
          </h3>
          <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hadir Hari Ini</p>
        </div>
      </Card>

      <!-- Pending Leaves -->
      <Card class="bg-card/60 backdrop-blur-3xl rounded-[2rem] p-6 border border-border/50 shadow-sm relative overflow-hidden transition-all duration-700 delay-300 ease-out group"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="flex justify-between items-start mb-6">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <FileClock class="w-5 h-5" />
          </div>
          <span v-if="stats?.pendingLeaves > 0" class="relative flex h-2.5 w-2.5 mt-1 mr-1">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
        </div>
        <div class="space-y-1">
          <h3 class="text-3xl font-bold text-foreground tracking-tight">
            <span v-if="isLoading" class="animate-pulse bg-slate-200 text-transparent rounded w-16 inline-block">000</span>
            <span v-else>{{ stats?.pendingLeaves || 0 }}</span>
          </h3>
          <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cuti Menunggu</p>
        </div>
      </Card>

      <!-- Departments -->
      <Card class="bg-card/60 backdrop-blur-3xl rounded-[2rem] p-6 border border-border/50 shadow-sm relative overflow-hidden transition-all duration-700 delay-400 ease-out group"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="flex justify-between items-start mb-6">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
            <Building2 class="w-5 h-5" />
          </div>
        </div>
        <div class="space-y-1">
          <h3 class="text-3xl font-bold text-foreground tracking-tight">
            <span v-if="isLoading" class="animate-pulse bg-slate-200 text-transparent rounded w-16 inline-block">000</span>
            <span v-else>{{ stats?.totalDepartments || 0 }}</span>
          </h3>
          <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Departemen</p>
        </div>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Hires -->
      <Card class="bg-card/60 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-border/50 shadow-sm transition-all duration-700 delay-500 ease-out"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl bg-accent text-muted-foreground flex items-center justify-center border border-border/50">
            <UserPlus class="w-5 h-5" />
          </div>
          <h3 class="text-lg font-bold text-foreground tracking-tight">Pegawai Baru Masuk</h3>
        </div>

        <div v-if="isLoading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 animate-pulse">
            <div class="w-10 h-10 rounded-full bg-slate-200"></div>
            <div class="space-y-2 flex-1">
              <div class="h-4 bg-slate-200 rounded w-1/2"></div>
              <div class="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        <div v-else-if="stats?.recentHires && stats.recentHires.length > 0" class="space-y-4">
          <div v-for="hire in stats.recentHires" :key="hire.id" class="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20">
              {{ hire.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-bold text-foreground">{{ hire.name }}</p>
              <p class="text-xs text-muted-foreground font-mono">{{ hire.nik }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-muted-foreground text-sm font-medium">
          Belum ada data pegawai baru.
        </div>
      </Card>

      <!-- Chart Placeholder for MVP -->
      <Card class="bg-card/60 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-border/50 shadow-sm transition-all duration-700 delay-500 ease-out flex flex-col justify-center items-center text-center"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="w-16 h-16 rounded-full bg-accent text-muted-foreground flex items-center justify-center mb-4 border border-border/50">
           <TrendingUp class="w-8 h-8 opacity-50" />
        </div>
        <h3 class="text-lg font-bold text-foreground tracking-tight">Trend Kehadiran</h3>
        <p class="text-xs text-muted-foreground mt-2 max-w-[250px]">Modul visualisasi grafik akan hadir pada iterasi MVP berikutnya.</p>
      </Card>
    </div>

  </div>
</template>