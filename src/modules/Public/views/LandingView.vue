<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center items-center text-center px-4">
    <div class="max-w-3xl">
      <h1 class="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
        AORTA HOSPITAL OS
      </h1>
      <p class="text-xl md:text-2xl text-slate-600 mb-10">
        Core Operating System Rumah Sakit berstandar Enterprise
      </p>
      <button
        @click="$router.push('/login')"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg"
      >
        Masuk ke Sistem
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Landing page
</script>