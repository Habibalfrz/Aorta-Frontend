<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import api from '@/api/axios'
import EssLayout from '@/layouts/EssLayout.vue'
import { Clock, Calendar, BellRing, ArrowRight, Activity, FileText } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()

const isClockingIn = ref(false)
const isClockingOut = ref(false)

const todayAttendance = ref({
  checkIn: null as string | null,
  checkOut: null as string | null,
  type: 'Shift Reguler'
})

// Optional: you could fetch the current day's status on mount
onMounted(async () => {
  // If there's a real endpoint to fetch today's status, call it here.
})

const handleClockIn = async () => {
  isClockingIn.value = true
  try {
    await api.post('/api/hris/attendance/clock', {
      employeeId: authStore.user?.id,
      type: 'IN'
    })

    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    todayAttendance.value.checkIn = time
    toast.success('Berhasil Clock In', { description: `Waktu: ${time}` })
  } catch (error) {
    console.error('Failed to clock in:', error)
    toast.error('Gagal melakukan Clock In', { description: 'Terjadi kesalahan pada server.' })
  } finally {
    isClockingIn.value = false
  }
}

const handleClockOut = async () => {
  isClockingOut.value = true
  try {
    await api.post('/api/hris/attendance/clock', {
      employeeId: authStore.user?.id,
      type: 'OUT'
    })

    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    todayAttendance.value.checkOut = time
    toast.success('Berhasil Clock Out', { description: `Waktu: ${time}` })
  } catch (error) {
    console.error('Failed to clock out:', error)
    toast.error('Gagal melakukan Clock Out', { description: 'Terjadi kesalahan pada server.' })
  } finally {
    isClockingOut.value = false
  }
}

const formatDate = () => {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
}
</script>

<template>
  <EssLayout>
    <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
          <Calendar class="w-4 h-4" />
          <span>{{ formatDate() }}</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          Halo, {{ authStore.user?.name?.split(' ')[0] || 'User' }}
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/60 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
          <FileText class="w-4 h-4" />
          Panduan ESS
        </button>
      </div>
    </div>

    <!-- Bento Grid Layout -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 auto-rows-[auto]">

      <!-- Profil Card (Hero Widget) -->
      <div class="md:col-span-8 lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm relative overflow-hidden group">
        <!-- Decoration -->
        <div class="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-primary/20 ring-4 ring-white">
            {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
          <div class="space-y-1.5 flex-1">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-1">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Status Aktif
            </div>
            <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{{ authStore.user?.name }}</h2>
            <div class="flex items-center gap-3 text-slate-500 text-sm font-medium">
              <span>{{ authStore.roles[0] || 'Staff' }}</span>
              <span class="w-1 h-1 rounded-full bg-slate-300"></span>
              <span class="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">ID: {{ authStore.user?.id?.substring(0, 8) || 'EMP-XXXX' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Time & Attendance Widget -->
      <div class="md:col-span-4 lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/60 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div class="flex justify-between items-start mb-6">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock class="w-5 h-5" />
          </div>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">Live</span>
        </div>

        <div>
          <p class="text-sm font-medium text-slate-500 mb-1">Status Kehadiran</p>
          <div class="flex items-center gap-2.5 mb-6">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" v-if="todayAttendance.checkIn && !todayAttendance.checkOut"></span>
              <span class="relative inline-flex rounded-full h-3 w-3" :class="(todayAttendance.checkIn && !todayAttendance.checkOut) ? 'bg-emerald-500' : 'bg-slate-300'"></span>
            </span>
            <span class="text-base font-bold text-slate-800">
              <span v-if="todayAttendance.checkIn && todayAttendance.checkOut">Shift Selesai ({{ todayAttendance.checkOut }})</span>
              <span v-else-if="todayAttendance.checkIn">Sedang Bekerja ({{ todayAttendance.checkIn }})</span>
              <span v-else>Belum Clock In</span>
            </span>
          </div>

          <div class="flex gap-2">
            <button
              class="flex-1 h-11 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              @click="handleClockIn"
              :disabled="isClockingIn || !!todayAttendance.checkIn"
            >
              <svg v-if="isClockingIn" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>{{ todayAttendance.checkIn ? 'In: ' + todayAttendance.checkIn : 'Clock In' }}</span>
            </button>
            <button
              class="flex-1 h-11 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              @click="handleClockOut"
              :disabled="isClockingOut || !todayAttendance.checkIn || !!todayAttendance.checkOut"
            >
              <svg v-if="isClockingOut" class="animate-spin h-4 w-4 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Clock Out</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="md:col-span-4 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col justify-center">
        <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity class="w-4 h-4 text-primary" />
          Aksi Cepat
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <button class="p-4 rounded-2xl bg-slate-50 hover:bg-primary/5 hover:text-primary transition-colors border border-transparent hover:border-primary/10 group text-left">
            <Calendar class="w-5 h-5 text-slate-400 group-hover:text-primary mb-3 transition-colors" />
            <div class="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">Ajukan Cuti</div>
          </button>
          <button class="p-4 rounded-2xl bg-slate-50 hover:bg-primary/5 hover:text-primary transition-colors border border-transparent hover:border-primary/10 group text-left">
            <FileText class="w-5 h-5 text-slate-400 group-hover:text-primary mb-3 transition-colors" />
            <div class="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">Slip Gaji</div>
          </button>
        </div>
      </div>

      <!-- Sisa Cuti Widget -->
      <div class="md:col-span-4 lg:col-span-4 bg-indigo-600 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        <div class="relative z-10 flex flex-col h-full justify-between">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Calendar class="w-5 h-5 text-white" />
            </div>
            <span class="font-semibold">Sisa Cuti Tahunan</span>
          </div>

          <div>
            <div class="flex items-end gap-2 mb-3">
              <span class="text-5xl font-black tracking-tighter">12</span>
              <span class="text-indigo-200 font-medium mb-1">/ 12 Hari</span>
            </div>

            <div class="h-2 w-full bg-indigo-950/30 rounded-full overflow-hidden mb-3">
              <div class="h-full bg-white rounded-full w-full"></div>
            </div>
            <button class="text-sm font-medium text-indigo-200 hover:text-white flex items-center gap-1 transition-colors">
              Lihat Riwayat <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Announcements Widget -->
      <div class="md:col-span-4 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <BellRing class="w-4 h-4 text-amber-500" />
            Papan Pengumuman
          </h3>
          <button class="text-xs font-bold text-primary hover:underline">Lihat Semua</button>
        </div>

        <div class="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed text-center">
          <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <BellRing class="w-5 h-5 text-slate-300" />
          </div>
          <p class="text-sm font-semibold text-slate-700">Belum ada informasi</p>
          <p class="text-xs text-slate-500 mt-1 max-w-[200px]">Pengumuman penting dari tim HR akan muncul di sini.</p>
        </div>
      </div>

    </div>
  </EssLayout>
</template>
