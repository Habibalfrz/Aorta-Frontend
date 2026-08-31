<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Search, Plus, MoreHorizontal, ShieldCheck, Mail, ShieldAlert, CheckCircle2, XCircle, UserX, UserCheck, KeySquare, History, Users } from 'lucide-vue-next'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

// Shadcn UI Components
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const isLoaded = ref(false)
const isLoading = ref(false)
const isSubmitting = ref(false)
const searchQuery = ref('')
const isAddModalOpen = ref(false)

const users = ref<any[]>([])
const roles = ref<any[]>([])

// Form State
const newUser = ref({
  name: '',
  email: '',
  password: '',
  roleId: null as number | null
})

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/SysAdmin/users')
    users.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch users:', error)
    toast.error('Gagal mengambil daftar pengguna')
  } finally {
    isLoading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const response = await api.get('/api/SysAdmin/roles')
    roles.value = response.data || []
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
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.role.toLowerCase().includes(q)
  )
})

const toggleStatus = async (user: any) => {
  try {
    await api.put(`/api/SysAdmin/users/${user.rawId}/status`)
    // Update local state directly for responsive UI
    user.status = user.status === 'Active' ? 'Inactive' : 'Active'
    toast.success(`Status ${user.name} berhasil diubah`)
  } catch (error: any) {
    console.error('Failed to toggle status:', error)
    toast.error(error.response?.data?.message || 'Gagal mengubah status pengguna')
  }
}

const createUser = async () => {
  if (!newUser.value.email || !newUser.value.password) {
    toast.error('Email dan Password wajib diisi')
    return
  }

  isSubmitting.value = true
  try {
    await api.post('/api/SysAdmin/users', newUser.value)
    toast.success('Pengguna berhasil ditambahkan')
    isAddModalOpen.value = false

    // Reset form
    newUser.value = { name: '', email: '', password: '', roleId: null }

    fetchUsers()
  } catch (error: any) {
    console.error('Failed to create user:', error)
    toast.error(error.response?.data?.message || 'Gagal menambahkan pengguna')
  } finally {
    isSubmitting.value = false
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
        <p class="text-sm text-muted-foreground mt-1 font-medium">Kelola identitas, akses, dan status seluruh pengguna dalam sistem AORTA.</p>
      </div>

      <div class="flex items-center gap-3">
        <button @click="isAddModalOpen = true" class="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <Plus class="w-4 h-4" /> Tambah Pengguna
        </button>
      </div>
    </div>

    <!-- Add User Modal -->
    <Dialog v-model:open="isAddModalOpen">
      <DialogContent class="sm:max-w-[425px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Tambah Pengguna Baru</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground">
            Isi identitas dan peran untuk membuat kredensial baru.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="name" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Lengkap</Label>
            <Input id="name" v-model="newUser.name" placeholder="Contoh: Dr. Andi Pratama" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label for="email" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Alamat Email</Label>
            <Input id="email" v-model="newUser.email" type="email" placeholder="email@aorta.local" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label for="password" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kata Sandi</Label>
            <Input id="password" v-model="newUser.password" type="password" placeholder="••••••••" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label for="role" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Peran (Role)</Label>
            <select id="role" v-model="newUser.roleId" class="flex h-10 w-full rounded-xl border border-border/50 bg-muted/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <option :value="null" disabled>Pilih Peran Sistem</option>
              <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isAddModalOpen = false" class="rounded-xl font-bold text-xs h-10">Batal</Button>
          <Button @click="createUser" :disabled="isSubmitting" class="rounded-xl font-bold text-xs h-10 px-6 shadow-sm">
            <span v-if="!isSubmitting">Simpan Pengguna</span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Menyimpan...
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Data Table Container -->
    <div class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden transition-all duration-700 delay-100 ease-out flex flex-col"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">

      <!-- Toolbar -->
      <div class="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
        <!-- Search -->
        <div class="relative w-full sm:w-[320px]">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama, email, atau peran..."
            class="w-full pl-10 pr-4 h-11 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-foreground"
          >
        </div>

        <!-- Filters (Dummy visual) -->
        <div class="flex items-center gap-2">
          <button class="h-10 px-4 bg-card border border-border text-foreground text-xs font-bold rounded-xl hover:bg-accent transition-colors flex items-center gap-2">
            Status: Semua
          </button>
          <button class="h-10 px-4 bg-card border border-border text-foreground text-xs font-bold rounded-xl hover:bg-accent transition-colors flex items-center gap-2">
            Peran: Semua
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto custom-scrollbar">
        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr class="border-b border-border/50 bg-muted/30">
              <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[300px]">Identitas Pengguna</th>
              <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[180px]">Peran (Role)</th>
              <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[140px]">Status</th>
              <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-[160px]">Aktivitas Terakhir</th>
              <th class="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/30">
            <!-- Empty State -->
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">
                <div class="flex flex-col items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-3 border border-border/50">
                    <Search class="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p class="text-sm font-semibold text-foreground">Tidak ada pengguna ditemukan</p>
                  <p class="text-xs mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
                </div>
              </td>
            </tr>

            <!-- User Rows -->
            <tr v-for="(user, index) in filteredUsers" :key="user.id"
                class="hover:bg-accent/50 transition-colors group"
                :style="{ transitionDelay: `${(index + 1) * 50}ms` }">

              <!-- Identity -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-accent border border-border/50 flex items-center justify-center font-bold text-muted-foreground text-sm shrink-0">
                    {{ user.avatar }}
                  </div>
                  <div class="flex flex-col overflow-hidden">
                    <span class="text-sm font-bold text-foreground tracking-tight truncate">{{ user.name }}</span>
                    <div class="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Mail class="w-3 h-3" />
                      <span class="truncate">{{ user.email }}</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Role -->
              <td class="px-6 py-4">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                     :class="user.role === 'Superadmin' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-accent text-muted-foreground border-border/50'">
                  <ShieldCheck v-if="user.role === 'Superadmin'" class="w-3 h-3" />
                  <Users v-else class="w-3 h-3" />
                  {{ user.role }}
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <div class="inline-flex items-center gap-2">
                  <span class="relative flex h-2.5 w-2.5">
                    <span v-if="user.status === 'Active'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="user.status === 'Active' ? 'bg-emerald-500' : 'bg-muted-foreground'"></span>
                  </span>
                  <span class="text-xs font-semibold" :class="user.status === 'Active' ? 'text-foreground' : 'text-muted-foreground'">
                    {{ user.status }}
                  </span>
                </div>
              </td>

              <!-- Last Login -->
              <td class="px-6 py-4">
                <span class="text-xs font-medium text-muted-foreground">{{ user.lastLogin }}</span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <button class="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent flex items-center justify-center ml-auto transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <MoreHorizontal class="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-48 rounded-xl border-border/60 shadow-lg p-1 bg-popover text-popover-foreground">
                    <DropdownMenuLabel class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">Tindakan</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="rounded-lg cursor-pointer text-xs font-medium hover:bg-accent focus:bg-accent">
                      <KeySquare class="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Atur Ulang Sandi
                    </DropdownMenuItem>
                    <DropdownMenuItem class="rounded-lg cursor-pointer text-xs font-medium hover:bg-accent focus:bg-accent">
                      <History class="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Log Aktivitas
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="toggleStatus(user)" class="rounded-lg cursor-pointer text-xs font-medium focus:bg-accent" :class="user.status === 'Active' ? 'text-amber-500 focus:text-amber-600' : 'text-emerald-500 focus:text-emerald-600'">
                      <UserX v-if="user.status === 'Active'" class="w-3.5 h-3.5 mr-2" />
                      <UserCheck v-else class="w-3.5 h-3.5 mr-2" />
                      {{ user.status === 'Active' ? 'Nonaktifkan Akun' : 'Aktifkan Akun' }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="px-6 py-4 border-t border-border/50 bg-muted/20 flex items-center justify-between rounded-b-3xl">
        <p class="text-xs font-medium text-muted-foreground">Menampilkan <span class="font-bold text-foreground">{{ filteredUsers.length }}</span> pengguna</p>
        <div class="flex gap-1">
          <button class="px-3 py-1.5 text-xs font-bold bg-card border border-border rounded-lg text-muted-foreground cursor-not-allowed">Sebelummya</button>
          <button class="px-3 py-1.5 text-xs font-bold bg-card border border-border rounded-lg text-foreground hover:bg-accent transition-colors">Selanjutnya</button>
        </div>
      </div>

    </div>

  </div>
</template>