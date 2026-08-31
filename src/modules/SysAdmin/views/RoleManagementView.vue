<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import api from '@/api/axios'
import { toast } from 'vue-sonner'
import { ShieldPlus, Check, Key, Search, Users, MoreHorizontal, Edit2, Trash2 } from 'lucide-vue-next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Permission {
  id: string
  name: string
  description?: string
}

interface Role {
  id: string
  name: string
  description?: string
  usersCount: number
  permissions: string[]
}

const roleName = ref('')
const roleDescription = ref('')
const availablePermissions = ref<Permission[]>([])
const selectedPermissions = ref<string[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isLoaded = ref(false)
const searchQuery = ref('')

const existingRoles = ref<Role[]>([])

const fetchRoles = async () => {
  try {
    const response = await api.get('/api/SysAdmin/roles')
    existingRoles.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    toast.error('Gagal memuat daftar peran')
  }
}

const deleteRole = async (id: string) => {
  if (!confirm('Apakah Anda yakin ingin menghapus peran ini?')) return

  try {
    await api.delete(`/api/SysAdmin/roles/${id}`)
    toast.success('Peran berhasil dihapus')
    fetchRoles()
  } catch (error: any) {
    console.error('Failed to delete role:', error)
    toast.error(error.response?.data?.message || 'Gagal menghapus peran')
  }
}

const editRoleWarning = () => {
  toast.info('Fitur edit peran sedang dalam pengembangan (Phase 9)')
}

const filteredRoles = computed(() => {
  if (!searchQuery.value) return existingRoles.value
  const q = searchQuery.value.toLowerCase()
  return existingRoles.value.filter(r =>
    r.name.toLowerCase().includes(q) ||
    (r.description && r.description.toLowerCase().includes(q))
  )
})

const fetchPermissions = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/SysAdmin/permissions')
    // Handle both array direct response or wrapped in data
    availablePermissions.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Failed to fetch permissions:', error)
    toast.error('Gagal mengambil daftar hak akses')
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

const selectAll = () => {
  if (selectedPermissions.value.length === availablePermissions.value.length) {
    selectedPermissions.value = []
  } else {
    selectedPermissions.value = availablePermissions.value.map(p => p.name)
  }
}

const createRole = async () => {
  if (!roleName.value.trim()) {
    toast.error('Kode Peran (Role) tidak boleh kosong')
    return
  }

  if (selectedPermissions.value.length === 0) {
    toast.error('Pilih setidaknya satu hak akses')
    return
  }

  isSubmitting.value = true
  try {
    await api.post('/api/SysAdmin/roles', {
      name: roleName.value,
      description: roleDescription.value,
      permissions: selectedPermissions.value
    })
    toast.success('Role berhasil dibuat')
    roleName.value = ''
    roleDescription.value = ''
    selectedPermissions.value = []
    fetchRoles() // Refresh list after create
  } catch (error) {
    console.error('Failed to create role:', error)
    toast.error('Gagal membuat role')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchPermissions()
  fetchRoles()
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})
</script>

<template>
  <div class="space-y-8 max-w-[1400px]">

    <!-- Page Title -->
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col md:flex-row md:items-end justify-between gap-4"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">Manajemen Peran</h1>
        <p class="text-sm text-slate-500 mt-1 font-medium">Buat dan konfigurasikan tingkat otorisasi sistem berdasarkan entitas peran.</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="space-y-8">

      <!-- Top Row: Role Builder & Permission Matrix -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <!-- Role Definition & Builder (Left) -->
        <div class="lg:col-span-4 xl:col-span-4 flex flex-col">
          <div class="bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-border/60 shadow-sm transition-all duration-700 delay-100 ease-out relative overflow-hidden flex-1"
               :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
          <!-- Glow -->
          <div class="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

          <div class="flex items-center gap-3 mb-8 relative z-10">
            <div class="w-10 h-10 rounded-xl bg-accent text-muted-foreground flex items-center justify-center border border-border/50">
              <ShieldPlus class="w-5 h-5" />
            </div>
            <h3 class="text-lg font-bold text-foreground tracking-tight">Buat Peran Baru</h3>
          </div>

          <div class="space-y-6 relative z-10">
            <div class="space-y-2">
              <Label for="roleName" class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Kode / Nama Peran</Label>
              <Input id="roleName" v-model="roleName" placeholder="Contoh: SYSTEM_AUDITOR" class="h-12 bg-accent border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary text-foreground rounded-xl" />
              <p class="text-[10px] font-medium text-muted-foreground mt-1">Gunakan format kapital dengan underscore untuk konsistensi sistem.</p>
            </div>

            <div class="space-y-2">
              <Label for="roleDescription" class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Deskripsi (Opsional)</Label>
              <Input id="roleDescription" v-model="roleDescription" placeholder="Deskripsi hak akses peran ini..." class="h-12 bg-accent border-border/50 focus-visible:ring-primary/20 focus-visible:border-primary text-foreground rounded-xl" />
            </div>

            <!-- Action Button placed closer to description -->
            <div class="pt-6">
               <button @click="createRole" :disabled="isSubmitting || isLoading"
                       class="w-full h-12 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                 <Check v-if="!isSubmitting" class="w-4 h-4" />
                 <svg v-else class="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 {{ isSubmitting ? 'Memproses...' : 'Terapkan Peran Baru' }}
               </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Permission Matrix (Right) -->
      <div class="lg:col-span-8 xl:col-span-8 flex flex-col">

        <!-- Card: Matriks Pilihan Izin untuk Peran Baru -->
        <div class="bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-border/60 shadow-sm transition-all duration-700 delay-200 ease-out flex flex-col flex-1"
             :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">

          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Key class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-foreground tracking-tight">Pilih Hak Akses</h3>
                <p class="text-xs font-medium text-muted-foreground">Pilih izin akses (permissions) untuk peran yang sedang dibuat. <span class="font-bold text-primary">{{ selectedPermissions.length }} dipilih</span></p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button @click="selectAll" class="px-4 py-2 bg-accent hover:bg-accent/80 text-foreground text-xs font-bold rounded-lg border border-border transition-colors">
                 {{ selectedPermissions.length === availablePermissions.length && availablePermissions.length > 0 ? 'Kosongkan Semua' : 'Pilih Semua' }}
              </button>
            </div>
          </div>

          <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center py-10 text-muted-foreground">
            <svg class="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p class="text-sm font-semibold tracking-wide">MENGUNDUH MATRIKS...</p>
          </div>
          <div v-else-if="availablePermissions.length === 0" class="flex-1 flex flex-col items-center justify-center py-10 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
            <Search class="w-8 h-8 mb-4 opacity-50" />
            <p class="text-sm font-semibold">Data izin akses (permissions) kosong dari API.</p>
          </div>

          <!-- Grid Matrix of Permissions -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto custom-scrollbar pr-2 pb-2">
            <div
              v-for="perm in availablePermissions"
              :key="perm.id || perm.name"
              class="flex items-start gap-3 p-3.5 rounded-2xl border transition-colors cursor-pointer group"
              :class="selectedPermissions.includes(perm.name) ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-border/50 hover:border-border hover:bg-muted'"
              @click="togglePermission(perm.name)"
            >
              <div class="mt-0.5">
                <Checkbox
                  :id="perm.name"
                  :checked="selectedPermissions.includes(perm.name)"
                  @click.stop="togglePermission(perm.name)"
                  class="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
              <div class="flex-1 overflow-hidden">
                <Label :for="perm.name" class="font-bold text-sm text-foreground tracking-tight cursor-pointer group-hover:text-primary transition-colors block truncate">
                  {{ perm.name || 'Unnamed Permission' }}
                </Label>
                <p v-if="perm.description" class="text-[10px] text-muted-foreground font-medium mt-0.5 line-clamp-2 leading-snug">
                  {{ perm.description }}
                </p>
                <p v-else class="text-[10px] text-muted-foreground/60 font-medium mt-0.5 italic">
                  Tanpa deskripsi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div> <!-- End of Top Row Grid -->

      <!-- Bottom Row: Tabel Daftar Peran Aktif -->
      <div class="w-full">
        <div class="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/60 shadow-sm transition-all duration-700 delay-300 ease-out flex flex-col overflow-hidden"
             :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">

          <div class="p-6 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                <Users class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-foreground tracking-tight">Daftar Peran Aktif</h3>
                <p class="text-xs font-medium text-muted-foreground">Peran yang sudah tersedia di dalam sistem.</p>
              </div>
            </div>

            <div class="relative w-full sm:w-[240px]">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input v-model="searchQuery" type="text" placeholder="Cari peran..." class="w-full pl-9 pr-4 h-10 bg-card border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr class="border-b border-border/50 bg-card">
                  <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[200px]">Nama Peran</th>
                  <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Akses (Izin)</th>
                  <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center w-[100px]">Pengguna</th>
                  <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right w-[80px]">Opsi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border/30">
                <tr v-if="filteredRoles.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-muted-foreground">
                    Tidak ada peran yang ditemukan.
                  </td>
                </tr>
                <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-accent/50 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-foreground tracking-tight">{{ role.name }}</span>
                      <span class="text-[11px] font-medium text-muted-foreground mt-1 line-clamp-1">{{ role.description || '-' }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1.5">
                      <span v-for="(p, i) in role.permissions.slice(0, 3)" :key="i" class="px-2 py-0.5 bg-accent border border-border/50 text-muted-foreground rounded text-[9px] font-bold uppercase tracking-wider">
                        {{ p }}
                      </span>
                      <span v-if="role.permissions.length > 3" class="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded text-[9px] font-bold">
                        +{{ role.permissions.length - 3 }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-accent text-foreground rounded-lg text-xs font-bold border border-border/50">
                      {{ role.usersCount }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <button class="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent flex items-center justify-center ml-auto transition-colors focus:outline-none">
                          <MoreHorizontal class="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-40 rounded-xl border-border/60 shadow-lg p-1 bg-popover text-popover-foreground">
                        <DropdownMenuItem @click="editRoleWarning()" class="rounded-lg cursor-pointer text-xs font-medium hover:bg-accent focus:bg-accent">
                          <Edit2 class="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Edit Peran
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="deleteRole(role.id)" class="rounded-lg cursor-pointer text-xs font-medium text-destructive hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10">
                          <Trash2 class="w-3.5 h-3.5 mr-2" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
