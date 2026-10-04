<script setup lang="ts">
import { ref } from 'vue';
import { syncZkTecoUsers } from '@/api/hris';

const ipAddress = ref('192.168.1.201');
const isSyncing = ref(false);
const syncMessage = ref('');

const triggerSync = async () => {
  try {
    isSyncing.value = true;
    await syncZkTecoUsers(ipAddress.value);
    syncMessage.value = "Sync job enqueued. Check back in a few moments.";
  } catch (error) {
    syncMessage.value = "Failed to enqueue sync.";
  } finally {
    isSyncing.value = false;
  }
};
</script>

<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow glass-panel">
    <h2 class="text-xl font-bold mb-4">Pengaturan ZKTeco</h2>
    <div class="flex gap-4 items-center">
      <input v-model="ipAddress" type="text" class="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="IP Address Mesin" />
      <button @click="triggerSync" :disabled="isSyncing" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
        {{ isSyncing ? 'Syncing...' : 'Tarik Data Pengguna' }}
      </button>
    </div>
    <p v-if="syncMessage" class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ syncMessage }}</p>
  </div>
</template>
