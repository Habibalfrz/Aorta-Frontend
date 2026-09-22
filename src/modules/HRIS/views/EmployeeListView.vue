<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import EmployeeForm from '../components/EmployeeForm.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
import { Search, Plus, MoreHorizontal, UserSquare, AlertTriangle, Building2, ShieldAlert, Loader2, CalendarDays, CalendarOff, Clock, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { toast } from 'vue-sonner'
import { updateEmployee, getDepartments, getJobPositions } from '@/api/hris'

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

const openDetail = (employee: Employee) => {
  selectedEmployee.value = employee
  isDetailOpen.value = true
}

const openEditModal = (employee: Employee) => {
  editForm.value = {
    id: employee.id,
    employeeNumber: employee.employeeNumber,
    fullName: employee.fullName,
    dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
    gender: (employee.gender === 'P' ? 'P' : 'L') as 'L' | 'P',
    status: employee.status || 'Aktif',
    professionCategory: employee.professionCategory || 'Staff',
    departmentId: employee.departmentId,
    jobPositionId: employee.positionId
  }
  isEditOpen.value = true
}

const handleSaveEdit = async () => {
  if (!editForm.value.fullName || !editForm.value.employeeNumber) {
    toast.error('NIK dan Nama lengkap wajib diisi')
    return
  }

  isSubmittingEdit.value = true
  try {
    await updateEmployee(editForm.value.id, {
      id: editForm.value.id,
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
    await api.delete(`/api/hris/employees/${employeeToDelete.value.id}`)
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
const mockupAttendance = ref([
  {
    date: '2026-09-22',
    dateStr: 'Senin, 22 Sep',
    totalHours: '8j 00m',
    status: 'Tepat Waktu',
    segments: [
      { start: '08:00', end: '12:00', left: '8.33%', width: '33.33%', color: 'bg-emerald-500' },
      { start: '13:00', end: '17:00', left: '50%', width: '33.33%', color: 'bg-emerald-500' }
    ]
  },
  {
    date: '2026-09-21',
    dateStr: 'Jumat, 19 Sep',
    totalHours: '8j 30m',
    status: 'Tepat Waktu',
    segments: [
      { start: '07:45', end: '12:00', left: '6.25%', width: '35.41%', color: 'bg-emerald-500' },
      { start: '13:00', end: '17:15', left: '50%', width: '35.41%', color: 'bg-emerald-500' }
    ]
  },
  {
    date: '2026-09-20',
    dateStr: 'Kamis, 18 Sep',
    totalHours: '7j 30m',
    status: 'Terlambat',
    segments: [
      { start: '08:30', end: '12:00', left: '12.5%', width: '29.16%', color: 'bg-amber-500' },
      { start: '13:00', end: '17:00', left: '50%', width: '33.33%', color: 'bg-emerald-500' }
    ]
  },
  {
    date: '2026-09-19',
    dateStr: 'Rabu, 17 Sep',
    totalHours: '8j 15m',
    status: 'Tepat Waktu',
    segments: [
      { start: '07:50', end: '12:00', left: '6.94%', width: '34.72%', color: 'bg-emerald-500' },
      { start: '13:00', end: '17:05', left: '50%', width: '34.02%', color: 'bg-emerald-500' }
    ]
  }
])
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
              <SelectContent class="rounded-sm border-border/60 bg-popover text-popover-foreground">
                <SelectItem value="ALL" class="text-xs">Semua Departemen</SelectItem>
                <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.name" class="text-xs">
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Status Filter -->
          <div class="w-36">
            <Select v-model="selectedStatusFilter">
              <SelectTrigger class="h-11 bg-card border-border/60 rounded-sm text-xs font-semibold">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent class="rounded-sm border-border/60 bg-popover text-popover-foreground">
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
                    <DropdownMenuContent align="end" class="w-48 rounded-sm border-border/60 shadow-xl p-1.5 bg-popover text-popover-foreground">
                      <DropdownMenuItem @click="openDetail(emp)" class="rounded-sm cursor-pointer text-xs font-semibold hover:bg-accent focus:bg-accent py-2">
                        Lihat Detail
                      </DropdownMenuItem>
                      <div v-permission="'hris.employees.write'">
                        <DropdownMenuSeparator class="my-1" />
                        <DropdownMenuItem @click="openEditModal(emp)" class="rounded-sm cursor-pointer text-xs font-semibold hover:bg-accent focus:bg-accent py-2">
                          Edit Data Pegawai
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
      <DialogContent class="sm:max-w-4xl w-[95vw] p-0 h-[85vh] bg-card border-border overflow-hidden rounded-sm flex flex-col">
        <Tabs v-model="activeTab" class="w-full h-full flex flex-col">

          <!-- Enterprise Header & Tabs -->
          <div class="pt-8 px-8 pb-0 bg-card border-b border-border/40 shrink-0 z-10">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div class="flex items-start gap-5">
                <Avatar class="w-16 h-16 border border-border/50 shadow-sm rounded-sm">
                  <AvatarFallback class="bg-primary/5 text-primary text-xl font-bold rounded-sm">
                    {{ selectedEmployee?.fullName?.charAt(0) || 'U' }}
                  </AvatarFallback>
                </Avatar>
                <div class="pt-1">
                  <div class="flex items-center gap-3">
                    <DialogTitle class="text-2xl font-bold tracking-tight text-foreground">{{ selectedEmployee?.fullName }}</DialogTitle>
                    <Badge :variant="getStatusVariant(selectedEmployee?.status || 'Aktif')" class="text-[10px] uppercase font-bold px-2 py-0.5 shadow-none">{{ selectedEmployee?.status || 'Aktif' }}</Badge>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 mt-2 text-xs font-medium text-muted-foreground">
                    <span class="font-mono text-foreground font-semibold">{{ selectedEmployee?.employeeNumber }}</span>
                    <span class="text-border">&bull;</span>
                    <span>{{ selectedEmployee?.department || 'Umum' }}</span>
                    <span class="text-border">&bull;</span>
                    <span>{{ selectedEmployee?.position || 'Posisi belum diatur' }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <div class="flex items-center gap-1 bg-muted/20 border border-border/40 rounded-sm p-0.5">
                  <Button variant="ghost" size="icon" class="h-7 w-7 rounded-[2px]" :disabled="!hasPrevEmployee" @click="goPrevEmployee">
                    <ChevronLeft class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-7 w-7 rounded-[2px]" :disabled="!hasNextEmployee" @click="goNextEmployee">
                    <ChevronRight class="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="outline" class="rounded-sm font-bold text-xs h-8 px-4" @click="selectedEmployee ? $router.push({ path: '/hris/employees/' + selectedEmployee.id }) : null">
                  <ExternalLink class="w-3.5 h-3.5 mr-2" />
                  Halaman Penuh
                </Button>
              </div>
            </div>

            <!-- Horizontal Underline Tabs -->
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
                <TabsTrigger
                  value="lembur"
                  class="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-bold whitespace-nowrap hover:text-foreground transition-colors"
                >
                  Lembur
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <!-- Right Content Area -->
          <div class="flex-1 bg-background overflow-y-auto custom-scrollbar relative">
            <div class="p-8 sm:p-10 max-w-4xl mx-auto space-y-8">
              <TabsContent value="profil" class="mt-0 outline-none space-y-8 animate-in fade-in-50 duration-500">
                <div class="pb-4 border-b border-border/40">
                  <h3 class="text-xl font-bold text-foreground tracking-tight">Informasi Personal</h3>
                  <p class="text-sm text-muted-foreground mt-1">Biodata demografi dan kontak darurat pegawai.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div class="space-y-1">
                    <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Jenis Kelamin</p>
                    <p class="text-sm font-medium text-foreground">
                      {{ selectedEmployee?.gender === 'L' ? 'Laki-laki' : (selectedEmployee?.gender === 'P' ? 'Perempuan' : selectedEmployee?.gender) }}
                    </p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Tanggal Lahir</p>
                    <p class="text-sm font-medium text-foreground">
                      {{ selectedEmployee?.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
                    </p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Kategori Profesi</p>
                    <p class="text-sm font-medium text-foreground">{{ selectedEmployee?.professionCategory || 'Staff' }}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Email Pribadi</p>
                    <p class="text-sm font-mono font-medium text-foreground">{{ selectedEmployee?.email || '-' }}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="penempatan" class="mt-0 outline-none space-y-8 animate-in fade-in-50 duration-500">
                <div class="pb-4 border-b border-border/40">
                  <h3 class="text-xl font-bold text-foreground tracking-tight">Unit Kerja & Jabatan</h3>
                  <p class="text-sm text-muted-foreground mt-1">Informasi struktural dan penempatan kerja aktif.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div class="space-y-1">
                    <p class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Departemen</p>
                    <p class="text-sm font-bold text-foreground">{{ selectedEmployee?.department || 'Belum diatur' }}</p>
                  </div>
                  <div class="space-y-1">
                    <p class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Jabatan</p>
                    <p class="text-sm font-medium text-foreground">{{ selectedEmployee?.position || 'Belum diatur' }}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="kehadiran" class="mt-0 outline-none space-y-8 animate-in fade-in-50 duration-500">
                <div class="flex items-end justify-between pb-4 border-b border-border/40">
                  <div>
                    <h3 class="text-xl font-bold text-foreground tracking-tight">Aktivitas Kehadiran</h3>
                    <p class="text-sm text-muted-foreground mt-1">Timeline jam kerja dan log presensi.</p>
                  </div>
                  <Select v-model="attendancePeriod">
                    <SelectTrigger class="w-[160px] h-8 text-xs font-semibold rounded-sm border-border bg-transparent">
                      <SelectValue placeholder="Pilih Periode" />
                    </SelectTrigger>
                    <SelectContent class="rounded-sm border-border shadow-sm text-xs">
                      <SelectItem value="1w">Seminggu Terakhir</SelectItem>
                      <SelectItem value="2w">2 Minggu Terakhir</SelectItem>
                      <SelectItem value="3w">3 Minggu Terakhir</SelectItem>
                      <SelectItem value="4w">4 Minggu Terakhir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <!-- Daily Timeline List -->
                <div class="space-y-8">
                  <div v-for="(day, idx) in mockupAttendance" :key="idx" class="space-y-2">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold text-foreground">{{ day.dateStr }}</span>
                      <div class="flex items-center gap-4">
                        <span class="font-bold uppercase tracking-wider text-[10px]" :class="day.status === 'Terlambat' ? 'text-amber-500' : 'text-emerald-500'">{{ day.status }}</span>
                        <span class="font-mono text-muted-foreground font-semibold">{{ day.totalHours }}</span>
                      </div>
                    </div>

                    <!-- Timeline Bar (07:00 - 19:00) -->
                    <div class="relative w-full h-4 bg-muted/40 rounded-sm overflow-hidden border border-border/30">
                      <div
                        v-for="(seg, sIdx) in day.segments"
                        :key="sIdx"
                        class="absolute top-0 bottom-0 rounded-sm"
                        :class="seg.color"
                        :style="{ left: seg.left, width: seg.width }"
                        :title="`${seg.start} - ${seg.end}`"
                      ></div>
                    </div>

                    <!-- Time Axis Labels -->
                    <div class="flex justify-between text-[10px] font-mono text-muted-foreground px-1">
                      <span>07:00</span>
                      <span>10:00</span>
                      <span>13:00</span>
                      <span>16:00</span>
                      <span>19:00</span>
                    </div>
                  </div>
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
              <Label for="editNik" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">NIK <span class="text-destructive">*</span></Label>
              <Input
                id="editNik"
                v-model="editForm.employeeNumber"
                class="bg-muted border-border rounded-sm"
              />
            </div>
            <div class="space-y-2">
              <Label for="editFullName" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap <span class="text-destructive">*</span></Label>
              <Input
                id="editFullName"
                v-model="editForm.fullName"
                class="bg-muted border-border rounded-sm"
              />
            </div>
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
                <SelectContent class="rounded-sm border-border/60 shadow-lg bg-popover text-popover-foreground">
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
                <SelectContent class="rounded-sm border-border/60 shadow-lg bg-popover text-popover-foreground">
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
                <SelectContent class="rounded-sm border-border/60 shadow-lg bg-popover text-popover-foreground">
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
                <SelectContent class="rounded-sm border-border/60 shadow-lg bg-popover text-popover-foreground max-h-56">
                  <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id" class="text-xs">
                    {{ dept.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Posisi Jabatan</Label>
              <Select v-model="editForm.jobPositionId">
                <SelectTrigger class="bg-muted border-border rounded-sm">
                  <SelectValue placeholder="Pilih Jabatan" />
                </SelectTrigger>
                <SelectContent class="rounded-sm border-border/60 shadow-lg bg-popover text-popover-foreground max-h-56">
                  <SelectItem v-for="job in jobPositions" :key="job.id" :value="job.id" class="text-xs">
                    {{ job.name }}
                  </SelectItem>
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