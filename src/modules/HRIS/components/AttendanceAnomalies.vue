<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  AlertTriangle, CheckCircle, Clock, Search, XCircle, Loader2, Moon
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

import { getAttendanceAnomalies, resolveAttendanceAnomaly } from '@/api/hris'

const anomalies = ref<any[]>([])
const isLoading = ref(true)

// Resolve Modal State
const isResolveOpen = ref(false)
const isResolving = ref(false)
const selectedAnomaly = ref<any>(null)

const resolveForm = ref({
  manualCheckInUtc: '',
  manualCheckOutUtc: '',
  waivePenalty: false,
  notes: ''
})

const fetchAnomalies = async () => {
  isLoading.value = true
  try {
    const data = await getAttendanceAnomalies()
    // We only want unresolved ones usually, but backend might return recently resolved
    anomalies.value = data.filter((a: any) => !a.isResolved)
  } catch (error) {
    console.error('Failed to fetch anomalies:', error)
    toast.error('Gagal memuat daftar anomali presensi')
  } finally {
    isLoading.value = false
  }
}

const openResolveModal = (anomaly: any) => {
  selectedAnomaly.value = anomaly

  // Format dates for datetime-local input if they exist
  const formatForInput = (utcStr: string) => {
    if (!utcStr) return ''
    const d = new Date(utcStr)
    // format as YYYY-MM-DDThh:mm
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
  }

  resolveForm.value = {
    manualCheckInUtc: formatForInput(anomaly.checkInUtc),
    manualCheckOutUtc: formatForInput(anomaly.checkOutUtc),
    waivePenalty: false,
    notes: ''
  }
  isResolveOpen.value = true
}

const handleResolve = async () => {
  if (!resolveForm.value.notes.trim()) {
    toast.error('Catatan/Alasan wajib diisi')
    return
  }

  isResolving.value = true
  try {
    const payload = {
      manualCheckInUtc: resolveForm.value.manualCheckInUtc ? new Date(resolveForm.value.manualCheckInUtc).toISOString() : undefined,
      manualCheckOutUtc: resolveForm.value.manualCheckOutUtc ? new Date(resolveForm.value.manualCheckOutUtc).toISOString() : undefined,
      waivePenalty: resolveForm.value.waivePenalty,
      notes: resolveForm.value.notes
    }

    await resolveAttendanceAnomaly(selectedAnomaly.value.id, payload)
    toast.success('Anomali berhasil diselesaikan')

    // Optimistic remove
    anomalies.value = anomalies.value.filter(a => a.id !== selectedAnomaly.value.id)
    isResolveOpen.value = false
  } catch (error: any) {
    console.error('Failed to resolve anomaly:', error)
    toast.error(error.response?.data?.message || 'Gagal menyelesaikan anomali')
  } finally {
    isResolving.value = false
  }
}

// Quick action: Waive with no time changes
const quickWaive = async (anomaly: any) => {
  const notes = window.prompt('Masukkan catatan dispensasi (CCTV OK, dll):')
  if (!notes) return // cancelled

  try {
    await resolveAttendanceAnomaly(anomaly.id, {
      waivePenalty: true,
      notes: notes
    })
    toast.success('Dispensasi berhasil diberikan')
    anomalies.value = anomalies.value.filter(a => a.id !== anomaly.id)
  } catch (error: any) {
    toast.error('Gagal memberikan dispensasi')
  }
}

onMounted(() => {
  fetchAnomalies()
})

</script>

<template>
  <Card class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-foreground flex items-center gap-2">
          <AlertTriangle class="w-5 h-5 text-amber-500" />
          Anomali Presensi (Manage by Exception)
        </h2>
        <p class="text-xs text-muted-foreground mt-1">Daftar presensi bermasalah (Lupa absen, telat ekstrem, alpha) yang butuh keputusan HRD.</p>
      </div>

      <Button variant="outline" class="rounded-xl font-bold text-xs h-10 gap-2 border-border/50" @click="fetchAnomalies" :disabled="isLoading">
        <Loader2 v-if="isLoading" class="w-3.5 h-3.5 animate-spin" />
        <Search v-else class="w-3.5 h-3.5" />
        Refresh
      </Button>
    </div>

    <div class="overflow-x-auto custom-scrollbar border border-border/50 rounded-2xl mt-4">
      <Table>
        <TableHeader class="bg-muted/30 border-b border-border/50">
          <TableRow>
            <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4">Tanggal</TableHead>
            <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4">Pegawai</TableHead>
            <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4">Status & Waktu</TableHead>
            <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4">Penalti Sementara</TableHead>
            <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-5 py-4 text-right">Tindakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="5" class="h-28 text-center text-muted-foreground text-sm font-medium">
              <Loader2 class="w-5 h-5 mx-auto animate-spin mb-2 text-primary" />
              Memuat anomali...
            </TableCell>
          </TableRow>
          <TableRow v-else-if="anomalies.length === 0">
            <TableCell colspan="5" class="h-28 text-center text-muted-foreground text-sm font-medium flex flex-col items-center justify-center">
              <CheckCircle class="w-8 h-8 text-emerald-500 mb-2 opacity-50" />
              Bersih! Tidak ada anomali presensi saat ini.
            </TableCell>
          </TableRow>
          <template v-else>
            <TableRow v-for="a in anomalies" :key="a.id" class="hover:bg-muted/20 transition-colors">
              <TableCell class="font-mono text-xs font-semibold text-foreground px-5 py-4">
                {{ new Date(a.date).toLocaleDateString('id-ID') }}
              </TableCell>
              <TableCell class="px-5 py-4">
                <p class="font-bold text-foreground text-sm">{{ a.employeeName }}</p>
              </TableCell>
              <TableCell class="px-5 py-4">
                <div class="flex flex-col gap-1 items-start">
                  <Badge v-if="a.status === 'MissingCheckOut'" variant="destructive" class="text-[10px] font-bold">
                    <Moon class="w-3 h-3 mr-1" /> Lupa Tap Pulang
                  </Badge>
                  <Badge v-else-if="a.status === 'Late'" class="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-bold">
                    <Clock class="w-3 h-3 mr-1" /> Telat {{ a.lateMinutes }} mnt
                  </Badge>
                  <Badge v-else-if="a.status === 'Absent'" class="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] font-bold">
                    <XCircle class="w-3 h-3 mr-1" /> Bolos / Alpha
                  </Badge>
                  <Badge v-else variant="outline" class="text-[10px]">{{ a.status }}</Badge>

                  <span class="text-[10px] text-muted-foreground font-mono mt-1">
                    IN: {{ a.checkInUtc ? new Date(a.checkInUtc).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '--:--' }}
                    | OUT: {{ a.checkOutUtc ? new Date(a.checkOutUtc).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '--:--' }}
                  </span>
                </div>
              </TableCell>
              <TableCell class="px-5 py-4 font-mono text-xs font-bold text-rose-600">
                Rp {{ Number(a.penaltyAmount).toLocaleString('id-ID') }}
              </TableCell>
              <TableCell class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <Button size="sm" variant="outline" class="h-8 text-[11px] font-bold text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" @click="quickWaive(a)">
                    Dispensasi
                  </Button>
                  <Button size="sm" variant="outline" class="h-8 text-[11px] font-bold" @click="openResolveModal(a)">
                    Koreksi Manual
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- RESOLVE DIALOG -->
    <Dialog :open="isResolveOpen" @update:open="isResolveOpen = $event">
      <DialogContent class="sm:max-w-[480px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground">Koreksi Anomali Presensi</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">
            Sesuaikan jam manual jika mesin error, atau berikan dispensasi denda.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleResolve" class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground">Jam Masuk</Label>
              <Input
                type="datetime-local"
                v-model="resolveForm.manualCheckInUtc"
                class="bg-muted/50 border-border/50 rounded-xl text-xs"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-muted-foreground">Jam Pulang</Label>
              <Input
                type="datetime-local"
                v-model="resolveForm.manualCheckOutUtc"
                class="bg-muted/50 border-border/50 rounded-xl text-xs"
              />
            </div>
          </div>

          <div class="flex items-center space-x-2 bg-amber-50/50 dark:bg-amber-950/20 p-3 border border-amber-200 dark:border-amber-900 rounded-xl mt-2">
            <Checkbox id="waive" v-model:checked="resolveForm.waivePenalty" />
            <Label for="waive" class="text-sm font-semibold cursor-pointer text-amber-700 dark:text-amber-400">
              Bebaskan Denda (Waive Penalty)
            </Label>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-muted-foreground">Catatan HRD <span class="text-destructive">*</span></Label>
            <Input
              v-model="resolveForm.notes"
              placeholder="Misal: Sudah diizinkan pulang cepat karena dinas luar"
              class="bg-muted/50 border-border/50 rounded-xl text-xs"
              required
            />
          </div>

          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isResolveOpen = false" :disabled="isResolving" class="rounded-xl font-bold text-xs h-10">
              Batal
            </Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6" :disabled="isResolving">
              <Loader2 v-if="isResolving" class="w-3.5 h-3.5 mr-2 animate-spin" />
              Simpan Resolusi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </Card>
</template>