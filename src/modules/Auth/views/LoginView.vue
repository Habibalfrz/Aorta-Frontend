<template>
  <div class="min-h-screen flex">
    <!-- Left: Banner/Info -->
    <div class="hidden lg:flex lg:w-1/2 bg-blue-900 text-white flex-col justify-center px-12">
      <h1 class="text-4xl font-bold mb-4">AORTA OS</h1>
      <p class="text-blue-200 text-lg">Sistem Operasi Rumah Sakit Terintegrasi</p>
    </div>

    <!-- Right: Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
      <div class="w-full max-w-md">
        <h2 class="text-3xl font-bold text-slate-900 mb-8 text-center">Login ESS Portal</h2>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <BaseInput
            id="username"
            label="Username"
            v-model="loginForm.data.value.username"
            :error="loginForm.errors.value.username"
            placeholder="Masukkan username"
          />

          <BaseInput
            id="password"
            type="password"
            label="Password"
            v-model="loginForm.data.value.password"
            :error="loginForm.errors.value.password"
            placeholder="Masukkan password"
          />

          <button
            type="submit"
            :disabled="loginForm.isSubmitting.value"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ loginForm.isSubmitting.value ? 'Memproses...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod';
import { useRouter } from 'vue-router';
import { useForm } from '@/composables/useForm';
import BaseInput from '@/components/BaseInput.vue';
import { useAuthStore } from '@/store/auth'; // Ensure this path matches the actual store path

const router = useRouter();
const authStore = useAuthStore();

const loginForm = useForm(
  z.object({
    username: z.string().min(1, 'Username diperlukan'),
    password: z.string().min(1, 'Password diperlukan')
  }),
  { username: '', password: '' }
);

const handleLogin = async () => {
  if (loginForm.validate()) {
    try {
      // Simulate API call
      await authStore.login('dummy-token-123');
      router.push('/ess');
    } catch (e) {
      console.error('Login failed', e);
    }
  }
};
</script>