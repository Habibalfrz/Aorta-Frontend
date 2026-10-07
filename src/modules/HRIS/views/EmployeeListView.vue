<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import EmployeeForm from '../components/EmployeeForm.vue'
import EmployeeBasicInfoTab from '../components/EmployeeBasicInfoTab.vue'
import EmployeeHistoryTab from '../components/EmployeeHistoryTab.vue'
import EmployeeContractTab from '../components/EmployeeContractTab.vue'
import EmployeeCredentialsTab from '../components/EmployeeCredentialsTab.vue'
import EmployeeFamilyTab from '../components/EmployeeFamilyTab.vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import api from '@/api/axios'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, MoreHorizontal, AlertTriangle, ShieldAlert, Loader2, CalendarOff, ChevronLeft, ChevronRight, ExternalLink, CheckCircle2, Timer, FileWarning } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { toast } from 'vue-sonner'
import { updateEmployee, deleteEmployee, getDepartments, getJobPositions, getEmployeeContracts, getEmployeeAttendance } from '@/api/hris'

interface Employee {
  id: string;
  employeeNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  department?: string;
  departmentId?: string;
  position?: string;
  positionId?: string;
  status?: 'Aktif' | 'Cuti' | 'Resign';
  professionCategory?: string;
  email?: string;
}

const employees = ref<Employee[]>([])
const departments = ref<any[]>([])
const jobPositions = ref<any[]>([])
const isLoading = ref(true)

const searchQuery = ref('')
const selectedDepartmentFilter = ref<string>('ALL')
const selectedStatusFilter = ref<string>('ALL')

const isDetailOpen = ref(false)
const selectedEmployee = ref<Employee | null>(null)
const isLoaded = ref(false)

// Tab state for detail dialog
const activeTab = ref('profil')

// Create Form Dialog State
const isFormOpen = ref(false)

// Edit Dialog State
const isEditOpen = ref(false)
const editForm = ref<{
  id: string;
  identityNumber: string;
  employeeNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'L' | 'P';
  status: string;
  professionCategory: string;
  departmentId?: string;
  jobPositionId?: string;
}>({
  id: '',
  identityNumber: '',
  employeeNumber: '',
  fullName: '',
  dateOfBirth: '',
  gender: 'L',
  status: 'Aktif',
  professionCategory: 'Staff',
  departmentId: undefined,
  jobPositionId: undefined
})

const isSubmittingEdit = ref(false)

// Delete Dialog State
const isDeleteOpen = ref(false)
const employeeToDelete = ref<Employee | null>(null)
const isDeleting = ref(false)

const filteredEmployees = computed(() => {
  if (!Array.isArray(employees.value)) return []

  return employees.value.filter(emp => {
    if (!emp) return false

    const q = (searchQuery.value || '').trim().toLowerCase()
    const fullName = (emp.fullName || '').toLowerCase()
    const nik = (emp.employeeNumber || '').toLowerCase()
    const matchesSearch = !q || fullName.includes(q) || nik.includes(q)

    const deptFilter = (selectedDepartmentFilter.value || 'ALL').toUpperCase()
    const empDept = (emp.department || '').toUpperCase()
    const matchesDept = !selectedDepartmentFilter.value || deptFilter === 'ALL' || empDept === deptFilter

    const statusFilter = (selectedStatusFilter.value || 'ALL').toUpperCase()
    const empStatus = (emp.status || 'AKTIF').toUpperCase()
    const matchesStatus = !selectedStatusFilter.value || statusFilter === 'ALL' ||
      (statusFilter === 'AKTIF' && (empStatus === 'AKTIF' || empStatus === 'ACTIVE')) ||
      (statusFilter === 'CUTI' && empStatus === 'CUTI') ||
      (statusFilter === 'RESIGN' && (empStatus === 'RESIGN' || empStatus === 'INACTIVE'))

    return matchesSearch && matchesDept && matchesStatus
  })
})

const fullEmployeeData = ref<any>(null)
const contractsData = ref<any[]>([])
const isLoadingContracts = ref(false)

const getStatusVariant = (status: Employee['status'] | string | undefined) => {
  switch (status) {
    case 'Aktif':
    case 'Active':
      return 'default'
    case 'Cuti':
      return 'secondary'
    case 'Resign':
    case 'Inactive':
      return 'destructive'
    default:
      return 'default'
  }
}

const openDetail = async (employee: Employee) => {
  selectedEmployee.value = employee
  fullEmployeeData.value = null
  contractsData.value = []
  isDetailOpen.value = true
  isLoadingContracts.value = true

  // Fetch full details so that tabs like Credentials receive the required data
  try {
    const [empRes, contractRes] = await Promise.all([
      api.get(`/api/hris/employees/${employee.id}`),
      getEmployeeContracts(employee.id).catch(e => {
        console.warn('Contracts endpoint returned error:', e);
        return []; // Fallback to empty array if contracts API fails, so profile still loads
      })
    ])
    fullEmployeeData.value = empRes.data.data
    contractsData.value = contractRes || []
  } catch (error) {
    console.error('Failed to fetch full employee detail:', error)
  } finally {
    isLoadingContracts.value = false
  }
}

const handleSaveEdit = async () => {
  if (!editForm.value.fullName || !editForm.value.employeeNumber || !editForm.value.identityNumber) {
    toast.error('No. KTP, NIP, dan Nama lengkap wajib diisi')
    return
  }

  // Explicit validation for Placement
  if (editForm.value.departmentId && !editForm.value.jobPositionId) {
    toast.error('Gagal menyimpan: Posisi Jabatan wajib dipilih jika Departemen diisi.')
    return
  }
  if (!editForm.value.departmentId && editForm.value.jobPositionId) {
    toast.error('Gagal menyimpan: Departemen wajib dipilih jika Posisi Jabatan diisi.')
    return
  }

  isSubmittingEdit.value = true
  try {
    await updateEmployee(editForm.value.id, {
      id: editForm.value.id,
      identityNumber: editForm.value.identityNumber,
      employeeNumber: editForm.value.employeeNumber,
      fullName: editForm.value.fullName,
      dateOfBirth: editForm.value.dateOfBirth ? new Date(editForm.value.dateOfBirth).toISOString() : new Date().toISOString(),
      gender: editForm.value.gender,
      status: editForm.value.status,
      professionCategory: editForm.value.professionCategory,
      departmentId: editForm.value.departmentId,
      jobPositionId: editForm.value.jobPositionId
    })
    toast.success('Data pegawai berhasil diperbarui')
    isEditOpen.value = false
    fetchEmployees()

    // Jika pegawai yang diedit sedang dibuka detailnya, segarkan data detailnya
    if (isDetailOpen.value && selectedEmployee.value && selectedEmployee.value.id === editForm.value.id) {
      openDetail(selectedEmployee.value)
    }
  } catch (error: any) {
    console.error('Failed to update employee:', error)
    toast.error(error.response?.data?.message || 'Gagal memperbarui data pegawai')
  } finally {
    isSubmittingEdit.value = false
  }
}

const promptDeleteEmployee = (emp: Employee) => {
  employeeToDelete.value = emp
  isDeleteOpen.value = true
}

const confirmDeleteEmployee = async () => {
  if (!employeeToDelete.value) return

  isDeleting.value = true
  try {
    await deleteEmployee(employeeToDelete.value.id)
    toast.success('Pegawai berhasil dihapus dan dinonaktifkan')
    isDeleteOpen.value = false
    employeeToDelete.value = null
    fetchEmployees()
  } catch (error: any) {
    console.error('Failed to delete employee:', error)
    toast.error(error.response?.data?.message || 'Gagal menghapus pegawai')
  } finally {
    isDeleting.value = false
  }
}

const fetchEmployees = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/hris/employees')
    const rawList = response.data.data || response.data || []
    employees.value = Array.isArray(rawList) ? rawList : []
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    toast.error('Gagal mengambil data pegawai')
  } finally {
    isLoading.value = false
  }
}

const fetchMasterData = async () => {
  try {
    const [depts, jobs] = await Promise.all([
      getDepartments(),
      getJobPositions()
    ])
    departments.value = depts
    jobPositions.value = jobs
  } catch (e) {
    console.error('Failed to load master data:', e)
  }
}

onMounted(() => {
  fetchEmployees()
  fetchMasterData()
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})

const handleEmployeeCreated = (_id: string) => {
  fetchEmployees()
}

// Dialog Navigation Logic
const currentIndex = computed(() => {
  if (!selectedEmployee.value) return -1
  return filteredEmployees.value.findIndex(emp => emp.id === selectedEmployee.value?.id)
})

const hasNextEmployee = computed(() => currentIndex.value >= 0 && currentIndex.value < filteredEmployees.value.length - 1)
const hasPrevEmployee = computed(() => currentIndex.value > 0)

const goNextEmployee = () => {
  if (hasNextEmployee.value) {
    selectedEmployee.value = filteredEmployees.value[currentIndex.value + 1]
  }
}

const goPrevEmployee = () => {
  if (hasPrevEmployee.value) {
    selectedEmployee.value = filteredEmployees.value[currentIndex.value - 1]
  }
}

// Mockup Data for Attendance Timeline (assuming 07:00 - 19:00 window)
// 07:00 = 0%, 19:00 = 100% (12 hours total)
// 08:00 = 8.33%, 12:00 = 41.66%, 13:00 = 50%, 17:00 = 83.33%
const attendancePeriod = ref('1w')
const attendanceData = ref<any[]>([])
const isLoadingAttendance = ref(false)

const formatLocalDate = (dateStr: string) => {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(d)
  } catch (e) {
    return dateStr
  }
}

const calculateDuration = (checkIn: string, checkOut: string) => {
  if (!checkIn || checkIn === '-' || !checkOut || checkOut === '-') return '0j 0m'
  const [inH, inM] = checkIn.split(':').map(Number)
  const [outH, outM] = checkOut.split(':').map(Number)
  let diffMin = (outH * 60 + outM) - (inH * 60 + inM)
  if (diffMin < 0) diffMin += 24 * 60 // lintas hari
  const h = Math.floor(diffMin / 60)
  const m = diffMin % 60
  return `${h}j ${m}m`
}

const mapStatusToUI = (status: string, isAnomaly: boolean) => {
  if (isAnomaly || status === 'MissingCheckOut') return 'Lupa Tap Pulang'
  if (status === 'Late') return 'Terlambat'
  if (status === 'OnTime') return 'Tepat Waktu'
  return status
}

const attendanceStats = computed(() => {
  const data = attendanceData.value
  let totalDays = data.length
  let onTime = 0
  let late = 0
  let overtimeHours = 0
  let lateMinutesTotal = 0
  
  data.forEach(log => {
    if (log.status === 'OnTime') onTime++
    if (log.status === 'Late') {
      late++
      lateMinutesTotal += (log.lateMinutes || 0)
    }

    if (log.checkIn !== '-' && log.checkOut !== '-') {
      const [inH, inM] = log.checkIn.split(':').map(Number)
      const [outH, outM] = log.checkOut.split(':').map(Number)
      let diffMin = (outH * 60 + outM) - (inH * 60 + inM)
      if (diffMin < 0) diffMin += 24 * 60
      if (diffMin > 9 * 60) {
        overtimeHours += (diffMin - 9 * 60) / 60
      }
    }
  })

  return {
    totalDays,
    onTime,
    late,
    lateMinutesTotal,
    overtimeHours: Math.floor(overtimeHours)
  }
})

const fetchAttendance = async () => {
  if (!selectedEmployee.value) return
  isLoadingAttendance.value = true
  
  try {
    const end = new Date()
    let start = new Date()
    switch(attendancePeriod.value) {
      case '1w': start.setDate(end.getDate() - 7); break;
      case '2w': start.setDate(end.getDate() - 14); break;
      case '3w': start.setDate(end.getDate() - 21); break;
      case '4w': start = new Date(end.getFullYear(), end.getMonth(), 1); break;
    }
    
    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]

    const result = await getEmployeeAttendance(selectedEmployee.value.id, startStr, endStr)
    attendanceData.value = result || []
  } catch(e) {
    console.error('Failed fetching attendance', e)
    toast.error('Gagal mengambil log kehadiran')
  } finally {
    isLoadingAttendance.value = false
  }
}

watch([activeTab, attendancePeriod], ([newTab]) => {
  if (newTab === 'kehadiran') {
    fetchAttendance()
  }
})
</script>

<template>
  <div class="h-full space-y-8 max-w-[1400px]">
    <!-- Header -->
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-between"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Data Pegawai</h1>
        <p class="text-sm text-muted-foreground mt-1 font-medium">Kelola profil, penempatan divisi, status, dan data induk kepegawaian.</p>
      </div>
      <Button v-permission="'hris.employees.write'" class="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-sm transition-colors flex items-center gap-2 shadow-sm" @click="isFormOpen = true">
        <Plus class="w-4 h-4" />
        Tambah Pegawai Baru
      </Button>
    </div>

    <!-- Data Table Card -->
    <div class="bg-card border-none rounded-sm shadow-sm overflow-hidden transition-all duration-700 delay-100 ease-out flex flex-col"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">

      <!-- Toolbar with Advanced Filtering -->
      <div class="p-6 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-muted/20">
        <div class="flex flex-wrap items-center gap-3 flex-1">
          <!-- Search Bar -->
          <div class="relative w-full sm:w-72">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="Cari NIK atau Nama Pegawai..."
              class="w-full pl-10 pr-4 h-11 bg-card border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-foreground"
            />
          </div>

          <!-- Department Filter -->
          <div class="w-44">
            <Select v-model="selectedDepartmentFilter">
              <SelectTrigger class="h-11 bg-card border-border/60 rounded-sm text-xs font-semibold">
                <SelectValue placeholder="Departemen" />
              </SelectTrigger>
              <SelectContent class="rounded-sm border-border shadow-xl bg-card text-foreground z-50">
                <SelectGroup>
                  <SelectItem value="ALL" class="text-xs">Semua Departemen</SelectItem>
                  <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.name" class="text-xs">
                    {{ dept.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <!-- Status Filter -->
          <div class="w-36">
            <Select v-model="selectedStatusFilter">
              <SelectTrigger class="h-11 bg-card border-border/60 rounded-sm text-xs font-semibold">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent class="rounded-sm border-border shadow-xl bg-card text-foreground z-50">
                <SelectItem value="ALL" class="text-xs">Semua Status</SelectItem>
                <SelectItem value="Aktif" class="text-xs">Aktif</SelectItem>
                <SelectItem value="Cuti" class="text-xs">Cuti</SelectItem>
                <SelectItem value="Resign" class="text-xs">Resign</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="text-xs font-medium text-muted-foreground shrink-0">
          Menampilkan <span class="font-bold text-foreground">{{ filteredEmployees.length }}</span> dari <span class="font-bold text-foreground">{{ employees.length }}</span> Pegawai
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto custom-scrollbar">
        <Table class="w-full text-left border-collapse min-w-[850px]">
          <TableHeader class="bg-muted/30 border-b border-border/50">
            <TableRow class="hover:bg-transparent border-b-0">
              <TableHead class="w-[150px] font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">NIK</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Nama Lengkap</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Gender</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Departemen & Jabatan</TableHead>
              <TableHead class="w-[110px] font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Status</TableHead>
              <TableHead class="w-[80px] text-right font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Opsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody class="divide-y divide-border/30">
            <TableRow v-if="isLoading">
              <TableCell colspan="6" class="h-28 text-center text-muted-foreground font-medium text-sm">
                <div class="flex items-center justify-center gap-2">
                  <Loader2 class="w-4 h-4 animate-spin text-primary" />
                  <span>Memuat data pegawai...</span>
                </div>
              </TableCell>
            </TableRow>
            <template v-else>
              <TableRow
                v-for="(emp, index) in filteredEmployees"
                :key="emp.id"
                class="cursor-pointer hover:bg-accent/50 transition-colors group"
                :style="{ transitionDelay: `${(index + 1) * 30}ms` }"
                @click="openDetail(emp)"
              >
                <TableCell class="font-mono text-sm font-bold text-muted-foreground px-6 py-4">
                  {{ emp.employeeNumber }}
                </TableCell>
                <TableCell class="px-6 py-4">
                  <p class="font-bold text-foreground text-sm tracking-tight">{{ emp.fullName }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ emp.professionCategory || 'Staff' }}</p>
                </TableCell>
                <TableCell class="text-muted-foreground text-xs font-medium px-6 py-4">
                  {{ emp.gender === 'L' ? 'Laki-laki' : (emp.gender === 'P' ? 'Perempuan' : emp.gender) }}
                </TableCell>
                <TableCell class="px-6 py-4">
                  <div class="flex flex-col gap-0.5">
                    <span v-if="!emp.departmentId && (!emp.department || emp.department.includes('Belum'))" class="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Belum ada penempatan
                    </span>
                    <span v-else class="text-xs font-semibold text-foreground">{{ emp.department }}</span>
                    <span class="text-[11px] text-muted-foreground">{{ emp.position }}</span>
                  </div>
                </TableCell>
                <TableCell class="px-6 py-4">
                  <Badge :variant="getStatusVariant(emp.status)" class="text-[10px] font-bold uppercase tracking-wider">
                    {{ emp.status || 'Aktif' }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right px-6 py-4" @click.stop>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" class="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-xl">
                        <span class="sr-only">Buka menu</span>
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-48 rounded-sm border-border shadow-xl p-1.5 bg-card text-foreground z-50">
                      <DropdownMenuItem @click="openDetail(emp)" class="rounded-sm cursor-pointer text-xs font-semibold hover:bg-accent focus:bg-accent py-2">
                        Lihat Detail
                      </DropdownMenuItem>
                      <div v-permission="'hris.employees.write'">
                        <DropdownMenuSeparator class="my-1" />
                        <DropdownMenuItem @click="$router.push({ path: '/hris/employees/' + emp.id })" class="rounded-sm cursor-pointer text-xs font-semibold hover:bg-accent focus:bg-accent py-2">
                          Halaman Penuh / Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="promptDeleteEmployee(emp)" class="rounded-sm cursor-pointer text-xs font-semibold text-destructive hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10 py-2">
                          Hapus Pegawai
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow v-if="filteredEmployees.length === 0">
                <TableCell colspan="6" class="h-28 text-center text-muted-foreground text-sm font-medium">
                  Tidak ada data pegawai yang sesuai dengan filter pencarian.
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Dialog for Employee Detail -->
    <Dialog v-model:open="isDetailOpen">
      <DialogContent class="sm:max-w-4xl w-[95vw] p-0 h-[85vh] bg-card border-border shadow-2xl overflow-hidden rounded-xl flex flex-col">
        <Tabs v-model="activeTab" class="w-full h-full flex flex-col">

          <!-- Minimalist Header & Horizontal Tabs -->
          <div class="pt-8 px-8 pb-0 bg-background border-b border-border/40 shrink-0 z-10 flex flex-col">
            <div class="flex items-start justify-between gap-6">
              <div class="flex items-center gap-5">
                <Avatar class="w-16 h-16 border border-border shadow-sm rounded-full">
                  <AvatarFallback class="bg-primary/5 text-primary text-xl font-bold">
                    {{ selectedEmployee?.fullName?.charAt(0) || 'U' }}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div class="flex items-center gap-3">
                    <DialogTitle class="text-2xl font-bold tracking-tight text-foreground">{{ selectedEmployee?.fullName }}</DialogTitle>
                    <Badge :variant="getStatusVariant(selectedEmployee?.status || 'Aktif')" class="text-[10px] uppercase font-bold px-2 py-0.5 shadow-none rounded-md">{{ selectedEmployee?.status || 'Aktif' }}</Badge>
                  </div>
                  <p class="text-sm font-medium text-muted-foreground mt-1">
                    <span class="font-mono text-foreground font-semibold">{{ selectedEmployee?.employeeNumber }}</span> &bull; {{ selectedEmployee?.department || 'Umum' }} &bull; {{ selectedEmployee?.position || 'Staf' }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <div class="flex items-center gap-1 bg-muted/20 border border-border/40 rounded-lg p-1">
                  <Button variant="ghost" size="icon" class="h-8 w-8 rounded-md" :disabled="!hasPrevEmployee" @click="goPrevEmployee">
                    <ChevronLeft class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8 rounded-md" :disabled="!hasNextEmployee" @click="goNextEmployee">
                    <ChevronRight class="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="outline" class="rounded-lg font-bold text-xs h-10 px-4" @click="selectedEmployee ? $router.push({ path: '/hris/employees/' + selectedEmployee.id }) : null">
                  <ExternalLink class="w-3.5 h-3.5 mr-2" />
                  Halaman Penuh
                </Button>
              </div>
            </div>

            <!-- Horizontal Clean Tabs -->
            <div class="mt-8">
              <TabsList class="w-full justify-start h-auto p-0 bg-transparent gap-8 overflow-x-auto flex-nowrap border-none">
                <TabsTrigger
                  value="profil"
                  class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-bold whitespace-nowrap hover:text-foreground transition-colors"
                >
                  Profil Personal
                </TabsTrigger>
                <TabsTrigger
                  value="penempatan"
                  class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-bold whitespace-nowrap hover:text-foreground transition-colors"
                >
                  Penempatan
                </TabsTrigger>
                <TabsTrigger
                  value="kontrak"
                  class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-bold whitespace-nowrap hover:text-foreground transition-colors"
                >
                  Riwayat Kontrak
                </TabsTrigger>
                <TabsTrigger
                  v-if="['Medis', 'Keperawatan', 'Penunjang Medis'].includes(fullEmployeeData?.professionCategory)"
                  value="credentials"
                  class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-bold whitespace-nowrap hover:text-foreground transition-colors"
                >
                  Kredensial Medis
                </TabsTrigger>
                <TabsTrigger
                  value="kehadiran"
                  class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-bold whitespace-nowrap hover:text-foreground transition-colors"
                >
                  Kehadiran
                </TabsTrigger>
                <TabsTrigger
                  value="cuti"
                  class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-bold whitespace-nowrap hover:text-foreground transition-colors"
                >
                  Cuti & Izin
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <!-- Content Area -->
          <div class="flex-1 bg-muted/10 overflow-y-auto custom-scrollbar relative">
            <div class="p-8 sm:p-10 max-w-4xl mx-auto">
              <TabsContent value="profil" class="mt-0 outline-none space-y-8 animate-in fade-in-50 duration-500">
                <EmployeeBasicInfoTab
                  :employee-id="selectedEmployee?.id || ''"
                  :employee-data="fullEmployeeData"
                  :hide-edit-button="true"
                />
              </TabsContent>

              <TabsContent value="penempatan" class="mt-0 outline-none space-y-8 animate-in fade-in-50 duration-500">
                <EmployeeHistoryTab
                  :employee-id="selectedEmployee?.id || ''"
                  :employee-data="fullEmployeeData"
                  :departments="departments"
                  :job-positions="jobPositions"
                  @refetch="openDetail(selectedEmployee!)"
                />
              </TabsContent>

              <TabsContent value="kontrak" class="mt-0 outline-none space-y-8 animate-in fade-in-50 duration-500">
                <EmployeeContractTab
                  :employee-id="selectedEmployee?.id || ''"
                  :contracts="contractsData"
                  :is-loading-contracts="isLoadingContracts"
                  :is-readonly="true"
                />
              </TabsContent>

              <TabsContent value="kehadiran" class="mt-0 outline-none space-y-6 animate-in fade-in-50 duration-500">
                <div class="flex items-end justify-between pb-4 border-b border-border/40">
                  <div>
                    <h3 class="text-xl font-bold text-foreground tracking-tight">Audit Presensi & Jam Kerja</h3>
                    <p class="text-sm text-muted-foreground mt-1">Laporan analitik, log mesin, dan rekonsiliasi kehadiran bulanan.</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <Button variant="outline" class="h-8 text-xs font-semibold rounded-sm bg-transparent border-border hover:bg-muted/30">
                      <ExternalLink class="w-3.5 h-3.5 mr-2" />
                      Ekspor Laporan
                    </Button>
                    <Select v-model="attendancePeriod">
                      <SelectTrigger class="w-[160px] h-8 text-xs font-semibold rounded-sm border-border bg-transparent shadow-none hover:bg-muted/30 transition-colors">
                        <SelectValue placeholder="Pilih Periode" />
                      </SelectTrigger>
                      <SelectContent class="rounded-sm border-border shadow-xl bg-card text-foreground z-50 text-xs font-medium">
                        <SelectItem value="1w">Seminggu Terakhir</SelectItem>
                        <SelectItem value="2w">2 Minggu Terakhir</SelectItem>
                        <SelectItem value="3w">3 Minggu Terakhir</SelectItem>
                        <SelectItem value="4w">Bulan Berjalan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <!-- Data-Dense Analytics Panel -->
                <div v-if="!isLoadingAttendance" class="grid grid-cols-3 gap-6 bg-muted/10 border border-border/40 rounded-sm p-6">
                  <!-- Col 1: Punctuality -->
                  <div class="flex flex-col gap-3">
                    <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tingkat Kedisiplinan</p>
                    <div class="flex items-end gap-3">
                      <span class="text-4xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tighter">
                        {{ attendanceStats.totalDays > 0 ? Math.round((attendanceStats.onTime / attendanceStats.totalDays) * 100) : 0 }}%
                      </span>
                      <span class="text-xs text-muted-foreground font-medium mb-1">On-Time Rate</span>
                    </div>
                    <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-1 relative">
                      <div class="absolute left-0 top-0 bottom-0 bg-emerald-500 rounded-full transition-all duration-1000" 
                           :style="{ width: `${attendanceStats.totalDays > 0 ? Math.round((attendanceStats.onTime / attendanceStats.totalDays) * 100) : 0}%` }">
                      </div>
                    </div>
                  </div>

                  <!-- Col 2: Accumulations -->
                  <div class="flex flex-col gap-3 pl-6 border-l border-border/40">
                    <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Akumulasi Anomali</p>
                    <div class="grid grid-cols-2 gap-4 mt-1">
                      <div>
                        <p class="text-2xl font-light text-amber-600 dark:text-amber-400 tracking-tight">{{ attendanceStats.lateMinutesTotal }}<span class="text-xs ml-1 text-muted-foreground font-medium">mnt</span></p>
                        <p class="text-[10px] text-muted-foreground font-medium mt-1">Total Keterlambatan</p>
                      </div>
                      <div>
                        <p class="text-2xl font-light text-indigo-600 dark:text-indigo-400 tracking-tight">{{ attendanceStats.overtimeHours }}<span class="text-xs ml-1 text-muted-foreground font-medium">jam</span></p>
                        <p class="text-[10px] text-muted-foreground font-medium mt-1">Total Lembur (Est)</p>
                      </div>
                    </div>
                  </div>

                  <!-- Col 3: Status Counts -->
                  <div class="flex flex-col gap-3 pl-6 border-l border-border/40">
                    <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rekapitulasi Kehadiran</p>
                    <div class="flex flex-col gap-2 mt-1">
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-muted-foreground">Hadir / Tap In</span>
                        <span class="font-bold text-foreground">{{ attendanceStats.totalDays }} Hari</span>
                      </div>
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-muted-foreground">Tepat Waktu</span>
                        <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ attendanceStats.onTime }} Hari</span>
                      </div>
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-muted-foreground">Terlambat</span>
                        <span class="font-bold text-amber-600 dark:text-amber-400">{{ attendanceStats.late }} Hari</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Skeleton Loader -->
                <div v-if="isLoadingAttendance" class="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 class="w-8 h-8 animate-spin text-primary" />
                  <p class="text-sm text-muted-foreground font-medium">Menyinkronkan log kehadiran...</p>
                </div>

                <!-- Enterprise Audit Table -->
                <div v-else-if="attendanceData.length > 0" class="rounded-sm border border-border/40 overflow-hidden bg-card relative">
                  <Table>
                    <TableHeader class="bg-muted/30">
                      <TableRow class="hover:bg-transparent border-border/40">
                        <TableHead class="w-[180px] text-xs font-bold uppercase tracking-wider text-muted-foreground h-10">Tanggal</TableHead>
                        <TableHead class="text-xs font-bold uppercase tracking-wider text-muted-foreground h-10">Jadwal Shift</TableHead>
                        <TableHead class="text-xs font-bold uppercase tracking-wider text-muted-foreground h-10">Check In</TableHead>
                        <TableHead class="text-xs font-bold uppercase tracking-wider text-muted-foreground h-10">Check In Siang</TableHead>
                        <TableHead class="text-xs font-bold uppercase tracking-wider text-muted-foreground h-10">Check Out</TableHead>
                        <TableHead class="text-xs font-bold uppercase tracking-wider text-muted-foreground h-10">Durasi</TableHead>
                        <TableHead class="text-xs font-bold uppercase tracking-wider text-muted-foreground h-10">Catatan / Anomali</TableHead>
                        <TableHead class="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody class="border-t-0">
                      <TableRow 
                        v-for="log in attendanceData" 
                        :key="log.id"
                        class="border-border/20 hover:bg-muted/10 transition-colors"
                      >
                        <TableCell class="py-3">
                          <p class="text-sm font-semibold text-foreground">{{ formatLocalDate(log.date) }}</p>
                        </TableCell>
                        <TableCell class="py-3">
                          <p class="text-xs font-medium text-foreground">{{ log.shiftName || 'General Shift' }}</p>
                          <p class="text-[10px] font-mono text-muted-foreground mt-0.5">08:00 - 17:00</p>
                        </TableCell>
                        <TableCell class="py-3 font-mono text-sm font-medium" :class="log.lateMinutes > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'">
                          {{ log.checkIn }}
                          <p v-if="log.checkIn !== '-'" class="text-[9px] font-sans text-muted-foreground mt-0.5 font-normal">Mesin Absensi</p>
                        </TableCell>
                        <TableCell class="py-3 font-mono text-sm font-medium text-foreground">
                          {{ log.checkInSiang || '-' }}
                          <p v-if="log.checkInSiang && log.checkInSiang !== '-'" class="text-[9px] font-sans text-muted-foreground mt-0.5 font-normal">Mesin Absensi</p>
                        </TableCell>
                        <TableCell class="py-3 font-mono text-sm font-medium" :class="log.isAnomaly && log.status === 'MissingCheckOut' ? 'text-destructive' : 'text-foreground'">
                          {{ log.checkOut !== '-' ? log.checkOut : '--:--' }}
                          <p v-if="log.checkOut !== '-'" class="text-[9px] font-sans text-muted-foreground mt-0.5 font-normal">Mesin Absensi</p>
                          <p v-else-if="log.isAnomaly" class="text-[9px] font-sans text-muted-foreground mt-0.5 font-normal">Tidak Tercatat</p>
                        </TableCell>
                        <TableCell class="py-3">
                          <span class="text-xs font-mono text-muted-foreground">{{ calculateDuration(log.checkIn, log.checkOut) }}</span>
                        </TableCell>
                        <TableCell class="py-3">
                          <div v-if="log.isAnomaly && log.status === 'MissingCheckOut'" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-destructive/20 bg-destructive/10 text-destructive text-[10px] font-bold uppercase tracking-wider">
                            <FileWarning class="w-3 h-3" /> Lupa Tap Pulang
                          </div>
                          <div v-else-if="log.lateMinutes > 0" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                            <Timer class="w-3 h-3" /> Telat {{ log.lateMinutes }} Menit
                          </div>
                          <div v-else-if="log.status === 'OnTime'" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 class="w-3 h-3" /> Lengkap
                          </div>
                          <div v-else class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-border bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                            {{ mapStatusToUI(log.status, log.isAnomaly) }}
                          </div>
                        </TableCell>
                        <TableCell class="py-3 text-right">
                          <Button variant="ghost" size="icon" class="h-6 w-6 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal class="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <!-- Empty State -->
                <div v-else class="flex flex-col items-center justify-center py-16 bg-muted/5 border border-border/40 rounded-sm">
                  <CalendarOff class="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <h4 class="text-base font-bold text-foreground">Tidak Ada Log Tersedia</h4>
                  <p class="text-sm text-muted-foreground mt-1 max-w-sm text-center">Belum ada riwayat tap masuk maupun pulang untuk periode ini.</p>
                </div>
              </TabsContent>

              <TabsContent value="cuti" class="mt-0 outline-none space-y-8 animate-in fade-in-50 duration-500">
                <div class="pb-4 border-b border-border/40">
                  <h3 class="text-xl font-bold text-foreground tracking-tight">Cuti & Izin</h3>
                  <p class="text-sm text-muted-foreground mt-1">Sisa kuota tahunan dan riwayat ketidakhadiran.</p>
                </div>

                <div class="flex items-center justify-between p-6 bg-muted/20 border border-border/50 rounded-sm">
                  <div class="space-y-1">
                    <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sisa Cuti Tahunan</p>
                    <p class="text-sm font-medium text-foreground">Dapat digunakan hingga 31 Desember {{ new Date().getFullYear() }}</p>
                  </div>
                  <div class="text-4xl font-bold text-foreground tracking-tighter">
                    8 <span class="text-base font-semibold text-muted-foreground tracking-normal">hari</span>
                  </div>
                </div>

                <div class="py-12 flex flex-col items-center text-center">
                  <div class="w-12 h-12 bg-muted/40 rounded-full flex items-center justify-center mb-4">
                    <CalendarOff class="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p class="text-sm font-bold text-foreground">Tidak ada riwayat cuti</p>
                  <p class="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Pegawai ini belum mengajukan cuti atau izin dalam 3 bulan terakhir.</p>
                </div>
              </TabsContent>

              <TabsContent value="lembur" class="mt-0 outline-none space-y-8 animate-in fade-in-50 duration-500">
                <div class="flex items-end justify-between pb-4 border-b border-border/40">
                  <div>
                    <h3 class="text-xl font-bold text-foreground tracking-tight">Catatan Lembur</h3>
                    <p class="text-sm text-muted-foreground mt-1">Akumulasi jam lembur yang disetujui.</p>
                  </div>
                  <Badge variant="secondary" class="rounded-sm font-mono text-[10px]">Bulan Ini</Badge>
                </div>

                <div class="flex items-center gap-6">
                  <div class="text-5xl font-bold text-foreground tracking-tighter">12<span class="text-xl font-medium text-muted-foreground tracking-normal ml-1">jam</span></div>
                  <div class="h-10 w-[1px] bg-border"></div>
                  <div>
                    <p class="text-sm font-bold text-foreground">Total Disetujui</p>
                    <p class="text-xs text-muted-foreground mt-1">Dari 3 pengajuan lembur yang valid.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="credentials" class="mt-0 outline-none space-y-8 animate-in fade-in-50 duration-500">
                <EmployeeCredentialsTab
                  :employee-id="selectedEmployee?.id || ''"
                  :employee-data="fullEmployeeData"
                  @refetch="openDetail(selectedEmployee!)"
                />
              </TabsContent>

              <TabsContent value="family" class="mt-0 outline-none space-y-8 animate-in fade-in-50 duration-500">
                <EmployeeFamilyTab
                  :employee-id="selectedEmployee?.id || ''"
                />
              </TabsContent>

            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>

    <!-- Create Employee Dialog -->
    <EmployeeForm
      v-model:open="isFormOpen"
      @success="handleEmployeeCreated"
    />

    <!-- Complete Edit Employee Dialog -->
    <Dialog :open="isEditOpen" @update:open="isEditOpen = $event">
      <DialogContent class="sm:max-w-[800px] bg-card border-border p-6">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Edit Data Pegawai</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground">
            Perbarui informasi demografi, kategori profesi, status, dan penempatan unit kerja pegawai.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSaveEdit" class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label for="editIdentity" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">No. KTP / NIK <span class="text-destructive">*</span></Label>
              <Input
                id="editIdentity"
                v-model="editForm.identityNumber"
                class="bg-muted border-border rounded-sm"
              />
            </div>
            <div class="space-y-2">
              <Label for="editNik" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">NIP Kepegawaian <span class="text-destructive">*</span></Label>
              <Input
                id="editNik"
                v-model="editForm.employeeNumber"
                class="bg-muted border-border rounded-sm"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="editFullName" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap <span class="text-destructive">*</span></Label>
            <Input
              id="editFullName"
              v-model="editForm.fullName"
              class="bg-muted border-border rounded-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label for="editDateOfBirth" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tanggal Lahir</Label>
              <Input
                id="editDateOfBirth"
                type="date"
                v-model="editForm.dateOfBirth"
                class="bg-muted border-border rounded-sm"
              />
            </div>

            <div class="space-y-2">
              <Label for="editGender" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jenis Kelamin</Label>
              <Select v-model="editForm.gender">
                <SelectTrigger class="bg-muted border-border rounded-sm">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent class="rounded-sm border-border shadow-xl bg-card text-foreground z-50">
                  <SelectItem value="L" class="rounded-sm cursor-pointer text-xs font-medium">Laki-laki</SelectItem>
                  <SelectItem value="P" class="rounded-sm cursor-pointer text-xs font-medium">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label for="editStatus" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status Kepegawaian</Label>
              <Select v-model="editForm.status">
                <SelectTrigger class="bg-muted border-border rounded-sm">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent class="rounded-sm border-border shadow-xl bg-card text-foreground z-50">
                  <SelectItem value="Aktif" class="rounded-sm text-xs">Aktif</SelectItem>
                  <SelectItem value="Cuti" class="rounded-sm text-xs">Cuti</SelectItem>
                  <SelectItem value="Resign" class="rounded-sm text-xs">Resign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="editProfession" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategori Profesi</Label>
              <Select v-model="editForm.professionCategory">
                <SelectTrigger class="bg-muted border-border rounded-sm">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent class="rounded-sm border-border shadow-xl bg-card text-foreground z-50">
                  <SelectItem value="Medis" class="rounded-sm text-xs">Medis (Dokter)</SelectItem>
                  <SelectItem value="Keperawatan" class="rounded-sm text-xs">Keperawatan / Bidan</SelectItem>
                  <SelectItem value="Penunjang Medis" class="rounded-sm text-xs">Penunjang Medis</SelectItem>
                  <SelectItem value="Non-Medis" class="rounded-sm text-xs">Non-Medis</SelectItem>
                  <SelectItem value="Staff" class="rounded-sm text-xs">Staf Umum / Administrasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-1">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Departemen / Divisi</Label>
              <Select v-model="editForm.departmentId">
                <SelectTrigger class="bg-muted border-border rounded-sm">
                  <SelectValue placeholder="Pilih Departemen" />
                </SelectTrigger>
                <SelectContent class="rounded-sm border-border shadow-xl bg-card text-foreground z-50 max-h-56">
                  <SelectGroup>
                    <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id" class="text-xs">
                      {{ dept.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Posisi Jabatan</Label>
              <Select v-model="editForm.jobPositionId">
                <SelectTrigger class="bg-muted border-border rounded-sm">
                  <SelectValue placeholder="Pilih Jabatan" />
                </SelectTrigger>
                <SelectContent class="rounded-sm border-border shadow-xl bg-card text-foreground z-50 max-h-56">
                  <SelectGroup>
                    <SelectItem v-for="job in jobPositions" :key="job.id" :value="job.id" class="text-xs">
                      {{ job.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isEditOpen = false" :disabled="isSubmittingEdit" class="rounded-sm font-bold text-xs h-10">
              Batal
            </Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm font-bold text-xs h-10 px-6 shadow-sm" :disabled="isSubmittingEdit">
              <Loader2 v-if="isSubmittingEdit" class="w-3.5 h-3.5 mr-2 animate-spin" />
              {{ isSubmittingEdit ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Premium Glassmorphic Delete Confirmation Dialog -->
    <Dialog :open="isDeleteOpen" @update:open="isDeleteOpen = $event">
      <DialogContent class="sm:max-w-[450px] bg-card border-border p-6">
        <div class="flex flex-col items-center text-center space-y-4 py-2">
          <!-- Danger Icon Banner -->
          <div class="w-16 h-16 rounded-sm bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
            <AlertTriangle class="w-8 h-8" />
          </div>

          <div class="space-y-1.5">
            <DialogTitle class="text-xl font-bold text-foreground">Konfirmasi Penghapusan Pegawai</DialogTitle>
            <DialogDescription class="text-xs text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus data pegawai berikut dari sistem?
            </DialogDescription>
          </div>

          <!-- Highlight Employee Card -->
          <div v-if="employeeToDelete" class="w-full bg-muted/40 border-none rounded-sm p-4 text-left space-y-1">
            <p class="text-sm font-bold text-foreground">{{ employeeToDelete.fullName }}</p>
            <p class="text-xs font-mono text-muted-foreground">NIK: {{ employeeToDelete.employeeNumber }}</p>
            <p class="text-xs text-muted-foreground">{{ employeeToDelete.department || 'Umum' }} &bull; {{ employeeToDelete.position || 'Staff' }}</p>
          </div>

          <!-- Warning Notice -->
          <div class="w-full bg-destructive/5 border border-destructive/20 rounded-sm p-3 flex items-start gap-2.5 text-left">
            <ShieldAlert class="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p class="text-[11px] text-destructive leading-relaxed font-medium">
              Tindakan ini akan menonaktifkan data pegawai (<em>Soft-Delete</em>) dan <strong>secara otomatis menonaktifkan akun login</strong> terkait agar tidak dapat mengakses sistem lagi.
            </p>
          </div>
        </div>

        <DialogFooter class="flex sm:justify-between gap-2 pt-2">
          <Button variant="outline" type="button" @click="isDeleteOpen = false" :disabled="isDeleting" class="rounded-sm font-bold text-xs h-10 w-full sm:w-auto">
            Batal
          </Button>
          <Button variant="destructive" type="button" @click="confirmDeleteEmployee" :disabled="isDeleting" class="bg-destructive hover:bg-destructive/90 rounded-sm font-bold text-xs h-10 px-6 w-full sm:w-auto shadow-sm">
            <Loader2 v-if="isDeleting" class="w-3.5 h-3.5 mr-2 animate-spin" />
            {{ isDeleting ? 'Menghapus...' : 'Ya, Hapus Pegawai' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>