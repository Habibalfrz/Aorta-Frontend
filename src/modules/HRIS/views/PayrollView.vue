<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Banknote, CircleDollarSign, Trash2, Eye } from 'lucide-vue-next'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { getPayrolls, generatePayroll, getPayrollDetail, deletePayroll } from '@/api/hris'

const payrolls = ref<any[]>([])
const employees = ref<any[]>([])
const isLoading = ref(true)
const isModalOpen = ref(false)
const isSubmitting = ref(false)

// Slip Detail State
const isSlipOpen = ref(false)
const selectedSlip = ref<any>(null)
const isLoadingSlip = ref(false)

const newPayroll = ref({
  employeeId: '',
  periodMonth: new Date().getMonth() + 1,
  periodYear: new Date().getFullYear(),
})

const fetchPayrollsList = async () => {
  isLoading.value = true
  try {
    payrolls.value = await getPayrolls()
  } catch (error) {
    console.error('Failed to fetch payrolls:', error)
    toast.error('Gagal mengambil data riwayat payroll')
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

const openGenerateModal = () => {
  newPayroll.value = {
    employeeId: employees.value[0]?.id || '',
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
  }
  isModalOpen.value = true
}

const handleGeneratePayroll = async () => {
  if (!newPayroll.value.employeeId) {
    toast.error('Pilih pegawai untuk generate payroll')
    return
  }

  isSubmitting.value = true
  try {
    await generatePayroll({
      employeeId: newPayroll.value.employeeId,
      periodMonth: Number(newPayroll.value.periodMonth),
      periodYear: Number(newPayroll.value.periodYear)
    })
    toast.success('Payroll berhasil digenerate')
    isModalOpen.value = false
    fetchPayrollsList()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal memproses payroll')
  } finally {
    isSubmitting.value = false
  }
}

const openSlipDetail = async (id: string) => {
  isLoadingSlip.value = true
  isSlipOpen.value = true
  try {
    selectedSlip.value = await getPayrollDetail(id)
  } catch (error) {
    console.error('Failed to fetch slip detail:', error)
    toast.error('Gagal mengambil rincian slip gaji')
    isSlipOpen.value = false
  } finally {
    isLoadingSlip.value = false
  }
}

const handleDeletePayroll = async (id: string) => {
  if (!confirm('Hapus rekaman payroll ini?')) return
  try {
    await deletePayroll(id)
    toast.success('Rekaman payroll berhasil dihapus')
    fetchPayrollsList()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menghapus rekaman payroll')
  }
}

onMounted(() => {
  fetchPayrollsList()
  fetchEmployeesList()
})

const getMonthName = (month: number) => {
  const date = new Date()
  date.setMonth(month - 1)
  return date.toLocaleString('id-ID', { month: 'long' })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
}
</script>

<template>
  <div class="h-full space-y-6 max-w-[1400px]">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Sistem Penggajian (Payroll)</h1>
        <p class="text-sm text-muted-foreground mt-1 font-medium">Kalkulasi, verifikasi komponen gaji, dan distribusi slip gaji pegawai.</p>
      </div>
      <div class="flex gap-2">
        <Button v-permission="'hris.payroll.generate'" class="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2" @click="openGenerateModal">
          <Banknote class="w-4 h-4" />
          Generate Payroll Baru
        </Button>
      </div>
    </div>

    <!-- Generate Payroll Modal -->
    <Dialog v-model:open="isModalOpen">
      <DialogContent class="sm:max-w-[480px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground">Kalkulasi Payroll Periode Baru</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">
            Pilih pegawai dan periode penggajian untuk menghitung komponen gaji otomatis.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleGeneratePayroll" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pilih Pegawai <span class="text-destructive">*</span></Label>
            <Select v-model="newPayroll.employeeId">
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
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bulan (1 - 12)</Label>
              <Input type="number" min="1" max="12" v-model="newPayroll.periodMonth" class="bg-muted/50 border-border/50 rounded-xl" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tahun</Label>
              <Input type="number" v-model="newPayroll.periodYear" class="bg-muted/50 border-border/50 rounded-xl" />
            </div>
          </div>

          <div class="bg-muted/30 border border-border/50 rounded-2xl p-3 flex items-start gap-2.5">
             <CircleDollarSign class="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
             <p class="text-xs text-muted-foreground leading-relaxed">
               Sistem menghitung gaji kotor, tunjangan struktural/fungsional, dan potongan berdasarkan formula komponen payroll.
             </p>
          </div>

          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isModalOpen = false" class="rounded-xl font-bold text-xs h-10">Batal</Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6 shadow-sm" :disabled="isSubmitting">
              {{ isSubmitting ? 'Mengkalkulasi...' : 'Jalankan Proses' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Pay Slip Detail Modal -->
    <Dialog v-model:open="isSlipOpen">
      <DialogContent class="sm:max-w-[480px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground">Rincian Slip Gaji Pegawai</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">
            Detail rekapitulasi gaji bersih dan potongan periode {{ selectedSlip?.periodMonth }} / {{ selectedSlip?.periodYear }}.
          </DialogDescription>
        </DialogHeader>

        <div v-if="isLoadingSlip" class="py-12 text-center text-muted-foreground text-sm">
          Memuat rincian slip...
        </div>

        <div v-else-if="selectedSlip" class="space-y-4 py-2">
          <div class="p-4 bg-muted/40 border border-border/50 rounded-2xl space-y-1">
            <p class="text-xs text-muted-foreground font-semibold">Nama Pegawai</p>
            <p class="text-base font-bold text-foreground">{{ selectedSlip.employeeName }}</p>
            <p class="text-xs font-mono text-muted-foreground">NIK: {{ selectedSlip.employeeNik }}</p>
          </div>

          <div class="space-y-2 border border-border/50 rounded-2xl p-4">
            <div class="flex items-center justify-between text-xs py-1 border-b border-border/30">
              <span class="text-muted-foreground">Penghasilan Kotor (Gross)</span>
              <span class="font-mono font-bold text-foreground">{{ formatCurrency(selectedSlip.grossEarnings) }}</span>
            </div>
            <div class="flex items-center justify-between text-xs py-1 border-b border-border/30">
              <span class="text-muted-foreground">Total Potongan (Deductions)</span>
              <span class="font-mono font-bold text-destructive">- {{ formatCurrency(selectedSlip.totalDeductions) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm py-2 font-bold">
              <span class="text-foreground">Gaji Bersih (Take-Home Pay)</span>
              <span class="font-mono text-emerald-600 text-base">{{ formatCurrency(selectedSlip.netSalary) }}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isSlipOpen = false" class="rounded-xl font-bold text-xs h-10 px-6">Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden p-6">
      <div class="rounded-2xl overflow-hidden border border-border/50">
        <Table>
          <TableHeader class="bg-muted/30 border-b border-border/50">
            <TableRow>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Periode</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Status</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Gaji Kotor</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Potongan</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right px-6 py-4">Gaji Bersih</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right px-6 py-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="6" class="h-24 text-center text-muted-foreground font-medium text-sm">Memuat riwayat payroll...</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="payroll in payrolls" :key="payroll.id" class="hover:bg-accent/50 transition-colors">
                <TableCell class="px-6 py-4">
                  <p class="font-bold text-foreground text-sm">{{ getMonthName(payroll.periodMonth) }} {{ payroll.periodYear }}</p>
                </TableCell>
                <TableCell class="px-6 py-4">
                  <Badge variant="default" class="text-[10px] font-bold">Finalized</Badge>
                </TableCell>
                <TableCell class="font-mono text-xs font-semibold text-foreground px-6 py-4">
                  {{ formatCurrency(payroll.grossEarnings) }}
                </TableCell>
                <TableCell class="font-mono text-xs font-semibold text-destructive px-6 py-4">
                  - {{ formatCurrency(payroll.totalDeductions) }}
                </TableCell>
                <TableCell class="font-mono font-bold text-emerald-600 text-right px-6 py-4">
                  {{ formatCurrency(payroll.netSalary) }}
                </TableCell>
                <TableCell class="text-right px-6 py-4">
                  <div class="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" class="h-8 text-xs font-bold text-primary hover:bg-primary/10 rounded-xl" @click="openSlipDetail(payroll.id)">
                      <Eye class="w-3.5 h-3.5 mr-1" /> Slip Gaji
                    </Button>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-xl" @click="handleDeletePayroll(payroll.id)">
                      <Trash2 class="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="payrolls.length === 0">
                <TableCell colspan="6" class="h-24 text-center text-muted-foreground font-medium text-sm">Belum ada periode penggajian yang digenerate.</TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>