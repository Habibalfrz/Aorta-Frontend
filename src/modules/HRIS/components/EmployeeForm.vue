<script setup lang="ts">
import { z } from 'zod'
import { useForm } from '@/composables/useForm'
import { createEmployee } from '@/api/hris'
import { toast } from 'vue-sonner'

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

const form = useForm(
  z.object({
    employeeNumber: z.string().min(1, 'NIK wajib diisi'),
    fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
    dateOfBirth: z.string().min(1, 'Tanggal lahir wajib diisi').refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime()) && date < new Date()
    }, 'Tanggal lahir tidak valid atau di masa depan'),
    gender: z.enum(['L', 'P']),
  }),
  {
    employeeNumber: '',
    fullName: '',
    dateOfBirth: '',
    gender: 'L' as 'L' | 'P',
  }
)

const handleOpenChange = (val: boolean) => {
  if (!val) {
    form.clearErrors()
    // Reset form for next use
    form.data.value = {
      employeeNumber: '',
      fullName: '',
      dateOfBirth: '',
      gender: 'L'
    }
  }
  emit('update:open', val)
}

const onSubmit = async () => {
  if (!form.validate()) return

  form.isSubmitting.value = true
  try {
    const response = await createEmployee(form.data.value)

    toast.success('Pegawai berhasil ditambahkan', {
      description: `ID Pegawai: ${response.id}`,
    })

    emit('success', response.id)
    handleOpenChange(false)
  } catch (error: any) {
    // 400 ValidationProblemDetails are automatically mapped to fields
    // by useForm.ts. If it's something else, it drops to _global.
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
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Tambah Pegawai Baru</DialogTitle>
        <DialogDescription>
          Masukkan data informasi dasar pegawai. Klik simpan ketika selesai.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="onSubmit" class="space-y-4 py-4">
        <div v-if="form.errors.value._global" class="p-3 bg-red-50 text-red-600 rounded-md text-sm mb-4">
          {{ form.errors.value._global }}
        </div>

        <div class="space-y-2">
          <Label for="employeeNumber">Nomor Induk Kepegawaian (NIK) <span class="text-red-500">*</span></Label>
          <Input
            id="employeeNumber"
            v-model="form.data.value.employeeNumber"
            placeholder="Contoh: EMP-2024-001"
            :class="{ 'border-red-500': form.errors.value.employeeNumber }"
          />
          <p v-if="form.errors.value.employeeNumber" class="text-sm text-red-500">{{ form.errors.value.employeeNumber }}</p>
        </div>

        <div class="space-y-2">
          <Label for="fullName">Nama Lengkap <span class="text-red-500">*</span></Label>
          <Input
            id="fullName"
            v-model="form.data.value.fullName"
            placeholder="Nama lengkap sesuai identitas"
            :class="{ 'border-red-500': form.errors.value.fullName }"
          />
          <p v-if="form.errors.value.fullName" class="text-sm text-red-500">{{ form.errors.value.fullName }}</p>
        </div>

        <div class="space-y-2">
          <Label for="dateOfBirth">Tanggal Lahir <span class="text-red-500">*</span></Label>
          <Input
            id="dateOfBirth"
            type="date"
            v-model="form.data.value.dateOfBirth"
            :class="{ 'border-red-500': form.errors.value.dateOfBirth }"
          />
          <p v-if="form.errors.value.dateOfBirth" class="text-sm text-red-500">{{ form.errors.value.dateOfBirth }}</p>
        </div>

        <div class="space-y-2">
          <Label for="gender">Jenis Kelamin <span class="text-red-500">*</span></Label>
          <Select v-model="form.data.value.gender">
            <SelectTrigger :class="{ 'border-red-500': form.errors.value.gender }">
              <SelectValue placeholder="Pilih jenis kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="form.errors.value.gender" class="text-sm text-red-500">{{ form.errors.value.gender }}</p>
        </div>

        <DialogFooter class="pt-4">
          <Button variant="outline" type="button" @click="handleOpenChange(false)" :disabled="form.isSubmitting.value">
            Batal
          </Button>
          <Button type="submit" class="bg-indigo-600 hover:bg-indigo-700" :disabled="form.isSubmitting.value">
            {{ form.isSubmitting.value ? 'Menyimpan...' : 'Simpan Pegawai' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
