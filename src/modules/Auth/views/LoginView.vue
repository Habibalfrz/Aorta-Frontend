<script setup lang="ts">
import { z } from 'zod'
import { useRouter } from 'vue-router'
import { useForm } from '@/composables/useForm'
import { useAuthStore } from '@/store/auth'
import AuthLayout from '@/layouts/AuthLayout.vue'

// Shadcn UI Components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = useForm(
  z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(1, 'Password tidak boleh kosong')
  }),
  { email: '', password: '' }
)

const handleLogin = async () => {
  if (!form.validate()) return

  form.isSubmitting.value = true
  try {
    await authStore.login(form.data.value)
    router.push(authStore.determineLandingRoute())
  } catch (error: any) {
    if (error.response?.status === 401) {
      form.errors.value = { _global: 'Email atau password salah.' }
    } else {
      form.setApiErrors(error)
    }
  } finally {
    form.isSubmitting.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <Card class="w-full border-0 shadow-lg sm:border sm:shadow-md">
      <CardHeader class="space-y-2 text-center pb-8">
        <CardTitle class="text-3xl font-bold tracking-tight">Selamat Datang</CardTitle>
        <CardDescription class="text-base">
          Masuk ke akun AORTA OS Anda
        </CardDescription>
      </CardHeader>

      <form @submit.prevent="handleLogin">
        <CardContent class="space-y-5">
          <!-- Global API Error -->
          <div v-if="form.errors.value._global" class="flex items-center gap-2 p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md">
            <AlertCircle class="h-4 w-4" />
            <span>{{ form.errors.value._global }}</span>
          </div>

          <div class="space-y-2.5">
            <Label for="email" class="text-sm font-semibold text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              v-model="form.data.value.email"
              placeholder="nama@rs.com"
              class="h-11"
              :class="{ 'border-destructive focus-visible:ring-destructive': form.errors.value.email }"
            />
            <p v-if="form.errors.value.email" class="text-sm font-medium text-destructive">
              {{ form.errors.value.email }}
            </p>
          </div>

          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <Label for="password" class="text-sm font-semibold text-slate-700">Password</Label>
              <a href="#" class="text-sm font-medium text-primary hover:underline hover:text-primary/90" tabindex="-1">Lupa password?</a>
            </div>
            <Input
              id="password"
              type="password"
              v-model="form.data.value.password"
              class="h-11"
              :class="{ 'border-destructive focus-visible:ring-destructive': form.errors.value.password }"
            />
            <p v-if="form.errors.value.password" class="text-sm font-medium text-destructive">
              {{ form.errors.value.password }}
            </p>
          </div>
        </CardContent>

        <CardFooter class="pt-4 pb-6">
          <Button
            type="submit"
            class="w-full h-11 text-base font-semibold"
            :disabled="form.isSubmitting.value"
          >
            <span v-if="form.isSubmitting.value" class="flex items-center gap-2">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </span>
            <span v-else>Masuk</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  </AuthLayout>
</template>
