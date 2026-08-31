<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()

// Gunakan native querySelector untuk menghindari bug ref di Vue 3
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Menggunakan requestAnimationFrame agar manipulasi DOM sejalan dengan refresh rate layar (ProMotion 120Hz)
          requestAnimationFrame(() => {
            entry.target.classList.add('is-visible')
          })
          observer.unobserve(entry.target) // Only animate once
        }
      })
    },
    {
      threshold: 0.1,
      // Root margin disesuaikan agar elemen di-*observe* sedikit lebih awal sebelum benar-benar masuk viewport
      rootMargin: '50px 0px 0px 0px'
    }
  )

  // Ambil semua elemen dengan class 'reveal-item' dan observe
  setTimeout(() => {
    const elements = document.querySelectorAll('.reveal-item')
    elements.forEach((el) => {
      observer.observe(el)
    })
  }, 100)
})
</script>

<template>
  <div class="landing-view-container min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-primary/20 selection:text-primary">
    <!-- Subtle Background Pattern (Optimized) -->
    <div class="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
         style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 32px 32px;">
    </div>

    <!-- Top Gradient Glow (Optimized) -->
    <div class="fixed top-[-200px] left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-primary/5 blur-[100px] rounded-[100%] pointer-events-none z-0 will-change-transform transform-gpu"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-24 min-h-screen flex flex-col">

      <!-- Hero Section -->
      <div class="flex flex-col items-center text-center max-w-4xl mx-auto mt-10 md:mt-20">
        <div
          
          class="reveal-item inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm mb-8"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-primary relative">
            <span class="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></span>
          </span>
          <span class="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Aorta Enterprise V2.0</span>
        </div>

        <h1
          
          class="reveal-item text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[1.1] font-bold mb-8 text-balance"
          style="transition-delay: 100ms;"
        >
          Hospital OS. <br class="hidden md:block"/>
          <span class="text-muted-foreground font-medium">Decoupled & Refined.</span>
        </h1>

        <p
          
          class="reveal-item text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl font-light leading-relaxed text-balance"
          style="transition-delay: 200ms;"
        >
          A high-performance architecture built for modern healthcare. Isolated modules, unified data, uncompromising speed.
        </p>

        <div
          
          class="reveal-item flex flex-col sm:flex-row gap-4 items-center justify-center w-full sm:w-auto"
          style="transition-delay: 300ms;"
        >
          <template v-if="authStore.isAuthenticated">
            <RouterLink
              :to="authStore.determineLandingRoute()"
              class="group relative inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-primary-foreground h-12 px-8 w-full sm:w-auto overflow-hidden transition-transform active:scale-95"
            >
              <span class="relative z-10 flex items-center gap-2">
                Masuk ke Portal
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </span>
              <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              class="group relative inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-primary-foreground h-12 px-8 w-full sm:w-auto overflow-hidden transition-transform active:scale-95 shadow-[0_0_40px_-10px_rgba(var(--primary),0.3)]"
            >
              <span class="relative z-10 flex items-center gap-2">
                Login ke Sistem
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-1"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
              </span>
              <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </RouterLink>
          </template>
        </div>
      </div>

      <!-- Bento Grid Section -->
      <div class="mt-40 md:mt-56 mb-20 w-full max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div  class="reveal-item">
            <h2 class="text-3xl md:text-4xl font-semibold tracking-tight mb-3">Enterprise Modules</h2>
            <p class="text-muted-foreground">Purpose-built systems working in perfect isolation.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[240px]">

          <!-- Core Billing (Large) -->
          <div
            
            class="reveal-item group col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-card rounded-3xl border border-border/60 p-8 flex flex-col justify-between overflow-hidden relative hover:border-primary/30 transition-colors duration-500"
          >
            <div class="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110 ease-out">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="relative z-10">
              <div class="h-12 w-12 bg-background border border-border/50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 class="font-semibold text-2xl mb-3 tracking-tight">Billing Engine</h3>
              <p class="text-muted-foreground leading-relaxed max-w-sm">
                High-throughput transaction handling with comprehensive audit trails. Designed for complex hospital tariff structures and insurance integrations.
              </p>
            </div>

            <!-- Abstract visualization -->
            <div class="relative h-24 mt-8 w-full border-t border-border/40 pt-4 flex gap-2 items-end">
               <div class="w-full bg-primary/10 rounded-t-sm h-[40%] group-hover:h-[60%] transition-all duration-700 delay-75"></div>
               <div class="w-full bg-primary/20 rounded-t-sm h-[60%] group-hover:h-[80%] transition-all duration-700 delay-150"></div>
               <div class="w-full bg-primary/30 rounded-t-sm h-[30%] group-hover:h-[50%] transition-all duration-700 delay-200"></div>
               <div class="w-full bg-primary/50 rounded-t-sm h-[80%] group-hover:h-[100%] transition-all duration-700 delay-300"></div>
            </div>
          </div>

          <!-- HRIS (Medium) -->
          <div
            
            class="reveal-item group col-span-1 md:col-span-1 lg:col-span-2 bg-muted/30 rounded-3xl border border-border/60 p-8 flex flex-col justify-between hover:bg-muted/50 transition-colors duration-500"
          >
            <div>
              <div class="flex justify-between items-start mb-4">
                <div class="h-10 w-10 bg-background border border-border/50 rounded-xl flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
              </div>
              <h3 class="font-semibold text-xl mb-2 tracking-tight">HRIS Core</h3>
              <p class="text-muted-foreground text-sm leading-relaxed">Unified staff management, attendance tracking, and automated payroll systems.</p>
            </div>
          </div>

          <!-- EMR (Medium) -->
          <div
            
            class="reveal-item group col-span-1 md:col-span-2 lg:col-span-1 bg-card rounded-3xl border border-border/60 p-8 flex flex-col justify-between hover:border-primary/30 transition-colors duration-500"
          >
            <div>
              <div class="h-10 w-10 bg-background border border-border/50 rounded-xl flex items-center justify-center shadow-sm mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <h3 class="font-semibold text-xl mb-2 tracking-tight">Medical Records</h3>
              <p class="text-muted-foreground text-sm leading-relaxed">Instant access to patient histories with strict access control.</p>
            </div>
          </div>

          <!-- System Monitor (Small) -->
          <div
            
            class="reveal-item group col-span-1 md:col-span-1 lg:col-span-1 bg-primary text-primary-foreground rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div class="relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4 opacity-80"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <h3 class="font-semibold text-lg mb-1">System Health</h3>
              <p class="text-primary-foreground/70 text-sm">Real-time metrics.</p>
            </div>
            <div class="relative z-10 mt-4 flex items-center gap-2">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span class="text-sm font-medium">All systems operational</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Footer -->
      <footer class="mt-auto py-8 text-center text-sm text-muted-foreground border-t border-border/40 w-full max-w-6xl mx-auto">
        <p>&copy; {{ new Date().getFullYear() }} Aorta Enterprise. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Optimasi hardware acceleration secara global untuk view ini */
.landing-view-container {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000;
}

.reveal-item {
  opacity: 0;
  transform: translate3d(0, 30px, 0);
  transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}

.reveal-item.is-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
</style>
