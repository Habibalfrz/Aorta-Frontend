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
    <DialogContent class="sm:max-w-[425px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
      <DialogHeader>
        <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Tambah Pegawai Baru</DialogTitle>
        <DialogDescription class="text-xs font-medium text-muted-foreground">
          Masukkan data informasi dasar pegawai. Klik simpan ketika selesai.
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="onSubmit" class="space-y-4 py-4">
        <div v-if="form.errors.value._global" class="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm mb-4 font-semibold">
          {{ form.errors.value._global }}
        </div>

        <div class="space-y-2">
          <Label for="employeeNumber" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nomor Induk Kepegawaian (NIK) <span class="text-destructive">*</span></Label>
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
            <SelectContent class="rounded-xl border-border/60 shadow-lg bg-popover text-popover-foreground">
              <SelectItem value="L" class="rounded-lg cursor-pointer text-xs font-medium">Laki-laki</SelectItem>
              <SelectItem value="P" class="rounded-lg cursor-pointer text-xs font-medium">Perempuan</SelectItem>
            </SelectContent>
          </Select>
          <p v-if="form.errors.value.gender" class="text-xs font-bold text-destructive">{{ form.errors.value.gender }}</p>
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
