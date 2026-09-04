<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Phone, ShieldCheck, Heart, Loader2 } from 'lucide-vue-next'
import { getEmployeeFamilies, addEmployeeFamily, deleteEmployeeFamily } from '@/api/hris'
import { toast } from 'vue-sonner'

const props = defineProps<{
  employeeId: string
}>()

const isLoading = ref(true)
const familyMembers = ref<any[]>([])
const isAddOpen = ref(false)
const isSubmitting = ref(false)

const newFamily = ref({
  name: '',
  relation: 'Pasangan (Suami/Istri)',
  gender: 'L',
  dateOfBirth: '',
  emergencyContact: true,
  phone: ''
})

const fetchFamily = async () => {
  isLoading.value = true
  try {
    const data = await getEmployeeFamilies(props.employeeId)
    familyMembers.value = data
  } catch (error) {
    console.error('Failed to fetch family members:', error)
    toast.error('Gagal memuat data keluarga')
  } finally {
    isLoading.value = false
  }
}

const handleAddFamily = async () => {
  if (!newFamily.value.name) {
    toast.error('Nama lengkap anggota keluarga wajib diisi')
    return
  }

  isSubmitting.value = true
  try {
    await addEmployeeFamily(props.employeeId, {
      name: newFamily.value.name,
      relation: newFamily.value.relation,
      gender: newFamily.value.gender,
      dateOfBirth: newFamily.value.dateOfBirth || undefined,
      emergencyContact: newFamily.value.emergencyContact,
      phone: newFamily.value.phone || undefined
    })

    toast.success('Anggota keluarga berhasil ditambahkan')
    isAddOpen.value = false
    newFamily.value = {
      name: '',
      relation: 'Pasangan (Suami/Istri)',
      gender: 'L',
      dateOfBirth: '',
      emergencyContact: true,
      phone: ''
    }
    fetchFamily()
  } catch (error: any) {
    console.error('Failed to add family member:', error)
    toast.error(error.response?.data?.message || 'Gagal menambahkan anggota keluarga')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async (familyId: string, name: string) => {
  if (!confirm(`Hapus ${name} dari daftar keluarga/kontak darurat?`)) return

  try {
    await deleteEmployeeFamily(props.employeeId, familyId)
    toast.success(`${name} berhasil dihapus`)
    fetchFamily()
  } catch (error: any) {
    console.error('Failed to delete family member:', error)
    toast.error('Gagal menghapus anggota keluarga')
  }
}

onMounted(() => {
  fetchFamily()
})
</script>

<template>
  <div class="space-y-6">
    <Card class="bg-card/50 backdrop-blur-md border-border/50 shadow-sm rounded-3xl overflow-hidden">
      <CardHeader class="p-6 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle class="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Heart class="w-5 h-5 text-rose-500" />
            Data Keluarga & Kontak Darurat
          </CardTitle>
          <p class="text-xs text-muted-foreground mt-0.5">Daftar tanggungan keluarga dan nomor darurat pegawai</p>
        </div>
        <Button class="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-3.5 font-bold text-xs rounded-xl shadow-sm gap-1.5" @click="isAddOpen = true">
          <Plus class="w-3.5 h-3.5" />
          Tambah Keluarga
        </Button>
      </CardHeader>
      <CardContent class="p-6">
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-16 w-full rounded-2xl bg-muted" v-for="i in 2" :key="i" />
        </div>

        <div v-else-if="familyMembers.length > 0" class="overflow-x-auto rounded-2xl border border-border/50">
          <table class="w-full text-sm text-left">
            <thead class="bg-muted/40 text-muted-foreground uppercase tracking-widest text-[10px] border-b border-border/50">
              <tr>
                <th class="px-5 py-3.5">Nama Lengkap</th>
                <th class="px-5 py-3.5">Hubungan</th>
                <th class="px-5 py-3.5">L/P</th>
                <th class="px-5 py-3.5">Tanggal Lahir</th>
                <th class="px-5 py-3.5">Kontak Darurat</th>
                <th class="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/30">
              <tr v-for="member in familyMembers" :key="member.id" class="hover:bg-muted/20 transition-colors">
                <td class="px-5 py-4 font-bold text-foreground">{{ member.name }}</td>
                <td class="px-5 py-4 text-xs font-semibold text-muted-foreground">
                  <Badge variant="outline" class="text-xs font-medium">{{ member.relation }}</Badge>
                </td>
                <td class="px-5 py-4 text-xs font-medium text-muted-foreground">
                  {{ member.gender === 'L' ? 'Laki-laki' : (member.gender === 'P' ? 'Perempuan' : member.gender) }}
                </td>
                <td class="px-5 py-4 text-xs font-medium text-muted-foreground">
                  {{ member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : '-' }}
                </td>
                <td class="px-5 py-4">
                  <div v-if="member.emergencyContact" class="flex flex-col gap-1">
                    <span class="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold text-xs gap-1">
                      <ShieldCheck class="w-3.5 h-3.5" />
                      Kontak Utama
                    </span>
                    <span class="text-muted-foreground text-xs font-mono font-medium flex items-center gap-1">
                      <Phone class="w-3 h-3 text-primary" /> {{ member.phone || '-' }}
                    </span>
                  </div>
                  <span v-else class="text-muted-foreground text-xs">-</span>
                </td>
                <td class="px-5 py-4 text-right">
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg" @click="handleDelete(member.id, member.name)">
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-12 text-muted-foreground">
          <Heart class="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
          <p class="font-medium text-sm">Belum ada data keluarga atau kontak darurat yang didaftarkan.</p>
        </div>
      </CardContent>
    </Card>

    <!-- Modal Tambah Anggota Keluarga -->
    <Dialog :open="isAddOpen" @update:open="isAddOpen = $event">
      <DialogContent class="sm:max-w-[480px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Tambah Data Keluarga / Kontak Darurat</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground">
            Masukkan data identitas anggota keluarga atau pihak yang dapat dihubungi saat situasi darurat.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleAddFamily" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap <span class="text-destructive">*</span></Label>
            <Input v-model="newFamily.name" placeholder="Nama anggota keluarga" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hubungan</Label>
              <Select v-model="newFamily.relation">
                <SelectTrigger class="bg-muted/50 border-border/50 rounded-xl text-xs">
                  <SelectValue placeholder="Pilih hubungan" />
                </SelectTrigger>
                <SelectContent class="rounded-xl border-border/60 shadow-lg bg-popover text-popover-foreground">
                  <SelectItem value="Pasangan (Suami/Istri)" class="text-xs">Pasangan (Suami/Istri)</SelectItem>
                  <SelectItem value="Anak" class="text-xs">Anak</SelectItem>
                  <SelectItem value="Orang Tua" class="text-xs">Orang Tua (Ayah/Ibu)</SelectItem>
                  <SelectItem value="Saudara Kandung" class="text-xs">Saudara Kandung</SelectItem>
                  <SelectItem value="Lainnya" class="text-xs">Lainnya / Kerabat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jenis Kelamin</Label>
              <Select v-model="newFamily.gender">
                <SelectTrigger class="bg-muted/50 border-border/50 rounded-xl text-xs">
                  <SelectValue placeholder="Pilih" />
                </SelectTrigger>
                <SelectContent class="rounded-xl border-border/60 shadow-lg bg-popover text-popover-foreground">
                  <SelectItem value="L" class="text-xs">Laki-laki</SelectItem>
                  <SelectItem value="P" class="text-xs">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tanggal Lahir</Label>
              <Input type="date" v-model="newFamily.dateOfBirth" class="bg-muted/50 border-border/50 rounded-xl text-xs" />
            </div>

            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nomor Telepon / HP</Label>
              <Input v-model="newFamily.phone" placeholder="08123456789" class="bg-muted/50 border-border/50 rounded-xl text-xs" />
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <input type="checkbox" id="isEmergency" v-model="newFamily.emergencyContact" class="rounded border-border text-primary focus:ring-primary h-4 w-4" />
            <label for="isEmergency" class="text-xs font-semibold text-foreground cursor-pointer">
              Tetapkan sebagai Kontak Darurat Utama (Emergency Contact)
            </label>
          </div>

          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isAddOpen = false" :disabled="isSubmitting" class="rounded-xl font-bold text-xs h-10">
              Batal
            </Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6 shadow-sm" :disabled="isSubmitting">
              <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 mr-2 animate-spin" />
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Data Keluarga' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
