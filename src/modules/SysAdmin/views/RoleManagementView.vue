<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

interface Permission {
  id: string
  name: string
  description?: string
}

const roleName = ref('')
const availablePermissions = ref<Permission[]>([])
const selectedPermissions = ref<string[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)

const fetchPermissions = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/SysAdmin/permissions')
    // Handle both array direct response or wrapped in data
    availablePermissions.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Failed to fetch permissions:', error)
    toast.error('Gagal mengambil daftar permission')
  } finally {
    isLoading.value = false
  }
}

const togglePermission = (permName: string) => {
  const idx = selectedPermissions.value.indexOf(permName)
  if (idx > -1) {
    selectedPermissions.value.splice(idx, 1)
  } else {
    selectedPermissions.value.push(permName)
  }
}

const createRole = async () => {
  if (!roleName.value.trim()) {
    toast.error('Nama Role tidak boleh kosong')
    return
  }

  if (selectedPermissions.value.length === 0) {
    toast.error('Pilih setidaknya satu permission')
    return
  }

  isSubmitting.value = true
  try {
    await api.post('/api/SysAdmin/roles', {
      name: roleName.value,
      permissions: selectedPermissions.value
    })
    toast.success('Role berhasil dibuat')
    roleName.value = ''
    selectedPermissions.value = []
  } catch (error) {
    console.error('Failed to create role:', error)
    toast.error('Gagal membuat role')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchPermissions()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Manajemen Role</h2>
        <p class="text-slate-500">Buat dan konfigurasikan role dengan permission spesifik.</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Role Builder</CardTitle>
        <CardDescription>Rakit role baru dengan memilih permission yang tersedia.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Role Name Input -->
        <div class="space-y-2 max-w-md">
          <Label for="roleName">Nama Role</Label>
          <Input id="roleName" v-model="roleName" placeholder="e.g., HR Staff" />
        </div>

        <!-- Permissions List -->
        <div class="space-y-4">
          <Label>Daftar Permission</Label>

          <div v-if="isLoading" class="text-sm text-slate-500">
            Memuat permission...
          </div>
          <div v-else-if="availablePermissions.length === 0" class="text-sm text-slate-500">
            Tidak ada permission yang tersedia.
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border rounded-lg p-4 bg-slate-50/50">
            <div
              v-for="perm in availablePermissions"
              :key="perm.id || perm.name"
              class="flex items-start space-x-3 p-2 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Checkbox
                :id="perm.name"
                :checked="selectedPermissions.includes(perm.name)"
                @update:checked="togglePermission(perm.name)"
              />
              <div class="grid gap-1.5 leading-none">
                <Label :for="perm.name" class="font-medium cursor-pointer">
                  {{ perm.name }}
                </Label>
                <p v-if="perm.description" class="text-xs text-slate-500">
                  {{ perm.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end pt-4">
          <Button @click="createRole" :disabled="isSubmitting || isLoading">
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Role' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
