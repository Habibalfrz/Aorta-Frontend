<script setup lang="ts">
import { ref, computed } from 'vue'
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
import { Building2, Loader2, FileText, Clock } from 'lucide-vue-next'
import { recordEmployment } from '@/api/hris'
import { toast } from 'vue-sonner'
import api from '@/api/axios'

const props = defineProps<{
  employeeId: string
  employeeData?: any
  departments?: any[]
  jobPositions?: any[]
  contracts?: any[]
}>()

const emit = defineEmits<{
  (e: 'refetch'): void
}>()

const activeEmployment = computed(() => {
  if (!props.employeeData?.employments) return null;
  return props.employeeData.employments.find((e: any) => e.isActive) || null;
})

const activeContract = computed(() => {
  if (!props.contracts) return null;
  return props.contracts.find((c: any) => c.isActive) || null;
})

// === PLACEMENT & SALARY MODAL STATE ===
const isPlacementModalOpen = ref(false)
const isPlacementSubmitting = ref(false)
const placementForm = ref({
  departmentId: '',
  jobPositionId: '',
  gradeId: '',
  basicSalary: 0,
  startDate: new Date().toISOString().split('T')[0]
})

const openPlacementModal = () => {
  placementForm.value = {
    departmentId: activeEmployment.value?.departmentId || props.departments?.[0]?.id || '',
    jobPositionId: activeEmployment.value?.positionId || props.jobPositions?.[0]?.id || '',
    gradeId: activeEmployment.value?.gradeId || '',
    basicSalary: activeEmployment.value?.basicSalary || 0,
    startDate: new Date().toISOString().split('T')[0]
  }
  isPlacementModalOpen.value = true
}

const handleSavePlacement = async () => {
  if (!placementForm.value.departmentId || !placementForm.value.jobPositionId || !placementForm.value.startDate) {
    toast.error('Departemen, Posisi Jabatan, dan Tanggal Mulai wajib diisi')
    return
  }

  if (placementForm.value.basicSalary < 0) {
    toast.error('Gaji Pokok tidak boleh bernilai negatif')
    return
  }

  isPlacementSubmitting.value = true
  try {
    await recordEmployment(props.employeeId, {
      departmentId: placementForm.value.departmentId,
      jobPositionId: placementForm.value.jobPositionId,
      gradeId: placementForm.value.gradeId || undefined,
      basicSalary: Number(placementForm.value.basicSalary),
      startDate: placementForm.value.startDate
    })
    toast.success('Pembaruan Gaji/Penempatan berhasil disimpan')
    isPlacementModalOpen.value = false
    emit('refetch')
  } catch (error: any) {
    console.error('Failed to record employment:', error)
    toast.error(error.response?.data?.message || 'Gagal merekam penempatan kerja')
  } finally {
    isPlacementSubmitting.value = false
  }
}

// === CONTRACT MODAL STATE ===
const isContractModalOpen = ref(false)
const isContractSubmitting = ref(false)
const contractForm = ref({
  contractNumber: '',
  contractType: 'PKWT',
  startDate: new Date().toISOString().split('T')[0],
  endDate: ''
})

const openContractModal = () => {
  contractForm.value = {
    contractNumber: '',
    contractType: 'PKWT',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  }
  isContractModalOpen.value = true
}

const handleSaveContract = async () => {
  if (!contractForm.value.contractType || !contractForm.value.startDate) {
    toast.error('Tipe Kontrak dan Tanggal Mulai wajib diisi')
    return
  }

  isContractSubmitting.value = true
  try {
    await api.post(`/api/hris/employees/${props.employeeId}/contracts`, {
      contractNumber: contractForm.value.contractNumber,
      contractType: contractForm.value.contractType,
      startDate: contractForm.value.startDate,
      endDate: contractForm.value.endDate ? contractForm.value.endDate : null
    })

    toast.success('Perpanjangan kontrak berhasil disimpan')
    isContractModalOpen.value = false
    emit('refetch')
  } catch (error: any) {
    console.error('Failed to create contract:', error)
    toast.error(error.response?.data?.message || 'Gagal membuat kontrak')
  } finally {
    isContractSubmitting.value = false
  }
}

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- CARD 1: ACTIVE PLACEMENT & SALARY -->
      <div class="bg-card border border-border/40 shadow-sm rounded-xl overflow-hidden flex flex-col">
        <div class="p-5 border-b border-border/40 flex justify-between items-center bg-muted/20">
          <div class="flex items-center gap-2">
            <Building2 class="w-5 h-5 text-primary" />
            <h3 class="text-base font-bold tracking-tight text-foreground">Penempatan & Gaji Aktif</h3>
          </div>
          <Badge v-if="activeEmployment" variant="outline" class="bg-green-500/10 text-green-600 border-green-500/20 font-bold px-2 py-0.5 text-xs">Aktif</Badge>
          <Badge v-else variant="outline" class="bg-red-500/10 text-red-600 border-red-500/20 font-bold px-2 py-0.5 text-xs">Belum Diatur</Badge>
        </div>

        <div class="p-6 flex-1 flex flex-col justify-center">
          <div v-if="activeEmployment" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Jabatan</p>
                <p class="text-sm font-bold">{{ activeEmployment.positionName }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Departemen</p>
                <p class="text-sm font-bold">{{ activeEmployment.departmentName }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Golongan</p>
                <p class="text-sm font-bold">{{ activeEmployment.gradeName || '-' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Efektif Sejak</p>
                <p class="text-sm font-bold">{{ new Date(activeEmployment.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
              </div>
            </div>

            <div class="pt-4 mt-2 border-t border-dashed border-border">
              <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Gaji Pokok Saat Ini</p>
              <p class="text-2xl font-black text-primary tracking-tight">{{ formatRupiah(activeEmployment.basicSalary || 0) }}</p>
            </div>
          </div>

          <div v-else class="text-center py-8 text-muted-foreground">
            <p class="text-sm">Pegawai ini belum memiliki riwayat penempatan aktif.</p>
          </div>
        </div>

        <div class="p-4 bg-muted/10 border-t border-border/40">
          <Button v-permission="'hris.employees.write'" @click="openPlacementModal" class="w-full font-bold shadow-sm h-10">
            Mutasi / Update Gaji
          </Button>
        </div>
      </div>

      <!-- CARD 2: ACTIVE LEGAL CONTRACT -->
      <div class="bg-card border border-border/40 shadow-sm rounded-xl overflow-hidden flex flex-col">
        <div class="p-5 border-b border-border/40 flex justify-between items-center bg-muted/20">
          <div class="flex items-center gap-2">
            <FileText class="w-5 h-5 text-indigo-500" />
            <h3 class="text-base font-bold tracking-tight text-foreground">Kontrak Legal Aktif</h3>
          </div>
          <Badge v-if="activeContract" variant="outline" class="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-bold px-2 py-0.5 text-xs">Berjalan</Badge>
          <Badge v-else variant="outline" class="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold px-2 py-0.5 text-xs">Belum Ada / Habis</Badge>
        </div>

        <div class="p-6 flex-1 flex flex-col justify-center">
          <div v-if="activeContract" class="space-y-4">
            <div class="flex items-center gap-3 mb-2">
              <div class="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <FileText class="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Nomor Kontrak</p>
                <p class="text-sm font-bold">{{ activeContract.contractNumber || 'Tidak ada nomor' }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Status Kepegawaian</p>
                <Badge class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold border-none">{{ activeContract.contractType }}</Badge>
              </div>
              <div v-if="activeContract.endDate">
                <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Sisa Waktu</p>
                <p class="text-sm font-bold text-amber-600 flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5" />
                  {{ Math.max(0, Math.ceil((new Date(activeContract.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) }} Hari
                </p>
              </div>
            </div>

            <div class="pt-4 mt-2 border-t border-dashed border-border flex justify-between">
              <div>
                <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Mulai</p>
                <p class="text-sm font-bold">{{ new Date(activeContract.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
              </div>
              <div class="text-right" v-if="activeContract.endDate">
                <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Berakhir</p>
                <p class="text-sm font-bold">{{ new Date(activeContract.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-muted-foreground">
            <p class="text-sm">Tidak ada kontrak kerja aktif untuk pegawai ini.</p>
          </div>
        </div>

        <div class="p-4 bg-muted/10 border-t border-border/40">
          <Button v-permission="'hris.employees.write'" @click="openContractModal" variant="outline" class="w-full font-bold shadow-sm h-10 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/30">
            Perpanjang / Buat Kontrak
          </Button>
        </div>
      </div>

    </div>

    <!-- MODAL 1: PLACEMENT & SALARY -->
    <Dialog :open="isPlacementModalOpen" @update:open="isPlacementModalOpen = $event">
      <DialogContent class="sm:max-w-[460px] bg-card border-border rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight">Mutasi & Update Gaji</DialogTitle>
          <DialogDescription class="text-sm">
            Menugaskan pegawai pada unit kerja baru atau menyesuaikan gaji pokok. Riwayat sebelumnya akan diarsipkan.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSavePlacement" class="space-y-4 py-2">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground">Departemen</Label>
            <Select v-model="placementForm.departmentId">
              <SelectTrigger class="bg-muted rounded-md h-10">
                <SelectValue placeholder="Pilih Departemen" />
              </SelectTrigger>
              <SelectContent class="rounded-md shadow-xl max-h-56">
                <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id" class="text-sm">
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground">Jabatan</Label>
              <Select v-model="placementForm.jobPositionId">
                <SelectTrigger class="bg-muted rounded-md h-10">
                  <SelectValue placeholder="Pilih Jabatan" />
                </SelectTrigger>
                <SelectContent class="rounded-md shadow-xl max-h-56">
                  <SelectItem v-for="job in jobPositions" :key="job.id" :value="job.id" class="text-sm">
                    {{ job.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground">Golongan</Label>
              <Input type="text" v-model="placementForm.gradeId" placeholder="ID Golongan (Opsional)" class="hidden" />
              <p class="text-xs text-muted-foreground mt-2">Dikosongkan</p>
            </div>
          </div>

          <div class="space-y-2 pt-2 border-t border-border/50">
            <Label class="text-xs font-bold uppercase text-muted-foreground">Gaji Pokok Baru (Rp)</Label>
            <Input type="number" min="0" v-model="placementForm.basicSalary" placeholder="Contoh: 4500000" class="bg-muted rounded-md h-10 text-lg font-bold" />
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground">Tanggal Efektif Mulai</Label>
            <Input type="date" v-model="placementForm.startDate" class="bg-muted rounded-md h-10" />
          </div>

          <DialogFooter class="pt-4">
            <Button variant="ghost" type="button" @click="isPlacementModalOpen = false" :disabled="isPlacementSubmitting" class="rounded-md">Batal</Button>
            <Button type="submit" class="rounded-md px-6 shadow-sm" :disabled="isPlacementSubmitting">
              <Loader2 v-if="isPlacementSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- MODAL 2: CONTRACT -->
    <Dialog :open="isContractModalOpen" @update:open="isContractModalOpen = $event">
      <DialogContent class="sm:max-w-[420px] bg-card border-border rounded-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight">Perpanjang Kontrak</DialogTitle>
          <DialogDescription class="text-sm">
            Buat kontrak baru untuk pegawai ini.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSaveContract" class="space-y-4 py-2">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground">Nomor Kontrak (Opsional)</Label>
            <Input v-model="contractForm.contractNumber" placeholder="Contoh: SPK/2026/09/001" class="bg-muted rounded-md h-10" />
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground">Jenis Status</Label>
            <Select v-model="contractForm.contractType">
              <SelectTrigger class="bg-muted rounded-md h-10">
                <SelectValue placeholder="Pilih Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PKWT">PKWT (Kontrak)</SelectItem>
                <SelectItem value="PKWTT">PKWTT (Tetap)</SelectItem>
                <SelectItem value="Internship">Magang</SelectItem>
                <SelectItem value="Freelance">Lepas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground">Tanggal Mulai</Label>
              <Input type="date" v-model="contractForm.startDate" class="bg-muted rounded-md h-10" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground">Tgl Berakhir</Label>
              <Input type="date" v-model="contractForm.endDate" class="bg-muted rounded-md h-10" />
            </div>
          </div>

          <DialogFooter class="pt-4">
            <Button variant="ghost" type="button" @click="isContractModalOpen = false" :disabled="isContractSubmitting" class="rounded-md">Batal</Button>
            <Button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-6 shadow-sm" :disabled="isContractSubmitting">
              <Loader2 v-if="isContractSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              Buat Kontrak
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>