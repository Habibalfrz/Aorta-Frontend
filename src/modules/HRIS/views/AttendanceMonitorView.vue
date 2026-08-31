<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Clock, Search, Filter } from 'lucide-vue-next'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const logs = ref<any[]>([])
const isLoading = ref(true)

const fetchLogs = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/hris/attendance/logs')
    logs.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch attendance logs:', error)
    toast.error('Gagal memuat rekap kehadiran')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchLogs()
})

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'present': return 'default'
    case 'late': return 'destructive'
    case 'early_leave': return 'secondary'
    default: return 'outline'
  }
}
</script>

<template>
  <div class="h-full">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Log Kehadiran</h1>
        <p class="text-sm text-muted-foreground">Monitor rekapitulasi data clock-in dan clock-out harian pegawai.</p>
      </div>
      <Button variant="outline" @click="fetchLogs">
        <Clock class="w-4 h-4 mr-2" />
        Refresh Data
      </Button>
    </div>

    <Card class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm">
      <div class="p-4 border-b border-border/50 flex items-center justify-between gap-4 bg-muted/20 rounded-t-3xl">
        <div class="flex items-center gap-2 flex-1">
          <div class="relative w-full max-w-sm">
            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari NIK atau Nama..." class="pl-9 bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <Button variant="outline" class="border-border/50 rounded-xl">
            <Filter class="w-4 h-4 mr-2 text-muted-foreground" />
            Hari Ini
          </Button>
        </div>
      </div>

      <div class="rounded-b-3xl overflow-hidden bg-transparent">
        <Table>
          <TableHeader class="bg-muted/30 border-b border-border/50">
            <TableRow>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Tanggal</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Pegawai</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Shift</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Clock In</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Clock Out</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="6" class="h-24 text-center text-muted-foreground">Memuat log kehadiran...</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="log in logs" :key="log.id" class="hover:bg-accent/50 transition-colors">
                <TableCell class="font-medium text-foreground">{{ log.date }}</TableCell>
                <TableCell>
                  <p class="font-bold text-foreground text-sm">{{ log.employeeName }}</p>
                  <p class="text-xs text-muted-foreground font-mono">{{ log.employeeNik }}</p>
                </TableCell>
                <TableCell class="text-muted-foreground font-medium text-sm">{{ log.shiftName }}</TableCell>
                <TableCell class="font-mono text-emerald-600 font-medium">{{ log.clockInTime }}</TableCell>
                <TableCell class="font-mono text-amber-600 font-medium">{{ log.clockOutTime }}</TableCell>
                <TableCell>
                  <Badge :variant="getStatusBadge(log.status)">{{ log.status }}</Badge>
                </TableCell>
              </TableRow>
              <TableRow v-if="logs.length === 0">
                <TableCell colspan="6" class="h-24 text-center text-muted-foreground">Tidak ada log kehadiran hari ini.</TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </Card>
  </div>
</template>