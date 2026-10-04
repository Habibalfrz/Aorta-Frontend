<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { syncZkTecoUsers, getAllMachineUsers } from '@/api/hris';
import { Fingerprint, Loader2, Link2, Unlink } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const ipAddress = ref('192.168.1.201');
const isSyncing = ref(false);
const syncMessage = ref('');
const machineUsers = ref<any[]>([]);
const isLoadingUsers = ref(false);

const fetchMachineUsers = async () => {
  isLoadingUsers.value = true;
  try {
    machineUsers.value = await getAllMachineUsers();
  } catch (error) {
    console.error("Failed to load machine users", error);
  } finally {
    isLoadingUsers.value = false;
  }
};

const triggerSync = async () => {
  try {
    isSyncing.value = true;
    await syncZkTecoUsers(ipAddress.value);
    syncMessage.value = "Tugas sinkronisasi antrean terkirim ke background. Refresh tabel ini dalam beberapa saat.";
    toast.success("Job sinkronisasi berjalan di server.");
  } catch (error) {
    syncMessage.value = "Gagal memicu sinkronisasi.";
    toast.error("Gagal melakukan sinkronisasi.");
  } finally {
    isSyncing.value = false;
  }
};

onMounted(() => {
  fetchMachineUsers();
});
</script>

<template>
  <div class="space-y-6">
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow glass-panel border border-border/50">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Fingerprint class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-xl font-bold tracking-tight">Pengaturan Mesin ZKTeco</h2>
          <p class="text-xs text-muted-foreground">Tarik data pegawai dan template sidik jari dari mesin ke server AORTA</p>
        </div>
      </div>

      <div class="flex gap-4 items-center mb-2">
        <div class="w-full max-w-sm space-y-1">
          <label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">IP Address Mesin TCP/IP</label>
          <input v-model="ipAddress" type="text" class="w-full border p-2 rounded-xl bg-muted/50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Contoh: 192.168.1.201" />
        </div>
        <div class="pt-5">
          <button @click="triggerSync" :disabled="isSyncing" class="bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary/90 font-bold text-sm disabled:opacity-50 flex items-center gap-2 shadow-sm">
            <Loader2 v-if="isSyncing" class="w-4 h-4 animate-spin" />
            <Fingerprint v-else class="w-4 h-4" />
            {{ isSyncing ? 'Mengeksekusi...' : 'Tarik Data dari Mesin' }}
          </button>
        </div>
      </div>
      <p v-if="syncMessage" class="mt-2 text-xs font-medium text-amber-600 dark:text-amber-500">{{ syncMessage }}</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow glass-panel border border-border/50 overflow-hidden">
      <div class="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
        <h3 class="font-bold text-sm">Data Pengguna di Mesin (Staging)</h3>
        <button @click="fetchMachineUsers" class="text-xs text-primary font-bold hover:underline">Refresh Tabel</button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-muted-foreground uppercase bg-muted/30">
            <tr>
              <th scope="col" class="px-6 py-3 font-bold">PIN Mesin</th>
              <th scope="col" class="px-6 py-3 font-bold">Nama di Mesin</th>
              <th scope="col" class="px-6 py-3 font-bold">Role (Privilege)</th>
              <th scope="col" class="px-6 py-3 font-bold">Terakhir Ditarik</th>
              <th scope="col" class="px-6 py-3 font-bold text-right">Status Penyatuan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoadingUsers">
              <td colspan="5" class="px-6 py-8 text-center text-muted-foreground">Memuat data dari database staging...</td>
            </tr>
            <tr v-else-if="machineUsers.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-muted-foreground">Belum ada data yang ditarik dari mesin. Klik tombol "Tarik Data" di atas.</td>
            </tr>
            <tr v-for="user in machineUsers" :key="user.id" class="border-b border-border/50 hover:bg-muted/10">
              <td class="px-6 py-3 font-mono font-bold">{{ user.machinePin }}</td>
              <td class="px-6 py-3 font-semibold">{{ user.machineName }}</td>
              <td class="px-6 py-3">
                <span class="px-2 py-1 text-[10px] uppercase font-bold rounded-full"
                      :class="user.privilegeRole === 'Superadmin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'">
                  {{ user.privilegeRole || 'Normal' }}
                </span>
              </td>
              <td class="px-6 py-3 text-xs">{{ user.lastSyncAt ? new Date(user.lastSyncAt).toLocaleString() : '-' }}</td>
              <td class="px-6 py-3 text-right">
                <div v-if="user.linkedEmployeeId" class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-semibold text-xs bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                  <Link2 class="w-3 h-3" /> Ditautkan
                </div>
                <div v-else class="inline-flex items-center gap-1.5 text-muted-foreground font-semibold text-xs bg-muted/50 px-2 py-1 rounded-md">
                  <Unlink class="w-3 h-3" /> Menganggur
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
