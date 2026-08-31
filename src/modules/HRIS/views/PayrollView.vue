<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Banknote, Plus, Download, Search, CheckCircle2, CircleDollarSign } from 'lucide-vue-next'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

const payrolls = ref<any[]>([])
const isLoading = ref(true)
const isModalOpen = ref(false)
const isSubmitting = ref(false)

const newPayroll = ref({
  periodMonth: new Date().getMonth() + 1,
  periodYear: new Date().getFullYear(),
  cutoffStartDate: '',
  cutoffEndDate: ''
})

const fetchPayrolls = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/hris/payrolls')
    payrolls.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch payrolls:', error)
    toast.error('Gagal mengambil data riwayat payroll')
  } finally {
    isLoading.value = false
  }
}

const generatePayroll = async () => {
  if (!newPayroll.value.cutoffStartDate || !newPayroll.value.cutoffEndDate) {
    toast.error('Tanggal cut-off awal dan akhir wajib diisi')
    return
  }

  isSubmitting.value = true
  try {
    await api.post('/api/hris/payrolls/generate', newPayroll.value)
    toast.success('Proses kalkulasi Payroll berhasil dimulai')
    isModalOpen.value = false
    fetchPayrolls()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal memproses payroll')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchPayrolls()
})

const getMonthName = (month: number) => {
  const date = new Date()
  date.setMonth(month - 1)
  return date.toLocaleString('id-ID', { month: 'long' })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
}

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'draft': return 'secondary'
    case 'approved': return 'default'
    case 'paid': return 'default' // Add a specific class later if you want green
    default: return 'outline'
  }
}
</script>

<template>
  <div class="h-full">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Sistem Penggajian (Payroll)</h1>
        <p class="text-sm text-muted-foreground">Kalkulasi, verifikasi, dan distribusi gaji pegawai secara periodik.</p>
      </div>
      <div class="flex gap-2">
        <Button v-permission="'hris.payroll.generate'" class="bg-primary hover:bg-primary/90 text-primary-foreground" @click="isModalOpen = true">
          <Banknote class="w-4 h-4 mr-2" />
          Kalkulasi Payroll Baru
        </Button>
      </div>
    </div>

    <!-- Generate Payroll Modal -->
    <Dialog v-model:open="isModalOpen">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Kalkulasi Payroll Periode Baru</DialogTitle>
          <DialogDescription>
            Tentukan periode dan rentang tanggal cut-off absensi untuk perhitungan komponen gaji.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Bulan</Label>
              <Input type="number" min="1" max="12" v-model="newPayroll.periodMonth" />
            </div>
            <div class="space-y-2">
              <Label>Tahun</Label>
              <Input type="number" v-model="newPayroll.periodYear" />
            </div>
          </div>
          <div class="space-y-2 pt-2">
            <Label>Rentang Cut-off Absensi</Label>
            <div class="flex items-center gap-2">
              <Input type="date" v-model="newPayroll.cutoffStartDate" />
              <span class="text-sm text-muted-foreground">s/d</span>
              <Input type="date" v-model="newPayroll.cutoffEndDate" />
            </div>
          </div>
          <div class="bg-muted/40 border border-border/50 rounded-lg p-3 flex items-start gap-2 mt-4">
             <CircleDollarSign class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
             <p class="text-xs text-muted-foreground leading-relaxed">
               Sistem akan secara otomatis menghitung gaji pokok, tunjangan, lembur, dan memotong denda keterlambatan/absen berdasarkan rentang tanggal di atas. Proses ini mungkin memakan waktu beberapa saat.
             </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isModalOpen = false">Batal</Button>
          <Button @click="generatePayroll" class="bg-primary hover:bg-primary/90 text-primary-foreground" :disabled="isSubmitting">
            {{ isSubmitting ? 'Mengkalkulasi...' : 'Jalankan Proses' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Card class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm">
      <div class="p-4 border-b border-border/50 flex items-center justify-between gap-4 bg-muted/20 rounded-t-3xl">
        <div class="relative w-full max-w-sm">
          <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground font-medium text-sm" />
          <Input placeholder="Cari periode..." class="pl-9 bg-muted/50 border-border/50 rounded-xl" />
        </div>
      </div>

      <div class="rounded-b-3xl overflow-hidden bg-transparent">
        <Table>
          <TableHeader class="bg-muted/30 border-b border-border/50">
            <TableRow>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Periode</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Rentang Cut-off</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right">Total Pencairan</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right">Opsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="5" class="h-24 text-center text-muted-foreground font-medium text-sm">Memuat riwayat payroll...</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="payroll in payrolls" :key="payroll.id" class="hover:bg-accent/50 transition-colors">
                <TableCell>
                  <p class="font-bold text-foreground text-sm">{{ getMonthName(payroll.periodMonth) }} {{ payroll.periodYear }}</p>
                </TableCell>
                <TableCell class="text-muted-foreground text-xs">
                  {{ payroll.cutoffStartDate }} <span class="mx-1 text-muted-foreground">s/d</span> {{ payroll.cutoffEndDate }}
                </TableCell>
                <TableCell>
                  <Badge :variant="getStatusBadge(payroll.status)">{{ payroll.status }}</Badge>
                </TableCell>
                <TableCell class="font-mono font-bold text-foreground text-right">
                  {{ formatCurrency(payroll.totalAmount) }}
                </TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="sm" class="text-primary hover:text-primary/80 hover:bg-primary/10">
                    <Download class="w-4 h-4 mr-2" /> Slip Gaji
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow v-if="payrolls.length === 0">
                <TableCell colspan="5" class="h-24 text-center text-muted-foreground font-medium text-sm">Belum ada periode penggajian yang digenerate.</TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </Card>
  </div>
</template>