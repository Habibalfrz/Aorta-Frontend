<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Building2, Award } from 'lucide-vue-next'

const props = defineProps<{
  employeeId: string
  employeeData?: any
  departments?: any[]
  jobPositions?: any[]
}>()

const employments = computed(() => props.employeeData?.employments || [])
</script>

<template>
  <div class="space-y-6">
    <div class="bg-card border-none shadow-none rounded-sm">
      <div class="p-6 sm:p-8 pb-4 flex flex-row items-center justify-between border-b border-border/40">
        <div>
          <h3 class="text-xl font-bold tracking-tight text-foreground">Riwayat Penempatan & Mutasi</h3>
          <p class="text-sm text-muted-foreground mt-1">Jejak mutasi unit kerja, departemen, dan kenaikan jenjang karir.</p>
        </div>
      </div>

      <div class="px-6 sm:px-8 py-8">
        <div v-if="employments.length > 0" class="relative border-l border-border/60 ml-4 space-y-12">
          <div v-for="rec in employments" :key="rec.id" class="relative pl-8">
            <!-- Timeline dot -->
            <span
              class="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full"
              :class="rec.isActive ? 'bg-primary ring-4 ring-primary/20' : 'bg-muted border border-border'"
            ></span>

            <div class="space-y-3 -mt-1.5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div class="flex items-center gap-3">
                  <h4 class="font-bold text-foreground text-base tracking-tight">{{ rec.positionName }}</h4>
                  <Badge v-if="rec.isActive" variant="outline" class="text-[10px] font-bold bg-primary/5 text-primary border-primary/20 uppercase tracking-widest px-2 py-0.5">
                    Aktif
                  </Badge>
                  <Badge v-else variant="outline" class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-0.5 bg-muted/30">
                    Selesai
                  </Badge>
                </div>
                <span class="text-xs font-mono font-medium text-muted-foreground">
                  {{ new Date(rec.startDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }}
                  <template v-if="rec.endDate">
                    &mdash; {{ new Date(rec.endDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }}
                  </template>
                  <template v-else>
                    &mdash; Sekarang
                  </template>
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span class="flex items-center gap-2 font-medium">
                  <Building2 class="w-4 h-4 text-muted-foreground/70" /> {{ rec.departmentName }}
                </span>
                <span class="flex items-center gap-2 font-medium">
                  <Award class="w-4 h-4 text-muted-foreground/70" /> Golongan: {{ rec.gradeName || '-' }}
                </span>
                <span class="flex items-center gap-2 font-medium text-foreground">
                  Gaji Pokok: Rp {{ new Intl.NumberFormat('id-ID').format(rec.basicSalary || 0) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-muted-foreground text-sm font-medium bg-muted/20 rounded-md border border-dashed border-border/60">
          Belum ada riwayat penempatan kerja yang tercatat.
        </div>
      </div>
    </div>
  </div>
</template>
