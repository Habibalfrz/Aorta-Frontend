<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Selamat Datang di Portal ESS, [Nama Pegawai]</h1>
      <p class="text-slate-500 mt-2">Ringkasan informasi dan akses layanan mandiri pegawai.</p>
    </div>

    <!-- Grid Layout for Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      <!-- Card 1: Profil -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          Profil Pegawai
        </h2>
        <div class="space-y-3 text-sm text-slate-600">
          <div>
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Nama Lengkap</p>
            <p class="font-medium text-slate-900">Budi Santoso</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Jabatan</p>
            <p class="font-medium text-slate-900">Senior Nurse</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Departemen</p>
            <p class="font-medium text-slate-900">Rawat Inap</p>
          </div>
        </div>
      </div>

      <!-- Card 2: Kehadiran -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          Status Kehadiran
        </h2>
        <div class="flex flex-col h-full justify-between">
          <div>
            <p class="text-sm text-slate-600 mb-2">Status Hari Ini</p>
            <div class="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-200">
              Jam Masuk: 08:00 - Tepat Waktu
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Akses Modul -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 class="text-lg font-semibold text-slate-800 mb-4">
          Akses Cepat
        </h2>
        <div class="space-y-3">
          <button class="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2.5 px-4 rounded-lg transition-colors border border-blue-200 text-left flex items-center justify-between">
            Buka Layanan IT/Ticketing
            <span class="text-blue-500">→</span>
          </button>
          <button class="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2.5 px-4 rounded-lg transition-colors border border-indigo-200 text-left flex items-center justify-between">
            Buka HRIS
            <span class="text-indigo-500">→</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// Dashboard View
</script>