<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { CalendarDays, Save, Loader2, Copy, ClipboardPaste, Zap } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'vue-sonner'
import api from '@/api/axios'
import { getDepartments, getShifts, getSchedules, generateMonthlyRoster } from '@/api/hris'

// State
const departments = ref<any[]>([])
const shifts = ref<any[]>([])
const employees = ref<any[]>([])
const schedules = ref<any[]>([])

const selectedDepartment = ref<string>('')
const selectedMonth = ref<string>('')
const bulkShiftId = ref<string>('')

const activeTab = ref<string>('monitor')

const isLoading = ref(false)
const isSaving = ref(false)

// Initialize month to current YYYY-MM
onMounted(() => {
  const now = new Date()
  selectedMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  fetchMasterData()
})

onUnmounted(() => {
})

const fetchMasterData = async () => {
  try {
    const [deptRes, shiftRes] = await Promise.all([
      getDepartments(),
      getShifts()
    ])
    // Normalize UUIDs to lowercase to prevent C# vs JS mismatch
    departments.value = (deptRes || []).map((d: any) => ({...d, id: String(d.id).toLowerCase()}))
    shifts.value = (shiftRes || []).map((s: any) => ({...s, id: String(s.id).toLowerCase(), departmentId: s.departmentId ? String(s.departmentId).toLowerCase() : null}))
  } catch (error) {
    console.error('Failed to load master data', error)
  }
}

const loadMatrixData = async () => {
  if (!selectedDepartment.value || !selectedMonth.value) return

  isLoading.value = true
  try {
    // 1. Fetch employees
    const empRes = await api.get('/api/hris/employees')
    let allEmployees = empRes.data.data || []

    // Normalize UUIDs to lowercase
    allEmployees = allEmployees.map((e: any) => ({...e, id: String(e.id).toLowerCase()}))

    // Filter employees by selected department
    const dept = departments.value.find(d => d.id === String(selectedDepartment.value).toLowerCase())
    employees.value = allEmployees.filter((e: any) => e.department === dept?.name)

    // 2. Fetch schedules for the month & dept
    const [year, month] = selectedMonth.value.split('-').map(Number)
    const rawSchedules = await getSchedules(month, year, selectedDepartment.value)

    // Normalize schedule UUIDs
    schedules.value = (rawSchedules || []).map((sched: any) => ({
      ...sched,
      employeeId: String(sched.employeeId).toLowerCase(),
      workShiftId: String(sched.workShiftId).toLowerCase()
    }))
  } catch (error) {
    console.error('Failed to load matrix data', error)
    toast.error('Gagal memuat data jadwal.')
  } finally {
    buildMatrix()
    isLoading.value = false

    const now = new Date()
    if (selectedMonth.value === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`) {
      scrollTimelineToToday()
    }
  }
}

// Matrix State: matrix[employeeId][day] = workShiftId
const matrix = ref<Record<string, Record<number, string>>>({})

const scrollTimelineToToday = () => {
  // Logic removed: unified table doesn't need component-level scrolling
}

const buildMatrix = () => {
  const newMatrix: Record<string, Record<number, string>> = {}
  const daysCount = daysInMonth.value || 31

  employees.value.forEach(emp => {
    newMatrix[emp.id] = {}
    // Pre-populate all days to guarantee Vue 3 deep reactivity (fixes UI not updating immediately)
    for (let d = 1; d <= daysCount; d++) {
      newMatrix[emp.id][d] = 'EMPTY'
    }
  })

  schedules.value.forEach(sched => {
    const empIdLower = String(sched.employeeId).toLowerCase()
    const shiftIdLower = String(sched.workShiftId).toLowerCase()

    if (newMatrix[empIdLower]) {
      let dayStr = sched.date
      // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm:ss" formats safely
      if (dayStr.includes('T')) dayStr = dayStr.split('T')[0]

      const parts = dayStr.split('-')
      const day = parseInt(parts[2], 10)

      if (!isNaN(day) && day >= 1 && day <= daysCount) {
        newMatrix[empIdLower][day] = shiftIdLower
      }
    }
  })

  matrix.value = newMatrix
}

const daysInMonth = computed(() => {
  if (!selectedMonth.value) return 0
  const [year, month] = selectedMonth.value.split('-').map(Number)
  return new Date(year, month, 0).getDate()
})

const daysArray = computed(() => {
  const arr = []
  for (let i = 1; i <= daysInMonth.value; i++) {
    arr.push(i)
  }
  return arr
})

// UX Upgrade Helpers
function getContrastYIQ(hexcolor: string){
  if (!hexcolor) return 'black'
  hexcolor = hexcolor.replace("#", "");
  if (hexcolor.length === 3) {
    hexcolor = hexcolor.split('').map(c => c+c).join('')
  }
  if (hexcolor.length !== 6) return 'black'
  var r = parseInt(hexcolor.substring(0,2),16);
  var g = parseInt(hexcolor.substring(2,4),16);
  var b = parseInt(hexcolor.substring(4,6),16);
  var yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? 'black' : 'white';
}

const shiftsWithHotkeys = computed(() => {
  let globalCounter = 1;
  let deptCounter = 65; // ASCII 'A'

  return shifts.value
    .filter(s => {
      if (!s.departmentId) return true
      return String(s.departmentId).toLowerCase() === String(selectedDepartment.value).toLowerCase()
    })
    .map(s => {
      let hk = '';
      if (!s.departmentId) {
        hk = String(globalCounter <= 9 ? globalCounter : 0); // 1-9
        globalCounter++;
      } else {
        hk = String.fromCharCode(deptCounter); // A-Z
        deptCounter++;
      }

      return {
        ...s,
        hotkey: hk,
        timeRange: `${(s.startTime || '').substring(0,5)} - ${(s.endTime || '').substring(0,5)}`
      }
    })
})

const getShiftStyle = (shiftId: string) => {
  if (!shiftId || shiftId === 'EMPTY') return {}
  const s = shiftsWithHotkeys.value.find(x => x.id === shiftId)
  if (!s) return {}
  const bg = s.colorHex || '#e5e7eb'
  return {
    backgroundColor: bg,
    color: getContrastYIQ(bg)
  }
}

const getShiftCode = (shiftId: string) => {
  if (!shiftId || shiftId === 'EMPTY') return '-'
  const s = shiftsWithHotkeys.value.find(x => x.id === shiftId)
  return s ? s.code : '-'
}

const getShiftDetails = (shiftId: string) => {
  if (!shiftId || shiftId === 'EMPTY') return null
  const s = shifts.value.find(x => x.id === shiftId)
  if (!s) return null
  const hex = s.colorHex || '#e5e7eb'
  const isWhite = hex.toUpperCase() === '#FFFFFF'
  const st = s.startTime?.substring(0, 5) || ''
  const et = s.endTime?.substring(0, 5) || ''
  const isOvernight = st !== '' && et !== '' && st > et

  return {
    code: s.code,
    name: s.name,
    startTime: st,
    endTime: et,
    isOffDay: s.isOffDay,
    isOvernight,
    colorHex: hex,
    textColor: isWhite ? 'currentColor' : hex,
    bgColor: isWhite ? 'rgba(0, 0, 0, 0.05)' : (hex + '1A'),
    borderColor: isWhite ? 'rgba(0, 0, 0, 0.1)' : (hex + '4D')
  }
}

const getDayOfWeek = (day: number) => {
  if (!selectedMonth.value) return ''
  const [year, month] = selectedMonth.value.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, day)
  return new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date)
}

const isToday = (day: number) => {
  if (!selectedMonth.value) return false
  const now = new Date()
  const [year, month] = selectedMonth.value.split('-')
  return now.getDate() === day && now.getMonth() + 1 === parseInt(month) && now.getFullYear() === parseInt(year)
}

// Copy Paste Schedule
const copiedSchedule = ref<Record<number, string> | null>(null)

const copySchedule = (empId: string) => {
  copiedSchedule.value = { ...matrix.value[empId] }
  toast.success('Jadwal disalin. Klik logo Paste di pegawai lain.')
}

const pasteSchedule = (empId: string) => {
  if (copiedSchedule.value) {
    matrix.value[empId] = { ...copiedSchedule.value }
    toast.success('Jadwal berhasil ditempel.')
  }
}

// Bulk Auto-Fill
const applyBulk = () => {
  if (!bulkShiftId.value) {
    toast.error('Pilih shift terlebih dahulu untuk isi otomatis.')
    return
  }
  let count = 0
  Object.keys(matrix.value).forEach(empId => {
    daysArray.value.forEach(day => {
      const current = matrix.value[empId][day]
      if (!current || current === 'EMPTY') {
        matrix.value[empId][day] = bulkShiftId.value
        count++
      }
    })
  })
  toast.success(`${count} sel kosong berhasil diisi.`)
}

const activeBrush = ref<string | null>(null)
const activeCell = ref<{ empId: string, day: number, rect: any } | null>(null)

const handleCellClick = (empId: string, day: number, e: MouseEvent) => {
  if (activeBrush.value) {
    matrix.value[empId][day] = activeBrush.value
    activeCell.value = null
  } else {
    // Open contextual picker
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    let left = rect.left
    if (left + 240 > window.innerWidth) left = window.innerWidth - 250

    activeCell.value = {
      empId,
      day,
      rect: { bottom: rect.bottom, left }
    }
  }
}

const setShiftFromPicker = (shiftId: string) => {
  if (activeCell.value) {
    matrix.value[activeCell.value.empId][activeCell.value.day] = shiftId
    const el = document.getElementById(`cell-${activeCell.value.empId}-${activeCell.value.day}`)
    if (el) el.focus()
    activeCell.value = null
  }
}

const closePicker = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (activeCell.value && !target.closest('.shift-picker-menu') && !target.closest('.matrix-cell')) {
    activeCell.value = null
  }
}

// Attach listener
onMounted(() => {
  const now = new Date()
  selectedMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  fetchMasterData()
  document.addEventListener('click', closePicker)
})

onUnmounted(() => {
  document.removeEventListener('click', closePicker)
})

const handleCellKeydown = (e: KeyboardEvent, empId: string, day: number) => {
  // Arrow keys
  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.preventDefault()
    let nextDay = day
    let empIndex = employees.value.findIndex(emp => emp.id === empId)

    if (e.key === 'ArrowRight') nextDay++
    if (e.key === 'ArrowLeft') nextDay--
    if (e.key === 'ArrowDown') empIndex++
    if (e.key === 'ArrowUp') empIndex--

    if (nextDay < 1 || nextDay > daysInMonth.value) return
    if (empIndex < 0 || empIndex >= employees.value.length) return

    const nextEmpId = employees.value[empIndex].id
    const el = document.getElementById(`cell-${nextEmpId}-${nextDay}`)
    if (el) el.focus()
    return
  }

  // Delete / Backspace
  if (e.key === 'Backspace' || e.key === 'Delete') {
    matrix.value[empId][day] = 'EMPTY'
    return
  }

  // Match Hotkey
  const key = e.key.toUpperCase()
  const matchedShift = shiftsWithHotkeys.value.find(s => s.hotkey === key)
  if (matchedShift) {
    matrix.value[empId][day] = matchedShift.id

    // Auto move right
    if (day < daysInMonth.value) {
      const el = document.getElementById(`cell-${empId}-${day + 1}`)
      if (el) el.focus()
    }
  }
}

const saveRoster = async () => {
  if (!selectedDepartment.value || !selectedMonth.value) return

  isSaving.value = true
  const [year, month] = selectedMonth.value.split('-').map(Number)
  const rosters: any[] = []

  Object.keys(matrix.value).forEach(empId => {
    const empDays = matrix.value[empId]
    Object.keys(empDays).forEach(dayStr => {
      const day = Number(dayStr)
      const shiftId = empDays[day]
      if (shiftId && shiftId !== 'EMPTY') {
        // Build YYYY-MM-DD
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        rosters.push({
          employeeId: empId,
          date: dateStr,
          workShiftId: shiftId
        })
      }
    })
  })

  if (rosters.length === 0) {
    toast.info('Tidak ada jadwal yang dipilih untuk disimpan.')
    isSaving.value = false
    return
  }

  try {
    await generateMonthlyRoster({
      month,
      year,
      departmentId: selectedDepartment.value || undefined,
      rosters
    })
    toast.success('Jadwal shift bulanan berhasil disimpan.')
    // Refresh to show exact state from DB
    await loadMatrixData()
  } catch (error: any) {
    console.error('Failed to save roster', error)
    toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan jadwal.')
  } finally {
    isSaving.value = false
  }
}

watch([selectedDepartment, selectedMonth], () => {
  if (selectedDepartment.value && selectedMonth.value) {
    loadMatrixData()
  } else {
    employees.value = []
    matrix.value = {}
  }
})
</script>

<template>
  <div class="h-full space-y-6 max-w-[1600px] pb-10">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Roster & Penjadwalan</h1>
        <p class="text-sm text-muted-foreground mt-1 font-medium">Buat dan atur jadwal shift perawat / dokter per departemen.</p>
      </div>
      <Button v-permission="'hris.schedules.write'" @click="saveRoster" :disabled="isSaving || employees.length === 0" class="h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-sm shadow-sm">
        <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
        <Save v-else class="w-4 h-4 mr-2" />
        Simpan Jadwal
      </Button>
    </div>

    <!-- Filter & Toolbar -->
    <div class="p-6 bg-card border border-border/50 rounded-sm flex flex-wrap items-end gap-4 shadow-sm">
      <div class="space-y-2 w-64">
        <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Departemen / Divisi</Label>
        <Select v-model="selectedDepartment">
          <SelectTrigger class="bg-muted/50 border-border rounded-sm h-11">
            <SelectValue placeholder="Pilih Departemen" />
          </SelectTrigger>
          <SelectContent class="rounded-sm border-border shadow-xl">
            <SelectGroup>
              <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2 w-48">
        <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bulan & Tahun</Label>
        <input
          type="month"
          v-model="selectedMonth"
          class="flex h-11 w-full rounded-sm border border-border bg-muted/50 px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <!-- Bulk Auto-Fill -->
      <div class="space-y-2 w-72 ml-auto" v-if="employees.length > 0">
        <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Isi Otomatis Sel Kosong</Label>
        <div class="flex items-center gap-2">
          <Select v-model="bulkShiftId">
            <SelectTrigger class="bg-muted/50 border-border rounded-sm h-11 flex-1">
              <SelectValue placeholder="Pilih Shift" />
            </SelectTrigger>
            <SelectContent class="rounded-sm border-border shadow-xl">
              <SelectGroup>
                <SelectItem v-for="shift in shiftsWithHotkeys" :key="shift.id" :value="shift.id">
                  {{ shift.code }} - {{ shift.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button @click="applyBulk" variant="secondary" class="h-11 px-4 border border-border/50 rounded-sm shadow-sm" title="Terapkan ke semua sel kosong">
            <Zap class="w-4 h-4 mr-2" />
            Apply
          </Button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!selectedDepartment" class="flex flex-col items-center justify-center py-20 bg-muted/5 border border-border/40 rounded-sm">
      <CalendarDays class="w-16 h-16 text-muted-foreground/30 mb-4" />
      <h4 class="text-lg font-bold text-foreground">Pilih Departemen</h4>
      <p class="text-sm text-muted-foreground mt-1 max-w-sm text-center">Silakan pilih departemen dan bulan terlebih dahulu untuk menampilkan matriks jadwal.</p>
    </div>

    <div v-else-if="isLoading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2 class="w-8 h-8 animate-spin text-primary" />
      <p class="text-sm text-muted-foreground font-medium">Memuat data pegawai dan jadwal...</p>
    </div>

    <div v-else-if="employees.length === 0" class="flex flex-col items-center justify-center py-20 bg-muted/5 border border-border/40 rounded-sm">
      <p class="text-sm text-muted-foreground font-medium">Tidak ada pegawai di departemen ini.</p>
    </div>

    <div v-else class="space-y-4">
      <Tabs v-model="activeTab" class="w-full space-y-4">
        <TabsList class="w-full sm:w-auto inline-flex h-11 items-center justify-start rounded-sm bg-muted/50 p-1 text-muted-foreground">
          <TabsTrigger value="monitor" class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            Roster Board
          </TabsTrigger>
          <TabsTrigger value="editor" class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            Matriks Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" class="m-0 space-y-0">
          <!-- Elegant Top Command Bar & Painter Palette -->
          <div class="bg-card border border-border/40 border-b-0 rounded-t-xl p-3 flex flex-wrap items-center gap-4 shadow-sm relative z-10">
            <div class="flex items-center gap-2 mr-2">
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Zap class="w-4 h-4" />
              </div>
              <div>
                <p class="text-xs font-bold text-foreground leading-none">Mode Input Cepat</p>
                <p class="text-[10px] text-muted-foreground mt-0.5">Tekan Hotkey di cell, atau klik shift di bawah untuk mode "Brush/Kuas".</p>
              </div>
            </div>

            <div class="w-px h-8 bg-border/50 mx-2"></div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                v-for="shift in shiftsWithHotkeys"
                :key="shift.id"
                @click="activeBrush = activeBrush === shift.id ? null : shift.id"
                class="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 outline-none"
                :class="[
                  activeBrush === shift.id
                    ? 'border-primary ring-1 ring-primary bg-primary/5 shadow-sm'
                    : 'border-border/50 bg-background hover:border-border hover:bg-muted'
                ]"
              >
                <kbd class="min-w-[20px] h-5 flex items-center justify-center text-[10px] font-mono font-bold rounded shadow-[0_1.5px_0_0_rgba(0,0,0,0.1)] transition-colors"
                     :class="activeBrush === shift.id ? 'bg-primary text-primary-foreground shadow-none' : 'bg-muted border border-border/50 text-foreground'">
                  {{ shift.hotkey }}
                </kbd>
                <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: shift.colorHex || '#e5e7eb' }"></span>
                <div class="text-left">
                  <p class="text-[11px] font-bold leading-none" :class="activeBrush === shift.id ? 'text-primary' : 'text-foreground'">{{ shift.code }}</p>
                  <p class="text-[9px] font-medium text-muted-foreground mt-0.5">{{ shift.name }} <span class="opacity-70 font-mono ml-1">({{ shift.timeRange }})</span></p>
                </div>

                <!-- Brush Indicator -->
                <div v-if="activeBrush === shift.id" class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm">
                  <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </button>

              <div class="w-px h-6 bg-border/50 mx-1"></div>

              <button
                @click="activeBrush = activeBrush === 'EMPTY' ? null : 'EMPTY'"
                class="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 outline-none"
                :class="[
                  activeBrush === 'EMPTY'
                    ? 'border-destructive ring-1 ring-destructive bg-destructive/5 shadow-sm'
                    : 'border-border/50 bg-background hover:border-border hover:bg-muted'
                ]"
              >
                <kbd class="px-1.5 h-5 flex items-center justify-center text-[10px] font-mono font-bold rounded shadow-[0_1.5px_0_0_rgba(0,0,0,0.1)] transition-colors"
                     :class="activeBrush === 'EMPTY' ? 'bg-destructive text-destructive-foreground shadow-none' : 'bg-destructive/10 border border-destructive/20 text-destructive'">
                  Del
                </kbd>
                <div class="text-left">
                  <p class="text-[11px] font-bold leading-none" :class="activeBrush === 'EMPTY' ? 'text-destructive' : 'text-muted-foreground'">Hapus</p>
                  <p class="text-[9px] text-muted-foreground mt-0.5">Kosongkan cell</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Matrix Grid -->
          <div class="overflow-x-auto custom-scrollbar border border-border/40 rounded-b-xl bg-card shadow-sm pb-24 relative" :class="{'cursor-crosshair': activeBrush}">
            <table class="w-full text-left border-collapse min-w-max">
              <thead class="bg-muted/20 border-b border-border/40 sticky top-0 z-40 backdrop-blur-md">
                <tr>
                  <th class="sticky left-0 z-50 bg-background border-r border-border/40 p-4 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nama Pegawai</p>
                  </th>
                  <th v-for="day in daysArray" :key="day" class="p-2 text-center border-r border-border/20 min-w-[44px]">
                    <p class="text-[10px] font-bold text-muted-foreground uppercase">{{ day }}</p>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border/20">
                <tr v-for="emp in employees" :key="emp.id" class="hover:bg-muted/10 transition-colors">
                  <td class="sticky left-0 z-40 bg-background border-r border-border/40 p-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-muted/50 transition-colors">
                    <div class="flex items-start justify-between">
                      <div>
                        <p class="font-bold text-foreground text-sm tracking-tight truncate w-48" :title="emp.fullName">{{ emp.fullName }}</p>
                        <p class="text-[10px] text-muted-foreground mt-0.5">{{ emp.employeeNumber }}</p>
                      </div>
                      <div class="flex items-center gap-1 opacity-20 hover:opacity-100 transition-opacity">
                        <button @click="copySchedule(emp.id)" class="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors" title="Copy Jadwal 1 Bulan">
                          <Copy class="w-3.5 h-3.5" />
                        </button>
                        <button @click="pasteSchedule(emp.id)" :disabled="!copiedSchedule" class="p-1 hover:bg-muted rounded disabled:opacity-30 text-muted-foreground hover:text-primary transition-colors" title="Paste Jadwal">
                          <ClipboardPaste class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td v-for="day in daysArray" :key="day" class="p-1 border-r border-border/10 text-center relative h-12">
                    <div
                      :id="`cell-${emp.id}-${day}`"
                      class="matrix-cell w-full h-full rounded-md text-[11px] font-bold flex items-center justify-center cursor-pointer transition-all outline-none focus:ring-2 focus:ring-primary focus:shadow-md hover:bg-muted border border-transparent select-none"
                      :class="{'active:scale-90': !activeBrush, 'hover:border-primary/30': activeBrush}"
                      :style="getShiftStyle(matrix[emp.id][day])"
                      tabindex="0"
                      :title="getShiftDetails(matrix[emp.id]?.[day]) ? `${getShiftDetails(matrix[emp.id][day]).name} (${getShiftDetails(matrix[emp.id][day]).startTime} - ${getShiftDetails(matrix[emp.id][day]).endTime})` : 'Kosong'"
                      @click="handleCellClick(emp.id, day)"
                      @keydown="handleCellKeydown($event, emp.id, day)"
                    >
                      <span v-if="!matrix[emp.id]?.[day] || matrix[emp.id][day] === 'EMPTY'" class="opacity-0 hover:opacity-40 text-muted-foreground transition-opacity font-medium">+</span>
                      <span v-else>{{ getShiftCode(matrix[emp.id][day]) }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="monitor" class="m-0 space-y-4">
          <!-- Seamless Time Grid (Roster Board) -->
          <div class="overflow-x-auto custom-scrollbar border border-border/20 rounded-xl bg-card shadow-sm pb-10">
            <table class="w-full text-left border-collapse min-w-max">
              <thead class="sticky top-0 z-40 bg-background border-b border-border/30">
                <tr>
                  <th class="sticky left-0 z-50 bg-background border-r border-border/20 p-4 w-56 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Karyawan</p>
                  </th>
                  <th v-for="day in daysArray" :key="day"
                      class="p-2 text-center min-w-[50px] transition-colors relative"
                      :class="{ 'bg-primary/5': isToday(day) }">
                    <!-- Tiang Fokus Hari Ini (Top Cap) -->
                    <div v-if="isToday(day)" class="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                    <div class="flex flex-col items-center justify-center gap-0.5">
                      <span class="text-[9px] uppercase font-bold tracking-widest" :class="isToday(day) ? 'text-primary' : 'text-muted-foreground/60'">{{ getDayOfWeek(day) }}</span>
                      <span class="font-black text-sm" :class="isToday(day) ? 'text-primary' : 'text-foreground/80'">{{ day }}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border/10">
                <tr v-for="emp in employees" :key="emp.id" class="hover:bg-muted/30 transition-colors group">
                  <td class="sticky left-0 z-40 bg-background group-hover:bg-muted/50 transition-colors border-r border-border/20 p-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <div class="flex items-center gap-3">
                      <div class="w-7 h-7 rounded-full bg-muted border border-border/30 text-muted-foreground flex items-center justify-center font-bold text-[10px] shrink-0">
                        {{ emp.fullName.substring(0, 2).toUpperCase() }}
                      </div>
                      <div class="overflow-hidden">
                        <p class="font-bold text-foreground text-xs tracking-tight w-36 truncate" :title="emp.fullName">{{ emp.fullName }}</p>
                        <p class="text-[9px] font-semibold text-muted-foreground mt-0.5 truncate uppercase tracking-wider">{{ emp.jobPosition }}</p>
                      </div>
                    </div>
                  </td>
                  <td v-for="day in daysArray" :key="day"
                      class="p-1 text-center h-[52px] align-middle"
                      :class="{ 'bg-primary/[0.03]' : isToday(day) }">
                    <!-- Empty State -->
                    <template v-if="!getShiftDetails(matrix[emp.id]?.[day])"></template>

                    <!-- Off Day -->
                    <template v-else-if="getShiftDetails(matrix[emp.id]?.[day])?.isOffDay">
                      <div class="w-full h-full flex items-center justify-center">
                        <span class="text-[10px] font-black tracking-widest text-indigo-400/70">OFF</span>
                      </div>
                    </template>

                    <!-- Regular Shift Stacked Times -->
                    <template v-else>
                      <div class="flex flex-col items-center justify-center w-full h-full space-y-[2px]">
                        <span class="text-[11px] font-extrabold tracking-tighter leading-none text-emerald-500/90 dark:text-emerald-400">
                          {{ getShiftDetails(matrix[emp.id]?.[day])?.startTime }}
                        </span>
                        <div class="flex items-start">
                          <span class="text-[11px] font-extrabold tracking-tighter leading-none text-orange-500/90 dark:text-orange-400">
                            {{ getShiftDetails(matrix[emp.id]?.[day])?.endTime }}
                          </span>
                          <span v-if="getShiftDetails(matrix[emp.id]?.[day])?.isOvernight" class="text-[7px] font-black text-orange-500/60 leading-none ml-px -mt-0.5">+1</span>
                        </div>
                      </div>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>

  </div>

  <!-- Contextual Shift Picker -->
  <div
    v-if="activeCell"
    class="shift-picker-menu fixed z-[100] bg-popover border border-border shadow-2xl rounded-lg p-1 w-64 animate-in fade-in zoom-in-95"
    :style="{
      top: `${activeCell.rect.bottom + 6}px`,
      left: `${activeCell.rect.left}px`
    }"
  >
    <div class="text-[10px] font-bold text-muted-foreground px-2 py-1.5 uppercase border-b border-border/50 mb-1">Pilih Shift</div>

    <button @click="setShiftFromPicker('EMPTY')" class="w-full text-left px-2 py-1.5 hover:bg-muted rounded-md flex items-center justify-between transition-colors outline-none focus:bg-muted group">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded-sm border border-dashed border-muted-foreground/50 flex items-center justify-center">
          <span class="text-[8px] text-muted-foreground">✕</span>
        </div>
        <div>
          <p class="text-xs font-bold text-destructive group-hover:text-destructive/80">Kosongkan Sel</p>
        </div>
      </div>
      <kbd class="text-[9px] text-muted-foreground bg-muted group-hover:bg-background px-1.5 py-0.5 rounded border border-border/50 font-mono">Del</kbd>
    </button>

    <button
      v-for="shift in shiftsWithHotkeys"
      :key="shift.id"
      @click="setShiftFromPicker(shift.id)"
      class="w-full text-left px-2 py-1.5 mt-0.5 hover:bg-muted rounded-md flex items-start gap-2 transition-colors outline-none focus:bg-muted group"
    >
      <span class="w-4 h-4 rounded-sm border border-border/50 shadow-sm shrink-0 mt-0.5" :style="{ backgroundColor: shift.colorHex || '#e5e7eb' }"></span>
      <div class="flex-1 overflow-hidden">
        <p class="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{{ shift.code }}</p>
        <p class="text-[9px] font-medium text-muted-foreground">{{ shift.name }} <span class="opacity-70 font-mono">({{ shift.timeRange }})</span></p>
      </div>
      <kbd class="text-[9px] text-muted-foreground bg-muted group-hover:bg-background px-1.5 py-0.5 rounded border border-border/50 shrink-0 font-mono mt-0.5">{{ shift.hotkey }}</kbd>
    </button>
  </div>
</template>