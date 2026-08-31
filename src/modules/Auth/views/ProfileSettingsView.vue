<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { User, Mail, Shield, ShieldCheck, Smartphone, KeyRound, Clock, MapPin, Activity, AlertTriangle, Globe } from 'lucide-vue-next'
import { Monitor } from 'lucide-vue-next'

const authStore = useAuthStore()
const isLoaded = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})

const isSuperadmin = computed(() => {
  return authStore.roles?.includes('Superadmin') || authStore.roles?.includes('SUPERADMIN') || authStore.user?.is_superadmin
})

const activeSessions = [
  { id: 1, device: 'MacBook Pro M4 Max', browser: 'Safari 18.0', ip: '114.122.10.15', location: 'Jakarta, ID', time: 'Aktif sekarang', current: true },
  { id: 2, device: 'iPhone 15 Pro', browser: 'Safari Mobile', ip: '114.122.10.15', location: 'Jakarta, ID', time: '2 jam yang lalu', current: false },
]
</script>

<template>
  <div class="space-y-8 max-w-[1000px] mx-auto pb-10">
    <!-- Page Title -->
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Profil Keamanan</h1>
      <p class="text-sm text-muted-foreground mt-1 font-medium">Kelola informasi identitas, akses, dan perangkat tertaut Anda.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Left Column: Identity -->
      <div class="lg:col-span-5 space-y-6">
        <div class="bg-card/60 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-border/50 shadow-2xl relative overflow-hidden transition-all duration-700 delay-100 ease-out"
             :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
          <!-- Ambient Glow -->
          <div class="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

          <!-- Avatar Area -->
          <div class="flex flex-col items-center text-center relative z-10">
            <div class="w-24 h-24 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-4xl border border-border shadow-md mb-5 relative group cursor-pointer overflow-hidden transition-transform hover:scale-105">
               <span class="absolute inset-0 bg-background/80 flex items-center justify-center text-foreground text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">Unggah Foto</span>
               {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
            </div>

            <h2 class="text-xl font-bold text-foreground tracking-tight">{{ authStore.user?.name || 'Administrator' }}</h2>

            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider mt-3"
                 :class="isSuperadmin ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'">
              <Shield class="w-3.5 h-3.5" />
              {{ authStore.roles?.[0] || 'Administrator' }}
            </div>

            <!-- Superadmin Warning Banner -->
            <div v-if="isSuperadmin" class="mt-4 w-full bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5 text-left">
              <AlertTriangle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p class="text-xs font-bold text-red-500 uppercase tracking-wider">Akses Global Bypass Aktif</p>
                <p class="text-[10px] text-muted-foreground font-medium mt-0.5 leading-snug">Sebagai Superadmin, Anda memiliki hak akses penuh untuk mengesampingkan (bypass) semua limitasi RBAC di seluruh sistem.</p>
              </div>
            </div>

            <div class="mt-8 w-full flex flex-col gap-3">
               <div class="flex items-center gap-3 px-4 py-3 bg-muted/40 border border-border/50 rounded-2xl hover:bg-muted/80 transition-colors">
                 <div class="w-9 h-9 rounded-xl bg-card shadow-sm border border-border/50 flex items-center justify-center shrink-0">
                    <Mail class="w-4 h-4 text-muted-foreground" />
                 </div>
                 <div class="text-left overflow-hidden">
                    <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Alamat Email</p>
                    <p class="text-sm text-foreground font-semibold truncate">{{ authStore.user?.email || 'admin@aorta.local' }}</p>
                 </div>
               </div>
               <div class="flex items-center gap-3 px-4 py-3 bg-muted/40 border border-border/50 rounded-2xl hover:bg-muted/80 transition-colors">
                 <div class="w-9 h-9 rounded-xl bg-card shadow-sm border border-border/50 flex items-center justify-center shrink-0">
                    <User class="w-4 h-4 text-muted-foreground" />
                 </div>
                 <div class="text-left overflow-hidden">
                    <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">ID Sistem</p>
                    <p class="text-sm text-foreground font-semibold font-mono truncate">{{ authStore.user?.id || 'AORTA-ADM-001' }}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Settings -->
      <div class="lg:col-span-7 space-y-6">

        <!-- Security Card -->
        <div class="bg-card/60 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-border/50 shadow-2xl transition-all duration-700 delay-200 ease-out"
             :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
          <h3 class="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
             <ShieldCheck class="w-5 h-5 text-emerald-500" /> Akses & Autentikasi
          </h3>

          <div class="space-y-4">
             <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/50 hover:border-border transition-colors bg-muted/20">
                <div class="flex items-center gap-4">
                   <div class="w-11 h-11 rounded-xl bg-card flex items-center justify-center shrink-0 border border-border/60 shadow-sm">
                     <KeyRound class="w-5 h-5 text-muted-foreground" />
                   </div>
                   <div>
                     <p class="text-sm font-bold text-foreground">Kata Sandi</p>
                     <p class="text-[11px] text-muted-foreground font-medium mt-0.5">Terakhir diubah 3 bulan yang lalu</p>
                   </div>
                </div>
                <button class="px-5 py-2.5 bg-card border border-border text-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all shrink-0 shadow-sm">Ubah Sandi</button>
             </div>

             <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/50 hover:border-border transition-colors bg-muted/20">
                <div class="flex items-center gap-4">
                   <div class="w-11 h-11 rounded-xl bg-card flex items-center justify-center shrink-0 border border-border/60 shadow-sm">
                     <Smartphone class="w-5 h-5 text-muted-foreground" />
                   </div>
                   <div>
                     <p class="text-sm font-bold text-foreground">Autentikasi 2 Langkah (2FA)</p>
                     <p class="text-[11px] text-emerald-500 font-semibold mt-0.5 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Status: Aktif</p>
                   </div>
                </div>
                <button class="px-5 py-2.5 bg-card border border-border text-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all shrink-0 shadow-sm">Kelola 2FA</button>
             </div>
          </div>
        </div>

        <!-- Devices Card -->
        <div class="bg-card/60 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-border/50 shadow-2xl transition-all duration-700 delay-300 ease-out"
             :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-foreground flex items-center gap-2">
               <Activity class="w-5 h-5 text-blue-500" /> Sesi Aktif
            </h3>
            <button class="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20">Putuskan Semua</button>
          </div>

          <div class="space-y-3">
             <div v-for="session in activeSessions" :key="session.id" class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/50 hover:border-border transition-colors bg-muted/20">
                <div class="flex items-start gap-4">
                   <div class="w-11 h-11 rounded-xl bg-card flex items-center justify-center shrink-0 border border-border/60 shadow-sm mt-0.5">
                     <Monitor v-if="session.device.includes('MacBook')" class="w-5 h-5 text-muted-foreground" />
                     <Smartphone v-else class="w-5 h-5 text-muted-foreground" />
                   </div>
                   <div>
                     <div class="flex items-center gap-2">
                       <p class="text-sm font-bold text-foreground">{{ session.device }}</p>
                       <span v-if="session.current" class="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-md">Perangkat Ini</span>
                     </div>
                     <p class="text-[11px] text-muted-foreground font-medium mt-1">{{ session.browser }}</p>
                     <div class="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/80 font-semibold uppercase tracking-wider">
                       <span class="flex items-center gap-1"><MapPin class="w-3 h-3" /> {{ session.location }}</span>
                       <span class="flex items-center gap-1"><Globe class="w-3 h-3" /> {{ session.ip }}</span>
                       <span class="flex items-center gap-1 text-emerald-500" v-if="session.current"><Clock class="w-3 h-3" /> {{ session.time }}</span>
                       <span class="flex items-center gap-1" v-else><Clock class="w-3 h-3" /> {{ session.time }}</span>
                     </div>
                   </div>
                </div>
                <button v-if="!session.current" class="px-4 py-2 text-xs font-bold text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all shrink-0">Cabut Akses</button>
             </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>