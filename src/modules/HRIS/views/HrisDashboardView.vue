<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Users, FileClock, CalendarDays, TrendingUp, UserPlus, UserCog, Calculator, CheckSquare, Clock, Stethoscope, FileText, ChevronRight, Banknote } from 'lucide-vue-next'
import api from '@/api/axios'
import { Card } from '@/components/ui/card'
import LeaveCalendarWidget from '../components/Dashboard/LeaveCalendarWidget.vue'

const stats = ref<any>(null)
const isLoading = ref(true)
const isLoaded = ref(false)

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number)
}

const getMonthNameFromPeriod = (period: string) => {
  if (!period) return 'Bulan Lalu'
  const [year, month] = period.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

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

const getTodayDateString = () => {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div class="space-y-8 max-w-[1400px]">
    <!-- Page Title -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">HRIS Dashboard</h1>
        <p class="text-sm text-muted-foreground mt-1 font-medium">Ringkasan operasional SDM hari ini.</p>
      </div>
      <div class="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl font-bold text-sm shadow-sm shadow-primary/5">
        <CalendarDays class="w-4 h-4" />
        {{ getTodayDateString() }}
      </div>
    </div>

    <!-- Quick Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <CheckSquare class="w-5 h-5" />
          </div>
          <!-- Simple percentage calculation if totalEmployees exists -->
          <span v-if="!isLoading && stats?.totalEmployees > 0" class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
             {{ Math.round((stats.attendanceToday / stats.totalEmployees) * 100) }}% Hadir
          </span>
        </div>
        <div class="space-y-1">
          <h3 class="text-3xl font-bold text-foreground tracking-tight">
            <span v-if="isLoading" class="animate-pulse bg-slate-200 text-transparent rounded w-16 inline-block">000</span>
            <span v-else>{{ stats?.attendanceToday || 0 }}</span>
          </h3>
          <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hadir Hari Ini</p>
        </div>
      </Card>

      <!-- Total Salary -->
      <Card class="bg-card/60 backdrop-blur-3xl rounded-[2rem] p-6 border border-border/50 shadow-sm relative overflow-hidden transition-all duration-700 delay-300 ease-out group"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="flex justify-between items-start mb-6">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <Banknote class="w-5 h-5" />
          </div>
          <span v-if="!isLoading" class="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
            {{ getMonthNameFromPeriod(stats?.lastPayrollPeriod) }}
          </span>
        </div>
        <div class="space-y-1">
          <h3 class="text-3xl font-bold text-foreground tracking-tight truncate">
            <span v-if="isLoading" class="animate-pulse bg-slate-200 text-transparent rounded w-32 inline-block">Rp000.000</span>
            <span v-else>{{ formatRupiah(stats?.lastPayrollTotal || 0) }}</span>
          </h3>
          <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Beban Gaji Terakhir</p>
        </div>
      </Card>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Left Column (Wider Data Area) -->
      <div class="lg:col-span-8 space-y-6 flex flex-col transition-all duration-700 delay-500 ease-out"
           :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">

        <!-- Quick Actions (Compact Horizontal Row) -->
        <Card class="bg-card/60 backdrop-blur-3xl rounded-[2rem] p-4 lg:p-5 border border-border/50 shadow-sm shrink-0">
          <h3 class="text-sm font-bold text-foreground tracking-tight mb-3 px-1">Tindakan Cepat</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button class="flex items-center gap-2 p-2.5 rounded-2xl bg-muted/40 hover:bg-muted border border-border/30 transition-all hover:-translate-y-0.5">
              <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <UserPlus class="w-4 h-4" />
              </div>
              <span class="text-[11px] font-bold text-left text-foreground leading-tight">Pegawai<br/>Baru</span>
            </button>

            <button class="flex items-center gap-2 p-2.5 rounded-2xl bg-muted/40 hover:bg-muted border border-border/30 transition-all hover:-translate-y-0.5">
              <div class="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <FileClock class="w-4 h-4" />
              </div>
              <span class="text-[11px] font-bold text-left text-foreground leading-tight">Review<br/>Cuti</span>
            </button>

            <button class="flex items-center gap-2 p-2.5 rounded-2xl bg-muted/40 hover:bg-muted border border-border/30 transition-all hover:-translate-y-0.5">
              <div class="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Calculator class="w-4 h-4" />
              </div>
              <span class="text-[11px] font-bold text-left text-foreground leading-tight">Proses<br/>Payroll</span>
            </button>

            <button class="flex items-center gap-2 p-2.5 rounded-2xl bg-muted/40 hover:bg-muted border border-border/30 transition-all hover:-translate-y-0.5">
              <div class="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                <UserCog class="w-4 h-4" />
              </div>
              <span class="text-[11px] font-bold text-left text-foreground leading-tight">Shift /<br/>Roster</span>
            </button>
          </div>
        </Card>

        <!-- HR Action Center (Horizontal Layout) -->
        <Card class="bg-card/60 backdrop-blur-3xl rounded-[2.5rem] p-6 lg:p-8 border border-border/50 shadow-sm flex flex-col flex-1">
          <div class="flex items-center gap-3 mb-6 shrink-0">
            <div class="w-10 h-10 rounded-xl bg-accent text-muted-foreground flex items-center justify-center border border-border/50 shrink-0">
              <CheckSquare class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-foreground tracking-tight leading-tight">Pusat Perhatian HR</h3>
              <p class="text-[10px] text-muted-foreground font-medium">Tugas dan peringatan yang butuh tindakan segera</p>
            </div>
          </div>

          <div v-if="isLoading" class="space-y-4">
            <div class="animate-pulse bg-slate-200 h-12 w-full rounded-2xl"></div>
          </div>

          <div v-else class="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <!-- Main Alert (Left) -->
            <div class="md:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-rose-500/5 rounded-3xl border border-rose-500/10">
              <div class="flex items-start gap-1 justify-center">
                <span class="text-6xl font-black text-rose-600 tracking-tighter">14</span>
              </div>
              <span class="text-xs font-bold text-rose-700 bg-rose-500/10 px-3 py-1 rounded-full mt-3">Tindakan Diperlukan</span>
            </div>

            <!-- Breakdown Action Items (Right) -->
            <div class="md:col-span-8 space-y-3">

              <!-- Cuti Item -->
              <div class="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/30 cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <FileClock class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="text-xs font-bold text-foreground group-hover:text-amber-600 transition-colors">Pengajuan Cuti</p>
                    <p class="text-[10px] text-muted-foreground">Menunggu persetujuan manajer / HR</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-black text-amber-600">4</span>
                  <ChevronRight class="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <!-- Anomali Item -->
              <div class="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/30 cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                    <Clock class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="text-xs font-bold text-foreground group-hover:text-orange-600 transition-colors">Anomali Presensi</p>
                    <p class="text-[10px] text-muted-foreground">Lupa tap pulang atau jadwal bentrok</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-black text-orange-600">5</span>
                  <ChevronRight class="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <!-- Lisensi Klinis (SIP) Item -->
              <div class="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/30 cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                    <Stethoscope class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="text-xs font-bold text-foreground group-hover:text-rose-600 transition-colors">Lisensi Klinis (SIP / STR)</p>
                    <p class="text-[10px] text-muted-foreground">Kedaluwarsa dalam 30 hari ke depan</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-black text-rose-600">2</span>
                  <ChevronRight class="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <!-- Kontrak Item -->
              <div class="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/30 cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                    <FileText class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="text-xs font-bold text-foreground group-hover:text-indigo-600 transition-colors">Kontrak Kerja (PKWT)</p>
                    <p class="text-[10px] text-muted-foreground">Masa berlaku habis bulan ini</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-black text-indigo-600">3</span>
                  <ChevronRight class="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          </div>
        </Card>
      </div>

      <!-- Right Column (Compact Calendar) -->
      <div class="lg:col-span-4 space-y-8 transition-all duration-700 delay-600 ease-out"
           :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">

        <!-- Leave Calendar Widget (Vertically Stacked Design) -->
        <LeaveCalendarWidget />

      </div>

    </div>
  </div>
</template>