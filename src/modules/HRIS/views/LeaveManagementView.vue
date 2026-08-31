<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { CalendarDays, Search, CheckCircle2, XCircle, MoreHorizontal } from 'lucide-vue-next'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const leaves = ref<any[]>([])
const isLoading = ref(true)
const searchQuery = ref('')

const fetchLeaves = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/hris/leaves')
    leaves.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch leaves:', error)
    toast.error('Gagal mengambil data pengajuan cuti')
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async (id: string, action: string) => {
  try {
    await api.put(`/api/hris/leaves/${id}/status`, { leaveId: id, statusAction: action })
    toast.success('Status cuti berhasil diperbarui')
    fetchLeaves()
  } catch (error) {
    console.error('Failed to update leave status:', error)
    toast.error('Gagal mengubah status cuti')
  }
}

onMounted(() => {
  fetchLeaves()
})

const filteredLeaves = computed(() => {
  if (!searchQuery.value) return leaves.value
  const q = searchQuery.value.toLowerCase()
  return leaves.value.filter(l =>
    l.employeeName.toLowerCase().includes(q) ||
    l.employeeNik.toLowerCase().includes(q)
  )
})

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Draft': return 'secondary'
    case 'PendingManagerApproval': return 'outline'
    case 'PendingHrApproval': return 'default'
    case 'Approved': return 'default'
    case 'Rejected': return 'destructive'
    default: return 'outline'
  }
}
</script>

<template>
  <div class="h-full">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Pengajuan Cuti</h1>
        <p class="text-sm text-muted-foreground">Kelola persetujuan dan riwayat cuti pegawai.</p>
      </div>
      <Button variant="outline" @click="fetchLeaves">
        <CalendarDays class="w-4 h-4 mr-2" />
        Refresh Data
      </Button>
    </div>

    <Card class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm">
      <div class="p-4 border-b border-border/50 flex items-center justify-between gap-4 bg-muted/20 rounded-t-3xl">
        <div class="flex items-center gap-2 flex-1">
          <div class="relative w-full max-w-sm">
            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input v-model="searchQuery" placeholder="Cari Pegawai..." class="pl-9 bg-muted/50 border-border/50 rounded-xl" />
          </div>
        </div>
      </div>

      <div class="rounded-b-3xl overflow-hidden bg-transparent">
        <Table>
          <TableHeader class="bg-muted/30 border-b border-border/50">
            <TableRow>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Tanggal Pengajuan</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Pegawai</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Mulai - Selesai</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] w-[200px]">Alasan</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right">Opsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="isLoading">
              <TableCell colspan="6" class="h-24 text-center text-muted-foreground">Memuat data cuti...</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="leave in filteredLeaves" :key="leave.id" class="hover:bg-accent/50 transition-colors">
                <!-- Fallback since created_at might not be in endpoint yet -->
                <TableCell class="font-medium text-muted-foreground text-xs">{{ leave.startDate }}</TableCell>
                <TableCell>
                  <p class="font-bold text-foreground text-sm">{{ leave.employeeName }}</p>
                  <p class="text-xs text-muted-foreground font-mono">{{ leave.employeeNik }}</p>
                </TableCell>
                <TableCell class="text-muted-foreground text-sm font-semibold">
                   {{ leave.startDate }} <span class="text-muted-foreground mx-1">s/d</span> {{ leave.endDate }}
                </TableCell>
                <TableCell class="text-muted-foreground text-xs truncate max-w-[200px]">{{ leave.reason }}</TableCell>
                <TableCell>
                  <Badge :variant="getStatusBadge(leave.status)" class="text-[10px] font-bold">{{ leave.status.replace('PendingManagerApproval', 'Menunggu Manager').replace('PendingHrApproval', 'Menunggu HR').replace('Approved', 'Disetujui').replace('Rejected', 'Ditolak') }}</Badge>
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" class="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-48 rounded-xl border-border/60 shadow-lg p-1 bg-popover text-popover-foreground">
                      <DropdownMenuLabel class="text-xs">Tindakan</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="updateStatus(leave.id, 'ApproveHr')" class="rounded-lg cursor-pointer text-xs font-medium hover:bg-accent focus:bg-accent text-emerald-600">
                        <CheckCircle2 class="w-4 h-4 mr-2" /> Setujui Cuti (HR)
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="updateStatus(leave.id, 'Reject')" class="rounded-lg cursor-pointer text-xs font-medium hover:bg-destructive/10 focus:bg-destructive/10 text-destructive">
                        <XCircle class="w-4 h-4 mr-2" /> Tolak Cuti
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow v-if="filteredLeaves.length === 0">
                <TableCell colspan="6" class="h-24 text-center text-muted-foreground">Tidak ada pengajuan cuti yang ditemukan.</TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </Card>
  </div>
</template>