<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { ArrowLeft, CalendarClock, ShieldCheck, Users, Loader2 } from 'lucide-vue-next'
import api from '@/api/axios'
import { toast } from 'vue-sonner'
import { updateEmployee, getDepartments, getJobPositions, getEmployeeContracts, createEmployeeContract, getEmployeeDocuments } from '@/api/hris'

// Import lazy-loaded child components for the tabs
import EmployeeBasicInfoTab from '../components/EmployeeBasicInfoTab.vue'
import EmployeeCurrentStatusTab from '../components/EmployeeCurrentStatusTab.vue'
import EmployeeHistoryTab from '../components/EmployeeHistoryTab.vue'
import EmployeeCredentialsTab from '../components/EmployeeCredentialsTab.vue'
import EmployeeFamilyTab from '../components/EmployeeFamilyTab.vue'
import EmployeeContractTab from '../components/EmployeeContractTab.vue'
import EmployeeDocumentTab from '../components/EmployeeDocumentTab.vue'

const route = useRoute()
const router = useRouter()
const employeeId = computed(() => route.params.id as string)

// State for active tab
const activeTab = ref('basic-info')
const employeeData = ref<any>(null)
const departments = ref<any[]>([])
const jobPositions = ref<any[]>([])
const isLoading = ref(true)

// Edit Dialog State
const isEditOpen = ref(false)
const isSubmittingEdit = ref(false)
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
  fingerprintPin?: string;
}>({
  id: '',
  identityNumber: '',
  employeeNumber: '',
  fullName: '',
  dateOfBirth: '',
  gender: 'L',
  status: 'Aktif',
  professionCategory: 'Non-Kesehatan',
  fingerprintPin: ''
})

const fetchEmployeeDetail = async () => {
  isLoading.value = true
  try {
    const response = await api.get(`/api/hris/employees/${employeeId.value}`)
    employeeData.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch employee detail:', error)
    toast.error('Gagal memuat detail pegawai')
  } finally {
    isLoading.value = false
  }
}

// --- Contracts State ---
const contracts = ref<any[]>([])
const isLoadingContracts = ref(false)
const isContractModalOpen = ref(false)
const isSubmittingContract = ref(false)
const contractForm = ref({
  contractType: '',
  startDate: '',
  endDate: ''
})

// --- Documents State ---
const documents = ref<any[]>([])
const isLoadingDocuments = ref(false)

const fetchDocuments = async () => {
  isLoadingDocuments.value = true
  try {
    const data = await getEmployeeDocuments(employeeId.value)
    documents.value = data || []
  } catch (e) {
    toast.error('Gagal memuat dokumen pegawai')
  } finally {
    isLoadingDocuments.value = false
  }
}

const fetchContracts = async () => {
  isLoadingContracts.value = true
  try {
    const data = await getEmployeeContracts(employeeId.value)
    contracts.value = data || []
  } catch (e) {
    toast.error('Gagal memuat riwayat kontrak')
  } finally {
    isLoadingContracts.value = false
  }
}

const submitContract = async () => {
  if (!contractForm.value.contractType || !contractForm.value.startDate) {
    toast.error('Status dan Tanggal Mulai wajib diisi')
    return
  }
  isSubmittingContract.value = true
  try {
    await createEmployeeContract(employeeId.value, contractForm.value)
    toast.success('Status kepegawaian berhasil diperbarui')
    isContractModalOpen.value = false
    await fetchContracts()
  } catch (e) {
    toast.error('Gagal memperbarui status kepegawaian')
  } finally {
    isSubmittingContract.value = false
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

const openEditModal = () => {
  if (!employeeData.value) return
  editForm.value = {
    id: employeeData.value.id,
    identityNumber: employeeData.value.identityNumber || '',
    employeeNumber: employeeData.value.employeeNumber,
    fullName: employeeData.value.fullName,
    dateOfBirth: employeeData.value.dateOfBirth ? employeeData.value.dateOfBirth.split('T')[0] : '',
    gender: (employeeData.value.gender === 'P' ? 'P' : 'L') as 'L' | 'P',
    status: employeeData.value.status || 'Aktif',
    professionCategory: employeeData.value.professionCategory || 'Non-Kesehatan',
    departmentId: employeeData.value.departmentId,
    jobPositionId: employeeData.value.jobPositionId,
    fingerprintPin: employeeData.value.fingerprintPin || ''
  }
  isEditOpen.value = true
}

const handleSaveEdit = async () => {
  if (!editForm.value.fullName || !editForm.value.employeeNumber || !editForm.value.identityNumber) {
    toast.error('No. KTP, NIP, dan Nama lengkap wajib diisi')
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
      jobPositionId: editForm.value.jobPositionId,
      fingerprintPin: editForm.value.fingerprintPin || undefined
    })
    toast.success('Data pegawai berhasil diperbarui')
    isEditOpen.value = false
    fetchEmployeeDetail()
  } catch (error: any) {
    console.error('Failed to update employee:', error)
    toast.error(error.response?.data?.message || 'Gagal memperbarui data pegawai')
  } finally {
    isSubmittingEdit.value = false
  }
}

onMounted(() => {
  fetchEmployeeDetail()
  fetchMasterData()
  fetchContracts()
  fetchDocuments()
})

const goBack = () => {
  router.push('/hris/employees')
}
</script>

<template>
  <div class="h-full space-y-8 max-w-[1400px]">
    <!-- Top Bar -->
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-between gap-4 mb-6"
         :class="!isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <div class="flex items-center gap-4">
        <Button variant="outline" size="icon" @click="goBack" class="h-10 w-10 shrink-0 bg-card border-border hover:bg-accent text-foreground rounded-sm shadow-sm">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold tracking-tight text-foreground">{{ employeeData?.fullName || 'Detail Pegawai' }}</h1>
            <Badge v-if="employeeData?.status" variant="default" class="text-[10px] font-bold uppercase tracking-wider">
              {{ employeeData.status }}
            </Badge>
          </div>
          <p class="text-xs font-medium text-muted-foreground mt-1">
            <span class="font-mono font-semibold text-foreground">NIK: {{ employeeData?.employeeNumber || employeeId }}</span> &bull; {{ employeeData?.department || 'Umum' }} &bull; {{ employeeData?.position || 'Staf' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Main Tabs Layout -->
    <div class="bg-card border-none rounded-sm shadow-sm overflow-hidden flex flex-col min-h-[600px] transition-all duration-700 delay-100 ease-out"
         :class="!isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
      <Tabs v-model="activeTab" class="w-full flex flex-col sm:flex-row h-full">
        <!-- Sidebar Navigation -->
        <div class="sm:w-64 bg-muted/20 border-b sm:border-b-0 sm:border-r border-border/50 p-6 shrink-0 relative">
          <div class="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

          <TabsList class="flex sm:flex-col h-auto w-full bg-transparent justify-start gap-2 p-0 overflow-x-auto sm:overflow-visible relative z-10">
            <TabsTrigger
              value="basic-info"
              class="w-full justify-start text-left px-4 py-3 rounded-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap text-muted-foreground font-medium hover:bg-accent/50 text-xs"
            >
              <UserSquare class="w-4 h-4 mr-3 shrink-0" />
              Informasi Dasar
            </TabsTrigger>
            <TabsTrigger
              value="current-status"
              class="w-full justify-start text-left px-4 py-3 rounded-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap text-muted-foreground font-medium hover:bg-accent/50 text-xs"
            >
              <ShieldCheck class="w-4 h-4 mr-3 shrink-0" />
              Status Kontrak & Penempatan
            </TabsTrigger>
            <TabsTrigger
              value="history"
              class="w-full justify-start text-left px-4 py-3 rounded-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap text-muted-foreground font-medium hover:bg-accent/50 text-xs"
            >
              <CalendarClock class="w-4 h-4 mr-3 shrink-0" />
              Riwayat Penempatan
            </TabsTrigger>
            <TabsTrigger
              v-if="['Medis', 'Keperawatan', 'Penunjang Medis'].includes(employeeData?.professionCategory)"
              value="credentials"
              class="w-full justify-start text-left px-4 py-3 rounded-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap text-muted-foreground font-medium hover:bg-accent/50 text-xs"
            >
              <ShieldCheck class="w-4 h-4 mr-3 shrink-0" />
              Kredensial Medis
            </TabsTrigger>
            <TabsTrigger
              value="family"
              class="w-full justify-start text-left px-4 py-3 rounded-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap text-muted-foreground font-medium hover:bg-accent/50 text-xs"
            >
              <Users class="w-4 h-4 mr-3 shrink-0" />
              Keluarga & Darurat
            </TabsTrigger>
            <TabsTrigger
              value="contracts"
              class="w-full justify-start text-left px-4 py-3 rounded-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap text-muted-foreground font-medium hover:bg-accent/50 text-xs"
            >
              <ShieldCheck class="w-4 h-4 mr-3 shrink-0" />
              Riwayat Kontrak
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              class="w-full justify-start text-left px-4 py-3 rounded-sm data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap text-muted-foreground font-medium hover:bg-accent/50 text-xs"
            >
              <UserSquare class="w-4 h-4 mr-3 shrink-0" />
              Dokumen Pegawai
            </TabsTrigger>
          </TabsList>
        </div>

        <!-- Tab Content Area -->
        <div class="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10 bg-transparent">
          <TabsContent value="basic-info" class="mt-0 outline-none">
            <EmployeeBasicInfoTab
              v-if="activeTab === 'basic-info'"
              :employee-id="employeeId"
              :employee-data="employeeData"
              @edit="openEditModal"
            />
          </TabsContent>

          <TabsContent value="current-status" class="mt-0 outline-none">
            <EmployeeCurrentStatusTab
              v-if="activeTab === 'current-status'"
              :employee-id="employeeId"
              :employee-data="employeeData"
              :departments="departments"
              :job-positions="jobPositions"
              :contracts="contracts"
              @refetch="() => { fetchEmployeeDetail(); fetchContracts(); }"
            />
          </TabsContent>

          <TabsContent value="history" class="mt-0 outline-none">
            <EmployeeHistoryTab
              v-if="activeTab === 'history'"
              :employee-id="employeeId"
              :employee-data="employeeData"
              :departments="departments"
              :job-positions="jobPositions"
              @refetch="fetchEmployeeDetail"
            />
          </TabsContent>

          <TabsContent value="credentials" class="mt-0 outline-none">
            <EmployeeCredentialsTab
              v-if="activeTab === 'credentials'"
              :employee-id="employeeId"
              :employee-data="employeeData"
              @refetch="fetchEmployeeDetail"
            />
          </TabsContent>

          <TabsContent value="family" class="mt-0 outline-none">
            <EmployeeFamilyTab
              v-if="activeTab === 'family'"
              :employee-id="employeeId"
            />
          </TabsContent>

          <TabsContent value="contracts" class="mt-0 outline-none">
            <EmployeeContractTab
              v-if="activeTab === 'contracts'"
              :employee-id="employeeId"
              :contracts="contracts"
              :is-loading-contracts="isLoadingContracts"
              @refetch="fetchContracts"
            />
          </TabsContent>

          <TabsContent value="documents" class="mt-0 outline-none">
            <EmployeeDocumentTab
              v-if="activeTab === 'documents'"
              :employee-id="employeeId"
              :documents="documents"
              :is-loading-documents="isLoadingDocuments"
              @refetch="fetchDocuments"
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>

    <!-- Complete Edit Employee Dialog -->
    <Dialog :open="isEditOpen" @update:open="isEditOpen = $event">
      <DialogContent class="sm:max-w-[800px] bg-card border-border p-6">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Edit Data Pegawai</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground">
            Perbarui informasi demografi, status, dan penempatan unit kerja pegawai.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSaveEdit" class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label for="detailEditIdentity" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">No. KTP / NIK Penduduk <span class="text-destructive">*</span></Label>
              <Input
                id="detailEditIdentity"
                v-model="editForm.identityNumber"
                class="bg-muted border-border rounded-sm"
              />
            </div>
            <div class="space-y-2">
              <Label for="detailEditNik" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">NIP Kepegawaian <span class="text-destructive">*</span></Label>
              <Input
                id="detailEditNik"
                v-model="editForm.employeeNumber"
                class="bg-muted border-border rounded-sm"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="detailEditFullName" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap <span class="text-destructive">*</span></Label>
            <Input
              id="detailEditFullName"
              v-model="editForm.fullName"
              class="bg-muted border-border rounded-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label for="detailEditDateOfBirth" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tanggal Lahir</Label>
              <Input
                id="detailEditDateOfBirth"
                type="date"
                v-model="editForm.dateOfBirth"
                class="bg-muted border-border rounded-sm"
              />
            </div>

            <div class="space-y-2">
              <Label for="detailEditGender" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jenis Kelamin</Label>
              <Select v-model="editForm.gender">
                <SelectTrigger class="bg-muted border-border rounded-sm">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent class="rounded-sm border-border shadow-xl bg-white dark:bg-zinc-950 text-foreground">
                  <SelectItem value="L" class="rounded-sm cursor-pointer text-xs font-medium">Laki-laki</SelectItem>
                  <SelectItem value="P" class="rounded-sm cursor-pointer text-xs font-medium">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label for="detailEditStatus" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status Kepegawaian</Label>
              <Select v-model="editForm.status">
                <SelectTrigger class="bg-muted border-border rounded-sm">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent class="rounded-sm border-border shadow-xl bg-white dark:bg-zinc-950 text-foreground">
                  <SelectItem value="Aktif" class="rounded-sm text-xs">Aktif</SelectItem>
                  <SelectItem value="Cuti" class="rounded-sm text-xs">Cuti</SelectItem>
                  <SelectItem value="Resign" class="rounded-sm text-xs">Resign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="detailEditProfession" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategori Profesi</Label>
              <Select v-model="editForm.professionCategory">
                <SelectTrigger class="bg-muted border-border rounded-sm">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent class="rounded-sm border-border shadow-xl bg-white dark:bg-zinc-950 text-foreground">
                  <SelectItem value="Medis" class="rounded-sm text-xs">Medis (Dokter)</SelectItem>
                  <SelectItem value="Keperawatan" class="rounded-sm text-xs">Keperawatan & Kebidanan</SelectItem>
                  <SelectItem value="Penunjang Medis" class="rounded-sm text-xs">Tenaga Kesehatan Lainnya (Apoteker, Lab)</SelectItem>
                  <SelectItem value="Non-Kesehatan" class="rounded-sm text-xs">Tenaga Non-Kesehatan (Manajemen, Umum)</SelectItem>
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
                <SelectContent class="rounded-sm border-border shadow-lg bg-popover text-popover-foreground max-h-56">
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
                <SelectContent class="rounded-sm border-border shadow-lg bg-popover text-popover-foreground max-h-56">
                  <SelectItem v-for="job in jobPositions" :key="job.id" :value="job.id" class="text-xs">
                    {{ job.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2 pt-1">
            <Label for="detailEditFingerprintPin" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">PIN / ID Mesin Fingerprint (Opsional)</Label>
            <Input
              id="detailEditFingerprintPin"
              v-model="editForm.fingerprintPin"
              placeholder="Contoh: 101 (Default: mengikuti NIK)"
              class="bg-muted border-border rounded-sm font-mono"
            />
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
    <!-- Contract Modal -->
    <Dialog :open="isContractModalOpen" @update:open="isContractModalOpen = $event">
      <DialogContent class="sm:max-w-[420px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground">Perbarui Status Kepegawaian</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">Status yang lama akan otomatis diarsipkan menjadi riwayat.</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="submitContract" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jenis Status / Kontrak Baru</Label>
            <Select v-model="contractForm.contractType">
              <SelectTrigger class="bg-muted/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Pilih Jenis" />
              </SelectTrigger>
              <SelectContent class="rounded-xl border-border shadow-xl bg-card z-50">
                <SelectItem value="Probation" class="text-xs">Probation</SelectItem>
                <SelectItem value="PKWT" class="text-xs">Kontrak (PKWT)</SelectItem>
                <SelectItem value="PKWTT" class="text-xs">Tetap (PKWTT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mulai Berlaku</Label>
              <Input type="date" v-model="contractForm.startDate" class="bg-muted/50 border-border/50 rounded-xl [color-scheme:dark]" />
            </div>
            <div class="space-y-2" v-if="contractForm.contractType !== 'PKWTT'">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Berakhir Pada</Label>
              <Input type="date" v-model="contractForm.endDate" class="bg-muted/50 border-border/50 rounded-xl [color-scheme:dark]" />
            </div>
          </div>

          <DialogFooter class="pt-4 border-t border-border/40">
            <Button variant="outline" type="button" @click="isContractModalOpen = false" class="rounded-xl font-bold text-xs h-10">Batal</Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6" :disabled="isSubmittingContract">
              <Loader2 v-if="isSubmittingContract" class="w-3.5 h-3.5 mr-2 animate-spin" />
              Simpan & Arsipkan Lama
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

  </div>
</template>
