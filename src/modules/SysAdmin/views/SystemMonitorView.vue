<script setup lang="ts">
import { useRouter } from 'vue-router'
import SysAdminLayout from '@/layouts/SysAdminLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cpu, MemoryStick, Activity, Users, Ticket, Package } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <SysAdminLayout>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900 tracking-tight">The Gateway</h1>
      <p class="text-sm text-slate-500 mt-1">Superadmin Portal & System Monitoring</p>
    </div>

    <!-- System Health Scaffolding -->
    <div class="mb-10">
      <h2 class="text-lg font-semibold text-slate-800 mb-4">System Health</h2>
      <div class="grid gap-4 grid-cols-1 md:grid-cols-3">
        <!-- CPU Usage -->
        <Card class="border-slate-200 shadow-sm">
          <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle class="text-sm font-medium text-slate-600">CPU Usage</CardTitle>
            <Cpu class="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-slate-900">12%</div>
            <p class="text-xs text-slate-500 mt-1">Normal capacity</p>
          </CardContent>
        </Card>

        <!-- Memory Usage -->
        <Card class="border-slate-200 shadow-sm">
          <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle class="text-sm font-medium text-slate-600">Memory</CardTitle>
            <MemoryStick class="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-slate-900">1.2 GB</div>
            <p class="text-xs text-slate-500 mt-1">Stable allocation</p>
          </CardContent>
        </Card>

        <!-- DB Latency -->
        <Card class="border-slate-200 shadow-sm">
          <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle class="text-sm font-medium text-slate-600">DB Latency</CardTitle>
            <Activity class="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-slate-900">14ms</div>
            <p class="text-xs text-slate-500 mt-1">Optimal response time</p>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- App Cards Gateway -->
    <div>
      <h2 class="text-lg font-semibold text-slate-800 mb-4">Modul Terpasang</h2>
      <div class="grid gap-4 grid-cols-1 md:grid-cols-3">
        <!-- HRIS Module -->
        <Card
          class="border-slate-200 shadow-sm hover:bg-slate-100 hover:border-slate-300 cursor-pointer transition-colors group"
          @click="router.push('/hris')"
        >
          <CardHeader>
            <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-2 group-hover:bg-indigo-200 transition-colors">
              <Users class="w-5 h-5 text-indigo-600" />
            </div>
            <CardTitle class="text-base text-slate-900 group-hover:text-indigo-700 transition-colors">Modul HRIS</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-slate-500">Kelola Pegawai, Kehadiran & Payroll</p>
          </CardContent>
        </Card>

        <!-- Ticketing Module -->
        <Card class="border-slate-200 shadow-sm hover:bg-slate-100 hover:border-slate-300 cursor-pointer transition-colors group">
          <CardHeader>
            <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-2 group-hover:bg-amber-200 transition-colors">
              <Ticket class="w-5 h-5 text-amber-600" />
            </div>
            <CardTitle class="text-base text-slate-900 group-hover:text-amber-700 transition-colors">Modul Ticketing</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-slate-500">Helpdesk, Laporan Insiden & SLA</p>
          </CardContent>
        </Card>

        <!-- Inventory Module -->
        <Card class="border-slate-200 shadow-sm hover:bg-slate-100 hover:border-slate-300 cursor-pointer transition-colors group">
          <CardHeader>
            <div class="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-2 group-hover:bg-emerald-200 transition-colors">
              <Package class="w-5 h-5 text-emerald-600" />
            </div>
            <CardTitle class="text-base text-slate-900 group-hover:text-emerald-700 transition-colors">Modul Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-slate-500">Manajemen Aset & Stok Barang</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </SysAdminLayout>
</template>
