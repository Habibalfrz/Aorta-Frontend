<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Building2, Calendar, Award, Loader2 } from 'lucide-vue-next'
import { recordEmployment } from '@/api/hris'
import { toast } from 'vue-sonner'

const props = defineProps<{
  employeeId: string
  employeeData?: any
  departments?: any[]
  jobPositions?: any[]
}>()

const emit = defineEmits<{
  (e: 'refetch'): void
}>()

const employments = computed(() => props.employeeData?.employments || [])

// Record Employment Modal State
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const placementForm = ref({
  departmentId: '',
  jobPositionId: '',
  startDate: new Date().toISOString().split('T')[0]
})

const openModal = () => {
  placementForm.value = {
    departmentId: props.departments?.[0]?.id || '',
    jobPositionId: props.jobPositions?.[0]?.id || '',
    startDate: new Date().toISOString().split('T')[0]
  }
  isModalOpen.value = true
}

const handleSavePlacement = async () => {
  if (!placementForm.value.departmentId || !placementForm.value.jobPositionId || !placementForm.value.startDate) {
    toast.error('Departemen, Posisi Jabatan, dan Tanggal Mulai wajib diisi')
    return
  }

  isSubmitting.value = true
  try {
    await recordEmployment(props.employeeId, {
      departmentId: placementForm.value.departmentId,
      jobPositionId: placementForm.value.jobPositionId,
      startDate: new Date(placementForm.value.startDate).toISOString()
    })
    toast.success('Penempatan kerja baru berhasil direkam')
    isModalOpen.value = false
    emit('refetch')
  } catch (error: any) {
    console.error('Failed to record employment:', error)
    toast.error(error.response?.data?.message || 'Gagal merekam penempatan kerja')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <Card class="bg-card/50 backdrop-blur-md border-border/50 shadow-sm rounded-3xl overflow-hidden">
      <CardHeader class="p-6 pb-4 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle class="text-lg font-bold tracking-tight text-foreground">Riwayat Penempatan & Mutasi</CardTitle>
          <p class="text-xs text-muted-foreground mt-0.5">Jejak mutasi unit kerja, departemen, dan kenaikan jenjang karir.</p>
        </div>
        <Button v-permission="'hris.employees.write'" size="sm" class="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl h-9 gap-1.5 shadow-sm" @click="openModal">
          <Plus class="w-4 h-4" />
          Rekam Mutasi / Penempatan
        </Button>
      </CardHeader>

      <CardContent class="p-6">
        <div v-if="employments.length > 0" class="relative border-l-2 border-border/60 ml-4 space-y-8 pb-4">
          <div v-for="rec in employments" :key="rec.id" class="relative pl-6">
            <!-- Timeline dot -->
            <span
              class="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2"
              :class="rec.isActive ? 'bg-emerald-500 border-emerald-300 ring-4 ring-emerald-500/20' : 'bg-muted border-border'"
            ></span>

            <div class="p-4 rounded-2xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors space-y-2">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-foreground text-sm">{{ rec.positionName }}</h4>
                  <Badge v-if="rec.isActive" variant="default" class="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                    Penempatan Aktif
                  </Badge>
                  <Badge v-else variant="outline" class="text-[10px] text-muted-foreground">
                    Selesai
                  </Badge>
                </div>
                <span class="text-xs font-mono font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar class="w-3.5 h-3.5 text-primary" />
                  {{ new Date(rec.startDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric', day: 'numeric' }) }}
                  <template v-if="rec.endDate">
                    - {{ new Date(rec.endDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric', day: 'numeric' }) }}
                  </template>
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span class="flex items-center gap-1.5 font-medium">
                  <Building2 class="w-3.5 h-3.5 text-blue-500" /> {{ rec.departmentName }}
                </span>
                <span class="flex items-center gap-1.5 font-medium">
                  <Award class="w-3.5 h-3.5 text-amber-500" /> Golongan: {{ rec.gradeName || '-' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-muted-foreground text-sm font-medium">
          Belum ada riwayat penempatan kerja yang tercatat.
        </div>
      </CardContent>
    </Card>

    <!-- Modal Rekam Penempatan -->
    <Dialog :open="isModalOpen" @update:open="isModalOpen = $event">
      <DialogContent class="sm:max-w-[460px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Rekam Mutasi / Penempatan Baru</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground">
            Menugaskan pegawai pada unit kerja dan posisi jabatan baru.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleSavePlacement" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Departemen / Unit Kerja <span class="text-destructive">*</span></Label>
            <Select v-model="placementForm.departmentId">
              <SelectTrigger class="bg-muted/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Pilih Departemen" />
              </SelectTrigger>
              <SelectContent class="rounded-xl border-border/60 shadow-lg bg-popover text-popover-foreground max-h-56">
                <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id" class="text-xs">
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Posisi Jabatan <span class="text-destructive">*</span></Label>
            <Select v-model="placementForm.jobPositionId">
              <SelectTrigger class="bg-muted/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Pilih Jabatan" />
              </SelectTrigger>
              <SelectContent class="rounded-xl border-border/60 shadow-lg bg-popover text-popover-foreground max-h-56">
                <SelectItem v-for="job in jobPositions" :key="job.id" :value="job.id" class="text-xs">
                  {{ job.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tanggal Efektif Mulai <span class="text-destructive">*</span></Label>
            <Input
              type="date"
              v-model="placementForm.startDate"
              class="bg-muted/50 border-border/50 rounded-xl"
            />
          </div>

          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isModalOpen = false" :disabled="isSubmitting" class="rounded-xl font-bold text-xs h-10">
              Batal
            </Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6 shadow-sm" :disabled="isSubmitting">
              <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 mr-2 animate-spin" />
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Penempatan' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
