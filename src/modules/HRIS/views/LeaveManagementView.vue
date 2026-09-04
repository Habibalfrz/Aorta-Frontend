<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Search, CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-vue-next'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { getLeaves, applyLeave, updateLeaveStatus, deleteLeave } from '@/api/hris'

const leaves = ref<any[]>([])
const employees = ref<any[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const selectedStatusFilter = ref('ALL')

// Form Ajukan Cuti
const isApplyModalOpen = ref(false)
const isSubmittingLeave = ref(false)
const applyForm = ref({
  employeeId: '',
  startDate: '',
  endDate: '',
  reason: ''
})

const fetchLeavesList = async () => {
  isLoading.value = true
  try {
    leaves.value = await getLeaves()
  } catch (error) {
    console.error('Failed to fetch leaves:', error)
    toast.error('Gagal mengambil data pengajuan cuti')
  } finally {
    isLoading.value = false
  }
}

const fetchEmployeesList = async () => {
  try {
    const res = await api.get('/api/hris/employees')
    employees.value = res.data.data || res.data || []
  } catch (e) {
    console.error(e)
  }
}

const openApplyModal = () => {
  applyForm.value = {
    employeeId: employees.value[0]?.id || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  }
  isApplyModalOpen.value = true
}

const submitLeaveApplication = async () => {
  if (!applyForm.value.employeeId || !applyForm.value.startDate || !applyForm.value.endDate || !applyForm.value.reason) {
    toast.error('Seluruh kolom formulir cuti wajib diisi')
    return
  }

  isSubmittingLeave.value = true
  try {
    await applyLeave({
      employeeId: applyForm.value.employeeId,
      startDate: new Date(applyForm.value.startDate).toISOString(),
      endDate: new Date(applyForm.value.endDate).toISOString(),
      reason: applyForm.value.reason
    })
    toast.success('Pengajuan cuti berhasil dikirim')
    isApplyModalOpen.value = false
    fetchLeavesList()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal mengajukan cuti')
  } finally {
    isSubmittingLeave.value = false
  }
}

const handleUpdateStatus = async (id: string, action: string) => {
  try {
    await updateLeaveStatus(id, { action })
    toast.success(action === 'Approve' ? 'Pengajuan cuti disetujui' : 'Pengajuan cuti ditolak')
    fetchLeavesList()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal mengubah status cuti')
  }
}

const handleDeleteLeave = async (id: string) => {
  if (!confirm('Hapus pengajuan cuti ini?')) return
  try {
    await deleteLeave(id)
    toast.success('Pengajuan cuti berhasil dihapus')
    fetchLeavesList()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menghapus pengajuan cuti')
  }
}

onMounted(() => {
  fetchLeavesList()
  fetchEmployeesList()
})

const filteredLeaves = computed(() => {
  return leaves.value.filter(l => {
    const matchesSearch = !searchQuery.value ||
      (l.employeeName && l.employeeName.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (l.employeeNik && l.employeeNik.toLowerCase().includes(searchQuery.value.toLowerCase()))

    const matchesStatus = selectedStatusFilter.value === 'ALL' ||
      (selectedStatusFilter.value === 'PENDING' && (l.status.includes('Pending') || l.status === 'Draft')) ||
      (selectedStatusFilter.value === 'APPROVED' && l.status === 'Approved') ||
      (selectedStatusFilter.value === 'REJECTED' && l.status === 'Rejected')

    return matchesSearch && matchesStatus
  })
})

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Draft': return 'secondary'
    case 'PendingManagerApproval': return 'outline'
    case 'PendingHrApproval': return 'default'
    case 'Approved': return 'default'
    case 'Rejected': return 'destructive'
    default: return 'outline'
  }
}
</script>

<template>
  <div class="h-full space-y-6 max-w-[1400px]">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Pengajuan & Persetujuan Cuti</h1>
        <p class="text-sm text-muted-foreground mt-1 font-medium">Kelola permohonan waktu istirahat, izin, dan alur approval pegawai.</p>
      </div>
      <Button v-permission="'hris.leaves.write'" class="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2" @click="openApplyModal">
        <Plus class="w-4 h-4" />
        Ajukan Cuti Pegawai
      </Button>
    </div>

    <!-- Apply Leave Modal -->
    <Dialog v-model:open="isApplyModalOpen">
      <DialogContent class="sm:max-w-[460px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground">Formulir Pengajuan Cuti</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">
            Masukkan data pegawai dan rentang tanggal cuti yang diajukan.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="submitLeaveApplication" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pilih Pegawai <span class="text-destructive">*</span></Label>
            <Select v-model="applyForm.employeeId">
              <SelectTrigger class="bg-muted/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Pilih Pegawai" />
              </SelectTrigger>
              <SelectContent class="rounded-xl border-border/60 shadow-lg bg-popover text-popover-foreground max-h-56">
                <SelectItem v-for="emp in employees" :key="emp.id" :value="emp.id" class="cursor-pointer text-xs">
                  {{ emp.fullName }} ({{ emp.employeeNumber }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tanggal Mulai <span class="text-destructive">*</span></Label>
              <Input type="date" v-model="applyForm.startDate" class="bg-muted/50 border-border/50 rounded-xl" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tanggal Selesai <span class="text-destructive">*</span></Label>
              <Input type="date" v-model="applyForm.endDate" class="bg-muted/50 border-border/50 rounded-xl" />
            </div>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Alasan Cuti / Keperluan <span class="text-destructive">*</span></Label>
            <Input v-model="applyForm.reason" placeholder="Contoh: Keperluan keluarga, istirahat tahunan" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>

          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isApplyModalOpen = false" class="rounded-xl font-bold text-xs h-10">Batal</Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6 shadow-sm" :disabled="isSubmittingLeave">
              {{ isSubmittingLeave ? 'Mengirim...' : 'Kirim Pengajuan' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <div class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
      <!-- Filter Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative w-full max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Cari NIK atau Nama Pegawai..." class="pl-9 bg-muted/50 border-border/50 rounded-xl" />
        </div>

        <div class="flex items-center gap-1.5 bg-muted/50 p-1 rounded-2xl border border-border/50">
          <Button
            size="sm"
            variant="ghost"
            class="rounded-xl text-xs font-bold h-8 px-3"
            :class="selectedStatusFilter === 'ALL' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'"
            @click="selectedStatusFilter = 'ALL'"
          >
            Semua
          </Button>
          <Button
            size="sm"
            variant="ghost"
            class="rounded-xl text-xs font-bold h-8 px-3"
            :class="selectedStatusFilter === 'PENDING' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'"
            @click="selectedStatusFilter = 'PENDING'"
          >
            Menunggu Approval
          </Button>
          <Button
            size="sm"
            variant="ghost"
            class="rounded-xl text-xs font-bold h-8 px-3"
            :class="selectedStatusFilter === 'APPROVED' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'"
            @click="selectedStatusFilter = 'APPROVED'"
          >
            Disetujui
          </Button>
          <Button
            size="sm"
            variant="ghost"
            class="rounded-xl text-xs font-bold h-8 px-3"
            :class="selectedStatusFilter === 'REJECTED' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'"
            @click="selectedStatusFilter = 'REJECTED'"
          >
            Ditolak
          </Button>
        </div>
      </div>

      <div class="rounded-2xl overflow-hidden border border-border/50">
        <Table>
          <TableHeader class="bg-muted/30 border-b border-border/50">
            <TableRow>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Pegawai</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Rentang Tanggal</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Alasan Cuti</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Status</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right px-6 py-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="5" class="h-24 text-center text-muted-foreground font-medium text-sm">Memuat data pengajuan cuti...</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="leave in filteredLeaves" :key="leave.id" class="hover:bg-accent/50 transition-colors">
                <TableCell class="px-6 py-4">
                  <p class="font-bold text-foreground text-sm">{{ leave.employeeName }}</p>
                  <p class="text-xs text-muted-foreground font-mono">{{ leave.employeeNik }}</p>
                </TableCell>
                <TableCell class="text-muted-foreground text-xs font-semibold px-6 py-4">
                   {{ leave.startDate }} <span class="text-muted-foreground mx-1">s/d</span> {{ leave.endDate }}
                </TableCell>
                <TableCell class="text-muted-foreground text-xs px-6 py-4 max-w-[220px] truncate">{{ leave.reason }}</TableCell>
                <TableCell class="px-6 py-4">
                  <Badge :variant="getStatusBadge(leave.status)" class="text-[10px] font-bold">
                    {{ leave.status.replace('PendingManagerApproval', 'Menunggu Approval').replace('PendingHrApproval', 'Menunggu HR').replace('Approved', 'Disetujui').replace('Rejected', 'Ditolak') }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right px-6 py-4">
                  <div class="flex items-center justify-end gap-1">
                    <Button
                      v-if="leave.status.includes('Pending') || leave.status === 'Draft'"
                      size="sm"
                      variant="outline"
                      class="h-8 text-xs font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl"
                      @click="handleUpdateStatus(leave.id, 'Approve')"
                    >
                      <CheckCircle2 class="w-3.5 h-3.5 mr-1" />
                      Setujui
                    </Button>
                    <Button
                      v-if="leave.status.includes('Pending') || leave.status === 'Draft'"
                      size="sm"
                      variant="outline"
                      class="h-8 text-xs font-bold text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl"
                      @click="handleUpdateStatus(leave.id, 'Reject')"
                    >
                      <XCircle class="w-3.5 h-3.5 mr-1" />
                      Tolak
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      class="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-xl"
                      @click="handleDeleteLeave(leave.id)"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="filteredLeaves.length === 0">
                <TableCell colspan="5" class="h-24 text-center text-muted-foreground font-medium text-sm">Tidak ada pengajuan cuti yang ditemukan.</TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>