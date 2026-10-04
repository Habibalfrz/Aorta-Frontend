<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Building2, Briefcase, Award, Plus, Trash2, Edit2, ShieldAlert, Clock, Save, Loader2, AlertTriangle, Fingerprint, Link2, Unlink, Search } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getJobPositions, createJobPosition, updateJobPosition, deleteJobPosition,
  getGrades, createGrade, deleteGrade,
  getAttendancePolicy, updateAttendancePolicy,
  syncZkTecoUsers, getAllMachineUsers, updateZkTecoPrivilege, backupBiometrics
} from '@/api/hris'

const isLoaded = ref(false)
const activeTab = ref('departments')

// State for Departments
const departments = ref<any[]>([])
const isLoadingDepts = ref(false)
const isDeptModalOpen = ref(false)
const isEditingDept = ref(false)
const isDeleteDeptOpen = ref(false)
const deptToDelete = ref<any>(null)
const isDeletingDept = ref(false)
const deptForm = ref<{ id?: string; code: string; name: string; parentId: string | null }>({
  code: '',
  name: '',
  parentId: null
})

const availableParentDepartments = computed(() => {
  if (!isEditingDept.value) return departments.value
  return departments.value.filter(d => d.id !== deptForm.value.id)
})

// State for Job Positions
const jobPositions = ref<any[]>([])
const isLoadingJobs = ref(false)
const isJobModalOpen = ref(false)
const isEditingJob = ref(false)
const isDeleteJobOpen = ref(false)
const jobToDelete = ref<any>(null)
const isDeletingJob = ref(false)
const jobForm = ref<{ id?: string; code: string; name: string; description: string }>({
  code: '',
  name: '',
  description: ''
})

// State for Grades
const grades = ref<any[]>([])
const isLoadingGrades = ref(false)
const isGradeModalOpen = ref(false)
const gradeForm = ref<{ code: string; name: string; level: number }>({
  code: '',
  name: '',
  level: 1
})

// State for Attendance & Penalty Policy
const isLoadingPolicy = ref(false)
const isSavingPolicy = ref(false)
const policyForm = ref({
  name: 'Kebijakan Presensi Standar RS',
  toleranceMinutes: 15,
  lateTier1MaxMinutes: 30,
  lateTier1Penalty: 25000,
  lateTier2MaxMinutes: 60,
  lateTier2Penalty: 50000,
  lateTier3Penalty: 100000,
  missingCheckOutPenalty: 50000,
  missingCheckInPenalty: 25000,
  earlyLeavePenaltyPerMinute: 1000,
  absentPenalty: 150000,
  loyaltyOvertimeMinutes: 60,
  defaultOvertimeRatePerHour: 20000
})

// State for ZKTeco Machine
const machineIpAddress = ref('')
const isSyncingMachine = ref(false)
const isBackingUp = ref(false)
const machineSyncMessage = ref('')
const machineUsers = ref<any[]>([])
const isLoadingMachineUsers = ref(false)

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredMachineUsers = computed(() => {
  if (!searchQuery.value) return machineUsers.value
  const query = searchQuery.value.toLowerCase()
  return machineUsers.value.filter(user =>
    (user.machineName && user.machineName.toLowerCase().includes(query)) ||
    (user.machinePin && user.machinePin.toLowerCase().includes(query))
  )
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const totalPages = computed(() => Math.ceil(filteredMachineUsers.value.length / itemsPerPage.value))

const paginatedMachineUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredMachineUsers.value.slice(start, end)
})

// Fetch Handlers
const fetchDepts = async () => {
  isLoadingDepts.value = true
  try {
    departments.value = await getDepartments()
  } catch (error) {
    console.error('Failed to fetch departments:', error)
  } finally {
    isLoadingDepts.value = false
  }
}

const fetchJobs = async () => {
  isLoadingJobs.value = true
  try {
    jobPositions.value = await getJobPositions()
  } catch (error) {
    console.error('Failed to fetch job positions:', error)
  } finally {
    isLoadingJobs.value = false
  }
}

const fetchGradesList = async () => {
  isLoadingGrades.value = true
  try {
    grades.value = await getGrades()
  } catch (error) {
    console.error('Failed to fetch grades:', error)
  } finally {
    isLoadingGrades.value = false
  }
}

const fetchPolicy = async () => {
  isLoadingPolicy.value = true
  try {
    const data = await getAttendancePolicy()
    if (data) {
      policyForm.value = {
        name: data.name || 'Kebijakan Presensi Standar RS',
        toleranceMinutes: data.toleranceMinutes ?? 15,
        lateTier1MaxMinutes: data.lateTier1MaxMinutes ?? 30,
        lateTier1Penalty: data.lateTier1Penalty ?? 25000,
        lateTier2MaxMinutes: data.lateTier2MaxMinutes ?? 60,
        lateTier2Penalty: data.lateTier2Penalty ?? 50000,
        lateTier3Penalty: data.lateTier3Penalty ?? 100000,
        missingCheckOutPenalty: data.missingCheckOutPenalty ?? 50000,
        missingCheckInPenalty: data.missingCheckInPenalty ?? 25000,
        earlyLeavePenaltyPerMinute: data.earlyLeavePenaltyPerMinute ?? 1000,
        absentPenalty: data.absentPenalty ?? 150000,
        loyaltyOvertimeMinutes: data.loyaltyOvertimeMinutes ?? 60,
        defaultOvertimeRatePerHour: data.defaultOvertimeRatePerHour ?? 20000
      }
    }
  } catch (error) {
    console.error('Failed to fetch attendance policy:', error)
  } finally {
    isLoadingPolicy.value = false
  }
}

const handleSavePolicy = async () => {
  isSavingPolicy.value = true
  try {
    await updateAttendancePolicy(policyForm.value)
    toast.success('Kebijakan denda presensi & lembur berhasil diperbarui')
  } catch (error: any) {
    console.error('Failed to save policy:', error)
    toast.error(error.response?.data?.message || 'Gagal menyimpan kebijakan presensi')
  } finally {
    isSavingPolicy.value = false
  }
}

const fetchMachineUsers = async () => {
  isLoadingMachineUsers.value = true
  try {
    machineUsers.value = await getAllMachineUsers()
    currentPage.value = 1
  } catch (error) {
    console.error("Failed to load machine users", error)
  } finally {
    isLoadingMachineUsers.value = false
  }
}

const triggerSync = async () => {
  try {
    isSyncingMachine.value = true
    await syncZkTecoUsers(machineIpAddress.value)
    machineSyncMessage.value = "Tugas sinkronisasi antrean terkirim ke background. Refresh tabel ini dalam beberapa saat."
    toast.success("Job sinkronisasi berjalan di server.")
  } catch (error) {
    machineSyncMessage.value = "Gagal memicu sinkronisasi."
    toast.error("Gagal melakukan sinkronisasi.")
  } finally {
    isSyncingMachine.value = false
  }
}

const triggerBackup = async () => {
  try {
    isBackingUp.value = true
    await backupBiometrics(machineIpAddress.value)
    toast.success("Job backup biometrik terkirim ke background server.")
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Gagal memicu backup biometrik.")
  } finally {
    isBackingUp.value = false
  }
}

const handleRoleChange = async (userId: string, newRole: string) => {
  try {
    await updateZkTecoPrivilege(userId, newRole, machineIpAddress.value)
    toast.success(`Hak akses berhasil diubah menjadi ${newRole} pada mesin.`)
    fetchMachineUsers()
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Gagal mengubah hak akses mesin. Mesin mungkin offline.")
  }
}

onMounted(() => {
  fetchDepts()
  fetchJobs()
  fetchGradesList()
  fetchPolicy()
  fetchMachineUsers()
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})

// Department Actions
const openAddDept = () => {
  isEditingDept.value = false
  deptForm.value = { code: '', name: '', parentId: null }
  isDeptModalOpen.value = true
}

const openEditDept = (dept: any) => {
  isEditingDept.value = true
  deptForm.value = { id: dept.id, code: dept.code, name: dept.name, parentId: dept.parentId || null }
  isDeptModalOpen.value = true
}

const saveDept = async () => {
  if (!deptForm.value.code || !deptForm.value.name) {
    toast.error('Kode dan Nama Departemen wajib diisi')
    return
  }

  try {
    if (isEditingDept.value && deptForm.value.id) {
      await updateDepartment(deptForm.value.id, {
        code: deptForm.value.code,
        name: deptForm.value.name,
        parentId: (!deptForm.value.parentId || deptForm.value.parentId === 'null') ? null : deptForm.value.parentId
      })
      toast.success('Departemen berhasil diperbarui')
    } else {
      await createDepartment({
        code: deptForm.value.code,
        name: deptForm.value.name,
        parentId: (!deptForm.value.parentId || deptForm.value.parentId === 'null') ? null : deptForm.value.parentId
      })
      toast.success('Departemen berhasil ditambahkan')
    }
    isDeptModalOpen.value = false
    fetchDepts()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan departemen')
  }
}

const confirmDeleteDept = (dept: any) => {
  deptToDelete.value = dept
  isDeleteDeptOpen.value = true
}

const executeDeleteDept = async () => {
  if (!deptToDelete.value) return
  isDeletingDept.value = true
  try {
    await deleteDepartment(deptToDelete.value.id)
    toast.success('Departemen berhasil dihapus')
    isDeleteDeptOpen.value = false
    fetchDepts()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menghapus departemen')
  } finally {
    isDeletingDept.value = false
    deptToDelete.value = null
  }
}

// Job Position Actions
const openAddJob = () => {
  isEditingJob.value = false
  jobForm.value = { code: '', name: '', description: '' }
  isJobModalOpen.value = true
}

const openEditJob = (job: any) => {
  isEditingJob.value = true
  jobForm.value = { id: job.id, code: job.code, name: job.name, description: job.description || '' }
  isJobModalOpen.value = true
}

const saveJob = async () => {
  if (!jobForm.value.code || !jobForm.value.name) {
    toast.error('Kode dan Nama Jabatan wajib diisi')
    return
  }

  try {
    if (isEditingJob.value && jobForm.value.id) {
      await updateJobPosition(jobForm.value.id, {
        code: jobForm.value.code,
        name: jobForm.value.name,
        description: jobForm.value.description
      })
      toast.success('Jabatan berhasil diperbarui')
    } else {
      await createJobPosition({
        code: jobForm.value.code,
        name: jobForm.value.name,
        description: jobForm.value.description
      })
      toast.success('Jabatan berhasil ditambahkan')
    }
    isJobModalOpen.value = false
    fetchJobs()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan jabatan')
  }
}

const confirmDeleteJob = (job: any) => {
  jobToDelete.value = job
  isDeleteJobOpen.value = true
}

const executeDeleteJob = async () => {
  if (!jobToDelete.value) return
  isDeletingJob.value = true
  try {
    await deleteJobPosition(jobToDelete.value.id)
    toast.success('Jabatan berhasil dihapus')
    isDeleteJobOpen.value = false
    fetchJobs()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menghapus jabatan')
  } finally {
    isDeletingJob.value = false
    jobToDelete.value = null
  }
}

// Grade Actions
const openAddGrade = () => {
  gradeForm.value = { code: '', name: '', level: 1 }
  isGradeModalOpen.value = true
}

const saveGrade = async () => {
  if (!gradeForm.value.code || !gradeForm.value.name) {
    toast.error('Kode dan Nama Golongan wajib diisi')
    return
  }

  try {
    await createGrade({
      code: gradeForm.value.code,
      name: gradeForm.value.name,
      level: Number(gradeForm.value.level)
    })
    toast.success('Golongan berhasil ditambahkan')
    isGradeModalOpen.value = false
    fetchGradesList()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan golongan')
  }
}

const handleDeleteGrade = async (grade: any) => {
  if (!confirm(`Hapus golongan ${grade.name}?`)) return
  try {
    await deleteGrade(grade.id)
    toast.success('Golongan berhasil dihapus')
    fetchGradesList()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menghapus golongan')
  }
}
</script>

<template>
  <div class="space-y-8 max-w-[1400px]">
    <!-- Page Title -->
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Pengaturan & Master Data HRIS</h1>
      <p class="text-sm text-muted-foreground mt-1 font-medium">Kelola struktur organisasi, departemen, posisi jabatan, jenjang golongan, dan kebijakan denda presensi.</p>
    </div>

    <Tabs v-model="activeTab" class="w-full space-y-6">
      <TabsList class="bg-muted/50 p-1 rounded-2xl border border-border/50">
        <TabsTrigger value="departments" class="rounded-xl px-4 py-2 font-bold text-xs gap-2">
          <Building2 class="w-4 h-4" />
          Departemen & Divisi
        </TabsTrigger>
        <TabsTrigger value="positions" class="rounded-xl px-4 py-2 font-bold text-xs gap-2">
          <Briefcase class="w-4 h-4" />
          Jabatan (Job Positions)
        </TabsTrigger>
        <TabsTrigger value="grades" class="rounded-xl px-4 py-2 font-bold text-xs gap-2">
          <Award class="w-4 h-4" />
          Golongan (Grades)
        </TabsTrigger>
        <TabsTrigger value="policy" class="rounded-xl px-4 py-2 font-bold text-xs gap-2">
          <ShieldAlert class="w-4 h-4 text-amber-500" />
          Kebijakan Presensi & Denda
        </TabsTrigger>
        <TabsTrigger value="machine" class="rounded-xl px-4 py-2 font-bold text-xs gap-2">
          <Fingerprint class="w-4 h-4 text-primary" />
          Machine
        </TabsTrigger>
      </TabsList>

      <!-- DEPARTMENTS TAB -->
      <TabsContent value="departments" class="space-y-4 outline-none">
        <div class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-foreground">Daftar Departemen & Divisi</h3>
              <p class="text-xs text-muted-foreground">Struktur unit dan bagian kerja rumah sakit</p>
            </div>
            <Button @click="openAddDept" class="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl h-10 px-4 flex items-center gap-2">
              <Plus class="w-4 h-4" />
              Tambah Departemen
            </Button>
          </div>

          <div class="overflow-x-auto custom-scrollbar border border-border/50 rounded-2xl">
            <Table>
              <TableHeader class="bg-muted/30">
                <TableRow>
                  <TableHead class="w-[120px] font-bold text-xs uppercase text-muted-foreground px-6 py-4">Kode</TableHead>
                  <TableHead class="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Nama Departemen</TableHead>
                  <TableHead class="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Induk Departemen</TableHead>
                  <TableHead class="w-[100px] text-right font-bold text-xs uppercase text-muted-foreground px-6 py-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="isLoadingDepts">
                  <TableCell colspan="4" class="h-24 text-center text-muted-foreground text-sm font-medium">Memuat departemen...</TableCell>
                </TableRow>
                <template v-else>
                  <TableRow v-for="dept in departments" :key="dept.id" class="hover:bg-accent/40">
                    <TableCell class="font-mono text-xs font-bold text-muted-foreground px-6 py-4">{{ dept.code }}</TableCell>
                    <TableCell class="font-bold text-sm text-foreground px-6 py-4">{{ dept.name }}</TableCell>
                    <TableCell class="text-xs text-muted-foreground px-6 py-4">{{ dept.parentName || '-' }}</TableCell>
                    <TableCell class="text-right px-6 py-4">
                      <div class="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="openEditDept(dept)">
                          <Edit2 class="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" class="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" @click="confirmDeleteDept(dept)">
                          <Trash2 class="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="departments.length === 0">
                    <TableCell colspan="4" class="h-24 text-center text-muted-foreground text-sm font-medium">Belum ada departemen yang didaftarkan.</TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>

      <!-- JOB POSITIONS TAB -->
      <TabsContent value="positions" class="space-y-4 outline-none">
        <div class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-foreground">Daftar Posisi & Jabatan</h3>
              <p class="text-xs text-muted-foreground">Posisi pekerjaan dan tugas tenaga medis serta staf</p>
            </div>
            <Button @click="openAddJob" class="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl h-10 px-4 flex items-center gap-2">
              <Plus class="w-4 h-4" />
              Tambah Jabatan
            </Button>
          </div>

          <div class="overflow-x-auto custom-scrollbar border border-border/50 rounded-2xl">
            <Table>
              <TableHeader class="bg-muted/30">
                <TableRow>
                  <TableHead class="w-[120px] font-bold text-xs uppercase text-muted-foreground px-6 py-4">Kode</TableHead>
                  <TableHead class="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Nama Jabatan</TableHead>
                  <TableHead class="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Deskripsi</TableHead>
                  <TableHead class="w-[100px] text-right font-bold text-xs uppercase text-muted-foreground px-6 py-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="isLoadingJobs">
                  <TableCell colspan="4" class="h-24 text-center text-muted-foreground text-sm font-medium">Memuat jabatan...</TableCell>
                </TableRow>
                <template v-else>
                  <TableRow v-for="job in jobPositions" :key="job.id" class="hover:bg-accent/40">
                    <TableCell class="font-mono text-xs font-bold text-muted-foreground px-6 py-4">{{ job.code }}</TableCell>
                    <TableCell class="font-bold text-sm text-foreground px-6 py-4">{{ job.name }}</TableCell>
                    <TableCell class="text-xs text-muted-foreground px-6 py-4">{{ job.description || '-' }}</TableCell>
                    <TableCell class="text-right px-6 py-4">
                      <div class="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="openEditJob(job)">
                          <Edit2 class="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" class="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" @click="confirmDeleteJob(job)">
                          <Trash2 class="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="jobPositions.length === 0">
                    <TableCell colspan="4" class="h-24 text-center text-muted-foreground text-sm font-medium">Belum ada posisi jabatan yang didaftarkan.</TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>

      <!-- GRADES TAB -->
      <TabsContent value="grades" class="space-y-4 outline-none">
        <div class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-foreground">Daftar Golongan (Grades)</h3>
              <p class="text-xs text-muted-foreground">Tingkatan jenjang karir dan level penggajian</p>
            </div>
            <Button @click="openAddGrade" class="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl h-10 px-4 flex items-center gap-2">
              <Plus class="w-4 h-4" />
              Tambah Golongan
            </Button>
          </div>

          <div class="overflow-x-auto custom-scrollbar border border-border/50 rounded-2xl">
            <Table>
              <TableHeader class="bg-muted/30">
                <TableRow>
                  <TableHead class="w-[120px] font-bold text-xs uppercase text-muted-foreground px-6 py-4">Kode</TableHead>
                  <TableHead class="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Nama Golongan</TableHead>
                  <TableHead class="w-[120px] font-bold text-xs uppercase text-muted-foreground px-6 py-4">Level</TableHead>
                  <TableHead class="w-[100px] text-right font-bold text-xs uppercase text-muted-foreground px-6 py-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="isLoadingGrades">
                  <TableCell colspan="4" class="h-24 text-center text-muted-foreground text-sm font-medium">Memuat golongan...</TableCell>
                </TableRow>
                <template v-else>
                  <TableRow v-for="grade in grades" :key="grade.id" class="hover:bg-accent/40">
                    <TableCell class="font-mono text-xs font-bold text-muted-foreground px-6 py-4">{{ grade.code }}</TableCell>
                    <TableCell class="font-bold text-sm text-foreground px-6 py-4">{{ grade.name }}</TableCell>
                    <TableCell class="font-mono text-xs font-bold text-foreground px-6 py-4">Level {{ grade.level }}</TableCell>
                    <TableCell class="text-right px-6 py-4">
                      <Button variant="ghost" size="sm" class="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" @click="handleDeleteGrade(grade)">
                        <Trash2 class="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="grades.length === 0">
                    <TableCell colspan="4" class="h-24 text-center text-muted-foreground text-sm font-medium">Belum ada golongan yang didaftarkan.</TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
        </div>
      </TabsContent>

      <!-- POLICY TAB -->
      <TabsContent value="policy" class="space-y-6 outline-none">
        <div class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm p-6 sm:p-8 space-y-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
            <div>
              <h3 class="text-xl font-bold text-foreground flex items-center gap-2">
                <ShieldAlert class="w-5 h-5 text-amber-500" />
                Konfigurasi Kebijakan Denda Presensi & Kompensasi Lembur
              </h3>
              <p class="text-xs text-muted-foreground mt-1">
                Atur skema denda keterlambatan bertingkat, denda anomali mesin finger, potongan loyalitas, dan tarif dasar lembur.
              </p>
            </div>
            <Button
              class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6 shadow-sm gap-2 shrink-0"
              :disabled="isSavingPolicy"
              @click="handleSavePolicy"
            >
              <Loader2 v-if="isSavingPolicy" class="w-4 h-4 animate-spin" />
              <Save v-else class="w-4 h-4" />
              {{ isSavingPolicy ? 'Menyimpan...' : 'Simpan Kebijakan' }}
            </Button>
          </div>

          <!-- Section 1: Tier Keterlambatan -->
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <Clock class="w-4 h-4 text-primary" />
              1. Skema Denda Keterlambatan Bertingkat (Tiered Late Penalty)
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <Label class="text-[11px] font-bold uppercase text-muted-foreground">Toleransi Terlambat (Menit)</Label>
                <Input type="number" v-model.number="policyForm.toleranceMinutes" class="bg-background font-bold text-sm" />
                <p class="text-[10px] text-muted-foreground">0 - {{ policyForm.toleranceMinutes }} menit: Denda Rp 0 (Tepat Waktu)</p>
              </div>

              <div class="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <Label class="text-[11px] font-bold uppercase text-muted-foreground">Tier 1: Max Menit & Denda</Label>
                <div class="flex gap-2">
                  <Input type="number" v-model.number="policyForm.lateTier1MaxMinutes" placeholder="30 mnt" class="bg-background font-bold text-xs w-20" />
                  <Input type="number" v-model.number="policyForm.lateTier1Penalty" placeholder="Rp 25.000" class="bg-background font-bold text-xs" />
                </div>
                <p class="text-[10px] text-muted-foreground">{{ policyForm.toleranceMinutes + 1 }} - {{ policyForm.lateTier1MaxMinutes }} mnt: Denda Rp {{ policyForm.lateTier1Penalty.toLocaleString('id-ID') }}</p>
              </div>

              <div class="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <Label class="text-[11px] font-bold uppercase text-muted-foreground">Tier 2: Max Menit & Denda</Label>
                <div class="flex gap-2">
                  <Input type="number" v-model.number="policyForm.lateTier2MaxMinutes" placeholder="60 mnt" class="bg-background font-bold text-xs w-20" />
                  <Input type="number" v-model.number="policyForm.lateTier2Penalty" placeholder="Rp 50.000" class="bg-background font-bold text-xs" />
                </div>
                <p class="text-[10px] text-muted-foreground">{{ policyForm.lateTier1MaxMinutes + 1 }} - {{ policyForm.lateTier2MaxMinutes }} mnt: Denda Rp {{ policyForm.lateTier2Penalty.toLocaleString('id-ID') }}</p>
              </div>

              <div class="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <Label class="text-[11px] font-bold uppercase text-muted-foreground">Tier 3: > {{ policyForm.lateTier2MaxMinutes }} Menit</Label>
                <Input type="number" v-model.number="policyForm.lateTier3Penalty" placeholder="Rp 100.000" class="bg-background font-bold text-sm" />
                <p class="text-[10px] text-muted-foreground">> {{ policyForm.lateTier2MaxMinutes }} mnt: Denda Rp {{ policyForm.lateTier3Penalty.toLocaleString('id-ID') }}</p>
              </div>
            </div>
          </div>

          <!-- Section 2: Anomali Mesin & Alpha -->
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <ShieldAlert class="w-4 h-4 text-amber-500" />
              2. Denda Anomali Mesin Finger & Tidak Hadir (Alpha)
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <Label class="text-[11px] font-bold uppercase text-muted-foreground">Denda Lupa Finger Pulang (Rp)</Label>
                <Input type="number" v-model.number="policyForm.missingCheckOutPenalty" class="bg-background font-bold text-sm" />
                <p class="text-[10px] text-muted-foreground">Karyawan tap masuk tapi tidak tap pulang</p>
              </div>

              <div class="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <Label class="text-[11px] font-bold uppercase text-muted-foreground">Denda Lupa Finger Masuk (Rp)</Label>
                <Input type="number" v-model.number="policyForm.missingCheckInPenalty" class="bg-background font-bold text-sm" />
                <p class="text-[10px] text-muted-foreground">Hanya ada log tap pulang</p>
              </div>

              <div class="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <Label class="text-[11px] font-bold uppercase text-muted-foreground">Denda Pulang Cepat (/Menit)</Label>
                <Input type="number" v-model.number="policyForm.earlyLeavePenaltyPerMinute" class="bg-background font-bold text-sm" />
                <p class="text-[10px] text-muted-foreground">Dikenakan per menit sebelum jam shift berakhir</p>
              </div>

              <div class="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <Label class="text-[11px] font-bold uppercase text-muted-foreground">Denda Alpha / Hari (Rp)</Label>
                <Input type="number" v-model.number="policyForm.absentPenalty" class="bg-background font-bold text-sm" />
                <p class="text-[10px] text-muted-foreground">Tidak hadir tanpa surat cuti/izin resmi</p>
              </div>
            </div>
          </div>

          <!-- Section 3: Lembur & Loyalitas -->
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <Award class="w-4 h-4 text-emerald-500" />
              3. Kebijakan Kompensasi Lembur & Potongan Loyalitas
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <Label class="text-[11px] font-bold uppercase text-muted-foreground">Potongan Menit Loyalitas Lembur</Label>
                <Input type="number" v-model.number="policyForm.loyaltyOvertimeMinutes" class="bg-background font-bold text-sm" />
                <p class="text-[10px] text-muted-foreground">
                  Menit kelebihan jam pulang pertama yang dihitung sebagai loyalitas (misal 60 mnt, 30 mnt, atau 0 mnt).
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
                <Label class="text-[11px] font-bold uppercase text-muted-foreground">Tarif Default Lembur per Jam (Rp)</Label>
                <Input type="number" v-model.number="policyForm.defaultOvertimeRatePerHour" class="bg-background font-bold text-sm" />
                <p class="text-[10px] text-muted-foreground">
                  Upah kompensasi lembur efektif yang dihitung per jam kelebihan kerja di atas batas loyalitas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <!-- MACHINE TAB -->
      <TabsContent value="machine" class="space-y-6 outline-none">
        <div class="space-y-6">
          <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow glass-panel border border-border/50">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Fingerprint class="w-5 h-5" />
              </div>
              <div>
                <h2 class="text-xl font-bold tracking-tight">Pengaturan Mesin Sidik Jari</h2>
                <p class="text-xs text-muted-foreground">Tarik data pegawai dan template sidik jari dari mesin ke server AORTA</p>
              </div>
            </div>

            <div class="flex gap-4 items-center mb-2">
              <div class="w-full max-w-sm space-y-1">
                <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">IP Address Mesin TCP/IP</label>
                <Input v-model="machineIpAddress" type="text" class="w-full font-bold text-sm bg-muted/50" placeholder="Contoh: 192.168.1.201" />
              </div>
              <div class="pt-5 flex gap-2">
                <Button @click="triggerSync" :disabled="isSyncingMachine" class="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary/90 font-bold text-sm disabled:opacity-50 flex items-center gap-2 shadow-sm">
                  <Loader2 v-if="isSyncingMachine" class="w-4 h-4 animate-spin" />
                  <Fingerprint v-else class="w-4 h-4" />
                  {{ isSyncingMachine ? 'Mengeksekusi...' : 'Tarik Data Pengguna' }}
                </Button>
                <Button @click="triggerBackup" :disabled="isBackingUp" variant="outline" class="px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 shadow-sm">
                  <Loader2 v-if="isBackingUp" class="w-4 h-4 animate-spin" />
                  Backup Biometrik
                </Button>
              </div>
            </div>
            <p v-if="machineSyncMessage" class="mt-2 text-xs font-medium text-amber-600 dark:text-amber-500">{{ machineSyncMessage }}</p>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow glass-panel border border-border/50 overflow-hidden">
            <div class="p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-muted/20">
              <h3 class="font-bold text-sm">Data Pengguna di Mesin (Staging)</h3>
              <div class="flex items-center gap-3">
                <div class="relative w-full sm:w-64">
                  <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Cari PIN atau Nama..."
                    class="pl-9 h-9 text-xs font-medium bg-background"
                  />
                </div>
                <button @click="fetchMachineUsers" class="text-xs text-primary font-bold hover:underline shrink-0">Refresh Tabel</button>
              </div>
            </div>

            <div class="overflow-x-auto">
              <Table>
                <TableHeader class="bg-muted/30">
                  <TableRow>
                    <TableHead class="w-[60px] font-bold text-xs uppercase text-muted-foreground px-6 py-4">No.</TableHead>
                    <TableHead class="font-bold text-xs uppercase text-muted-foreground px-6 py-4">PIN Mesin</TableHead>
                    <TableHead class="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Nama di Mesin</TableHead>
                    <TableHead class="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Role (Privilege)</TableHead>
                    <TableHead class="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Terakhir Ditarik</TableHead>
                    <TableHead class="font-bold text-xs uppercase text-muted-foreground px-6 py-4 text-right">Status Penyatuan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-if="isLoadingMachineUsers">
                    <TableCell colspan="6" class="h-24 text-center text-muted-foreground text-sm font-medium">Memuat data dari database staging...</TableCell>
                  </TableRow>
                  <TableRow v-else-if="filteredMachineUsers.length === 0">
                    <TableCell colspan="6" class="h-24 text-center text-muted-foreground text-sm font-medium">
                      {{ searchQuery ? 'Tidak ada data yang cocok dengan pencarian.' : 'Belum ada data yang ditarik dari mesin. Klik tombol "Tarik Data" di atas.' }}
                    </TableCell>
                  </TableRow>
                  <TableRow v-for="(user, index) in paginatedMachineUsers" :key="user.id" class="hover:bg-accent/40">
                    <TableCell class="font-medium text-xs px-6 py-4">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</TableCell>
                    <TableCell class="font-mono text-xs font-bold text-muted-foreground px-6 py-4">{{ user.machinePin }}</TableCell>
                    <TableCell class="font-bold text-sm text-foreground px-6 py-4">{{ user.machineName }}</TableCell>
                    <TableCell class="px-6 py-4">
                      <Select :model-value="user.privilegeRole || 'Normal'" @update:model-value="(val) => handleRoleChange(user.id, val as string)">
                        <SelectTrigger class="w-[120px] h-8 text-[10px] font-bold uppercase rounded-full border-none" :class="user.privilegeRole === 'Superadmin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal" class="text-xs font-bold">Normal</SelectItem>
                          <SelectItem value="Superadmin" class="text-xs font-bold text-amber-600">Superadmin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>>
                    <TableCell class="text-xs text-muted-foreground px-6 py-4">{{ user.lastSyncAt ? new Date(user.lastSyncAt).toLocaleString() : '-' }}</TableCell>
                    <TableCell class="text-right px-6 py-4">
                      <div v-if="user.linkedEmployeeId" class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-semibold text-xs bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                        <Link2 class="w-3 h-3" /> Ditautkan
                      </div>
                      <div v-else class="inline-flex items-center gap-1.5 text-muted-foreground font-semibold text-xs bg-muted/50 px-2 py-1 rounded-md">
                        <Unlink class="w-3 h-3" /> Menganggur
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div class="p-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
              <div class="text-xs text-muted-foreground font-medium">
                Menampilkan {{ filteredMachineUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }} -
                {{ Math.min(currentPage * itemsPerPage, filteredMachineUsers.length) }} dari {{ filteredMachineUsers.length }} data
              </div>
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="currentPage === 1"
                  @click="currentPage--"
                >
                  Sebelumnya
                </Button>
                <span class="text-xs font-medium px-2">
                  Halaman {{ totalPages > 0 ? currentPage : 0 }} dari {{ totalPages }}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="currentPage === totalPages || totalPages === 0"
                  @click="currentPage++"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>

    <!-- DEPARTMENT DIALOG -->
    <Dialog :open="isDeptModalOpen" @update:open="isDeptModalOpen = $event">
      <DialogContent class="sm:max-w-[420px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground">{{ isEditingDept ? 'Edit Departemen' : 'Tambah Departemen Baru' }}</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">Konfigurasi kode dan nama departemen / divisi.</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="saveDept" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="deptCode" class="text-xs font-bold uppercase text-muted-foreground">Kode Departemen</Label>
            <Input id="deptCode" v-model="deptForm.code" placeholder="Misal: HRD, MED, FIN" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label for="deptName" class="text-xs font-bold uppercase text-muted-foreground">Nama Departemen</Label>
            <Input id="deptName" v-model="deptForm.name" placeholder="Misal: Sumber Daya Manusia" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Induk Departemen (Opsional)</Label>
            <Select v-model="deptForm.parentId">
              <SelectTrigger class="bg-muted border-border rounded-sm">
                <SelectValue placeholder="Pilih Induk (Misal: Umum)" />
              </SelectTrigger>
              <SelectContent class="rounded-sm border-border shadow-xl bg-card text-foreground z-50">
                <SelectItem :value="null" class="text-xs font-medium text-muted-foreground italic">Tidak Ada (Departemen Utama)</SelectItem>
                <SelectItem v-for="d in availableParentDepartments" :key="d.id" :value="d.id" class="text-xs">
                  {{ d.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isDeptModalOpen = false" class="rounded-xl font-bold text-xs h-10">Batal</Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- JOB POSITION DIALOG -->
    <Dialog :open="isJobModalOpen" @update:open="isJobModalOpen = $event">
      <DialogContent class="sm:max-w-[420px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground">{{ isEditingJob ? 'Edit Jabatan' : 'Tambah Jabatan Baru' }}</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">Konfigurasi nama dan deskripsi posisi pekerjaan.</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="saveJob" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="jobCode" class="text-xs font-bold uppercase text-muted-foreground">Kode Jabatan</Label>
            <Input id="jobCode" v-model="jobForm.code" placeholder="Misal: DOC-SP, NURSE, ADM" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label for="jobName" class="text-xs font-bold uppercase text-muted-foreground">Nama Jabatan</Label>
            <Input id="jobName" v-model="jobForm.name" placeholder="Misal: Dokter Spesialis Bedah" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label for="jobDesc" class="text-xs font-bold uppercase text-muted-foreground">Deskripsi (Opsional)</Label>
            <Input id="jobDesc" v-model="jobForm.description" placeholder="Uraian ringkas tugas jabatan" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isJobModalOpen = false" class="rounded-xl font-bold text-xs h-10">Batal</Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- GRADE DIALOG -->
    <Dialog :open="isGradeModalOpen" @update:open="isGradeModalOpen = $event">
      <DialogContent class="sm:max-w-[420px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground">Tambah Golongan Baru</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">Konfigurasi tingkatan jenjang karir golongan pegawai.</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="saveGrade" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="gradeCode" class="text-xs font-bold uppercase text-muted-foreground">Kode Golongan</Label>
            <Input id="gradeCode" v-model="gradeForm.code" placeholder="Misal: III/A, IV/B" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label for="gradeName" class="text-xs font-bold uppercase text-muted-foreground">Nama Jenjang</Label>
            <Input id="gradeName" v-model="gradeForm.name" placeholder="Misal: Penata Muda" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label for="gradeLevel" class="text-xs font-bold uppercase text-muted-foreground">Tingkat Level (Numerik)</Label>
            <Input id="gradeLevel" type="number" v-model="gradeForm.level" placeholder="1" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isGradeModalOpen = false" class="rounded-xl font-bold text-xs h-10">Batal</Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- DELETE CONFIRMATION DIALOGS -->
    <Dialog :open="isDeleteDeptOpen" @update:open="isDeleteDeptOpen = $event">
      <DialogContent class="sm:max-w-[420px] bg-card border-border/60 rounded-3xl p-0 overflow-hidden shadow-2xl">
        <div class="p-6 pt-8 text-center space-y-4">
          <div class="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertTriangle class="w-8 h-8 text-destructive" />
          </div>
          <DialogTitle class="text-xl font-bold text-foreground">Hapus Departemen?</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground px-4">
            Apakah Anda yakin ingin menghapus departemen <span class="font-bold text-foreground">{{ deptToDelete?.name }}</span>? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </div>
        <div class="p-4 bg-muted/30 border-t border-border/50 flex justify-end gap-2">
          <Button variant="outline" @click="isDeleteDeptOpen = false" :disabled="isDeletingDept" class="rounded-xl font-bold text-xs">Batal</Button>
          <Button variant="destructive" @click="executeDeleteDept" :disabled="isDeletingDept" class="rounded-xl font-bold text-xs px-6">
            <Loader2 v-if="isDeletingDept" class="w-4 h-4 mr-2 animate-spin" />
            Hapus Departemen
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog :open="isDeleteJobOpen" @update:open="isDeleteJobOpen = $event">
      <DialogContent class="sm:max-w-[420px] bg-card border-border/60 rounded-3xl p-0 overflow-hidden shadow-2xl">
        <div class="p-6 pt-8 text-center space-y-4">
          <div class="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertTriangle class="w-8 h-8 text-destructive" />
          </div>
          <DialogTitle class="text-xl font-bold text-foreground">Hapus Jabatan?</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground px-4">
            Apakah Anda yakin ingin menghapus jabatan <span class="font-bold text-foreground">{{ jobToDelete?.name }}</span>? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </div>
        <div class="p-4 bg-muted/30 border-t border-border/50 flex justify-end gap-2">
          <Button variant="outline" @click="isDeleteJobOpen = false" :disabled="isDeletingJob" class="rounded-xl font-bold text-xs">Batal</Button>
          <Button variant="destructive" @click="executeDeleteJob" :disabled="isDeletingJob" class="rounded-xl font-bold text-xs px-6">
            <Loader2 v-if="isDeletingJob" class="w-4 h-4 mr-2 animate-spin" />
            Hapus Jabatan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>