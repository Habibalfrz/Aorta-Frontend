<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import api from '@/api/axios'
import EssLayout from '@/layouts/EssLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Calendar, BellRing } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()

// Remove dummy essSummary logic and use a minimal reactive state for attendance
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
  // For now, we'll assume null initial state until they clock in.
})

const handleClockIn = async () => {
  isClockingIn.value = true
  try {
    await api.post('/api/hris/attendance/clock', {
      employeeId: authStore.user?.id,
      type: 'IN'
    })

    // Simulate successful response handling
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

    // Simulate successful response handling
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
</script>

<template>
  <EssLayout>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 tracking-tight">
        Selamat Datang, {{ authStore.user?.name || 'User' }}
      </h1>
      <p class="text-slate-500 mt-1">Ringkasan informasi dan akses layanan mandiri pegawai.</p>
    </div>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">

      <!-- Profil & Kehadiran (Kiri, lebih lebar) -->
      <div class="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- Widget 1: Profil -->
        <Card class="border-slate-200 shadow-sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-lg text-slate-800">Profil Singkat</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex items-start gap-4 pt-2">
              <Avatar class="w-16 h-16 border border-slate-100">
                <AvatarImage src="" alt="Avatar" />
                <AvatarFallback class="bg-blue-100 text-blue-700 text-xl font-medium">
                  {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
                </AvatarFallback>
              </Avatar>
              <div class="space-y-1 flex-1">
                <h3 class="font-semibold text-slate-900 text-lg">{{ authStore.user?.name }}</h3>
                <p class="text-slate-500 text-sm">{{ authStore.roles[0] || 'Pegawai' }}</p>
                <div class="inline-flex mt-2 items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                  ID: {{ authStore.user?.id?.substring(0, 8) || 'EMP' }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Widget 2: Kehadiran -->
        <Card class="border-slate-200 shadow-sm flex flex-col">
          <CardHeader class="pb-2">
            <CardTitle class="text-lg text-slate-800 flex items-center gap-2">
              <Clock class="w-5 h-5 text-blue-600" />
              Kehadiran Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent class="flex-grow flex flex-col justify-between pt-2">
            <div>
              <p class="text-sm text-slate-500 mb-1">{{ todayAttendance.type }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" v-if="todayAttendance.checkIn && !todayAttendance.checkOut"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3" :class="(todayAttendance.checkIn && !todayAttendance.checkOut) ? 'bg-emerald-500' : 'bg-slate-300'"></span>
                </span>
                <span class="text-sm font-medium text-slate-700">
                  <span v-if="todayAttendance.checkIn && todayAttendance.checkOut">Selesai Clock Out ({{ todayAttendance.checkOut }})</span>
                  <span v-else-if="todayAttendance.checkIn">Sudah Clock In ({{ todayAttendance.checkIn }})</span>
                  <span v-else>Belum Clock In</span>
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mt-6">
              <Button
                class="w-full bg-blue-600 hover:bg-blue-700 text-white"
                @click="handleClockIn"
                :disabled="isClockingIn || !!todayAttendance.checkIn"
              >
                {{ isClockingIn ? 'Proses...' : 'Clock In' }}
              </Button>
              <Button
                variant="outline"
                class="w-full"
                @click="handleClockOut"
                :disabled="isClockingOut || !todayAttendance.checkIn || !!todayAttendance.checkOut"
              >
                {{ isClockingOut ? 'Proses...' : 'Clock Out' }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sisi Kanan (Sempit) -->
      <div class="md:col-span-4 space-y-6">

        <!-- Widget 3: Sisa Cuti -->
        <Card class="border-slate-200 shadow-sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-lg text-slate-800 flex items-center gap-2">
              <Calendar class="w-5 h-5 text-indigo-600" />
              Sisa Cuti Tahunan
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-4">
            <div class="flex justify-between items-end mb-2">
              <span class="text-3xl font-bold text-slate-900">12 <span class="text-sm font-normal text-slate-500">hari</span></span>
              <span class="text-sm text-slate-500">dari 12 hari</span>
            </div>
            <Progress :model-value="100" class="h-2 bg-slate-100" />
            <p class="text-xs text-slate-500 mt-3">Time Bank: 0 jam</p>
          </CardContent>
        </Card>

        <!-- Widget 4: Notifikasi / Pengumuman -->
        <Card class="border-slate-200 shadow-sm">
          <CardHeader class="pb-2">
            <CardTitle class="text-lg text-slate-800 flex items-center gap-2">
              <BellRing class="w-5 h-5 text-amber-500" />
              Pengumuman HR
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-4">
            <div class="flex flex-col items-center justify-center py-8 text-center px-4 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
              <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mb-3">
                <BellRing class="w-5 h-5 text-slate-400" />
              </div>
              <p class="text-sm font-medium text-slate-700">Belum ada pengumuman</p>
              <p class="text-xs text-slate-500 mt-1">Pengumuman dari HR akan muncul di sini.</p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  </EssLayout>
</template>
