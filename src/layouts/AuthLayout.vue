<template>
  <div class="min-h-screen flex">
    <!-- Left: Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-blue-900 text-white flex-col justify-center px-12">
      <h1 class="text-4xl font-bold mb-4">AORTA OS</h1>
      <p class="text-blue-200 text-lg">Sistem Operasi Rumah Sakit Terintegrasi</p>
    </div>

    <!-- Right: Form Area -->
    <div class="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-8">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </div>
  </div>
</template>
