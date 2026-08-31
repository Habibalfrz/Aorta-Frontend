<script setup lang="ts">
import { z } from 'zod'
import { useRouter } from 'vue-router'
import { useForm } from '@/composables/useForm'
import { useAuthStore } from '@/store/auth'
import AuthSimpleLayout from '@/layouts/AuthSimpleLayout.vue'

// Shadcn UI Components
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AlertCircle, LockKeyhole, Mail } from 'lucide-vue-next'

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
      form.errors.value = { _global: 'Kredensial tidak valid. Silakan coba lagi.' }
    } else {
      form.setApiErrors(error)
    }
  } finally {
    form.isSubmitting.value = false
  }
}
</script>

<template>
  <AuthSimpleLayout>
    <div class="flex flex-col space-y-8 w-full">
      <!-- Header -->
      <div class="space-y-3 text-center">
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Secure Login</h1>
        <p class="text-sm text-muted-foreground font-medium">Autentikasi sesi Anda untuk mengakses sistem</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">

        <!-- Error Alert -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div v-if="form.errors.value._global" class="flex items-start gap-3 p-3.5 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
            <AlertCircle class="h-5 w-5 shrink-0 mt-0.5" />
            <span class="leading-relaxed">{{ form.errors.value._global }}</span>
          </div>
        </Transition>

        <!-- Input Group -->
        <div class="space-y-4">
          <!-- Email -->
          <div class="space-y-2 group">
            <Label for="email" class="text-xs font-bold text-muted-foreground uppercase tracking-wider group-focus-within:text-foreground transition-colors">Alamat Email</Label>
            <div class="relative">
              <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                id="email"
                type="email"
                v-model="form.data.value.email"
                placeholder="nama@rs-aorta.com"
                class="pl-10 h-12 bg-background/50 focus:bg-background transition-colors duration-200 rounded-xl border-border/80"
                :class="{ 'border-destructive focus-visible:ring-destructive': form.errors.value.email }"
                autocomplete="email"
                spellcheck="false"
              />
            </div>
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform -translate-y-1 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
            >
              <p v-if="form.errors.value.email" class="text-xs font-semibold text-destructive mt-1.5">
                {{ form.errors.value.email }}
              </p>
            </Transition>
          </div>

          <!-- Password -->
          <div class="space-y-2 group">
            <div class="flex items-center justify-between">
              <Label for="password" class="text-xs font-bold text-muted-foreground uppercase tracking-wider group-focus-within:text-foreground transition-colors">Kata Sandi</Label>
              <a href="#" class="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors" tabindex="-1">Lupa sandi?</a>
            </div>
            <div class="relative">
              <LockKeyhole class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                id="password"
                type="password"
                v-model="form.data.value.password"
                placeholder="••••••••"
                class="pl-10 h-12 bg-background/50 focus:bg-background transition-colors duration-200 rounded-xl border-border/80 tracking-widest placeholder:tracking-normal"
                :class="{ 'border-destructive focus-visible:ring-destructive': form.errors.value.password }"
                autocomplete="current-password"
              />
            </div>
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform -translate-y-1 opacity-0"
              enter-to-class="transform translate-y-0 opacity-100"
            >
              <p v-if="form.errors.value.password" class="text-xs font-semibold text-destructive mt-1.5">
                {{ form.errors.value.password }}
              </p>
            </Transition>
          </div>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          class="w-full h-12 text-sm font-bold tracking-wide mt-6 rounded-xl transition-all duration-300 relative overflow-hidden"
          :class="form.isSubmitting.value ? 'bg-primary/70 cursor-wait' : 'bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20'"
          :disabled="form.isSubmitting.value"
        >
          <span
            class="flex items-center justify-center gap-2 transition-transform duration-300 w-full absolute inset-0"
            :class="form.isSubmitting.value ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'"
          >
            Akses Sistem
          </span>

          <span
            class="flex items-center justify-center gap-2 transition-transform duration-300 w-full absolute inset-0"
            :class="form.isSubmitting.value ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'"
          >
            <svg class="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memverifikasi...
          </span>
        </Button>
      </form>
    </div>
  </AuthSimpleLayout>
</template>