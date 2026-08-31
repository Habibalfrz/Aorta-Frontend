<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Settings, Building2, GitBranch, Briefcase } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'

const isLoaded = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})
</script>

<template>
  <div class="space-y-8 max-w-[1400px]">
    <!-- Page Title -->
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <h1 class="text-3xl font-bold tracking-tight text-foreground">Pengaturan HRIS</h1>
      <p class="text-sm text-muted-foreground mt-1 font-medium">Konfigurasi struktur organisasi, departemen, dan aturan dasar HRIS.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card class="bg-card/60 backdrop-blur-3xl rounded-[2rem] p-6 border border-border/50 shadow-sm transition-all duration-700 delay-100 ease-out cursor-pointer hover:border-primary/40 hover:-translate-y-1"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 mb-4">
          <Building2 class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-foreground tracking-tight mb-2">Departemen & Divisi</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">Kelola struktur hierarki departemen, divisi, dan sub-unit perusahaan.</p>
      </Card>

      <Card class="bg-card/60 backdrop-blur-3xl rounded-[2rem] p-6 border border-border/50 shadow-sm transition-all duration-700 delay-200 ease-out cursor-pointer hover:border-primary/40 hover:-translate-y-1"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 mb-4">
          <Briefcase class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-foreground tracking-tight mb-2">Jabatan (Job Positions)</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">Master data posisi pekerjaan, job description, dan tingkatan (grade).</p>
      </Card>

      <Card class="bg-card/60 backdrop-blur-3xl rounded-[2rem] p-6 border border-border/50 shadow-sm transition-all duration-700 delay-300 ease-out cursor-pointer hover:border-primary/40 hover:-translate-y-1"
            :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mb-4">
          <GitBranch class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-foreground tracking-tight mb-2">Alur Persetujuan</h3>
        <p class="text-xs text-muted-foreground leading-relaxed">Atur rute approval untuk pengajuan cuti, lembur, dan mutasi pegawai.</p>
      </Card>
    </div>
  </div>
</template>