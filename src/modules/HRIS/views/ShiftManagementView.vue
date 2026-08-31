<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Clock, Plus, MoreHorizontal } from 'lucide-vue-next'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const shifts = ref<any[]>([])
const isLoading = ref(true)
const isModalOpen = ref(false)
const isSubmitting = ref(false)

const newShift = ref({
  code: '',
  name: '',
  startTime: '08:00',
  endTime: '17:00',
  toleranceMinutes: 15
})

const fetchShifts = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/hris/shifts')
    shifts.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch shifts:', error)
    toast.error('Gagal mengambil data shift')
  } finally {
    isLoading.value = false
  }
}

const createShift = async () => {
  isSubmitting.value = true
  try {
    await api.post('/api/hris/shifts', newShift.value)
    toast.success('Shift berhasil ditambahkan')
    isModalOpen.value = false
    newShift.value = { code: '', name: '', startTime: '08:00', endTime: '17:00', toleranceMinutes: 15 }
    fetchShifts()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menambahkan shift')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchShifts()
})
</script>

<template>
  <div class="h-full">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Manajemen Shift</h1>
        <p class="text-sm text-muted-foreground">Kelola master data jadwal kerja operasional pegawai.</p>
      </div>
      <Button v-permission="'hris.shifts.write'" class="bg-primary hover:bg-primary/90 text-primary-foreground" @click="isModalOpen = true">
        <Plus class="w-4 h-4 mr-2" />
        Tambah Shift
      </Button>
    </div>

    <!-- Create Shift Modal -->
    <Dialog v-model:open="isModalOpen">
      <DialogContent class="sm:max-w-[425px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Buat Shift Baru</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground">
            Masukkan detail master jam kerja.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kode Shift</Label>
            <Input v-model="newShift.code" placeholder="PAGI" class="bg-muted/50 border-border/50 rounded-xl uppercase" />
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Deskriptif</Label>
            <Input v-model="newShift.name" placeholder="Shift Pagi Reguler" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jam Masuk</Label>
              <Input type="time" v-model="newShift.startTime" class="bg-muted/50 border-border/50 rounded-xl" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jam Pulang</Label>
              <Input type="time" v-model="newShift.endTime" class="bg-muted/50 border-border/50 rounded-xl" />
            </div>
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Toleransi Keterlambatan (Menit)</Label>
            <Input type="number" v-model="newShift.toleranceMinutes" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" @click="isModalOpen = false" class="rounded-xl font-bold text-xs h-10">Batal</Button>
          <Button @click="createShift" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6 shadow-sm" :disabled="isSubmitting">
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Shift' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Card class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm">
      <div class="rounded-3xl overflow-hidden bg-transparent">
        <Table>
          <TableHeader class="bg-muted/30 border-b border-border/50">
            <TableRow>
              <TableHead class="w-[150px] font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Kode Shift</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Nama</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Jam Masuk</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Jam Pulang</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-center">Toleransi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="5" class="h-24 text-center text-muted-foreground font-medium text-sm">Memuat master shift...</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="shift in shifts" :key="shift.id" class="hover:bg-accent/50 transition-colors">
                <TableCell class="font-mono text-sm font-bold text-muted-foreground">{{ shift.code }}</TableCell>
                <TableCell class="font-bold text-foreground text-sm">{{ shift.name }}</TableCell>
                <TableCell class="text-muted-foreground flex items-center gap-2">
                  <Clock class="w-3.5 h-3.5 text-emerald-500" /> {{ shift.startTime }}
                </TableCell>
                <TableCell class="text-muted-foreground">
                  <span class="flex items-center gap-2"><Clock class="w-3.5 h-3.5 text-amber-500" /> {{ shift.endTime }}</span>
                </TableCell>
                <TableCell class="text-muted-foreground text-center">{{ shift.toleranceMinutes }} mnt</TableCell>
              </TableRow>
              <TableRow v-if="shifts.length === 0">
                <TableCell colspan="5" class="h-24 text-center text-muted-foreground font-medium text-sm">Belum ada master shift terdaftar.</TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </Card>
  </div>
</template>