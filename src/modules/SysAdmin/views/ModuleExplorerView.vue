<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Users, Ticket, Package, ExternalLink } from 'lucide-vue-next'

const router = useRouter()
const isLoaded = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})

const modules = [
  { id: 'hris', name: 'HRIS Core', description: 'Human Resource Information System. Manajemen siklus hidup pegawai, penggajian, dan kehadiran.', icon: Users, path: '/hris', status: 'Active', color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { id: 'ticketing', name: 'IT Helpdesk', description: 'Sistem pelacakan masalah dan tiket bantuan untuk staf internal rumah sakit.', icon: Ticket, path: '#', status: 'Maintenance', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'inventory', name: 'Asset & Inventory', description: 'Pelacakan aset medis dan non-medis terdistribusi.', icon: Package, path: '#', status: 'In Development', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
]

function enterModule(path: string) {
  if (path !== '#') {
    router.push(path)
  }
}
</script>

<template>
  <div class="space-y-8 max-w-[1400px]">
    <!-- Page Title -->
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Eksplorasi Modul</h1>
      <p class="text-sm text-muted-foreground mt-1 font-medium">Akses dan simulasikan modul bisnis yang terisolasi dari pusat kontrol Superadmin.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="(mod, index) in modules" :key="mod.id"
           @click="enterModule(mod.path)"
           class="bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-border/60 shadow-sm relative overflow-hidden transition-all duration-700 ease-out group"
           :class="[
             isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12',
             mod.path !== '#' ? 'cursor-pointer hover:border-primary/40 hover:shadow-md hover:-translate-y-1' : 'opacity-80 cursor-not-allowed'
           ]"
           :style="{ transitionDelay: `${(index + 1) * 100}ms` }">

        <div class="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500 transform group-hover:scale-110 ease-out pointer-events-none">
          <component :is="mod.icon" class="w-32 h-32" />
        </div>

        <div class="flex justify-between items-start mb-8 relative z-10">
          <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center border', mod.bg, mod.color, mod.border]">
            <component :is="mod.icon" class="w-6 h-6" />
          </div>
          <span class="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border"
                :class="mod.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : (mod.status === 'Maintenance' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-muted text-muted-foreground border-border')">
            <span v-if="mod.status === 'Active'" class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {{ mod.status }}
          </span>
        </div>

        <div class="relative z-10">
          <h3 class="text-xl font-bold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors flex items-center gap-2">
            {{ mod.name }}
            <ExternalLink v-if="mod.path !== '#'" class="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </h3>
          <p class="text-sm text-muted-foreground leading-relaxed font-medium">
            {{ mod.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>