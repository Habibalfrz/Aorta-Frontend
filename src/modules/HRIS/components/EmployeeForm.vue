<script setup lang="ts">
import { z } from 'zod'
import { useForm } from '@/composables/useForm'
import { createEmployee, getUnlinkedMachineUsers, linkMachineUser } from '@/api/hris'
import { toast } from 'vue-sonner'
import { ref, watch, computed } from 'vue'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success', id: string): void
}>()

const form = useForm(
  z.object({
    identityNumber: z.string().min(1, 'No KTP / NIK wajib diisi'),
    employeeNumber: z.string().min(1, 'NIP (Nomor Pegawai) wajib diisi'),
    fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
    dateOfBirth: z.string().min(1, 'Tanggal lahir wajib diisi').refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime()) && date < new Date()
    }, 'Tanggal lahir tidak valid atau di masa depan'),
    gender: z.enum(['L', 'P']),
    professionCategory: z.string().min(1, 'Kategori profesi wajib diisi'),
    fingerprintPin: z.string().optional(),
    initialContractType: z.string().optional(),
    initialStartDate: z.string().optional(),
  }),
  {
    identityNumber: '',
    employeeNumber: '',
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: 'L' as 'L' | 'P',
    professionCategory: 'Non-Medis',
    fingerprintPin: '',
    initialContractType: '',
    initialStartDate: ''
  }
)

const unlinkedUsers = ref<any[]>([])
const selectedMachineUserId = ref<string | null>(null)

const fetchUnlinkedUsers = async () => {
  try {
    const data = await getUnlinkedMachineUsers()
    unlinkedUsers.value = data
  } catch (error) {
    console.error('Failed to load unlinked machine users', error)
  }
}

const searchQuery = ref('')
const filteredUnlinkedUsers = computed(() => {
  if (!searchQuery.value) return unlinkedUsers.value
  const q = searchQuery.value.toLowerCase()
  return unlinkedUsers.value.filter(u =>
    (u.machineName || '').toLowerCase().includes(q) ||
    (u.machinePin || '').toLowerCase().includes(q)
  )
})

watch(() => props.open, (val) => {
  if (val) {
    fetchUnlinkedUsers()
  } else {
    form.clearErrors()
    // Reset form for next use
    form.data.value = {
      identityNumber: '',
      employeeNumber: '',
      fullName: '',
      email: '',
      dateOfBirth: '',
      gender: 'L',
      professionCategory: 'Non-Medis',
      fingerprintPin: '',
      initialContractType: '',
      initialStartDate: ''
    }
    selectedMachineUserId.value = null
    searchQuery.value = ''
  }
})

const onSubmit = async () => {
  if (!form.validate()) return

  form.isSubmitting.value = true
  try {
    // Override fingerprint pin if a machine user is selected
    if (selectedMachineUserId.value) {
      const selectedMachineUser = unlinkedUsers.value.find(u => u.id === selectedMachineUserId.value)
      if (selectedMachineUser) {
        form.data.value.fingerprintPin = selectedMachineUser.machinePin
      }
    }

    const response = await createEmployee(form.data.value)

    if (selectedMachineUserId.value) {
      await linkMachineUser(selectedMachineUserId.value, response.id)
    }

    toast.success('Pegawai berhasil ditambahkan', {
      description: `Akun user otomatis dibuat (Status: Non-Aktif)`,
    })

    emit('success', response.id)
    emit('update:open', false)
  } catch (error: any) {
    form.setApiErrors(error)

    if (form.errors.value._global) {
      toast.error('Gagal menambahkan pegawai', {
        description: form.errors.value._global,
      })
    }
  } finally {
    form.isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[460px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Tambah Pegawai Baru</DialogTitle>
        <DialogDescription class="text-xs font-medium text-muted-foreground">
          Masukkan informasi data pegawai. Akun login sistem akan otomatis dibuat dalam status <strong>Non-Aktif</strong>.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="onSubmit" class="space-y-4 py-4">
        <div v-if="form.errors.value._global" class="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm mb-4 font-semibold">
          {{ form.errors.value._global }}
        </div>

        <div class="space-y-2">
          <Label for="identityNumber" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">No. KTP / NIK Penduduk <span class="text-destructive">*</span></Label>
          <Input
            id="identityNumber"
            v-model="form.data.value.identityNumber"
            placeholder="16 digit NIK KTP"
            class="bg-muted/50 border-border/50 rounded-xl"
            :class="{ 'border-destructive focus-visible:ring-destructive': form.errors.value.identityNumber }"
          />
          <p v-if="form.errors.value.identityNumber" class="text-xs font-bold text-destructive">{{ form.errors.value.identityNumber }}</p>
        </div>

        <div class="space-y-2">
          <Label for="employeeNumber" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nomor Induk Pegawai (NIP) <span class="text-destructive">*</span></Label>
          <Input
            id="employeeNumber"
            v-model="form.data.value.employeeNumber"
            placeholder="Contoh: EMP-2024-001"
            class="bg-muted/50 border-border/50 rounded-xl"
            :class="{ 'border-destructive focus-visible:ring-destructive': form.errors.value.employeeNumber }"
          />
          <p v-if="form.errors.value.employeeNumber" class="text-xs font-bold text-destructive">{{ form.errors.value.employeeNumber }}</p>
        </div>

        <div class="space-y-2">
          <Label for="fullName" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap <span class="text-destructive">*</span></Label>
          <Input
            id="fullName"
            v-model="form.data.value.fullName"
            placeholder="Nama lengkap sesuai identitas"
            class="bg-muted/50 border-border/50 rounded-xl"
            :class="{ 'border-destructive focus-visible:ring-destructive': form.errors.value.fullName }"
          />
          <p v-if="form.errors.value.fullName" class="text-xs font-bold text-destructive">{{ form.errors.value.fullName }}</p>
        </div>

        <div class="space-y-2">
          <Label for="email" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Akun (Opsional)</Label>
          <Input
            id="email"
            type="email"
            v-model="form.data.value.email"
            placeholder="nama@aorta.id (Default: nik@aorta.id)"
            class="bg-muted/50 border-border/50 rounded-xl"
            :class="{ 'border-destructive focus-visible:ring-destructive': form.errors.value.email }"
          />
          <p v-if="form.errors.value.email" class="text-xs font-bold text-destructive">{{ form.errors.value.email }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <Label for="dateOfBirth" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tanggal Lahir <span class="text-destructive">*</span></Label>
            <Input
              id="dateOfBirth"
              type="date"
              v-model="form.data.value.dateOfBirth"
              class="bg-muted/50 border-border/50 rounded-xl"
              :class="{ 'border-destructive focus-visible:ring-destructive': form.errors.value.dateOfBirth }"
            />
            <p v-if="form.errors.value.dateOfBirth" class="text-xs font-bold text-destructive">{{ form.errors.value.dateOfBirth }}</p>
          </div>

          <div class="space-y-2">
            <Label for="gender" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jenis Kelamin <span class="text-destructive">*</span></Label>
            <Select v-model="form.data.value.gender">
              <SelectTrigger class="bg-muted/50 border-border/50 rounded-xl" :class="{ 'border-destructive focus-visible:ring-destructive': form.errors.value.gender }">
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent class="rounded-xl border-border shadow-2xl bg-white dark:bg-zinc-950 text-foreground">
                <SelectItem value="L" class="rounded-lg cursor-pointer text-xs font-medium">Laki-laki</SelectItem>
                <SelectItem value="P" class="rounded-lg cursor-pointer text-xs font-medium">Perempuan</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="form.errors.value.gender" class="text-xs font-bold text-destructive">{{ form.errors.value.gender }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="professionCategory" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategori Profesi <span class="text-destructive">*</span></Label>
          <Select v-model="form.data.value.professionCategory">
            <SelectTrigger class="bg-muted/50 border-border/50 rounded-xl" :class="{ 'border-destructive focus-visible:ring-destructive': form.errors.value.professionCategory }">
              <SelectValue placeholder="Pilih Kategori Profesi" />
            </SelectTrigger>
            <SelectContent class="rounded-xl border-border bg-white dark:bg-zinc-950 text-foreground shadow-2xl">
              <SelectItem value="Medis" class="rounded-lg cursor-pointer text-xs font-medium">Medis (Dokter)</SelectItem>
              <SelectItem value="Keperawatan" class="rounded-lg cursor-pointer text-xs font-medium">Keperawatan & Kebidanan</SelectItem>
              <SelectItem value="Penunjang Medis" class="rounded-lg cursor-pointer text-xs font-medium">Tenaga Kesehatan Lainnya (Apoteker, Lab)</SelectItem>
              <SelectItem value="Non-Kesehatan" class="rounded-lg cursor-pointer text-xs font-medium">Tenaga Non-Kesehatan (Manajemen, Umum)</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="form.errors.value.professionCategory" class="text-xs font-bold text-destructive">{{ form.errors.value.professionCategory }}</p>
        </div>

        <div class="space-y-2">
          <Label for="fingerprintPin" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">PIN / ID Mesin Fingerprint (Opsional)</Label>
          <Input
            id="fingerprintPin"
            v-model="form.data.value.fingerprintPin"
            placeholder="Contoh: 101 (Default: mengikuti NIK)"
            class="bg-muted/50 border-border/50 rounded-xl font-mono"
          />
        </div>

        <div class="mt-4 p-4 border rounded-xl bg-gray-50 dark:bg-gray-900/50">
          <Label class="block text-sm font-bold mb-2">Tautkan dengan Data Mesin (ZKTeco)</Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                type="button"
                role="combobox"
                class="w-full justify-between font-normal bg-white dark:bg-gray-800 border-border rounded-lg text-sm h-10 px-3"
                :class="!selectedMachineUserId ? 'text-muted-foreground' : ''"
              >
                {{ selectedMachineUserId
                    ? `PIN: ${unlinkedUsers.find(u => u.id === selectedMachineUserId)?.machinePin} - ${unlinkedUsers.find(u => u.id === selectedMachineUserId)?.machineName}`
                    : '-- Pilih Data Pegawai di Mesin --' }}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2 h-4 w-4 shrink-0 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-[400px] p-0 shadow-xl border border-border rounded-xl z-50 bg-white dark:bg-zinc-950 overflow-hidden">
              <div class="p-2 border-b">
                <Input
                  v-model="searchQuery"
                  placeholder="Cari nama atau PIN..."
                  class="h-9 border-none focus-visible:ring-0 shadow-none bg-muted/50 rounded-lg text-sm"
                />
              </div>
              <div class="max-h-[200px] overflow-y-auto p-1">
                <div v-if="filteredUnlinkedUsers.length === 0" class="p-4 text-center text-xs text-muted-foreground">Data tidak ditemukan.</div>

                <div
                  v-if="!searchQuery"
                  class="flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer hover:bg-muted"
                  @click="selectedMachineUserId = null"
                >
                   <span class="font-medium text-muted-foreground">-- Tidak Ditautkan --</span>
                </div>

                <div
                  v-for="user in filteredUnlinkedUsers"
                  :key="user.id"
                  class="flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer hover:bg-muted"
                  :class="{ 'bg-primary/10 text-primary font-bold': selectedMachineUserId === user.id }"
                  @click="selectedMachineUserId = user.id"
                >
                  <span class="font-mono text-xs w-12 shrink-0">PIN:{{ user.machinePin }}</span>
                  <span class="text-muted-foreground shrink-0">-</span>
                  <span class="font-medium truncate">{{ user.machineName }}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter class="pt-4">
          <Button variant="outline" type="button" @click="$emit('update:open', false)" :disabled="form.isSubmitting.value" class="rounded-xl font-bold text-xs h-10">
            Batal
          </Button>
          <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6 shadow-sm" :disabled="form.isSubmitting.value">
            {{ form.isSubmitting.value ? 'Menyimpan...' : 'Simpan Pegawai' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
