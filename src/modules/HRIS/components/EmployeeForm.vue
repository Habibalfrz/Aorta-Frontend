<script setup lang="ts">
import { z } from 'zod'
import { useForm } from '@/composables/useForm'
import { createEmployee, getUnlinkedMachineUsers, linkMachineUser } from '@/api/hris'
import { toast } from 'vue-sonner'
import { onMounted, ref } from 'vue'

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

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'success', id: string): void
}>()

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

const handleOpenChange = (val: boolean) => {
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
  }
  emit('update:open', val)
}

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
    handleOpenChange(false)
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
  <Dialog :open="open" @update:open="handleOpenChange">
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
          <select v-model="selectedMachineUserId" class="w-full p-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
            <option :value="null">-- Tidak Ditautkan --</option>
            <option v-for="user in unlinkedUsers" :key="user.id" :value="user.id">
              PIN: {{ user.machinePin }} - {{ user.machineName }}
            </option>
          </select>
        </div>

        <DialogFooter class="pt-4">
          <Button variant="outline" type="button" @click="handleOpenChange(false)" :disabled="form.isSubmitting.value" class="rounded-xl font-bold text-xs h-10">
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
