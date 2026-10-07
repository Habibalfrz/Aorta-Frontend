<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Clock, Plus, Edit2, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'vue-sonner'
import { getShifts, createShift, updateShift, deleteShift, getDepartments } from '@/api/hris'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup
} from '@/components/ui/select'

const shifts = ref<any[]>([])
const departments = ref<any[]>([])
const isLoading = ref(true)
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)

const shiftForm = ref<{
  id?: string
  code: string
  name: string
  startTime: string
  endTime: string
  toleranceMinutes: number
  departmentId?: string
  isOffDay: boolean
  isFlexible: boolean
}>({
  code: '',
  name: '',
  startTime: '08:00',
  endTime: '17:00',
  toleranceMinutes: 15,
  departmentId: 'GLOBAL',
  isOffDay: false,
  isFlexible: false
})

const fetchShiftsList = async () => {
  isLoading.value = true
  try {
    const [shiftsData, deptsData] = await Promise.all([
      getShifts(),
      getDepartments()
    ])
    shifts.value = shiftsData
    departments.value = deptsData
  } catch (error) {
    console.error('Failed to fetch master data:', error)
    toast.error('Gagal mengambil data')
  } finally {
    isLoading.value = false
  }
}

const openAddModal = () => {
  isEditing.value = false
  shiftForm.value = {
    code: '',
    name: '',
    startTime: '08:00',
    endTime: '17:00',
    toleranceMinutes: 15,
    departmentId: 'GLOBAL',
    isOffDay: false,
    isFlexible: false
  }
  isModalOpen.value = true
}

const openEditModal = (shift: any) => {
  isEditing.value = true
  shiftForm.value = {
    id: shift.id,
    code: shift.code,
    name: shift.name,
    startTime: typeof shift.startTime === 'string' ? shift.startTime.substring(0, 5) : '08:00',
    endTime: typeof shift.endTime === 'string' ? shift.endTime.substring(0, 5) : '17:00',
    toleranceMinutes: shift.toleranceMinutes || 15,
    departmentId: shift.departmentId || 'GLOBAL',
    isOffDay: shift.isOffDay || false,
    isFlexible: shift.isFlexible || false
  }
  isModalOpen.value = true
}

const saveShift = async () => {
  if (!shiftForm.value.code || !shiftForm.value.name) {
    toast.error('Kode dan Nama Shift wajib diisi')
    return
  }

  isSubmitting.value = true
  try {
    const formattedStartTime = shiftForm.value.startTime.length === 5 ? `${shiftForm.value.startTime}:00` : shiftForm.value.startTime
    const formattedEndTime = shiftForm.value.endTime.length === 5 ? `${shiftForm.value.endTime}:00` : shiftForm.value.endTime

    const payload = {
      code: shiftForm.value.code,
      name: shiftForm.value.name,
      startTime: (shiftForm.value.isOffDay || shiftForm.value.isFlexible) ? '00:00:00' : formattedStartTime,
      endTime: (shiftForm.value.isOffDay || shiftForm.value.isFlexible) ? '00:00:00' : formattedEndTime,
      toleranceMinutes: (shiftForm.value.isOffDay || shiftForm.value.isFlexible) ? 0 : Number(shiftForm.value.toleranceMinutes),
      departmentId: shiftForm.value.departmentId === 'GLOBAL' ? undefined : shiftForm.value.departmentId,
      isOffDay: shiftForm.value.isOffDay,
      isFlexible: shiftForm.value.isFlexible
    }

    if (isEditing.value && shiftForm.value.id) {
      await updateShift(shiftForm.value.id, payload)
      toast.success('Shift berhasil diperbarui')
    } else {
      await createShift(payload)
      toast.success('Shift berhasil ditambahkan')
    }
    isModalOpen.value = false
    fetchShiftsList()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menyimpan shift')
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteShift = async (shift: any) => {
  if (!confirm(`Hapus master shift ${shift.name}?`)) return
  try {
    await deleteShift(shift.id)
    toast.success('Shift berhasil dihapus')
    fetchShiftsList()
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menghapus shift')
  }
}

onMounted(() => {
  fetchShiftsList()
})
</script>

<template>
  <div class="h-full space-y-6 max-w-[1400px]">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Manajemen Shift</h1>
        <p class="text-sm text-muted-foreground mt-1 font-medium">Kelola master data jadwal kerja operasional dan toleransi waktu pegawai.</p>
      </div>
      <Button v-permission="'hris.shifts.write'" class="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 font-bold text-xs rounded-xl shadow-sm flex items-center gap-2" @click="openAddModal">
        <Plus class="w-4 h-4" />
        Tambah Shift
      </Button>
    </div>

    <!-- Create/Edit Shift Modal -->
    <Dialog v-model:open="isModalOpen">
      <DialogContent class="sm:max-w-[425px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">{{ isEditing ? 'Edit Shift' : 'Buat Shift Baru' }}</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground">
            Masukkan detail master jam kerja.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kode Shift</Label>
            <Input v-model="shiftForm.code" placeholder="PAGI" class="bg-muted/50 border-border/50 rounded-xl uppercase" />
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Deskriptif</Label>
            <Input v-model="shiftForm.name" placeholder="Shift Pagi Reguler" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>

          <div class="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
            <div>
              <p class="text-sm font-bold text-foreground">Shift Libur (Off-Day)</p>
              <p class="text-[10px] text-muted-foreground mt-0.5">Pegawai tidak akan denda Alpha jika absen.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="shiftForm.isOffDay" class="sr-only peer">
              <div class="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div class="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
            <div>
              <p class="text-sm font-bold text-foreground">Shift On-Call (Fleksibel)</p>
              <p class="text-[10px] text-muted-foreground mt-0.5">Abaikan jadwal, jam masuk bebas tanpa denda Telat.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="shiftForm.isFlexible" class="sr-only peer" :disabled="shiftForm.isOffDay">
              <div class="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div class="grid grid-cols-2 gap-4" v-if="!shiftForm.isOffDay && !shiftForm.isFlexible">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jam Masuk</Label>
              <Input type="time" v-model="shiftForm.startTime" class="bg-muted/50 border-border/50 rounded-xl" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jam Pulang</Label>
              <Input type="time" v-model="shiftForm.endTime" class="bg-muted/50 border-border/50 rounded-xl" />
            </div>
          </div>
          <div class="space-y-2" v-if="!shiftForm.isOffDay && !shiftForm.isFlexible">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Toleransi Keterlambatan (Menit)</Label>
            <Input type="number" v-model="shiftForm.toleranceMinutes" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Departemen (Opsional)</Label>
            <Select v-model="shiftForm.departmentId">
              <SelectTrigger class="bg-muted/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Global (Semua Departemen)" />
              </SelectTrigger>
              <SelectContent class="rounded-xl shadow-xl z-50">
                <SelectGroup>
                  <SelectItem value="GLOBAL" class="text-xs text-muted-foreground">Global (Semua Departemen)</SelectItem>
                  <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id" class="text-xs font-bold">
                    {{ dept.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" @click="isModalOpen = false" class="rounded-xl font-bold text-xs h-10">Batal</Button>
          <Button @click="saveShift" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6 shadow-sm" :disabled="isSubmitting">
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Shift' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden p-6">
      <div class="rounded-2xl overflow-hidden border border-border/50">
        <Table>
          <TableHeader class="bg-muted/30 border-b border-border/50">
            <TableRow>
              <TableHead class="w-[140px] font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Kode Shift</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Nama</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Departemen</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Jam Masuk</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Jam Pulang</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-center px-6 py-4">Toleransi</TableHead>
              <TableHead class="w-[100px] text-right font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="7" class="h-24 text-center text-muted-foreground font-medium text-sm">Memuat master shift...</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="shift in shifts" :key="shift.id" class="hover:bg-accent/50 transition-colors">
                <TableCell class="font-mono text-sm font-bold text-muted-foreground px-6 py-4">{{ shift.code }}</TableCell>
                <TableCell class="font-bold text-foreground text-sm px-6 py-4">{{ shift.name }}</TableCell>
                <TableCell class="text-xs font-semibold px-6 py-4">
                  <span v-if="shift.departmentId" class="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-md">{{ departments.find(d => d.id === shift.departmentId)?.name || 'Unknown' }}</span>
                  <span v-else class="text-muted-foreground italic">Global</span>
                </TableCell>
                <TableCell class="text-muted-foreground text-xs font-semibold px-6 py-4">
                  <span v-if="shift.isOffDay" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-wider">OFF DAY</span>
                  <span v-else-if="shift.isFlexible" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[10px] uppercase font-bold tracking-wider">FLEXIBLE</span>
                  <span v-else class="inline-flex items-center gap-1.5"><Clock class="w-3.5 h-3.5 text-emerald-500" /> {{ shift.startTime }}</span>
                </TableCell>
                <TableCell class="text-muted-foreground text-xs font-semibold px-6 py-4">
                  <span v-if="shift.isOffDay || shift.isFlexible">-</span>
                  <span v-else class="inline-flex items-center gap-1.5"><Clock class="w-3.5 h-3.5 text-amber-500" /> {{ shift.endTime }}</span>
                </TableCell>
                <TableCell class="text-muted-foreground text-xs font-semibold text-center px-6 py-4">{{ shift.toleranceMinutes }} mnt</TableCell>
                <TableCell class="text-right px-6 py-4">
                  <div class="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0" @click="openEditModal(shift)">
                      <Edit2 class="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" class="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" @click="handleDeleteShift(shift)">
                      <Trash2 class="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="shifts.length === 0">
                <TableCell colspan="7" class="h-24 text-center text-muted-foreground font-medium text-sm">Belum ada master shift terdaftar.</TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>