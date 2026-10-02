<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Loader2, CalendarClock } from 'lucide-vue-next'

const props = defineProps<{
  employeeId: string
  contracts: any[]
  isLoadingContracts: boolean
  isReadonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'refetch'): void
}>()

// Function to calculate duration
const calculateDuration = (startDateStr: string, endDateStr?: string | null) => {
  if (!startDateStr) return ''
  const start = new Date(startDateStr)
  const end = endDateStr ? new Date(endDateStr) : new Date()
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return ''

  let months = (end.getFullYear() - start.getFullYear()) * 12
  months -= start.getMonth()
  months += end.getMonth()
  
  if (months <= 0) {
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} hari`
  }
  
  if (months >= 12) {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return `${years} tahun`
    return `${years} tahun ${remainingMonths} bln`
  }
  
  return `${months} bulan`
}

</script>

<template>
  <div class="space-y-6">
    <div class="bg-card border-none shadow-none rounded-sm">
      <div class="p-6 sm:p-8 pb-4 flex flex-row items-center justify-between border-b border-border/40">
        <div>
          <h3 class="font-bold text-lg text-foreground flex items-center gap-2">
            <ShieldCheck class="w-5 h-5 text-primary" />
            Riwayat Status Kepegawaian
          </h3>
          <p class="text-xs text-muted-foreground mt-1">Lacak histori probation, PKWT, hingga PKWTT.</p>
        </div>
      </div>

      <div class="p-6 sm:p-8">
        <div v-if="isLoadingContracts" class="flex flex-col items-center justify-center p-12 text-center">
          <Loader2 class="w-8 h-8 text-primary/40 animate-spin mb-4" />
          <p class="text-sm font-medium text-muted-foreground">Memuat riwayat kontrak...</p>
        </div>

        <div v-else-if="!contracts || contracts.length === 0" class="flex flex-col items-center justify-center p-12 text-center bg-muted/20 border border-dashed border-border/60 rounded-xl">
          <ShieldCheck class="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h4 class="text-sm font-bold text-foreground mb-1">Belum Ada Riwayat Status</h4>
          <p class="text-xs text-muted-foreground max-w-[250px]">Karyawan ini belum memiliki riwayat kontrak atau status kepegawaian yang terekam.</p>
        </div>

        <div v-else class="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/60 before:to-transparent">
          <div v-for="contract in contracts" :key="contract.id" class="relative flex items-center justify-start gap-4 py-2">

            <div :class="[
              'flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 shadow-sm relative z-10 transition-colors',
              contract.isActive ? 'bg-primary border-primary/20 text-primary-foreground' : 'bg-muted border-background text-muted-foreground'
            ]">
              <ShieldCheck class="w-4 h-4" />
            </div>

            <div class="w-full p-5 rounded-2xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/20">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-bold text-foreground text-sm uppercase tracking-wide">{{ contract.contractType }}</h4>
                    <span v-if="contract.contractNumber" class="text-xs font-mono font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded-sm">
                      {{ contract.contractNumber }}
                    </span>
                    <Badge v-if="contract.isActive" variant="default" class="bg-primary/10 text-primary hover:bg-primary/10 border-none font-bold text-[10px] px-2 py-0 h-5">Aktif</Badge>
                  </div>
                  <div class="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                    <CalendarClock class="w-3.5 h-3.5" />
                    <span>{{ contract.startDate }} &mdash; {{ contract.endDate || 'Sekarang' }}</span>
                  </div>
                </div>
                <div class="shrink-0 text-left sm:text-right">
                  <span class="inline-flex items-center px-2 py-1 rounded-md bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Durasi: {{ calculateDuration(contract.startDate, contract.endDate) }}
                  </span>
                </div>
              </div>

              <div v-if="contract.endDate && contract.isActive" class="mt-4 pt-3 border-t border-border/40 text-xs text-amber-600 dark:text-amber-500 font-medium flex items-center">
                <span class="relative flex h-2 w-2 mr-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Kontrak ini akan kedaluwarsa pada {{ contract.endDate }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
