<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Clock, Search, Download, RefreshCw, Radio,
  ShieldCheck, AlertTriangle, Moon, Edit3, Loader2, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'

import {
  getAttendanceLogs, getMonthlyRecaps, calculateMonthlyRecap,
  adjustMonthlyRecap, finalizeMonthlyRecap, unfinalizeMonthlyRecap,
  simulatePunch
} from '@/api/hris'
import api from '@/api/axios'

import AttendanceRawUpload from '../components/AttendanceRawUpload.vue'
import AttendanceAnomalies from '../components/AttendanceAnomalies.vue'

const isLoaded = ref(false)
const activeTab = ref('live-logs')

// --- LIVE LOGS STATE ---
const logs = ref<any[]>([])
const isLoadingLogs = ref(true)
const isTriggeringCron = ref(false)
const searchQuery = ref('')

// Trigger Sync modal state
const isSyncModalOpen = ref(false)
const forceRecalculateSync = ref(false)

// Simulation modal state

// Simulation modal state
const isSimulateOpen = ref(false)
const isSimulating = ref(false)
const simForm = ref({
  pin: '',
  timestamp: '',
  serialNumber: 'MESIN-IGD-01'
})

// --- MONTHLY RECAPS STATE ---
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const recaps = ref<any[]>([])
const isLoadingRecaps = ref(false)
const isCalculatingRecap = ref(false)
const isFinalizing = ref(false)

// Adjustment modal state
const isAdjustOpen = ref(false)
const isSubmittingAdjust = ref(false)
const selectedRecap = ref<any>(null)
const adjustForm = ref({
  adjustmentAmount: 0,
  notes: ''
})

const months = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' }
]

const years = [2025, 2026, 2027]

// Trigger Cronjob
const triggerCronjob = async () => {
  isTriggeringCron.value = true
  try {
    const res = await api.post(`/api/hris/attendance/trigger-processing?forceRecalculate=${forceRecalculateSync.value}`)
    toast.success(res.data?.message || 'Proses sinkronisasi berhasil dipicu')
    fetchLogs()
    isSyncModalOpen.value = false
    forceRecalculateSync.value = false // reset state
  } catch (error: any) {
    console.error('Failed to trigger sync:', error)
    toast.error(error.response?.data?.message || 'Gagal memicu sinkronisasi absensi')
  } finally {
    isTriggeringCron.value = false
  }
}

// Fetch Live Logs
const fetchLogs = async () => {
  isLoadingLogs.value = true
  try {
    const data = await getAttendanceLogs()
    logs.value = data
  } catch (error) {
    console.error('Failed to fetch attendance logs:', error)
    toast.error('Gagal memuat log presensi')
  } finally {
    isLoadingLogs.value = false
  }
}

// Fetch Monthly Recaps
const fetchRecaps = async () => {
  isLoadingRecaps.value = true
  try {
    const data = await getMonthlyRecaps(selectedMonth.value, selectedYear.value)
    recaps.value = data
  } catch (error) {
    console.error('Failed to fetch monthly recaps:', error)
    toast.error('Gagal memuat rekapitulasi presensi')
  } finally {
    isLoadingRecaps.value = false
  }
}

// Filtered Live Logs
const filteredLogs = computed(() => {
  if (!searchQuery.value) return logs.value
  const q = searchQuery.value.toLowerCase()
  return logs.value.filter(log =>
    log.employeeName?.toLowerCase().includes(q) ||
    log.employeeNik?.toLowerCase().includes(q) ||
    log.machineSn?.toLowerCase().includes(q)
  )
})

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Reset pagination when search changes
watch(searchQuery, () => {
  currentPage.value = 1
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredLogs.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage.value))

// Recap Summary KPIs
const totalHadirAll = computed(() => recaps.value.reduce((acc, r) => acc + (r.totalPresentDays || 0), 0))
const totalDendaTelatAll = computed(() => recaps.value.reduce((acc, r) => acc + (r.totalLatePenalty || 0), 0))
const totalUangLemburAll = computed(() => recaps.value.reduce((acc, r) => acc + (r.totalOvertimeAmount || 0), 0))
const totalDendaAnomaliAll = computed(() => recaps.value.reduce((acc, r) => acc + (r.totalMissingCheckOutPenalty || 0) + (r.totalAbsentPenalty || 0), 0))
const isAnyFinalized = computed(() => recaps.value.some(r => r.isFinalized))

// Actions
const handleRecalculate = async () => {
  isCalculatingRecap.value = true
  try {
    await calculateMonthlyRecap(selectedMonth.value, selectedYear.value)
    toast.success('Kalkulasi rekapitulasi presensi bulanan berhasil diperbarui')
    fetchRecaps()
  } catch (error: any) {
    console.error('Failed to recalculate recap:', error)
    toast.error(error.response?.data?.message || 'Gagal menghitung rekap presensi')
  } finally {
    isCalculatingRecap.value = false
  }
}

const handleToggleFinalize = async () => {
  isFinalizing.value = true
  try {
    if (isAnyFinalized.value) {
      await unfinalizeMonthlyRecap(selectedMonth.value, selectedYear.value)
      toast.success('Kunci rekapitulasi berhasil dibuka (Status: Draft)')
    } else {
      await finalizeMonthlyRecap(selectedMonth.value, selectedYear.value)
      toast.success('Rekapitulasi presensi berhasil difinalisasi & dikunci')
    }
    fetchRecaps()
  } catch (error: any) {
    console.error('Failed to toggle finalize:', error)
    toast.error('Gagal memperbarui status finalisasi')
  } finally {
    isFinalizing.value = false
  }
}

const handleDownloadCsv = async () => {
  try {
    const response = await api.get(`/api/hris/attendance/recaps/export?month=${selectedMonth.value}&year=${selectedYear.value}`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Rekap_Presensi_${selectedYear.value}_${String(selectedMonth.value).padStart(2, '0')}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    toast.success('File rekapitulasi CSV berhasil diunduh')
  } catch (error) {
    console.error('Failed to export recap:', error)
    toast.error('Gagal mengunduh file rekap presensi')
  }
}

// Adjust Modal Handlers
const openAdjustModal = (recap: any) => {
  selectedRecap.value = recap
  adjustForm.value = {
    adjustmentAmount: recap.manualAdjustmentAmount || 0,
    notes: recap.manualAdjustmentNotes || ''
  }
  isAdjustOpen.value = true
}

const handleSaveAdjustment = async () => {
  if (!selectedRecap.value) return

  isSubmittingAdjust.value = true
  try {
    await adjustMonthlyRecap(selectedRecap.value.id, {
      adjustmentAmount: Number(adjustForm.value.adjustmentAmount),
      notes: adjustForm.value.notes
    })
    toast.success('Dispensasi / penyesuaian denda berhasil disimpan')
    isAdjustOpen.value = false
    fetchRecaps()
  } catch (error: any) {
    console.error('Failed to adjust recap:', error)
    toast.error(error.response?.data?.message || 'Gagal menyimpan penyesuaian denda')
  } finally {
    isSubmittingAdjust.value = false
  }
}

// Simulate Handlers
const handleSimulatePunch = async () => {
  if (!simForm.value.pin) {
    toast.error('PIN atau NIK pegawai wajib diisi')
    return
  }

  isSimulating.value = true
  try {
    await simulatePunch({
      pin: simForm.value.pin,
      timestamp: simForm.value.timestamp || undefined,
      serialNumber: simForm.value.serialNumber
    })
    toast.success(`Punch berhasil dikirim untuk PIN ${simForm.value.pin}`)
    isSimulateOpen.value = false
    simForm.value.pin = ''
    fetchLogs()
  } catch (error: any) {
    console.error('Failed to simulate punch:', error)
    toast.error(error.response?.data?.message || 'Gagal mengirim punch simulasi')
  } finally {
    isSimulating.value = false
  }
}

onMounted(() => {
  fetchLogs()
  fetchRecaps()
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})
</script>

<template>
  <div class="space-y-8 max-w-[1400px]">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold tracking-tight text-foreground">Pusat Monitor Presensi & Denda</h1>
          <Badge variant="outline" class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 flex items-center gap-1.5 px-3 py-1">
            <Radio class="w-3.5 h-3.5 animate-pulse" />
            Live ADMS Ingestion
          </Badge>
        </div>
        <p class="text-sm text-muted-foreground mt-1 font-medium">
          Feed presensi biometrik mesin sidik jari/wajah real-time, evaluasi keterlambatan bertingkat, dan rekapitulasi denda bulanan.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" class="rounded-xl font-bold text-xs h-10 gap-2 border-border/50" @click="isSimulateOpen = true">
          <Sparkles class="w-4 h-4 text-primary" />
          Simulasi Mesin Finger
        </Button>
      </div>
    </div>

    <!-- Main Tabs -->
    <Tabs v-model="activeTab" class="w-full space-y-6">
      <TabsList class="bg-transparent p-0 border-b border-border/40 flex flex-wrap gap-6 rounded-none w-full justify-start overflow-x-auto hide-scrollbar">
        <TabsTrigger
          value="live-logs"
          class="rounded-none px-0 py-3 font-semibold text-sm gap-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors"
        >
          Live Feed
        </TabsTrigger>
        <TabsTrigger
          value="anomalies"
          class="rounded-none px-0 py-3 font-semibold text-sm gap-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors"
        >
          Resolusi Anomali
        </TabsTrigger>
        <TabsTrigger
          value="monthly-recap"
          class="rounded-none px-0 py-3 font-semibold text-sm gap-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors"
        >
          Rekapitulasi HRD
        </TabsTrigger>
        <TabsTrigger
          value="upload"
          class="rounded-none px-0 py-3 font-semibold text-sm gap-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors"
        >
          Upload Raw (CSV)
        </TabsTrigger>
      </TabsList>

      <!-- TAB 1: LIVE PUNCH LOGS -->
      <TabsContent value="live-logs" class="space-y-4 outline-none">
        <Card class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="relative w-full max-w-md">
              <Search class="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                placeholder="Cari berdasarkan NIK, Nama Pegawai, atau Shift..."
                class="pl-10 bg-muted/50 border-border/50 rounded-2xl text-xs h-10"
              />
            </div>

            <div class="flex items-center gap-2">
              <Button variant="outline" class="rounded-xl font-bold text-xs h-10 gap-2 border-border/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:text-amber-700" :disabled="isTriggeringCron" @click="isSyncModalOpen = true">
                  <Sparkles class="w-3.5 h-3.5" :class="{ 'animate-spin': isTriggeringCron }" />
                  Trigger Sync
                </Button>

              <Button variant="outline" class="rounded-xl font-bold text-xs h-10 gap-2 border-border/50" @click="fetchLogs" :disabled="isLoadingLogs">
                <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoadingLogs }" />
                Refresh Feed
              </Button>
            </div>
          </div>

          <div class="overflow-x-auto custom-scrollbar border border-border/50 rounded-2xl">
            <Table>
              <TableHeader class="bg-muted/30 border-b border-border/50">
                <TableRow>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Waktu (Log Mentah)</TableHead>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Pegawai</TableHead>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Mesin</TableHead>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Tipe Absen</TableHead>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Status Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="isLoadingLogs">
                  <TableCell colspan="5" class="h-28 text-center text-muted-foreground text-sm font-medium">
                    <Loader2 class="w-5 h-5 mx-auto animate-spin mb-2 text-primary" />
                    Memuat log presensi real-time...
                  </TableCell>
                </TableRow>
                <template v-else>
                  <TableRow v-for="log in paginatedLogs" :key="log.id" class="hover:bg-muted/20 transition-colors">
                    <TableCell class="font-mono text-xs font-semibold text-foreground px-6 py-4">
                      {{ new Date(log.timestamp).toLocaleString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}
                    </TableCell>
                    <TableCell class="px-6 py-4">
                      <p class="font-bold text-foreground text-sm">{{ log.employeeName }}</p>
                      <p class="text-xs text-muted-foreground font-mono">NIK: {{ log.employeeNik }}</p>
                    </TableCell>
                    <TableCell class="text-xs font-semibold text-muted-foreground px-6 py-4 font-mono">
                      {{ log.machineSn }}
                    </TableCell>
                    <TableCell class="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      Tipe: {{ log.attendanceType }}
                    </TableCell>
                    <TableCell class="px-6 py-4">
                      <Badge v-if="log.isProcessed" class="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] font-bold">
                        <ShieldCheck class="w-3 h-3 mr-1" />
                        Processed
                      </Badge>
                      <Badge v-else class="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[11px] font-bold">
                        <AlertTriangle class="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="paginatedLogs.length === 0">
                    <TableCell colspan="5" class="h-28 text-center text-muted-foreground text-sm font-medium">
                      Tidak ada data log presensi yang cocok dengan pencarian.
                    </TableCell>
                  </TableRow>

</template>
              </TableBody>
            </Table>
          </div>

          <!-- Pagination UI -->
          <div class="flex items-center justify-between mt-4" v-if="filteredLogs.length > 0">
            <p class="text-xs text-muted-foreground font-medium">
              Menampilkan <span class="font-bold text-foreground">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
              sampai <span class="font-bold text-foreground">{{ Math.min(currentPage * itemsPerPage, filteredLogs.length) }}</span>
              dari <span class="font-bold text-foreground">{{ filteredLogs.length }}</span> data
            </p>
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                class="w-8 h-8 rounded-lg"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                <ChevronLeft class="w-4 h-4" />
              </Button>
              <div class="text-xs font-bold px-2">
                Halaman {{ currentPage }} dari {{ totalPages === 0 ? 1 : totalPages }}
              </div>
              <Button
                variant="outline"
                size="icon"
                class="w-8 h-8 rounded-lg"
                :disabled="currentPage >= totalPages"
                @click="currentPage++"
              >
                <ChevronRight class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </TabsContent>

      <!-- TAB 2: MONTHLY RECAPS & OVERVIEW -->
      <TabsContent value="monthly-recap" class="space-y-6 outline-none">
        <!-- 4 KPI CARDS -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl p-5 shadow-sm space-y-2">
            <p class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck class="w-4 h-4 text-emerald-500" />
              Total Hari Hadir Pegawai
            </p>
            <p class="text-3xl font-extrabold text-foreground font-mono">{{ totalHadirAll }} <span class="text-sm font-medium text-muted-foreground">Hari</span></p>
          </Card>

          <Card class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl p-5 shadow-sm space-y-2">
            <p class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle class="w-4 h-4 text-rose-500" />
              Akumulasi Denda Terlambat
            </p>
            <p class="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              Rp {{ totalDendaTelatAll.toLocaleString('id-ID') }}
            </p>
          </Card>

          <Card class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl p-5 shadow-sm space-y-2">
            <p class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock class="w-4 h-4 text-blue-500" />
              Estimasi Uang Lembur
            </p>
            <p class="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              Rp {{ totalUangLemburAll.toLocaleString('id-ID') }}
            </p>
          </Card>

          <Card class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl p-5 shadow-sm space-y-2">
            <p class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Moon class="w-4 h-4 text-amber-500" />
              Denda Lupa Finger & Alpha
            </p>
            <p class="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              Rp {{ totalDendaAnomaliAll.toLocaleString('id-ID') }}
            </p>
          </Card>
        </div>

        <!-- RECAP TABLE & CONTROLS -->
        <Card class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm p-6 space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
            <div class="flex items-center gap-3">
              <Select v-model="selectedMonth" @update:model-value="fetchRecaps">
                <SelectTrigger class="w-36 rounded-xl bg-muted/50 border-border/50 font-bold text-xs h-10">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent class="rounded-xl border-border/60 shadow-lg bg-popover text-popover-foreground">
                  <SelectItem v-for="m in months" :key="m.value" :value="m.value" class="text-xs">
                    {{ m.label }}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select v-model="selectedYear" @update:model-value="fetchRecaps">
                <SelectTrigger class="w-28 rounded-xl bg-muted/50 border-border/50 font-bold text-xs h-10">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent class="rounded-xl border-border/60 shadow-lg bg-popover text-popover-foreground">
                  <SelectItem v-for="y in years" :key="y" :value="y" class="text-xs">
                    {{ y }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                class="rounded-xl font-bold text-xs h-10 gap-2 border-border/50"
                :disabled="isCalculatingRecap"
                @click="handleRecalculate"
              >
                <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isCalculatingRecap }" />
                {{ isCalculatingRecap ? 'Menghitung...' : 'Kalkulasi Ulang Rekap' }}
              </Button>

              <Button
                variant="outline"
                class="rounded-xl font-bold text-xs h-10 gap-2 border-border/50"
                :disabled="isFinalizing"
                @click="handleToggleFinalize"
              >
                <ShieldCheck class="w-3.5 h-3.5" :class="isAnyFinalized ? 'text-amber-500' : 'text-emerald-500'" />
                {{ isAnyFinalized ? 'Buka Kunci (Draft)' : 'Kunci Rekap (Finalize)' }}
              </Button>

              <Button
                class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-4 gap-2 shadow-sm"
                @click="handleDownloadCsv"
              >
                <Download class="w-4 h-4" />
                Download Rekap (CSV)
              </Button>
            </div>
          </div>

          <div class="overflow-x-auto custom-scrollbar border border-border/50 rounded-2xl">
            <Table>
              <TableHeader class="bg-muted/30 border-b border-border/50">
                <TableRow>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4">Pegawai</TableHead>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4 text-center">Hadir / Hari Kerja</TableHead>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4 text-center">Keterlambatan</TableHead>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4 text-center">Lupa Pulang</TableHead>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4 text-center">Lembur</TableHead>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4 text-right">Potongan Bersih</TableHead>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4 text-center">Status</TableHead>
                  <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="isLoadingRecaps">
                  <TableCell colspan="8" class="h-28 text-center text-muted-foreground text-sm font-medium">
                    <Loader2 class="w-5 h-5 mx-auto animate-spin mb-2 text-primary" />
                    Memuat rekapan bulanan...
                  </TableCell>
                </TableRow>
                <template v-else>
                  <TableRow v-for="r in recaps" :key="r.id" class="hover:bg-muted/20 transition-colors">
                    <TableCell class="px-5 py-4">
                      <p class="font-bold text-foreground text-sm">{{ r.fullName }}</p>
                      <p class="text-xs text-muted-foreground font-mono">{{ r.employeeNumber }} &bull; {{ r.department }}</p>
                    </TableCell>
                    <TableCell class="px-5 py-4 text-center">
                      <span class="font-bold font-mono text-sm">{{ r.totalPresentDays }}</span>
                      <span class="text-xs text-muted-foreground"> / {{ r.totalWorkDays }} hr</span>
                    </TableCell>
                    <TableCell class="px-5 py-4 text-center">
                      <div v-if="r.totalLateDays > 0" class="flex flex-col items-center">
                        <span class="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                          {{ r.totalLateDays }}x ({{ r.totalLateMinutes }} mnt)
                        </span>
                        <span class="text-[10px] text-muted-foreground font-mono">
                          -Rp {{ Number(r.totalLatePenalty).toLocaleString('id-ID') }}
                        </span>
                      </div>
                      <span v-else class="text-xs text-muted-foreground">-</span>
                    </TableCell>
                    <TableCell class="px-5 py-4 text-center">
                      <span v-if="r.totalMissingCheckOutDays > 0" class="text-xs font-bold text-amber-600 font-mono">
                        {{ r.totalMissingCheckOutDays }}x (-Rp {{ Number(r.totalMissingCheckOutPenalty).toLocaleString('id-ID') }})
                      </span>
                      <span v-else class="text-xs text-muted-foreground">-</span>
                    </TableCell>
                    <TableCell class="px-5 py-4 text-center">
                      <div v-if="r.totalNetOvertimeMinutes > 0" class="flex flex-col items-center">
                        <span class="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {{ r.totalNetOvertimeMinutes }} mnt
                        </span>
                        <span class="text-[10px] text-muted-foreground font-mono">
                          +Rp {{ Number(r.totalOvertimeAmount).toLocaleString('id-ID') }}
                        </span>
                      </div>
                      <span v-else class="text-xs text-muted-foreground">-</span>
                    </TableCell>
                    <TableCell class="px-5 py-4 text-right">
                      <p class="font-bold font-mono text-sm" :class="r.totalNetDeductions > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'">
                        Rp {{ Number(r.totalNetDeductions).toLocaleString('id-ID') }}
                      </p>
                      <p v-if="r.manualAdjustmentAmount !== 0" class="text-[10px] text-emerald-600 font-mono">
                        (Dispensasi: {{ r.manualAdjustmentAmount > 0 ? '+' : '' }}Rp {{ Number(r.manualAdjustmentAmount).toLocaleString('id-ID') }})
                      </p>
                    </TableCell>
                    <TableCell class="px-5 py-4 text-center">
                      <Badge :variant="r.isFinalized ? 'default' : 'outline'" class="text-[10px] font-bold">
                        {{ r.isFinalized ? 'Final / Dikunci' : 'Draft' }}
                      </Badge>
                    </TableCell>
                    <TableCell class="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        class="rounded-xl text-xs font-bold gap-1 hover:bg-muted/50"
                        @click="openAdjustModal(r)"
                      >
                        <Edit3 class="w-3.5 h-3.5" />
                        Koreksi / Dispensasi
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="recaps.length === 0">
                    <TableCell colspan="8" class="h-28 text-center text-muted-foreground text-sm font-medium">
                      Belum ada data rekapan presensi untuk periode {{ months.find(m => m.value === selectedMonth)?.label }} {{ selectedYear }}.
                    </TableCell>
                  </TableRow>

</template>
              </TableBody>
            </Table>
          </div>
        </Card>
      </TabsContent>
      <!-- TAB 3: ANOMALIES -->
      <TabsContent value="anomalies" class="space-y-4 outline-none">
        <AttendanceAnomalies />
      </TabsContent>

      <!-- TAB 4: RAW UPLOAD -->
      <TabsContent value="upload" class="space-y-4 outline-none">
        <AttendanceRawUpload />
      </TabsContent>
    </Tabs>

    <!-- MODAL KOREKSI MANUAL / DISPENSASI CCTV HRD -->
    <Dialog :open="isAdjustOpen" @update:open="isAdjustOpen = $event">
      <DialogContent class="sm:max-w-[480px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground">Dispensasi & Koreksi Denda HRD</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">
            Sesuaikan denda presensi pegawai untuk kasus khusus (misal: verifikasi kehadiran via rekaman CCTV atau surat dinas luar).
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSaveAdjustment" class="space-y-4 py-4">
          <div class="p-3 bg-muted/30 border border-border/40 rounded-2xl space-y-1">
            <p class="text-xs font-bold text-foreground">{{ selectedRecap?.fullName }} ({{ selectedRecap?.employeeNumber }})</p>
            <p class="text-xs text-muted-foreground">Total Denda Kotor Terkumpul: <span class="font-mono font-bold text-rose-600">Rp {{ Number(selectedRecap?.totalGrossDeductions || 0).toLocaleString('id-ID') }}</span></p>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground">Nominal Dispensasi / Penyesuaian (Rp)</Label>
            <Input
              type="number"
              v-model.number="adjustForm.adjustmentAmount"
              placeholder="Contoh: -50000 (untuk mengurangi denda)"
              class="bg-muted/50 border-border/50 rounded-xl font-mono text-sm"
            />
            <p class="text-[10px] text-muted-foreground">
              Gunakan tanda minus (-) untuk menghapus denda (misal: <strong>-50000</strong> akan memotong denda sebesar Rp 50.000).
            </p>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground">Alasan & Catatan Audit Dispensasi <span class="text-destructive">*</span></Label>
            <Input
              v-model="adjustForm.notes"
              placeholder="Misal: Verifikasi CCTV hadir penuh - Dispensasi lupa finger pulang"
              class="bg-muted/50 border-border/50 rounded-xl text-xs"
              required
            />
          </div>

          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isAdjustOpen = false" :disabled="isSubmittingAdjust" class="rounded-xl font-bold text-xs h-10">
              Batal
            </Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6" :disabled="isSubmittingAdjust">
              <Loader2 v-if="isSubmittingAdjust" class="w-3.5 h-3.5 mr-2 animate-spin" />
              Simpan Koreksi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- MODAL SIMULASI MESIN FINGER -->
    <Dialog :open="isSimulateOpen" @update:open="isSimulateOpen = $event">
      <DialogContent class="sm:max-w-[440px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-primary" />
            Simulasi Tembakan Mesin Finger
          </DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">
            Kirim paket log punch ADMS buatan untuk menguji coba deteksi keterlambatan, denda, dan pencatatan presensi real-time.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSimulatePunch" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground">PIN / NIK Pegawai <span class="text-destructive">*</span></Label>
            <Input
              v-model="simForm.pin"
              placeholder="Misal: 101 atau EMP-2024-001"
              class="bg-muted/50 border-border/50 rounded-xl font-mono text-sm"
              required
            />
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground">Waktu Punch (Opsional - Kosongkan untuk Sekarang)</Label>
            <Input
              type="datetime-local"
              v-model="simForm.timestamp"
              class="bg-muted/50 border-border/50 rounded-xl text-xs"
            />
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground">ID Mesin (Serial Number)</Label>
            <Input
              v-model="simForm.serialNumber"
              placeholder="MESIN-IGD-01"
              class="bg-muted/50 border-border/50 rounded-xl text-xs"
            />
          </div>

          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isSimulateOpen = false" :disabled="isSimulating" class="rounded-xl font-bold text-xs h-10">
              Batal
            </Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6" :disabled="isSimulating">
              <Loader2 v-if="isSimulating" class="w-3.5 h-3.5 mr-2 animate-spin" />
              Tembakkan Punch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Trigger Sync Dialog -->
    <Dialog :open="isSyncModalOpen" @update:open="isSyncModalOpen = $event">
      <DialogContent class="sm:max-w-[425px] rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle class="text-lg font-bold flex items-center gap-2 text-primary">
            <RefreshCw class="w-5 h-5" />
            Sinkronisasi Kehadiran
          </DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground mt-2 leading-relaxed">
            Sistem secara bawaan hanya akan memproses data log mentah terbaru yang belum diproses sebelumnya.
          </DialogDescription>
        </DialogHeader>

        <div class="py-4 space-y-4">
          <div
            class="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border/50 p-4 shadow-sm bg-muted/10 cursor-pointer hover:bg-muted/20 transition-colors"
            @click="forceRecalculateSync = !forceRecalculateSync"
          >
            <div
              class="grid place-content-center h-4 w-4 shrink-0 rounded-sm border border-primary shadow mt-0.5 transition-colors"
              :class="forceRecalculateSync ? 'bg-primary text-primary-foreground' : 'bg-transparent'"
            >
              <svg v-if="forceRecalculateSync" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="space-y-1 leading-none">
              <span class="font-bold text-sm cursor-pointer block">
                Kalkulasi Ulang Semua Data
              </span>
              <span class="text-[11px] text-muted-foreground mt-1 cursor-pointer block">
                Centang opsi ini hanya jika Anda ingin merekonstruksi seluruh data.
              </span>
            </div>
          </div>

          <div v-if="forceRecalculateSync" class="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
            <AlertTriangle class="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div class="text-xs text-destructive font-medium leading-relaxed">
              <span class="font-bold block mb-0.5">Peringatan Keras:</span>
              Sistem akan menghapus seluruh data kehadiran dan denda yang belum dikunci secara manual, lalu menghitungnya ulang dari 0. Proses ini membutuhkan waktu sedikit lebih lama.
            </div>
          </div>
        </div>

        <DialogFooter class="sm:justify-end gap-2 pt-2 border-t border-border/50 mt-4">
          <Button variant="ghost" class="rounded-xl font-semibold text-xs" @click="isSyncModalOpen = false" :disabled="isTriggeringCron">
            Batal
          </Button>
          <Button type="button" @click="triggerCronjob" class="rounded-xl font-bold text-xs gap-2" :disabled="isTriggeringCron" :variant="forceRecalculateSync ? 'destructive' : 'default'">
            <Loader2 v-if="isTriggeringCron" class="w-3.5 h-3.5 animate-spin" />
            <RefreshCw v-else class="w-3.5 h-3.5" />
            {{ forceRecalculateSync ? 'Force Recalculate' : 'Mulai Sinkronisasi' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>