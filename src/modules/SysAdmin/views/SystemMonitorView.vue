<script setup lang="ts">
import SysAdminLayout from '@/layouts/SysAdminLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, AlertOctagon, Cpu, ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Dummy Data
const stats = [
  { 
    title: 'System Uptime', 
    value: '99.98%', 
    icon: Activity, 
    trend: '+0.01%', 
    trendUp: true, 
    desc: 'Last 30 days',
    color: 'text-emerald-500' 
  },
  { 
    title: 'Total Active Users', 
    value: '1,248', 
    icon: Users, 
    trend: '+12%', 
    trendUp: true, 
    desc: 'vs last week',
    color: 'text-blue-500' 
  },
  { 
    title: 'Error Rate 24h', 
    value: '0.12%', 
    icon: AlertOctagon, 
    trend: '-0.05%', 
    trendUp: true, // Down is good for errors
    desc: 'vs yesterday',
    color: 'text-amber-500' 
  },
  { 
    title: 'Memory Usage', 
    value: '64.2%', 
    icon: Cpu, 
    trend: '+4.1%', 
    trendUp: false, 
    desc: 'Average cluster load',
    color: 'text-purple-500' 
  },
]

const recentErrors = [
  { id: 'ERR-091', time: '2026-08-22 14:32:11', module: 'AuthService', message: 'Failed to connect to Redis cache during token validation', status: 'Unresolved' },
  { id: 'ERR-090', time: '2026-08-22 13:15:42', module: 'HRIS_API', message: 'Timeout waiting for response from legacy payroll DB', status: 'Investigating' },
  { id: 'ERR-089', time: '2026-08-22 11:05:01', module: 'NotificationWorker', message: 'SMTP server rejected connection (Rate limited)', status: 'Resolved' },
  { id: 'ERR-088', time: '2026-08-22 09:45:22', module: 'PatientAPI', message: 'NullReferenceException in PatientRecordController.GetHistory', status: 'Resolved' },
  { id: 'ERR-087', time: '2026-08-22 08:30:15', module: 'AuthService', message: 'Invalid JWT signature detected from IP 192.168.1.50', status: 'Resolved' },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'Investigating': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'Unresolved': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-slate-100 text-slate-800 border-slate-200'
  }
}
</script>

<template>
  <SysAdminLayout>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900">System Monitor</h1>
      <p class="text-sm text-slate-500 mt-1">Real-time overview of AORTA OS infrastructure health.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card v-for="(stat, index) in stats" :key="index" class="border-slate-200 shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium text-slate-600">{{ stat.title }}</CardTitle>
          <component :is="stat.icon" class="w-4 h-4" :class="stat.color" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-slate-900">{{ stat.value }}</div>
          <div class="flex items-center mt-1 text-xs">
            <span 
              class="flex items-center font-medium mr-2" 
              :class="stat.trendUp ? 'text-emerald-600' : 'text-red-600'"
            >
              <component :is="stat.trendUp ? ArrowUpRight : ArrowDownRight" class="w-3 h-3 mr-0.5" />
              {{ stat.trend }}
            </span>
            <span class="text-slate-500">{{ stat.desc }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Error Logs Table -->
    <Card class="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle class="text-lg font-semibold text-slate-800">Recent Error Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="rounded-md border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader class="bg-slate-50">
              <TableRow>
                <TableHead class="w-[180px] font-semibold">Timestamp</TableHead>
                <TableHead class="w-[150px] font-semibold">Module</TableHead>
                <TableHead class="font-semibold">Error Message</TableHead>
                <TableHead class="w-[120px] text-right font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="log in recentErrors" :key="log.id" class="hover:bg-slate-50/50 transition-colors">
                <TableCell class="font-mono text-xs text-slate-600">{{ log.time }}</TableCell>
                <TableCell>
                  <span class="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium font-mono">
                    {{ log.module }}
                  </span>
                </TableCell>
                <TableCell class="text-sm text-slate-700 font-mono">{{ log.message }}</TableCell>
                <TableCell class="text-right">
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                    :class="getStatusColor(log.status)"
                  >
                    {{ log.status }}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </SysAdminLayout>
</template>
