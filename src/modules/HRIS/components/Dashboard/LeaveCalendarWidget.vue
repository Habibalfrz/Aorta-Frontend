<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-vue-next'
import api from '@/api/axios'
import { Card } from '@/components/ui/card'

interface LeaveEvent {
  leaveRequestId: string
  employeeId: string
  employeeName: string
  departmentName: string
  startDate: string
  endDate: string
  state: string
  leaveType: string
}

const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const leaveEvents = ref<LeaveEvent[]>([])
const isLoading = ref(true)

// Calendar calculations
const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month, 1).getDay()
})

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const currentMonthName = computed(() => monthNames[currentDate.value.getMonth()])
const currentYear = computed(() => currentDate.value.getFullYear())

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  fetchLeaveData()
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  fetchLeaveData()
}

const selectDate = (day: number) => {
  selectedDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
}

const isToday = (day: number) => {
  const today = new Date()
  return today.getDate() === day &&
         today.getMonth() === currentDate.value.getMonth() &&
         today.getFullYear() === currentDate.value.getFullYear()
}

const isSelected = (day: number) => {
  return selectedDate.value.getDate() === day &&
         selectedDate.value.getMonth() === currentDate.value.getMonth() &&
         selectedDate.value.getFullYear() === currentDate.value.getFullYear()
}

const getEventsForDay = (day: number) => {
  const checkDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  // Normalize time for comparison
  const checkTime = checkDate.getTime()

  return leaveEvents.value.filter(event => {
    const start = new Date(event.startDate).setHours(0,0,0,0)
    const end = new Date(event.endDate).setHours(23,59,59,999)
    return checkTime >= start && checkTime <= end
  })
}

const hasEvents = (day: number) => getEventsForDay(day).length > 0

const selectedDateEvents = computed(() => {
  return getEventsForDay(selectedDate.value.getDate())
})

// Fetch Data
const fetchLeaveData = async () => {
  isLoading.value = true
  try {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()

    // Fetch from 1st of month to end of month
    const start = new Date(year, month, 1).toISOString()
    const end = new Date(year, month + 1, 0).toISOString()

    const response = await api.get('/api/hris/dashboard/leave-calendar', {
      params: { startDate: start, endDate: end }
    })
    leaveEvents.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch leave calendar data:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDateShort = (date: Date) => {
  return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
}

onMounted(() => {
  fetchLeaveData()
})
</script>

<template>
  <Card class="bg-card/60 backdrop-blur-3xl rounded-[2.5rem] p-5 lg:p-6 border border-border/50 shadow-sm flex flex-col h-full">
    <div class="flex items-center gap-3 mb-4 shrink-0">
      <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
        <Calendar class="w-4 h-4" />
      </div>
      <div>
        <h3 class="text-base font-bold text-foreground tracking-tight">Kalender Cuti & Kehadiran</h3>
        <p class="text-[10px] text-muted-foreground font-medium">{{ formatDateShort(new Date()) }}</p>
      </div>
    </div>

    <!-- Calendar Grid (Top) -->
    <div class="flex flex-col shrink-0 mb-4">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-bold text-sm text-foreground">{{ currentMonthName }} {{ currentYear }}</h4>
        <div class="flex gap-1">
          <button @click="prevMonth" class="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">
            <ChevronLeft class="w-3 h-3" />
          </button>
          <button @click="nextMonth" class="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors">
            <ChevronRight class="w-3 h-3" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1 mb-1">
        <div v-for="day in ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']" :key="day" class="text-center text-[9px] font-bold text-muted-foreground uppercase tracking-wider py-0.5">
          {{ day }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-1 relative" :class="{ 'opacity-50 pointer-events-none': isLoading }">
        <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center z-10">
          <span class="animate-pulse font-bold text-xs text-primary">Memuat...</span>
        </div>

        <!-- Empty slots for first day -->
        <div v-for="n in firstDayOfMonth" :key="`empty-${n}`" class="py-2"></div>

        <!-- Days -->
        <button
          v-for="day in daysInMonth"
          :key="day"
          @click="selectDate(day)"
          class="relative flex items-center justify-center rounded-lg text-xs font-medium transition-all py-1.5 h-8"
          :class="[
            isSelected(day) ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-bold scale-105 z-10' : 'hover:bg-muted text-foreground',
            isToday(day) && !isSelected(day) ? 'ring-1 ring-primary/50 text-primary font-bold bg-primary/5' : ''
          ]"
        >
          {{ day }}
          <!-- Event Indicator Dot -->
          <span v-if="hasEvents(day)"
                class="absolute bottom-1 w-1 h-1 rounded-full"
                :class="isSelected(day) ? 'bg-primary-foreground' : 'bg-primary'">
          </span>
        </button>
      </div>
    </div>

    <!-- Day Details (Bottom, Scrollable) -->
    <div class="flex flex-col flex-1 min-h-0 bg-muted/20 rounded-2xl p-4 border border-border/30">
      <h4 class="font-bold text-foreground mb-3 text-xs flex items-center justify-between shrink-0">
        <span>Detail: {{ selectedDate.getDate() }} {{ currentMonthName }}</span>
        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              :class="selectedDateEvents.length > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'">
          {{ selectedDateEvents.length }} Pegawai
        </span>
      </h4>

      <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 min-h-0">
        <div v-if="isLoading" class="space-y-2">
           <div v-for="i in 2" :key="i" class="animate-pulse flex gap-2 p-2 rounded-xl border border-border/20 bg-background/50">
             <div class="w-6 h-6 rounded-full bg-slate-200 shrink-0"></div>
             <div class="space-y-1.5 flex-1">
               <div class="h-2 bg-slate-200 rounded w-1/2"></div>
               <div class="h-1.5 bg-slate-200 rounded w-1/3"></div>
             </div>
           </div>
        </div>
        <template v-else-if="selectedDateEvents.length > 0">
          <div v-for="event in selectedDateEvents" :key="event.leaveRequestId"
               class="p-2 rounded-xl border border-border/50 bg-background/80 hover:bg-background transition-colors flex gap-2 items-center">
            <div class="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center border border-primary/20 shrink-0">
              {{ event.employeeName.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-foreground truncate leading-tight">{{ event.employeeName }}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="inline-flex items-center gap-0.5 text-[8px] font-bold px-1 py-0.5 rounded"
                      :class="event.state === 'Approved' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'">
                  <CheckCircle2 v-if="event.state === 'Approved'" class="w-2.5 h-2.5" />
                  <Clock v-else class="w-2.5 h-2.5" />
                  {{ event.state === 'Approved' ? 'Disetujui' : 'Menunggu' }}
                </span>
                <span class="text-[9px] text-muted-foreground truncate leading-tight">
                  {{ event.leaveType || 'Cuti' }}
                </span>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="h-full flex flex-col items-center justify-center text-center opacity-40">
          <Calendar class="w-6 h-6 mb-1.5" />
          <p class="text-[10px] font-medium leading-tight">Tidak ada pegawai cuti<br/>pada tanggal ini.</p>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
</style>