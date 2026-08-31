<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isLoaded = ref(false)

onMounted(() => {
  // Selalu set ke false terlebih dahulu di siklus mount
  isLoaded.value = false

  // Memberikan sedikit delay 50ms agar browser sempat me-render state awal (opacity 0)
  // sebelum melakukan kalkulasi animasi. Ini memaksa animasi selalu berulang (re-trigger) setiap reload/navigasi.
  setTimeout(() => {
    requestAnimationFrame(() => {
      isLoaded.value = true
    })
  }, 50)
})
</script>

<template>
  <div class="min-h-screen bg-background flex p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-primary/20 selection:text-primary">
    <!-- Subtle Background Pattern (Consistent with Landing Page) -->
    <div class="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
         style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 32px 32px;">
    </div>

    <!-- Main Container -->
    <div class="w-full max-w-7xl mx-auto flex z-10 relative perspective-1000 items-center justify-center">

      <!-- Interactive Split Card -->
      <div
        class="w-full md:w-[90%] lg:w-[1000px] min-h-[600px] flex flex-col md:flex-row bg-card/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-border/50 overflow-hidden transition-all duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] relative"
        :class="isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-[0.98]'"
        style="box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(var(--border), 0.1) inset;"
      >

        <!-- Left Panel: Branding & Context (Hidden on Mobile) -->
        <div class="hidden md:flex flex-col w-1/2 p-12 lg:p-16 relative overflow-hidden bg-muted/20 border-r border-border/40">
          <!-- Abstract Background Graphic -->
          <div class="absolute -top-32 -left-32 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-screen transition-transform duration-1000 transform-gpu"
               :class="isLoaded ? 'translate-x-0 translate-y-0 scale-100' : '-translate-x-20 -translate-y-20 scale-90'"></div>

          <div class="absolute bottom-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>

          <!-- Content -->
          <div class="z-10 relative flex-1 flex flex-col justify-between h-full">
            <!-- Logo area -->
            <div class="flex items-center gap-3 transition-all duration-1000 delay-100 ease-out"
                 :class="isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'">
               <div class="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
                  <span class="text-primary-foreground font-black text-2xl">A</span>
               </div>
               <h2 class="text-2xl font-bold tracking-tight text-foreground">Aorta OS</h2>
            </div>

            <!-- Value Prop -->
            <div class="space-y-6 mt-20 mb-10">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border shadow-sm transition-all duration-1000 delay-200"
                   :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
                <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enterprise Edition</span>
              </div>

              <h3 class="text-4xl lg:text-5xl font-extrabold text-foreground leading-[1.1] tracking-tighter transition-all duration-1000 delay-300"
                  :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
                Hospital <br/>Management.<br/>
                <span class="text-muted-foreground font-medium">Decoupled.</span>
              </h3>
              <p class="text-muted-foreground text-lg leading-relaxed max-w-sm font-light transition-all duration-1000 delay-400"
                 :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
                A highly secure, high-performance architecture built for the modern healthcare ecosystem.
              </p>
            </div>

            <!-- Footer -->
            <div class="transition-all duration-1000 delay-500" :class="isLoaded ? 'opacity-100' : 'opacity-0'">
              <p class="text-sm font-medium text-muted-foreground/60">&copy; {{ new Date().getFullYear() }} Aorta Health Systems.</p>
            </div>
          </div>
        </div>

        <!-- Right Panel: Form Area -->
        <div class="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-card text-card-foreground relative">
          <div class="w-full max-w-[380px] mx-auto z-10 transition-all duration-1000 delay-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
               :class="isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'">

            <!-- Mobile Only Logo (shows when left panel hides) -->
            <div class="md:hidden flex items-center justify-center gap-3 mb-10">
               <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                  <span class="text-primary-foreground font-bold text-xl">A</span>
               </div>
               <h2 class="text-xl font-bold tracking-tight">Aorta OS</h2>
            </div>

            <slot />

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
</style>