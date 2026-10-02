<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, FileCheck2, Calendar, Building, Loader2 } from 'lucide-vue-next'
import { addClinicalLicense } from '@/api/hris'
import { toast } from 'vue-sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const props = defineProps<{
  employeeId: string
  employeeData?: any
}>()

const emit = defineEmits<{
  (e: 'refetch'): void
}>()

const licenses = computed(() => props.employeeData?.clinicalLicenses || [])

// Modal State
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const licenseForm = ref({
  licenseType: 'STR',
  licenseNumber: '',
  issuedDate: new Date().toISOString().split('T')[0],
  expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
  issuedBy: 'KTKI / Dinas Kesehatan'
})

const openModal = () => {
  licenseForm.value = {
    licenseType: 'STR',
    licenseNumber: '',
    issuedDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
    issuedBy: 'KTKI / Dinas Kesehatan'
  }
  isModalOpen.value = true
}

const handleSaveLicense = async () => {
  if (!licenseForm.value.licenseType || !licenseForm.value.licenseNumber || !licenseForm.value.issuedDate || !licenseForm.value.expiryDate) {
    toast.error('Tipe, Nomor, Tanggal Terbit, dan Masa Berlaku wajib diisi')
    return
  }

  isSubmitting.value = true
  try {
    await addClinicalLicense(props.employeeId, {
      licenseType: licenseForm.value.licenseType,
      licenseNumber: licenseForm.value.licenseNumber,
      issuedDate: new Date(licenseForm.value.issuedDate).toISOString(),
      expiryDate: new Date(licenseForm.value.expiryDate).toISOString(),
      issuedBy: licenseForm.value.issuedBy || 'KTKI / Dinas Kesehatan'
    })
    toast.success('Kredensial Medis berhasil ditambahkan')
    isModalOpen.value = false
    emit('refetch')
  } catch (error: any) {
    console.error('Failed to add license:', error)
    toast.error(error.response?.data?.message || 'Gagal menambahkan kredensial lisensi')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-card border-none shadow-none rounded-sm">
      <div class="p-6 sm:p-8 pb-4 flex flex-row items-center justify-between border-b border-border/40">
        <div>
          <h3 class="text-xl font-bold tracking-tight text-foreground">Kredensial & Surat Izin Praktik (SIP/STR)</h3>
          <p class="text-sm text-muted-foreground mt-1">Legalitas kompetensi dan izin praktik klinis tenaga kesehatan.</p>
        </div>
        <Button v-permission="'hris.employees.write'" variant="outline" size="sm" class="font-bold text-xs rounded-sm h-9 gap-1.5" @click="openModal">
          <Plus class="w-3.5 h-3.5" />
          Tambah SIP / STR Baru
        </Button>
      </div>

      <div class="px-6 sm:px-8 py-8">
        <div v-if="licenses.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div v-for="cred in licenses" :key="cred.id" class="p-5 border border-border/50 rounded-sm bg-muted/20 hover:bg-muted/40 transition-all space-y-3">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-2">
                <FileCheck2 class="w-5 h-5 text-primary" />
                <h4 class="font-bold text-foreground text-sm">{{ cred.licenseType === 'STR' ? 'Surat Tanda Registrasi (STR)' : (cred.licenseType === 'SIP' ? 'Surat Izin Praktik (SIP)' : cred.licenseType) }}</h4>
              </div>
              <Badge :variant="cred.isExpired ? 'destructive' : 'default'" class="text-[10px] font-bold uppercase tracking-wider">
                {{ cred.isExpired ? 'Kedaluwarsa' : 'Aktif & Valid' }}
              </Badge>
            </div>

            <div class="space-y-2 pt-1">
              <div>
                <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Nomor Kredensial</p>
                <p class="text-sm font-mono font-bold text-foreground">{{ cred.licenseNumber }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Tanggal Terbit</p>
                  <p class="text-xs font-semibold text-foreground flex items-center gap-1">
                    <Calendar class="w-3 h-3 text-emerald-500" />
                    {{ new Date(cred.issuedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                  </p>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Masa Berlaku Hingga</p>
                  <p class="text-xs font-semibold flex items-center gap-1" :class="cred.isExpired ? 'text-destructive' : 'text-foreground'">
                    <Calendar class="w-3 h-3 text-amber-500" />
                    {{ new Date(cred.expiryDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                  </p>
                </div>
              </div>

              <div class="pt-1 border-t border-border/30 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Building class="w-3 h-3 text-muted-foreground" />
                <span>Penerbit: <strong class="text-foreground">{{ cred.issuedBy || 'Dinas Kesehatan' }}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-muted-foreground text-sm font-medium bg-muted/20 rounded-sm border border-dashed border-border/60">
          Tidak ada data kredensial atau izin praktik klinis (SIP/STR) yang terdaftar.
        </div>
      </div>
    </div>

    <!-- Modal Tambah SIP -->
    <Dialog :open="isModalOpen" @update:open="isModalOpen = $event">
      <DialogContent class="sm:max-w-[460px] bg-card border-border rounded-lg p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Tambah Kredensial SIP / STR</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground">
            Masukkan nomor legalitas izin praktik pegawai medis.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSaveLicense" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipe Kredensial Medis <span class="text-destructive">*</span></Label>
            <Select v-model="licenseForm.licenseType">
              <SelectTrigger class="bg-muted border-border rounded-sm h-10 text-sm">
                <SelectValue placeholder="Pilih Tipe Kredensial" />
              </SelectTrigger>
              <SelectContent class="rounded-sm shadow-xl z-50">
                <SelectItem value="STR" class="text-sm">STR (Surat Tanda Registrasi)</SelectItem>
                <SelectItem value="SIP" class="text-sm">SIP (Surat Izin Praktik)</SelectItem>
                <SelectItem value="SIK" class="text-sm">SIK (Surat Izin Kerja)</SelectItem>
                <SelectItem value="Lainnya" class="text-sm">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nomor Surat Izin (STR/SIP) <span class="text-destructive">*</span></Label>
            <Input
              v-model="licenseForm.licenseNumber"
              placeholder="Contoh: 503/SIP.01/DKS/2024"
              class="bg-muted border-border rounded-sm font-mono text-sm"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tanggal Terbit <span class="text-destructive">*</span></Label>
              <Input
                type="date"
                v-model="licenseForm.issuedDate"
                class="bg-muted border-border rounded-sm text-sm"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Berlaku Hingga <span class="text-destructive">*</span></Label>
              <Input
                type="date"
                v-model="licenseForm.expiryDate"
                class="bg-muted border-border rounded-sm text-sm"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Instansi Penerbit</Label>
            <Input
              v-model="licenseForm.issuedBy"
              placeholder="Dinas Kesehatan / Kemenkes"
              class="bg-muted border-border rounded-sm text-sm"
            />
          </div>

          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isModalOpen = false" :disabled="isSubmitting" class="rounded-sm font-bold text-xs h-10">
              Batal
            </Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm font-bold text-xs h-10 px-6 shadow-sm" :disabled="isSubmitting">
              <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 mr-2 animate-spin" />
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Kredensial' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
