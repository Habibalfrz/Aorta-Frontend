<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  Search,
  Plus,
  MoreHorizontal,
  ShieldCheck,
  Mail,
  UserX,
  UserCheck,
  KeySquare,
  Users,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-vue-next'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

// Shadcn UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const isLoaded = ref(false)
const isLoading = ref(false)
const searchQuery = ref('')
const selectedStatusFilter = ref('ALL')
const selectedRoleFilter = ref('ALL')

const users = ref<any[]>([])
const roles = ref<any[]>([])

// Create Modal State
const isAddModalOpen = ref(false)
const isSubmittingAdd = ref(false)
const newUser = ref({
  name: '',
  email: '',
  password: '',
  roleId: null as number | null,
  isActive: true
})

// Edit Modal State
const isEditModalOpen = ref(false)
const isSubmittingEdit = ref(false)
const editUser = ref({
  rawId: 0,
  name: '',
  email: '',
  password: '',
  roleId: 0 as number | null,
  isActive: true
})

// Reset Password Modal State
const isResetModalOpen = ref(false)
const isSubmittingReset = ref(false)
const resetUser = ref<any>(null)
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

// Delete Dialog State
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const userToDelete = ref<any>(null)

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/sysadmin/users')
    const rawList = response.data.data || response.data || []
    users.value = Array.isArray(rawList) ? rawList : []
  } catch (error) {
    console.error('Failed to fetch users:', error)
    toast.error('Gagal mengambil daftar pengguna')
  } finally {
    isLoading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const response = await api.get('/api/sysadmin/roles')
    const rawRoles = response.data || []
    roles.value = Array.isArray(rawRoles) ? rawRoles : []
  } catch (error) {
    console.error('Failed to fetch roles:', error)
  }
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})

const filteredUsers = computed(() => {
  if (!Array.isArray(users.value)) return []

  return users.value.filter(u => {
    if (!u) return false

    // Search filter
    const q = (searchQuery.value || '').trim().toLowerCase()
    const name = (u.name || '').toLowerCase()
    const email = (u.email || '').toLowerCase()
    const roleName = (u.role || '').toLowerCase()
    const matchesSearch = !q || name.includes(q) || email.includes(q) || roleName.includes(q)

    // Status filter
    const statusFilter = selectedStatusFilter.value
    const isUserActive = u.isActive ?? (u.status === 'Active')
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && isUserActive) ||
      (statusFilter === 'INACTIVE' && !isUserActive)

    // Role filter
    const roleFilter = selectedRoleFilter.value
    const matchesRole = roleFilter === 'ALL' || (u.role && u.role.toUpperCase() === roleFilter.toUpperCase())

    return matchesSearch && matchesStatus && matchesRole
  })
})

const toggleStatus = async (user: any) => {
  try {
    const response = await api.put(`/api/sysadmin/users/${user.rawId}/status`)
    user.isActive = !user.isActive
    user.status = user.isActive ? 'Active' : 'Inactive'
    toast.success(response.data?.message || `Status ${user.name} berhasil diubah`)
  } catch (error: any) {
    console.error('Failed to toggle status:', error)
    toast.error(error.response?.data?.message || 'Gagal mengubah status pengguna')
  }
}

const createUser = async () => {
  if (!newUser.value.email || !newUser.value.password) {
    toast.error('Email dan Kata Sandi wajib diisi')
    return
  }

  isSubmittingAdd.value = true
  try {
    await api.post('/api/sysadmin/users', {
      name: newUser.value.name,
      email: newUser.value.email,
      password: newUser.value.password,
      roleId: newUser.value.roleId,
      isActive: newUser.value.isActive
    })
    toast.success('Pengguna berhasil ditambahkan')
    isAddModalOpen.value = false
    newUser.value = { name: '', email: '', password: '', roleId: null, isActive: true }
    fetchUsers()
  } catch (error: any) {
    console.error('Failed to create user:', error)
    toast.error(error.response?.data?.message || 'Gagal menambahkan pengguna')
  } finally {
    isSubmittingAdd.value = false
  }
}

const openEditModal = (user: any) => {
  editUser.value = {
    rawId: user.rawId,
    name: user.name,
    email: user.email,
    password: '',
    roleId: user.roleId || 0,
    isActive: user.isActive ?? (user.status === 'Active')
  }
  isEditModalOpen.value = true
}

const saveEditUser = async () => {
  if (!editUser.value.email) {
    toast.error('Email tidak boleh kosong')
    return
  }

  isSubmittingEdit.value = true
  try {
    await api.put(`/api/sysadmin/users/${editUser.value.rawId}`, {
      name: editUser.value.name,
      email: editUser.value.email,
      password: editUser.value.password || undefined,
      roleId: editUser.value.roleId || 0,
      isActive: editUser.value.isActive
    })
    toast.success('Data pengguna berhasil diperbarui')
    isEditModalOpen.value = false
    fetchUsers()
  } catch (error: any) {
    console.error('Failed to update user:', error)
    toast.error(error.response?.data?.message || 'Gagal memperbarui pengguna')
  } finally {
    isSubmittingEdit.value = false
  }
}

const openResetPasswordModal = (user: any) => {
  resetUser.value = user
  newPassword.value = ''
  confirmPassword.value = ''
  showPassword.value = false
  isResetModalOpen.value = true
}

const handleResetPassword = async () => {
  if (!newPassword.value) {
    toast.error('Kata sandi baru wajib diisi')
    return
  }
  if (newPassword.value.length < 6) {
    toast.error('Kata sandi minimal 6 karakter')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.error('Konfirmasi kata sandi tidak cocok')
    return
  }

  isSubmittingReset.value = true
  try {
    await api.put(`/api/sysadmin/users/${resetUser.value.rawId}`, {
      password: newPassword.value
    })
    toast.success(`Kata sandi untuk ${resetUser.value.name} berhasil diubah`)
    isResetModalOpen.value = false
  } catch (error: any) {
    console.error('Failed to reset password:', error)
    toast.error(error.response?.data?.message || 'Gagal mereset kata sandi')
  } finally {
    isSubmittingReset.value = false
  }
}

const openDeleteModal = (user: any) => {
  userToDelete.value = user
  isDeleteModalOpen.value = true
}

const confirmDeleteUser = async () => {
  if (!userToDelete.value) return

  isDeleting.value = true
  try {
    await api.delete(`/api/sysadmin/users/${userToDelete.value.rawId}`)
    toast.success('Pengguna berhasil dihapus secara permanen')
    isDeleteModalOpen.value = false
    userToDelete.value = null
    fetchUsers()
  } catch (error: any) {
    console.error('Failed to delete user:', error)
    toast.error(error.response?.data?.message || 'Gagal menghapus pengguna')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="space-y-8 max-w-[1400px]">
    <!-- Page Title & Actions -->
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col md:flex-row md:items-end justify-between gap-4"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Manajemen Pengguna</h1>
        <p class="text-sm text-muted-foreground mt-1 font-medium">Kelola akun, peran otorisasi, dan status aktif seluruh pengguna sistem AORTA.</p>
      </div>

      <div class="flex items-center gap-3">
        <Button @click="isAddModalOpen = true" class="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <Plus class="w-4 h-4" /> Tambah Pengguna Baru
        </Button>
      </div>
    </div>

    <!-- Data Table Container -->
    <div class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden transition-all duration-700 delay-100 ease-out flex flex-col"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">

      <!-- Toolbar with Interactive Filters -->
      <div class="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
        <!-- Search Input -->
        <div class="relative w-full sm:w-[320px]">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama, email, atau peran..."
            class="w-full pl-10 pr-4 h-11 bg-card border-border/60 rounded-xl text-xs text-foreground shadow-sm"
          />
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Status Filter -->
          <div class="w-40">
            <Select v-model="selectedStatusFilter">
              <SelectTrigger class="h-11 bg-card border-border/60 rounded-xl text-xs font-semibold">
                <SelectValue placeholder="Status Akun" />
              </SelectTrigger>
              <SelectContent class="rounded-xl border-border/60 bg-popover text-popover-foreground">
                <SelectItem value="ALL" class="text-xs">Semua Status</SelectItem>
                <SelectItem value="ACTIVE" class="text-xs">Aktif (Active)</SelectItem>
                <SelectItem value="INACTIVE" class="text-xs">Non-Aktif (Inactive)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Role Filter -->
          <div class="w-44">
            <Select v-model="selectedRoleFilter">
              <SelectTrigger class="h-11 bg-card border-border/60 rounded-xl text-xs font-semibold">
                <SelectValue placeholder="Peran (Role)" />
              </SelectTrigger>
              <SelectContent class="rounded-xl border-border/60 bg-popover text-popover-foreground max-h-56">
                <SelectItem value="ALL" class="text-xs">Semua Peran</SelectItem>
                <SelectItem v-for="r in roles" :key="r.id" :value="r.name" class="text-xs">
                  {{ r.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr class="border-b border-border/50 bg-muted/30">
              <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[320px]">Identitas Pengguna</th>
              <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[200px]">Peran (Role)</th>
              <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[160px]">Status Akun</th>
              <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/30">
            <!-- Empty State -->
            <tr v-if="filteredUsers.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-muted-foreground">
                <div class="flex flex-col items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-3 border border-border/50">
                    <Search class="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p class="text-sm font-semibold text-foreground">Tidak ada pengguna ditemukan</p>
                  <p class="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter status/peran.</p>
                </div>
              </td>
            </tr>

            <!-- User Rows -->
            <tr v-for="(user, index) in filteredUsers" :key="user.id"
                class="hover:bg-accent/50 transition-colors group"
                :style="{ transitionDelay: `${(index + 1) * 30}ms` }">

              <!-- Identity -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-accent border border-border/50 flex items-center justify-center font-bold text-muted-foreground text-sm shrink-0">
                    {{ user.avatar }}
                  </div>
                  <div class="flex flex-col overflow-hidden">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold text-foreground tracking-tight truncate">{{ user.name }}</span>
                      <Badge v-if="user.email === 'superadmin@aorta.id'" variant="outline" class="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold px-1.5 py-0">
                        ROOT
                      </Badge>
                    </div>
                    <div class="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Mail class="w-3 h-3" />
                      <span class="truncate font-mono">{{ user.email }}</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Role -->
              <td class="px-6 py-4">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
                     :class="user.role === 'SUPERADMIN' || user.role === 'Superadmin' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-accent text-muted-foreground border-border/50'">
                  <ShieldCheck v-if="user.role === 'SUPERADMIN' || user.role === 'Superadmin'" class="w-3 h-3" />
                  <Users v-else class="w-3 h-3" />
                  {{ user.role }}
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <div class="inline-flex items-center gap-2">
                  <span class="relative flex h-2.5 w-2.5">
                    <span v-if="user.isActive ?? (user.status === 'Active')" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="(user.isActive ?? (user.status === 'Active')) ? 'bg-emerald-500' : 'bg-destructive'"></span>
                  </span>
                  <span class="text-xs font-semibold" :class="(user.isActive ?? (user.status === 'Active')) ? 'text-foreground' : 'text-muted-foreground'">
                    {{ (user.isActive ?? (user.status === 'Active')) ? 'Aktif' : 'Non-Aktif' }}
                  </span>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">
                      <MoreHorizontal class="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-52 rounded-2xl border-border/60 shadow-xl p-1 bg-popover text-popover-foreground">
                    <DropdownMenuLabel class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">Aksi Pengguna</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem @click="openEditModal(user)" class="rounded-xl cursor-pointer text-xs font-semibold py-2">
                      <Edit2 class="w-3.5 h-3.5 mr-2 text-primary" /> Edit Profil & Peran
                    </DropdownMenuItem>

                    <DropdownMenuItem @click="openResetPasswordModal(user)" class="rounded-xl cursor-pointer text-xs font-semibold py-2">
                      <KeySquare class="w-3.5 h-3.5 mr-2 text-amber-500" /> Atur Ulang Sandi
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      v-if="user.email !== 'superadmin@aorta.id'"
                      @click="toggleStatus(user)"
                      class="rounded-xl cursor-pointer text-xs font-semibold py-2"
                      :class="(user.isActive ?? (user.status === 'Active')) ? 'text-amber-600' : 'text-emerald-600'"
                    >
                      <UserX v-if="(user.isActive ?? (user.status === 'Active'))" class="w-3.5 h-3.5 mr-2" />
                      <UserCheck v-else class="w-3.5 h-3.5 mr-2" />
                      {{ (user.isActive ?? (user.status === 'Active')) ? 'Nonaktifkan Akun' : 'Aktifkan Akun' }}
                    </DropdownMenuItem>

                    <template v-if="user.email !== 'superadmin@aorta.id'">
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        @click="openDeleteModal(user)"
                        class="rounded-xl cursor-pointer text-xs font-semibold py-2 text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Trash2 class="w-3.5 h-3.5 mr-2" /> Hapus Permanen
                      </DropdownMenuItem>
                    </template>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Info -->
      <div class="px-6 py-4 border-t border-border/50 bg-muted/20 flex items-center justify-between rounded-b-3xl">
        <p class="text-xs font-medium text-muted-foreground">
          Menampilkan <span class="font-bold text-foreground">{{ filteredUsers.length }}</span> dari <span class="font-bold text-foreground">{{ users.length }}</span> total pengguna
        </p>
      </div>
    </div>

    <!-- 1. Add User Modal -->
    <Dialog :open="isAddModalOpen" @update:open="isAddModalOpen = $event">
      <DialogContent class="sm:max-w-[460px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Tambah Pengguna Baru</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground">
            Daftarkan identitas, peran, dan kredensial login akun pengguna baru.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="createUser" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap</Label>
            <Input v-model="newUser.name" placeholder="Contoh: dr. Amanda Sp.JP" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Alamat Email <span class="text-destructive">*</span></Label>
            <Input v-model="newUser.email" type="email" placeholder="user@aorta.id" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kata Sandi Awal <span class="text-destructive">*</span></Label>
            <Input v-model="newUser.password" type="password" placeholder="••••••••" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Peran Akses (Role)</Label>
            <Select v-model="newUser.roleId">
              <SelectTrigger class="bg-muted/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Pilih Peran Sistem" />
              </SelectTrigger>
              <SelectContent class="rounded-xl border-border/60 bg-popover text-popover-foreground max-h-56">
                <SelectItem v-for="r in roles" :key="r.id" :value="Number(r.id)" class="text-xs font-medium">
                  {{ r.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isAddModalOpen = false" :disabled="isSubmittingAdd" class="rounded-xl font-bold text-xs h-10">
              Batal
            </Button>
            <Button type="submit" :disabled="isSubmittingAdd" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6 shadow-sm">
              <Loader2 v-if="isSubmittingAdd" class="w-3.5 h-3.5 mr-2 animate-spin" />
              {{ isSubmittingAdd ? 'Menyimpan...' : 'Simpan Pengguna' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- 2. Edit User Modal -->
    <Dialog :open="isEditModalOpen" @update:open="isEditModalOpen = $event">
      <DialogContent class="sm:max-w-[460px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Edit Profil & Peran Pengguna</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground">
            Perbarui data identitas, penetapan peran, dan status akun pengguna.
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="saveEditUser" class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap</Label>
            <Input v-model="editUser.name" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Alamat Email <span class="text-destructive">*</span></Label>
            <Input v-model="editUser.email" type="email" class="bg-muted/50 border-border/50 rounded-xl font-mono" />
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Peran Otorisasi (Role)</Label>
            <Select v-model="editUser.roleId">
              <SelectTrigger class="bg-muted/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Pilih Peran Sistem" />
              </SelectTrigger>
              <SelectContent class="rounded-xl border-border/60 bg-popover text-popover-foreground max-h-56">
                <SelectItem :value="0" class="text-xs text-muted-foreground">Tanpa Peran (Hapus Peran)</SelectItem>
                <SelectItem v-for="r in roles" :key="r.id" :value="Number(r.id)" class="text-xs font-medium">
                  {{ r.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ubah Kata Sandi (Opsional)</Label>
            <Input v-model="editUser.password" type="password" placeholder="Kosongkan jika tidak ingin mengubah" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>

          <div class="pt-2 flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/50">
            <div>
              <p class="text-xs font-bold text-foreground">Status Akun Aktif</p>
              <p class="text-[11px] text-muted-foreground">Pengguna non-aktif tidak dapat masuk ke sistem.</p>
            </div>
            <input
              type="checkbox"
              v-model="editUser.isActive"
              class="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
          </div>

          <DialogFooter class="pt-4">
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

    <!-- 3. Dedicated Reset Password Modal -->
    <Dialog :open="isResetModalOpen" @update:open="isResetModalOpen = $event">
      <DialogContent class="sm:max-w-[420px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 border border-amber-500/20">
            <Lock class="w-6 h-6" />
          </div>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Atur Ulang Kata Sandi</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground">
            Setel kata sandi baru untuk akun <strong class="text-foreground">{{ resetUser?.name }}</strong> (<span class="font-mono text-muted-foreground">{{ resetUser?.email }}</span>).
          </DialogDescription>
        </DialogHeader>

        <form @submit.prevent="handleResetPassword" class="space-y-4 py-3">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kata Sandi Baru</Label>
            <div class="relative">
              <Input
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Minimal 6 karakter"
                class="bg-muted/50 border-border/50 rounded-xl pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Konfirmasi Kata Sandi</Label>
            <Input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Ulangi kata sandi baru"
              class="bg-muted/50 border-border/50 rounded-xl"
            />
          </div>

          <DialogFooter class="pt-4">
            <Button variant="outline" type="button" @click="isResetModalOpen = false" :disabled="isSubmittingReset" class="rounded-xl font-bold text-xs h-10">
              Batal
            </Button>
            <Button type="submit" :disabled="isSubmittingReset" class="bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs h-10 px-6 shadow-sm">
              <Loader2 v-if="isSubmittingReset" class="w-3.5 h-3.5 mr-2 animate-spin" />
              {{ isSubmittingReset ? 'Menyimpan...' : 'Perbarui Sandi' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- 4. Glassmorphic Delete Confirmation Dialog -->
    <Dialog :open="isDeleteModalOpen" @update:open="isDeleteModalOpen = $event">
      <DialogContent class="sm:max-w-[440px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div class="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-3 border border-destructive/20">
            <AlertTriangle class="w-6 h-6" />
          </div>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Hapus Pengguna Permanen?</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground pt-1">
            Tindakan ini bersifat <strong>permanen dan tidak dapat dibatalkan</strong>. Seluruh relasi izin dan hak akses akun ini akan dihapus dari sistem.
          </DialogDescription>
        </DialogHeader>

        <div v-if="userToDelete" class="my-4 p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-accent font-bold text-xs flex items-center justify-center text-foreground">
              {{ userToDelete.avatar }}
            </div>
            <div>
              <p class="font-bold text-sm text-foreground">{{ userToDelete.name }}</p>
              <p class="text-xs font-mono text-muted-foreground">{{ userToDelete.email }}</p>
            </div>
          </div>
          <div class="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>Peran: <strong class="text-foreground">{{ userToDelete.role }}</strong></span>
            <span>Status: <strong class="text-foreground">{{ userToDelete.isActive ? 'Aktif' : 'Non-Aktif' }}</strong></span>
          </div>
        </div>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="outline" @click="isDeleteModalOpen = false" :disabled="isDeleting" class="rounded-xl font-bold text-xs h-10">
            Batal
          </Button>
          <Button variant="destructive" @click="confirmDeleteUser" :disabled="isDeleting" class="rounded-xl font-bold text-xs h-10 px-6 shadow-sm">
            <Loader2 v-if="isDeleting" class="w-3.5 h-3.5 mr-2 animate-spin" />
            {{ isDeleting ? 'Menghapus...' : 'Hapus Permanen' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>