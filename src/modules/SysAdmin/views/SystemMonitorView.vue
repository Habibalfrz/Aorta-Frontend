<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ShieldAlert, Terminal, CheckCircle2, AlertTriangle, XCircle, Database, Server, Globe } from 'lucide-vue-next'
import api from '@/api/axios'

const isLoaded = ref(false)

// State for Dynamic Data
const recentLogs = ref<any[]>([])
const metrics = ref<any>({
  networkTraffic: 0,
  cpuUsagePercent: 0,
  memoryUsageGb: 0,
  maxMemoryGb: 64,
  storageIops: 0,
  dbLatencyMs: 0,
  activeThreats: 0,
  sparkline: Array.from({ length: 20 }, () => 0)
})

let pollingInterval: any = null

const fetchMonitorData = async () => {
  try {
    const response = await api.get('/api/SysAdmin/monitor')
    metrics.value = response.data.metrics
    recentLogs.value = response.data.logs
  } catch (error) {
    console.error('Failed to fetch monitor data:', error)
  }
}

onMounted(() => {
  fetchMonitorData()
  // Start polling every 5 seconds
  pollingInterval = setInterval(fetchMonitorData, 5000)

  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})

function getLogColor(type: string) {
  switch (type?.toLowerCase()) {
    case 'info': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20'
    default: return 'text-muted-foreground bg-accent border-border/50'
  }
}

function getLogIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'info': return CheckCircle2
    case 'warning': return AlertTriangle
    case 'error': return XCircle
    default: return Terminal
  }
}

// Visual helpers for metrics
const maxData = computed(() => Math.max(...metrics.value.sparkline, 10))
const sparklineHeight = (val: number) => `${(val / maxData.value) * 100}%`
const cpuWidth = computed(() => `${metrics.value.cpuUsagePercent}%`)
const memWidth = computed(() => `${(metrics.value.memoryUsageGb / metrics.value.maxMemoryGb) * 100}%`)
const iopsWidth = computed(() => `${Math.min((metrics.value.storageIops / 10000) * 100, 100)}%`)
</script>

<template>
  <div class="space-y-8 max-w-[1400px]">

    <!-- Page Title -->
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Resource Monitor</h1>
      <p class="text-sm text-muted-foreground mt-1 font-medium">Informasi performa server, penggunaan sumber daya, dan aktivitas real-time.</p>
    </div>

    <!-- Top Main Metrics -->
    <div class="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

      <!-- Network Request Chart -->
      <div class="lg:col-span-2 bg-card/60 backdrop-blur-xl rounded-[2rem] p-8 border border-border/60 shadow-sm relative overflow-hidden transition-all duration-700 delay-100 ease-out flex flex-col justify-between"
           :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <!-- Decorative Glow -->
        <div class="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div class="flex justify-between items-start mb-8 relative z-10">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Globe class="w-4 h-4" />
              </div>
              <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Network Traffic</p>
            </div>
            <h3 class="text-4xl font-bold text-foreground tracking-tight">{{ metrics.networkTraffic.toLocaleString() }} <span class="text-lg text-muted-foreground font-medium">req/s</span></h3>
          </div>

          <div class="flex flex-col items-end gap-2">
            <span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Healthy
            </span>
            <span class="text-[11px] font-medium text-muted-foreground">Europe/Asia Region</span>
          </div>
        </div>

        <!-- Sparkline Visualization -->
        <div class="h-24 w-full flex items-end gap-1.5 relative z-10 opacity-70 group">
          <div v-for="(val, i) in metrics.sparkline" :key="i"
               class="flex-1 bg-primary/20 hover:bg-primary rounded-t-sm transition-all duration-300"
               :style="{ height: sparklineHeight(val) }">
          </div>
        </div>
      </div>

      <!-- Server Status Panel -->
      <div class="bg-card/60 backdrop-blur-xl rounded-[2rem] p-8 border border-border/60 shadow-sm relative overflow-hidden transition-all duration-700 delay-200 ease-out"
           :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="flex items-center gap-3 mb-8">
           <div class="w-10 h-10 rounded-xl bg-accent text-muted-foreground flex items-center justify-center border border-border/50">
             <Server class="w-5 h-5" />
           </div>
           <h3 class="text-lg font-bold text-foreground tracking-tight">Core Infrastructure</h3>
        </div>

        <div class="space-y-6">
          <div class="space-y-2">
            <div class="flex justify-between items-end">
               <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider">CPU Allocation</p>
               <span class="text-sm font-bold text-foreground">{{ metrics.cpuUsagePercent }}% (32 Cores)</span>
            </div>
            <div class="h-2 w-full bg-accent rounded-full overflow-hidden">
               <div class="h-full bg-blue-500/80 rounded-full transition-all duration-1000" :style="{ width: cpuWidth }"></div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between items-end">
               <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Memory Usage</p>
               <span class="text-sm font-bold text-foreground">{{ metrics.memoryUsageGb }} / {{ metrics.maxMemoryGb }} GB</span>
            </div>
            <div class="h-2 w-full bg-accent rounded-full overflow-hidden">
               <div class="h-full bg-indigo-500/80 rounded-full transition-all duration-1000" :style="{ width: memWidth }"></div>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between items-end">
               <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Storage IOPS</p>
               <span class="text-sm font-bold text-foreground">{{ (metrics.storageIops / 1000).toFixed(1) }}k</span>
            </div>
            <div class="h-2 w-full bg-accent rounded-full overflow-hidden">
               <div class="h-full bg-cyan-500/80 rounded-full transition-all duration-1000" :style="{ width: iopsWidth }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Secondary Metrics -->
    <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

      <!-- DB Latency Metric -->
      <div class="bg-card/60 backdrop-blur-xl rounded-3xl p-6 border border-border/60 shadow-sm relative overflow-hidden transition-all duration-700 delay-300 ease-out group"
           :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="flex justify-between items-start mb-6">
          <div class="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
            <Database class="w-5 h-5" />
          </div>
          <span class="relative flex h-2.5 w-2.5 mt-1 mr-1">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <div class="space-y-1">
          <h3 class="text-3xl font-bold text-foreground tracking-tight">{{ metrics.dbLatencyMs }}<span class="text-lg text-muted-foreground font-medium ml-1">ms</span></h3>
          <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Query Latency</p>
        </div>
      </div>

      <!-- Security Metric -->
      <div class="bg-card/60 backdrop-blur-xl rounded-3xl p-6 border border-border/60 shadow-sm relative overflow-hidden transition-all duration-700 delay-400 ease-out group"
           :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="flex justify-between items-start mb-6">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
            <ShieldAlert class="w-5 h-5" />
          </div>
        </div>
        <div class="space-y-1">
          <h3 class="text-3xl font-bold text-foreground tracking-tight">{{ metrics.activeThreats }}</h3>
          <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Threats</p>
        </div>
      </div>
    </div>

    <!-- Clean Activity Logs -->
    <div class="bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden transition-all duration-1000 delay-500 ease-out"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'">

      <!-- Log Header -->
      <div class="px-6 py-5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-accent text-muted-foreground flex items-center justify-center border border-border/50">
            <Terminal class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-base font-bold text-foreground tracking-tight">Audit Trail</h2>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="px-3 py-1.5 text-xs font-semibold bg-card border border-border rounded-lg text-foreground hover:bg-accent transition-colors">Export Data</button>
        </div>
      </div>

      <!-- Log Body -->
      <div class="p-0 overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-border/50 bg-muted/30">
              <th class="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[140px]">Waktu</th>
              <th class="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[120px]">Status</th>
              <th class="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[200px]">Aktivitas</th>
              <th class="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detail</th>
              <th class="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Pengguna</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/30">
            <tr v-if="recentLogs.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-muted-foreground text-sm font-medium">
                Belum ada aktivitas terekam.
              </td>
            </tr>
            <tr v-else v-for="log in recentLogs" :key="log.id" class="hover:bg-accent/50 transition-colors">
              <td class="px-6 py-4">
                <span class="font-mono text-[11px] text-muted-foreground">{{ log.time }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border"
                     :class="getLogColor(log.type)">
                  <component :is="getLogIcon(log.type)" class="w-2.5 h-2.5" />
                  {{ log.type }}
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-xs font-bold text-foreground">{{ log.action }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-xs font-medium text-muted-foreground">{{ log.details }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex flex-col items-end">
                  <span class="text-xs font-bold text-foreground">{{ log.user }}</span>
                  <span class="font-mono text-[10px] text-muted-foreground mt-0.5">{{ log.ip }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>