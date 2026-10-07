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

const isLoading = ref(false)
const isSaving = ref(false)

// Initialize month to current YYYY-MM
onMounted(() => {
  const now = new Date()
  selectedMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  fetchMasterData()
  document.addEventListener('click', closePicker)
})

onUnmounted(() => {
  document.removeEventListener('click', closePicker)
})

const fetchMasterData = async () => {
  try {
    const [deptRes, shiftRes] = await Promise.all([
      getDepartments(),
      getShifts()
    ])
    departments.value = deptRes
    shifts.value = shiftRes
  } catch (error) {
    console.error('Failed to load master data', error)
  }
}

const loadMatrixData = async () => {
  if (!selectedDepartment.value || !selectedMonth.value) return

  isLoading.value = true
  activeCell.value = null
  try {
    // 1. Fetch employees
    const empRes = await api.get('/api/hris/employees')
    const allEmployees = empRes.data.data || []

    // Filter employees by selected department
    const dept = departments.value.find(d => d.id === selectedDepartment.value)
    employees.value = allEmployees.filter((e: any) => e.department === dept?.name)

    // 2. Fetch schedules for the month & dept
    const [year, month] = selectedMonth.value.split('-').map(Number)
    schedules.value = await getSchedules(month, year, selectedDepartment.value)
  } catch (error) {
    console.error('Failed to load matrix data', error)
    toast.error('Gagal memuat data jadwal.')
  } finally {
    buildMatrix()
    isLoading.value = false
  }
}

// Matrix State: matrix[employeeId][day] = workShiftId
const matrix = ref<Record<string, Record<number, string>>>({})

const buildMatrix = () => {
  const newMatrix: Record<string, Record<number, string>> = {}

  employees.value.forEach(emp => {
    newMatrix[emp.id] = {}
  })

  schedules.value.forEach(sched => {
    if (newMatrix[sched.employeeId]) {
      // Safely parse YYYY-MM-DD to avoid timezone shift issues
      const parts = sched.date.split('-')
      const day = parseInt(parts[2], 10)
      newMatrix[sched.employeeId][day] = sched.workShiftId
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
  const used = new Set()
  return shifts.value
    .filter(s => !s.departmentId || s.departmentId === selectedDepartment.value)
    .map(s => {
      let hk = s.code.charAt(0).toUpperCase()
      if (used.has(hk)) {
        for(let i=1; i<s.code.length; i++) {
          const c = s.code.charAt(i).toUpperCase()
          if (/[A-Z]/.test(c) && !used.has(c)) {
            hk = c; break;
          }
        }
      }
      if (used.has(hk)) {
        hk = String(used.size + 1)
      }
      used.add(hk)
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

// Keyboard Navigation & Cell Interaction
const activeCell = ref<{ empId: string, day: number, rect: DOMRect } | null>(null)

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

const openShiftPicker = (empId: string, day: number, e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()

  let left = rect.left
  // Mencegah popover terpotong di tepi kanan layar (w-56 = 224px)
  if (left + 224 > window.innerWidth) {
    left = window.innerWidth - 240
  }

  activeCell.value = {
    empId,
    day,
    rect: { bottom: rect.bottom, left } as any
  }
}

const setShiftFromPicker = (shiftId: string) => {
  if (activeCell.value) {
    matrix.value[activeCell.value.empId][activeCell.value.day] = shiftId

    // Focus back on the cell so keyboard navigation continues working
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
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Penjadwalan Shift Bulanan</h1>
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
      <!-- Shift Legend -->
      <div class="flex flex-wrap items-center gap-3 p-4 bg-muted/20 border border-border/40 rounded-sm">
        <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">Legenda Shift & Hotkey:</p>
        <div v-for="shift in shiftsWithHotkeys" :key="shift.id" class="flex items-center gap-1.5 bg-card px-2 py-1 rounded border border-border/50 shadow-sm">
          <span class="w-3 h-3 rounded-sm border border-border/50" :style="{ backgroundColor: shift.colorHex || '#e5e7eb' }"></span>
          <span class="text-xs font-bold">{{ shift.code }}</span>
          <span class="text-[10px] text-muted-foreground ml-1">{{ shift.timeRange }}</span>
          <span class="ml-1 text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border/30 text-muted-foreground">Key: {{ shift.hotkey }}</span>
        </div>
        <p class="text-[10px] text-muted-foreground ml-auto flex items-center gap-2">
          <span class="px-1.5 py-0.5 bg-muted rounded border border-border/50 font-mono">Del</span> Hapus
          <span class="px-1.5 py-0.5 bg-muted rounded border border-border/50 font-mono ml-2">Panah</span> Navigasi
        </p>
      </div>

      <!-- Matrix Grid -->
      <div class="overflow-x-auto custom-scrollbar border border-border/40 rounded-sm bg-card shadow-sm pb-24">
        <table class="w-full text-left border-collapse min-w-max">
          <thead class="bg-muted/30 border-b border-border/50">
            <tr>
              <th class="sticky left-0 z-20 bg-muted/90 backdrop-blur border-r border-border/40 p-4 w-64 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nama Pegawai</p>
              </th>
              <th v-for="day in daysArray" :key="day" class="p-2 text-center border-r border-border/20 min-w-[36px]">
                <p class="text-[10px] font-bold text-muted-foreground uppercase">{{ day }}</p>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/30">
            <tr v-for="emp in employees" :key="emp.id" class="hover:bg-muted/10 transition-colors">
              <td class="sticky left-0 z-10 bg-card border-r border-border/40 p-3 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                <div class="flex items-start justify-between">
                  <div>
                    <p class="font-bold text-foreground text-sm tracking-tight truncate w-48" :title="emp.fullName">{{ emp.fullName }}</p>
                    <p class="text-[10px] text-muted-foreground mt-0.5">{{ emp.employeeNumber }}</p>
                  </div>
                  <div class="flex items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                    <button @click="copySchedule(emp.id)" class="p-1 hover:bg-muted rounded" title="Copy Jadwal 1 Bulan">
                      <Copy class="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                    <button @click="pasteSchedule(emp.id)" :disabled="!copiedSchedule" class="p-1 hover:bg-muted rounded disabled:opacity-30" title="Paste Jadwal">
                      <ClipboardPaste class="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                </div>
              </td>
              <td v-for="day in daysArray" :key="day" class="p-0 border-r border-border/20 text-center relative h-full">
                <div
                  :id="`cell-${emp.id}-${day}`"
                  class="matrix-cell w-full h-11 text-[11px] font-bold flex items-center justify-center cursor-pointer transition-all outline-none focus:ring-2 focus:ring-primary focus:z-20 hover:ring-1 hover:ring-border hover:z-10 select-none"
                  :style="getShiftStyle(matrix[emp.id][day])"
                  tabindex="0"
                  @click="openShiftPicker(emp.id, day, $event)"
                  @keydown="handleCellKeydown($event, emp.id, day)"
                >
                  {{ getShiftCode(matrix[emp.id][day]) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Floating Shift Picker Menu -->
    <div
      v-if="activeCell"
      class="shift-picker-menu fixed z-50 bg-popover border border-border shadow-xl rounded-md p-1 w-56 animate-in fade-in zoom-in-95"
      :style="{
        top: `${activeCell.rect.bottom + 4}px`,
        left: `${activeCell.rect.left}px`
      }"
    >
      <div class="text-[10px] font-bold text-muted-foreground px-2 py-1.5 uppercase border-b border-border/50 mb-1">Pilih Shift</div>
      <button @click="setShiftFromPicker('EMPTY')" class="w-full text-left px-2 py-1.5 text-xs hover:bg-muted rounded-sm flex items-center justify-between transition-colors">
        <span>Kosongkan Sel</span>
        <span class="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50 font-mono">Del</span>
      </button>
      <button
        v-for="shift in shiftsWithHotkeys"
        :key="shift.id"
        @click="setShiftFromPicker(shift.id)"
        class="w-full text-left px-2 py-1.5 text-xs hover:bg-muted rounded-sm flex items-center gap-2 transition-colors mt-0.5"
      >
        <span class="w-3.5 h-3.5 rounded-sm border border-border/50 shadow-sm shrink-0" :style="{ backgroundColor: shift.colorHex || '#e5e7eb' }"></span>
        <div class="flex-1 overflow-hidden">
          <p class="font-bold truncate">{{ shift.code }} <span class="font-normal text-muted-foreground">- {{ shift.name }}</span></p>
          <p class="text-[9px] text-muted-foreground">{{ shift.timeRange }}</p>
        </div>
        <span class="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/50 shrink-0 font-mono">{{ shift.hotkey }}</span>
      </button>
    </div>

  </div>
</template>