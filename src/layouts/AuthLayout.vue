<template>
  <div class="min-h-screen flex bg-slate-50 lg:bg-white">
    <!-- Left: Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-center px-12 relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500 blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-blue-600 to-transparent blur-2xl"></div>
      </div>

      <div class="relative z-10 max-w-lg mx-auto">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
            <span class="font-bold text-xl text-primary-foreground">A</span>
          </div>
          <span class="text-2xl font-semibold tracking-tight">AORTA</span>
        </div>

        <h1 class="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          Sistem Operasi<br />
          Rumah Sakit<br />
          <span class="text-blue-400">Terintegrasi</span>
        </h1>

        <p class="text-slate-300 text-lg leading-relaxed max-w-md">
          Kelola sumber daya, pantau performa, dan tingkatkan efisiensi operasional rumah sakit dalam satu platform terpadu.
        </p>
      </div>

      <div class="absolute bottom-8 left-0 right-0 text-center text-sm text-slate-500">
        &copy; {{ new Date().getFullYear() }} AORTA OS. All rights reserved.
      </div>
    </div>

    <!-- Right: Form Area -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-[420px]">
        <!-- Mobile Logo (visible only on small screens) -->
        <div class="flex items-center justify-center gap-3 mb-8 lg:hidden">
          <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <span class="font-bold text-xl text-primary-foreground">A</span>
          </div>
          <span class="text-2xl font-bold tracking-tight text-slate-900">AORTA OS</span>
        </div>

        <slot />
      </div>
    </div>
  </div>
</template>
