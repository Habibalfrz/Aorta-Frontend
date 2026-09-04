<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/api/axios'
import { toast } from 'vue-sonner'
import {
  ShieldPlus,
  Check,
  Key,
  Search,
  Users,
  MoreHorizontal,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  Layers,
  CheckSquare,
  Square
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Permission {
  id: string | number
  name: string
  moduleGroup?: string
  featureGroup?: string
  description?: string
}

interface Role {
  id: string
  name: string
  description?: string
  usersCount: number
  permissions: string[]
}

const isLoaded = ref(false)
const isLoading = ref(false)
const isSubmittingCreate = ref(false)
const searchQuery = ref('')
const permSearchQuery = ref('')

// Create Role Form State
const createRoleName = ref('')
const createRoleDescription = ref('')
const createSelectedPermissions = ref<string[]>([])

// Edit Role Modal State
const isEditModalOpen = ref(false)
const isSubmittingEdit = ref(false)
const editRoleId = ref('')
const editRoleName = ref('')
const editRoleDescription = ref('')
const editSelectedPermissions = ref<string[]>([])
const editActiveTab = ref('ALL')

// Delete Dialog State
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const roleToDelete = ref<Role | null>(null)

const availablePermissions = ref<Permission[]>([])
const existingRoles = ref<Role[]>([])

const fetchRoles = async () => {
  try {
    const response = await api.get('/api/SysAdmin/roles')
    const rawRoles = response.data || []
    existingRoles.value = Array.isArray(rawRoles) ? rawRoles : []
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    toast.error('Gagal memuat daftar peran')
  }
}

const fetchPermissions = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/SysAdmin/permissions')
    const rawPerms = response.data.data || response.data || []
    availablePermissions.value = Array.isArray(rawPerms) ? rawPerms : []
  } catch (error) {
    console.error('Failed to fetch permissions:', error)
    toast.error('Gagal mengambil daftar hak akses')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchPermissions()
  fetchRoles()
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})

// Grouped Permissions Helper
const groupedPermissions = computed(() => {
  const groups: Record<string, Permission[]> = {}

  availablePermissions.value.forEach(p => {
    const groupName = p.moduleGroup && p.moduleGroup.trim() !== '' ? p.moduleGroup.toUpperCase() : 'CORE'
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    groups[groupName].push(p)
  })

  return groups
})

const moduleGroupNames = computed(() => Object.keys(groupedPermissions.value).sort())

const filteredRoles = computed(() => {
  if (!searchQuery.value) return existingRoles.value
  const q = searchQuery.value.toLowerCase()
  return existingRoles.value.filter(r =>
    r.name.toLowerCase().includes(q) ||
    (r.description && r.description.toLowerCase().includes(q))
  )
})

// --- Create Role Handlers ---
const toggleCreatePermission = (permName: string) => {
  const idx = createSelectedPermissions.value.indexOf(permName)
  if (idx > -1) {
    createSelectedPermissions.value.splice(idx, 1)
  } else {
    createSelectedPermissions.value.push(permName)
  }
}

const toggleCreateModuleAll = (moduleName: string) => {
  const permsInModule = groupedPermissions.value[moduleName]?.map(p => p.name) || []
  const allSelected = permsInModule.every(p => createSelectedPermissions.value.includes(p))

  if (allSelected) {
    // Unselect all in module
    createSelectedPermissions.value = createSelectedPermissions.value.filter(p => !permsInModule.includes(p))
  } else {
    // Select all in module
    permsInModule.forEach(p => {
      if (!createSelectedPermissions.value.includes(p)) {
        createSelectedPermissions.value.push(p)
      }
    })
  }
}

const isCreateModuleAllSelected = (moduleName: string) => {
  const permsInModule = groupedPermissions.value[moduleName]?.map(p => p.name) || []
  return permsInModule.length > 0 && permsInModule.every(p => createSelectedPermissions.value.includes(p))
}

const selectAllCreate = () => {
  if (createSelectedPermissions.value.length === availablePermissions.value.length) {
    createSelectedPermissions.value = []
  } else {
    createSelectedPermissions.value = availablePermissions.value.map(p => p.name)
  }
}

const createRole = async () => {
  if (!createRoleName.value.trim()) {
    toast.error('Kode Peran (Role) tidak boleh kosong')
    return
  }

  if (createSelectedPermissions.value.length === 0) {
    toast.error('Pilih setidaknya satu hak akses')
    return
  }

  isSubmittingCreate.value = true
  try {
    await api.post('/api/SysAdmin/roles', {
      name: createRoleName.value.toUpperCase(),
      description: createRoleDescription.value,
      permissions: createSelectedPermissions.value
    })
    toast.success(`Peran ${createRoleName.value.toUpperCase()} berhasil dibuat`)
    createRoleName.value = ''
    createRoleDescription.value = ''
    createSelectedPermissions.value = []
    fetchRoles()
  } catch (error: any) {
    console.error('Failed to create role:', error)
    toast.error(error.response?.data?.message || 'Gagal membuat peran')
  } finally {
    isSubmittingCreate.value = false
  }
}

// --- Edit Role Handlers ---
const openEditRoleModal = (role: Role) => {
  editRoleId.value = role.id
  editRoleName.value = role.name
  editRoleDescription.value = role.description || ''
  editSelectedPermissions.value = [...(role.permissions || [])]
  editActiveTab.value = 'ALL'
  permSearchQuery.value = ''
  isEditModalOpen.value = true
}

const toggleEditPermission = (permName: string) => {
  const idx = editSelectedPermissions.value.indexOf(permName)
  if (idx > -1) {
    editSelectedPermissions.value.splice(idx, 1)
  } else {
    editSelectedPermissions.value.push(permName)
  }
}

const toggleEditModuleAll = (moduleName: string) => {
  const permsInModule = groupedPermissions.value[moduleName]?.map(p => p.name) || []
  const allSelected = permsInModule.every(p => editSelectedPermissions.value.includes(p))

  if (allSelected) {
    editSelectedPermissions.value = editSelectedPermissions.value.filter(p => !permsInModule.includes(p))
  } else {
    permsInModule.forEach(p => {
      if (!editSelectedPermissions.value.includes(p)) {
        editSelectedPermissions.value.push(p)
      }
    })
  }
}

const isEditModuleAllSelected = (moduleName: string) => {
  const permsInModule = groupedPermissions.value[moduleName]?.map(p => p.name) || []
  return permsInModule.length > 0 && permsInModule.every(p => editSelectedPermissions.value.includes(p))
}

const selectAllEdit = () => {
  if (editSelectedPermissions.value.length === availablePermissions.value.length) {
    editSelectedPermissions.value = []
  } else {
    editSelectedPermissions.value = availablePermissions.value.map(p => p.name)
  }
}

const saveEditRole = async () => {
  if (!editRoleName.value.trim()) {
    toast.error('Nama peran tidak boleh kosong')
    return
  }

  isSubmittingEdit.value = true
  try {
    await api.put(`/api/SysAdmin/roles/${editRoleId.value}`, {
      name: editRoleName.value.toUpperCase(),
      description: editRoleDescription.value,
      permissions: editSelectedPermissions.value
    })
    toast.success('Hak akses peran berhasil diperbarui')
    isEditModalOpen.value = false
    fetchRoles()
  } catch (error: any) {
    console.error('Failed to update role:', error)
    toast.error(error.response?.data?.message || 'Gagal memperbarui peran')
  } finally {
    isSubmittingEdit.value = false
  }
}

// --- Delete Role Handlers ---
const promptDeleteRole = (role: Role) => {
  roleToDelete.value = role
  isDeleteModalOpen.value = true
}

const confirmDeleteRole = async () => {
  if (!roleToDelete.value) return

  isDeleting.value = true
  try {
    const response = await api.delete(`/api/SysAdmin/roles/${roleToDelete.value.id}`)
    toast.success(response.data?.message || 'Peran berhasil dihapus')
    isDeleteModalOpen.value = false
    roleToDelete.value = null
    fetchRoles()
  } catch (error: any) {
    console.error('Failed to delete role:', error)
    toast.error(error.response?.data?.message || 'Gagal menghapus peran')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="space-y-8 max-w-[1400px]">
    <!-- Page Title -->
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col md:flex-row md:items-end justify-between gap-4"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Manajemen Peran & Hak Akses</h1>
        <p class="text-sm text-muted-foreground mt-1 font-medium">Atur matriks otorisasi peran sistem untuk membatasi fungsionalitas modul.</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="space-y-8">
      <!-- Top Row: Role Builder & Permission Matrix -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Role Definition & Builder (Left) -->
        <div class="lg:col-span-4 xl:col-span-4 flex flex-col">
          <div class="bg-card/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-border/60 shadow-sm transition-all duration-700 delay-100 ease-out relative overflow-hidden flex-1"
               :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
            <div class="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

            <div class="flex items-center gap-3 mb-6 relative z-10">
              <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <ShieldPlus class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-foreground tracking-tight">Buat Peran Baru</h3>
                <p class="text-xs text-muted-foreground">Definisikan kode peran dan izin akses</p>
              </div>
            </div>

            <div class="space-y-5 relative z-10">
              <div class="space-y-2">
                <Label for="roleName" class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Kode / Nama Peran <span class="text-destructive">*</span></Label>
                <Input
                  id="roleName"
                  v-model="createRoleName"
                  placeholder="Contoh: HRD_MANAGER"
                  class="h-11 bg-muted/50 border-border/50 focus-visible:ring-primary/20 font-bold text-foreground rounded-xl uppercase"
                />
                <p class="text-[10px] font-medium text-muted-foreground">Gunakan huruf kapital dengan underscore.</p>
              </div>

              <div class="space-y-2">
                <Label for="roleDescription" class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Deskripsi Peran</Label>
                <Input
                  id="roleDescription"
                  v-model="createRoleDescription"
                  placeholder="Contoh: Mengelola data SDM, shift, dan cuti"
                  class="h-11 bg-muted/50 border-border/50 focus-visible:ring-primary/20 text-foreground rounded-xl"
                />
              </div>

              <div class="p-3 rounded-2xl bg-muted/30 border border-border/50 text-xs text-muted-foreground flex items-center justify-between">
                <span>Total Hak Akses Dipilih:</span>
                <span class="font-bold text-primary text-sm">{{ createSelectedPermissions.length }}</span>
              </div>

              <div class="pt-4">
                <Button
                  @click="createRole"
                  :disabled="isSubmittingCreate || isLoading"
                  class="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2"
                >
                  <Loader2 v-if="isSubmittingCreate" class="w-4 h-4 animate-spin" />
                  <Check v-else class="w-4 h-4" />
                  {{ isSubmittingCreate ? 'Menyimpan...' : 'Simpan & Terapkan Peran' }}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Permission Matrix (Right) -->
        <div class="lg:col-span-8 xl:col-span-8 flex flex-col">
          <div class="bg-card/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-border/60 shadow-sm transition-all duration-700 delay-200 ease-out flex flex-col flex-1"
               :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">

            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-border/50 pb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-accent text-foreground flex items-center justify-center border border-border/50">
                  <Key class="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-foreground tracking-tight">Pilih Hak Akses (Permissions)</h3>
                  <p class="text-xs font-medium text-muted-foreground">Centang hak akses per kelompok modul untuk peran baru.</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  @click="selectAllCreate"
                  class="rounded-xl text-xs font-bold h-9 gap-1.5"
                >
                  <CheckSquare v-if="createSelectedPermissions.length === availablePermissions.length && availablePermissions.length > 0" class="w-3.5 h-3.5 text-primary" />
                  <Square v-else class="w-3.5 h-3.5 text-muted-foreground" />
                  {{ createSelectedPermissions.length === availablePermissions.length && availablePermissions.length > 0 ? 'Kosongkan Semua' : 'Pilih Semua' }}
                </Button>
              </div>
            </div>

            <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Loader2 class="w-8 h-8 mb-3 animate-spin text-primary" />
              <p class="text-xs font-bold uppercase tracking-wider">Memuat Daftar Hak Akses...</p>
            </div>

            <div v-else-if="availablePermissions.length === 0" class="flex-1 flex flex-col items-center justify-center py-16 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
              <Search class="w-8 h-8 mb-3 opacity-40" />
              <p class="text-sm font-semibold">Belum ada hak akses yang terdaftar dari sistem.</p>
            </div>

            <!-- Grouped Matrix -->
            <div v-else class="space-y-6 max-h-[460px] overflow-y-auto custom-scrollbar pr-2">
              <div v-for="modName in moduleGroupNames" :key="modName" class="space-y-3">
                <!-- Module Header -->
                <div class="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40 border border-border/50">
                  <div class="flex items-center gap-2">
                    <Layers class="w-4 h-4 text-primary" />
                    <span class="text-xs font-bold text-foreground uppercase tracking-wider">{{ modName }}</span>
                    <Badge variant="outline" class="text-[10px] font-bold">
                      {{ (groupedPermissions[modName] || []).filter(p => createSelectedPermissions.includes(p.name)).length }} / {{ (groupedPermissions[modName] || []).length }}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    @click="toggleCreateModuleAll(modName)"
                    class="text-[11px] font-bold text-primary hover:underline"
                  >
                    {{ isCreateModuleAllSelected(modName) ? 'Batal Pilih Modul' : 'Pilih Semua Modul' }}
                  </button>
                </div>

                <!-- Module Permissions Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 pl-2">
                  <div
                    v-for="perm in groupedPermissions[modName]"
                    :key="perm.id || perm.name"
                    @click="toggleCreatePermission(perm.name)"
                    class="p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none"
                    :class="createSelectedPermissions.includes(perm.name) ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' : 'bg-muted/20 border-border/40 hover:bg-muted/40'"
                  >
                    <input
                      type="checkbox"
                      :checked="createSelectedPermissions.includes(perm.name)"
                      @click.stop="toggleCreatePermission(perm.name)"
                      class="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <div class="flex-1 overflow-hidden">
                      <p class="font-bold text-xs text-foreground tracking-tight truncate font-mono">{{ perm.name }}</p>
                      <p class="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{{ perm.description || 'Hak akses sistem' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Bottom Row: Table of Active Roles -->
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
                <p class="text-xs font-medium text-muted-foreground">Kelola peran yang terdaftar dan atur ulang hak aksesnya.</p>
              </div>
            </div>

            <div class="relative w-full sm:w-[260px]">
              <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama peran..."
                class="w-full pl-10 pr-4 h-10 bg-card border-border/60 rounded-xl text-xs text-foreground shadow-sm"
              />
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr class="border-b border-border/50 bg-muted/30">
                  <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[220px]">Nama Peran</th>
                  <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hak Akses Terdaftar</th>
                  <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center w-[120px]">Pengguna</th>
                  <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right w-[90px]">Opsi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border/30">
                <tr v-if="filteredRoles.length === 0">
                  <td colspan="4" class="px-6 py-12 text-center text-muted-foreground">
                    Tidak ada peran yang cocok dengan pencarian.
                  </td>
                </tr>
                <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-accent/50 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-foreground tracking-tight uppercase">{{ role.name }}</span>
                        <Badge v-if="role.name === 'SUPERADMIN'" variant="default" class="text-[9px] font-bold px-1.5 py-0">
                          ROOT
                        </Badge>
                      </div>
                      <span class="text-[11px] font-medium text-muted-foreground mt-0.5 line-clamp-1">{{ role.description || 'Peran otorisasi sistem' }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1.5">
                      <Badge
                        v-for="(p, i) in (role.permissions || []).slice(0, 3)"
                        :key="i"
                        variant="secondary"
                        class="text-[9px] font-mono font-semibold"
                      >
                        {{ p }}
                      </Badge>
                      <Badge
                        v-if="(role.permissions || []).length > 3"
                        variant="default"
                        class="text-[9px] font-bold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                      >
                        +{{ role.permissions.length - 3 }} Hak Akses
                      </Badge>
                      <span v-if="!role.permissions || role.permissions.length === 0" class="text-xs text-muted-foreground italic">
                        Belum ada hak akses
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <Badge variant="outline" class="font-bold text-xs">
                      {{ role.usersCount || 0 }} User
                    </Badge>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                          <MoreHorizontal class="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-48 rounded-2xl border-border/60 shadow-xl p-1 bg-popover text-popover-foreground">
                        <DropdownMenuItem @click="openEditRoleModal(role)" class="rounded-xl cursor-pointer text-xs font-semibold py-2">
                          <Edit2 class="w-3.5 h-3.5 mr-2 text-primary" /> Edit Peran & Izin
                        </DropdownMenuItem>
                        <template v-if="role.name !== 'SUPERADMIN'">
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            @click="promptDeleteRole(role)"
                            class="rounded-xl cursor-pointer text-xs font-semibold py-2 text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2 class="w-3.5 h-3.5 mr-2" /> Hapus Peran
                          </DropdownMenuItem>
                        </template>
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

    <!-- Edit Role Modal -->
    <Dialog :open="isEditModalOpen" @update:open="isEditModalOpen = $event">
      <DialogContent class="sm:max-w-[700px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
        <DialogHeader class="shrink-0 pb-2 border-b border-border/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Edit2 class="w-5 h-5" />
            </div>
            <div>
              <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Edit Peran & Hak Akses</DialogTitle>
              <DialogDescription class="text-xs font-medium text-muted-foreground">
                Perbarui nama peran dan centang hak akses per modul yang diizinkan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form @submit.prevent="saveEditRole" class="flex-1 overflow-hidden flex flex-col py-3 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            <div class="space-y-1.5">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kode / Nama Peran</Label>
              <Input
                v-model="editRoleName"
                :disabled="editRoleName === 'SUPERADMIN'"
                class="bg-muted/50 border-border/50 rounded-xl uppercase font-bold"
              />
            </div>
            <div class="space-y-1.5">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deskripsi Peran</Label>
              <Input v-model="editRoleDescription" class="bg-muted/50 border-border/50 rounded-xl" />
            </div>
          </div>

          <!-- Permission Matrix Selector -->
          <div class="flex-1 overflow-hidden flex flex-col border border-border/50 rounded-2xl p-4 bg-muted/20">
            <div class="flex items-center justify-between pb-3 border-b border-border/40 shrink-0">
              <div class="flex items-center gap-2">
                <Key class="w-4 h-4 text-primary" />
                <span class="text-xs font-bold text-foreground">Pilih Hak Akses:</span>
                <Badge variant="default" class="text-[10px] font-bold">
                  {{ editSelectedPermissions.length }} dipilih
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                @click="selectAllEdit"
                class="rounded-xl text-xs font-bold h-8"
              >
                {{ editSelectedPermissions.length === availablePermissions.length && availablePermissions.length > 0 ? 'Kosongkan Semua' : 'Pilih Semua' }}
              </Button>
            </div>

            <!-- Grouped Matrix Container -->
            <div class="flex-1 overflow-y-auto custom-scrollbar pt-3 space-y-4 pr-1">
              <div v-for="modName in moduleGroupNames" :key="modName" class="space-y-2.5">
                <div class="flex items-center justify-between px-3 py-1.5 rounded-xl bg-muted/50 border border-border/40">
                  <div class="flex items-center gap-2">
                    <Layers class="w-3.5 h-3.5 text-primary" />
                    <span class="text-xs font-bold text-foreground uppercase">{{ modName }}</span>
                    <Badge variant="outline" class="text-[9px]">
                      {{ (groupedPermissions[modName] || []).filter(p => editSelectedPermissions.includes(p.name)).length }} / {{ (groupedPermissions[modName] || []).length }}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    @click="toggleEditModuleAll(modName)"
                    class="text-[10px] font-bold text-primary hover:underline"
                  >
                    {{ isEditModuleAllSelected(modName) ? 'Batal Pilih' : 'Pilih Semua Modul' }}
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                  <div
                    v-for="perm in groupedPermissions[modName]"
                    :key="perm.id || perm.name"
                    @click="toggleEditPermission(perm.name)"
                    class="p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 select-none"
                    :class="editSelectedPermissions.includes(perm.name) ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' : 'bg-card/50 border-border/40 hover:bg-muted/40'"
                  >
                    <input
                      type="checkbox"
                      :checked="editSelectedPermissions.includes(perm.name)"
                      @click.stop="toggleEditPermission(perm.name)"
                      class="w-3.5 h-3.5 mt-0.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <div class="flex-1 overflow-hidden">
                      <p class="font-bold text-xs text-foreground tracking-tight truncate font-mono">{{ perm.name }}</p>
                      <p class="text-[10px] text-muted-foreground line-clamp-1">{{ perm.description || 'Hak akses sistem' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter class="pt-2 shrink-0">
            <Button variant="outline" type="button" @click="isEditModalOpen = false" :disabled="isSubmittingEdit" class="rounded-xl font-bold text-xs h-10">
              Batal
            </Button>
            <Button type="submit" :disabled="isSubmittingEdit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6 shadow-sm">
              <Loader2 v-if="isSubmittingEdit" class="w-3.5 h-3.5 mr-2 animate-spin" />
              {{ isSubmittingEdit ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete Role Confirmation Dialog -->
    <Dialog :open="isDeleteModalOpen" @update:open="isDeleteModalOpen = $event">
      <DialogContent class="sm:max-w-[440px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div class="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-3 border border-destructive/20">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Hapus Peran Otorisasi?</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground pt-1">
            Tindakan ini akan menghapus entitas peran ini dari sistem.
          </DialogDescription>
        </DialogHeader>

        <div v-if="roleToDelete" class="my-4 p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-base text-foreground uppercase">{{ roleToDelete.name }}</span>
            <Badge variant="outline" class="text-xs font-bold">
              {{ roleToDelete.usersCount }} Pengguna Aktif
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground">{{ roleToDelete.description || 'Tidak ada deskripsi' }}</p>

          <div v-if="roleToDelete.usersCount > 0" class="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
            <ShieldAlert class="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong>Peringatan:</strong> Peran ini masih digunakan oleh <strong>{{ roleToDelete.usersCount }} pengguna</strong>. Anda harus mengubah peran pengguna tersebut sebelum menghapus peran ini.</span>
          </div>
        </div>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="isDeleteModalOpen = false" :disabled="isDeleting" class="rounded-xl font-bold text-xs h-10">
            Batal
          </Button>
          <Button
            variant="destructive"
            @click="confirmDeleteRole"
            :disabled="isDeleting || (roleToDelete?.usersCount || 0) > 0"
            class="rounded-xl font-bold text-xs h-10 px-6 shadow-sm"
          >
            <Loader2 v-if="isDeleting" class="w-3.5 h-3.5 mr-2 animate-spin" />
            {{ isDeleting ? 'Menghapus...' : 'Hapus Peran' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
