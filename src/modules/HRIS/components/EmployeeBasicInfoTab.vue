<script setup lang="ts">
import { computed } from 'vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Mail, Calendar, User, Building2, Briefcase, Award, ShieldCheck } from 'lucide-vue-next'

const props = defineProps<{
  employeeId: string
  employeeData?: any
}>()

const emit = defineEmits<{
  (e: 'edit'): void
}>()

const info = computed(() => props.employeeData)

const getAge = (dob: string) => {
  if (!dob) return '-'
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return `${age} Tahun`
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-card border-none shadow-none rounded-sm overflow-hidden">
      <div class="p-6 border-b border-border/50 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold text-foreground tracking-tight">Informasi Dasar & Demografi</h3>
          <p class="text-xs text-muted-foreground">Profil identitas personal pegawai rumah sakit</p>
        </div>
        <Button variant="outline" size="sm" class="rounded-sm font-bold text-xs h-9 gap-1.5" @click="emit('edit')">
          <Edit2 class="w-3.5 h-3.5" />
          Edit Profil
        </Button>
      </div>

      <div class="p-6">
        <div v-if="!info" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2" v-for="i in 4" :key="i">
              <Skeleton class="h-4 w-28 bg-muted" />
              <Skeleton class="h-12 w-full bg-muted rounded-sm" />
            </div>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 rounded-sm bg-muted/30 border-none hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <User class="w-3 h-3 text-primary" /> Nomor Induk Kepegawaian (NIK)
              </p>
              <p class="text-base text-foreground font-mono font-bold">{{ info.employeeNumber }}</p>
            </div>

            <div class="p-4 rounded-sm bg-muted/30 border-none hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <User class="w-3 h-3 text-primary" /> Nama Lengkap
              </p>
              <p class="text-base text-foreground font-bold">{{ info.fullName }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-sm bg-muted/30 border-none hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Mail class="w-3 h-3 text-primary" /> Email Login Akun
              </p>
              <p class="text-xs font-mono font-semibold text-foreground truncate">{{ info.email || '-' }}</p>
            </div>

            <div class="p-4 rounded-sm bg-muted/30 border-none hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Jenis Kelamin</p>
              <p class="text-sm text-foreground font-bold">
                {{ info.gender === 'L' ? 'Laki-laki' : (info.gender === 'P' ? 'Perempuan' : info.gender) }}
              </p>
            </div>

            <div class="p-4 rounded-sm bg-muted/30 border-none hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Calendar class="w-3 h-3 text-primary" /> Tanggal Lahir (Usia)
              </p>
              <p class="text-sm text-foreground font-bold">
                {{ info.dateOfBirth ? new Date(info.dateOfBirth).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
                <span class="text-xs text-muted-foreground font-medium">({{ getAge(info.dateOfBirth) }})</span>
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-sm bg-muted/30 border-none hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <ShieldCheck class="w-3 h-3 text-primary" /> Status Kepegawaian
              </p>
              <Badge variant="default" class="text-[10px] font-bold uppercase tracking-wider mt-1">
                {{ info.status || 'Aktif' }}
              </Badge>
            </div>

            <div class="p-4 rounded-sm bg-muted/30 border-none hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Award class="w-3 h-3 text-primary" /> Kategori Profesi
              </p>
              <p class="text-sm text-foreground font-bold">{{ info.professionCategory || 'Staff' }}</p>
            </div>

            <div class="p-4 rounded-sm bg-muted/30 border-none hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Calendar class="w-3 h-3 text-primary" /> Tanggal Bergabung
              </p>
              <p class="text-sm text-foreground font-bold">
                {{ info.joinDate ? new Date(info.joinDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 rounded-sm bg-muted/30 border-none hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Building2 class="w-3 h-3 text-primary" /> Departemen / Divisi
              </p>
              <p class="text-sm text-foreground font-bold">{{ info.department || 'Belum diatur' }}</p>
            </div>

            <div class="p-4 rounded-sm bg-muted/30 border-none hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Briefcase class="w-3 h-3 text-primary" /> Posisi Jabatan
              </p>
              <p class="text-sm text-foreground font-bold">{{ info.position || 'Belum diatur' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 rounded-sm bg-muted/30 border-none hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <ShieldCheck class="w-3 h-3 text-primary" /> PIN / ID Mesin Fingerprint
              </p>
              <p class="text-sm text-foreground font-mono font-bold">{{ info.fingerprintPin || info.employeeNumber }}</p>
            </div>

            <div class="p-4 rounded-sm bg-muted/30 border-none hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <ShieldCheck class="w-3 h-3 text-primary" /> Nomor Kartu RFID
              </p>
              <p class="text-sm text-foreground font-mono font-bold">{{ info.cardNumber || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
