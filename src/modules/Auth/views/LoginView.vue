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
    // API call diganti di sini nantinya
    authStore.login('dummy-token-123')
    router.push(authStore.determineLandingRoute())
  } catch (error) {
    form.setApiErrors(error)
  } finally {
    form.isSubmitting.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl font-bold text-slate-900">Login ESS Portal</CardTitle>
        <CardDescription>Masukkan kredensial Anda untuk masuk ke sistem.</CardDescription>
      </CardHeader>
      
      <form @submit.prevent="handleLogin">
        <CardContent class="space-y-4">
          <!-- Global API Error -->
          <div v-if="form.errors.value._global" class="p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {{ form.errors.value._global }}
          </div>

          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              v-model="form.data.value.email" 
              placeholder="nama@rs.com" 
              :class="{ 'border-red-500': form.errors.value.email }"
            />
            <p v-if="form.errors.value.email" class="text-sm text-red-500">{{ form.errors.value.email }}</p>
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              v-model="form.data.value.password" 
              :class="{ 'border-red-500': form.errors.value.password }"
            />
            <p v-if="form.errors.value.password" class="text-sm text-red-500">{{ form.errors.value.password }}</p>
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            type="submit" 
            class="w-full bg-blue-600 hover:bg-blue-700" 
            :disabled="form.isSubmitting.value"
          >
            {{ form.isSubmitting.value ? 'Memproses...' : 'Masuk' }}
          </Button>
        </CardFooter>
      </form>
    </Card>
  </AuthLayout>
</template>
