<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  employeeId: string
}>()

const isLoading = ref(true)
const basicInfo = ref<any>(null)

const fetchBasicInfo = async () => {
  isLoading.value = true
  try {
    // Simulated endpoint for basic info or just reuse the general endpoint
    const response = await api.get(`/api/hris/employees/${props.employeeId}`)
    basicInfo.value = response.data.data || response.data
  } catch (error) {
    console.error('Failed to fetch basic info:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBasicInfo()
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-card/50 backdrop-blur-md border border-border/50 shadow-sm rounded-2xl">
      <div class="p-6 border-b border-border/50">
        <h3 class="text-lg font-bold text-foreground tracking-tight">Informasi Dasar Pegawai</h3>
      </div>
      <div class="p-6">
        <div v-if="isLoading" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Skeleton class="h-4 w-24 bg-muted" />
              <Skeleton class="h-10 w-full bg-muted" />
            </div>
            <div class="space-y-2">
              <Skeleton class="h-4 w-32 bg-muted" />
              <Skeleton class="h-10 w-full bg-muted" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Skeleton class="h-4 w-20 bg-muted" />
              <Skeleton class="h-10 w-full bg-muted" />
            </div>
            <div class="space-y-2">
              <Skeleton class="h-4 w-28 bg-muted" />
              <Skeleton class="h-10 w-full bg-muted" />
            </div>
          </div>
        </div>

        <div v-else-if="basicInfo" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Nomor Induk Kepegawaian (NIK)</p>
              <p class="text-base text-foreground font-mono font-semibold">{{ basicInfo.employeeNumber }}</p>
            </div>
            <div class="p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Nama Lengkap</p>
              <p class="text-base text-foreground font-semibold">{{ basicInfo.fullName }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Jenis Kelamin</p>
              <p class="text-base text-foreground font-medium">
                {{ basicInfo.gender === 'L' ? 'Laki-laki' : (basicInfo.gender === 'P' ? 'Perempuan' : basicInfo.gender) }}
              </p>
            </div>
            <div class="p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Tanggal Lahir</p>
              <p class="text-base text-foreground font-medium">
                {{ basicInfo.dateOfBirth ? new Date(basicInfo.dateOfBirth).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status Kepegawaian</p>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mt-1"
                    :class="basicInfo.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'">
                {{ basicInfo.status || 'Aktif' }}
              </span>
            </div>
            <div class="p-4 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
              <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Tanggal Bergabung</p>
              <p class="text-base text-foreground font-medium">
                {{ basicInfo.joinDate ? new Date(basicInfo.joinDate).toLocaleDateString('id-ID') : '-' }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-muted-foreground font-medium text-sm">
          Gagal memuat data informasi dasar.
        </div>
      </div>
    </div>
  </div>
</template>
