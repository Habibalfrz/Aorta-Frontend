<script setup lang="ts">
import { computed } from 'vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Mail, Calendar, User, Building2, Briefcase, Award, ShieldCheck } from 'lucide-vue-next'

const props = defineProps<{
  employeeId: string
  employeeData?: any
  hideEditButton?: boolean
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
    <div class="bg-card border-none shadow-none rounded-sm">
      <div class="p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h3 class="text-xl font-bold text-foreground tracking-tight">Informasi Personal</h3>
          <p class="text-sm text-muted-foreground mt-1">Data demografi dan profil kepegawaian</p>
        </div>
        <Button v-if="!props.hideEditButton" variant="outline" size="sm" class="rounded-sm font-bold text-xs h-9 gap-1.5" @click="emit('edit')">
          <Edit2 class="w-3.5 h-3.5" />
          Edit Profil
        </Button>
      </div>

      <div class="px-6 sm:px-8 pb-8">
        <div v-if="!info" class="space-y-8">
          <div v-for="section in 2" :key="section" class="space-y-4">
            <Skeleton class="h-4 w-40 bg-muted mb-6" />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div class="space-y-2" v-for="i in 4" :key="i">
                <Skeleton class="h-3 w-28 bg-muted" />
                <Skeleton class="h-5 w-48 bg-muted" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-12">
          <!-- Section 1: Identitas -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 pb-2 border-b border-border/40">Identitas & Kontak</h4>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <dt class="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <User class="w-3.5 h-3.5 text-primary" /> Nomor Induk Kependudukan
                </dt>
                <dd class="text-sm text-foreground font-mono font-medium">{{ info.identityNumber || '-' }}</dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <User class="w-3.5 h-3.5 text-primary" /> NIP (Nomor Pegawai)
                </dt>
                <dd class="text-sm text-foreground font-mono font-bold">{{ info.employeeNumber }}</dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <User class="w-3.5 h-3.5 text-primary" /> Nama Lengkap
                </dt>
                <dd class="text-base text-foreground font-semibold">{{ info.fullName }}</dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Mail class="w-3.5 h-3.5 text-primary" /> Email Akun
                </dt>
                <dd class="text-sm text-foreground font-mono">{{ info.email || '-' }}</dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold text-muted-foreground mb-1.5">Jenis Kelamin</dt>
                <dd class="text-sm text-foreground">{{ info.gender === 'L' ? 'Laki-laki' : (info.gender === 'P' ? 'Perempuan' : info.gender) }}</dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Calendar class="w-3.5 h-3.5 text-primary" /> Tanggal Lahir (Usia)
                </dt>
                <dd class="text-sm text-foreground">
                  {{ info.dateOfBirth ? new Date(info.dateOfBirth).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
                  <span class="text-muted-foreground text-xs ml-1 font-medium">({{ getAge(info.dateOfBirth) }})</span>
                </dd>
              </div>
            </dl>
          </div>

          <!-- Section 2: Kepegawaian -->
          <div>
            <h4 class="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 pb-2 border-b border-border/40">Status & Penempatan</h4>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <dt class="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                  <ShieldCheck class="w-3.5 h-3.5 text-primary" /> Status Kepegawaian
                </dt>
                <dd><Badge variant="outline" class="text-[10px] font-bold uppercase tracking-wider bg-background">{{ info.status || 'Aktif' }}</Badge></dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Award class="w-3.5 h-3.5 text-primary" /> Kategori Profesi
                </dt>
                <dd class="text-sm text-foreground font-medium">{{ info.professionCategory || 'Staff' }}</dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Building2 class="w-3.5 h-3.5 text-primary" /> Departemen / Divisi
                </dt>
                <dd class="text-sm text-foreground font-semibold">{{ info.department || 'Belum diatur' }}</dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Briefcase class="w-3.5 h-3.5 text-primary" /> Posisi Jabatan
                </dt>
                <dd class="text-sm text-foreground font-semibold">{{ info.position || 'Belum diatur' }}</dd>
              </div>
              <div>
                <dt class="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Calendar class="w-3.5 h-3.5 text-primary" /> Tanggal Bergabung
                </dt>
                <dd class="text-sm text-foreground">
                  {{ info.joinDate ? new Date(info.joinDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
