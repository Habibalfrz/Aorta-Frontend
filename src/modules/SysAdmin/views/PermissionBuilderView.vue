<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, KeyRound, Globe, Server, Database, MoreHorizontal, Edit2, Trash2, ShieldAlert } from 'lucide-vue-next'
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
import api from '@/api/axios'
import { toast } from 'vue-sonner'

const isLoaded = ref(false)
const isLoading = ref(false)
const isSubmitting = ref(false)
const searchQuery = ref('')
const isAddModalOpen = ref(false)

const rawPermissions = ref<any[]>([])

const newPerm = ref({
  name: '',
  description: '',
  moduleGroup: ''
})

const fetchPermissions = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/SysAdmin/permissions')
    rawPermissions.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch permissions:', error)
    toast.error('Gagal mengambil daftar hak akses dari server')
  } finally {
    isLoading.value = false
  }
}

const createPermission = async () => {
  if (!newPerm.value.name.trim()) {
    toast.error('Nama permission wajib diisi')
    return
  }

  isSubmitting.value = true
  try {
    await api.post('/api/SysAdmin/permissions', newPerm.value)
    toast.success('Permission (Virtual) berhasil dibuat')
    isAddModalOpen.value = false
    newPerm.value = { name: '', description: '', moduleGroup: '' }
    fetchPermissions()
  } catch (error: any) {
    console.error('Failed to create permission:', error)
    toast.error(error.response?.data?.message || 'Gagal membuat permission')
  } finally {
    isSubmitting.value = false
  }
}

const deletePermission = async (id: number) => {
  if (!confirm('Hapus permission ini? (Jika ini adalah code-first permission, ia akan muncul kembali setelah restart server)')) return

  try {
    const response = await api.delete(`/api/SysAdmin/permissions/${id}`)
    toast.success(response.data?.message || 'Permission dihapus')
    fetchPermissions()
  } catch (error: any) {
    console.error('Failed to delete permission:', error)
    toast.error(error.response?.data?.message || 'Gagal menghapus permission')
  }
}

onMounted(() => {
  fetchPermissions()
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})

// Dynamic Grouping
const permissionGroups = computed(() => {
  if (!rawPermissions.value.length) return []

  const groupsObj: Record<string, any> = {}

  rawPermissions.value.forEach(p => {
    // Gunakan ModuleGroup atau default 'SYSTEM CORE' jika tidak ada
    const groupName = p.moduleGroup && p.moduleGroup !== 'UNKNOWN' ? p.moduleGroup : 'SYSTEM CORE'
    const groupId = `grp_${groupName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`

    if (!groupsObj[groupId]) {
      groupsObj[groupId] = {
        id: groupId,
        name: groupName + ' Module',
        // Tentukan ikon berdasarkan nama grup
        icon: groupName === 'API' ? 'Globe' : (groupName === 'SYSTEM CORE' ? 'Database' : 'Server'),
        permissions: []
      }
    }

    // Heuristik tipe izin untuk styling UI
    let pType = 'Global'
    const nameLower = p.name.toLowerCase()
    if (nameLower.includes('delete') || nameLower.includes('destroy') || nameLower.includes('admin') || nameLower.includes('manage')) pType = 'Critical'
    else if (nameLower.includes('create') || nameLower.includes('update') || nameLower.includes('edit') || nameLower.includes('post')) pType = 'Write'
    else if (nameLower.includes('view') || nameLower.includes('read') || nameLower.includes('get')) pType = 'Read'

    groupsObj[groupId].permissions.push({
      id: p.id || p.name,
      name: p.name,
      description: p.description || 'Tidak ada deskripsi',
      type: pType
    })
  })

  return Object.values(groupsObj)
})

const filteredGroups = computed(() => {
  if (!searchQuery.value) return permissionGroups.value
  const q = searchQuery.value.toLowerCase()

  // Clone and filter deeply
  return permissionGroups.value.map((group: any) => {
    return {
      ...group,
      permissions: group.permissions.filter((p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    }
  }).filter((group: any) => group.name.toLowerCase().includes(q) || group.permissions.length > 0)
})

function getTypeStyle(type: string) {
  switch(type) {
    case 'Critical': return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'Write': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    case 'Read': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  }
}

function getIconComponent(iconName: string) {
  switch(iconName) {
    case 'Server': return Server
    case 'Database': return Database
    case 'Globe': return Globe
    default: return KeyRound
  }
}
</script>

<template>
  <div class="space-y-8 max-w-[1400px]">

    <!-- Page Title & Actions -->
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col md:flex-row md:items-end justify-between gap-4"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Permission Builder</h1>
        <p class="text-sm text-muted-foreground mt-1 font-medium">Desain dan kelola matriks izin akses granuler (fine-grained access control) sistem.</p>
      </div>

      <div class="flex items-center gap-3">
        <button @click="isAddModalOpen = true" class="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <Plus class="w-4 h-4" /> Ciptakan Izin (Permission)
        </button>
      </div>
    </div>

    <!-- Create Permission Modal -->
    <Dialog v-model:open="isAddModalOpen">
      <DialogContent class="sm:max-w-[425px] bg-card border-border/60 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Ciptakan Izin (Virtual)</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground">
            Izin yang dibuat di sini idealnya berfungsi sebagai penanda UI front-end. Izin endpoint backend di-sync secara otomatis.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="permName" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama Izin (Kebab-case)</Label>
            <Input id="permName" v-model="newPerm.name" placeholder="frontend.button.hide" class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
          <div class="space-y-2">
            <Label for="moduleGroup" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Grup Modul</Label>
            <Input id="moduleGroup" v-model="newPerm.moduleGroup" placeholder="Contoh: HRIS, TICKETING" class="bg-muted/50 border-border/50 rounded-xl uppercase" />
          </div>
          <div class="space-y-2">
            <Label for="desc" class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deskripsi</Label>
            <Input id="desc" v-model="newPerm.description" placeholder="Menyembunyikan tombol khusus..." class="bg-muted/50 border-border/50 rounded-xl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isAddModalOpen = false" class="rounded-xl font-bold text-xs h-10">Batal</Button>
          <Button @click="createPermission" :disabled="isSubmitting" class="rounded-xl font-bold text-xs h-10 px-6 shadow-sm">
            <span v-if="!isSubmitting">Ciptakan Izin</span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Memproses...
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Main Container -->
    <div class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden transition-all duration-700 delay-100 ease-out flex flex-col min-h-[600px]"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">

      <!-- Ambient Background -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-[100%] blur-[80px] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>

      <!-- Toolbar -->
      <div class="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20 relative z-10">
        <!-- Search -->
        <div class="relative w-full sm:w-[400px]">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari berdasarkan nama endpoint atau deskripsi..."
            class="w-full pl-10 pr-4 h-11 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-foreground"
          >
        </div>

        <div class="flex items-center gap-2">
          <button class="h-10 px-4 bg-card border border-border text-foreground text-xs font-bold rounded-xl hover:bg-accent transition-colors flex items-center gap-2 shadow-sm">
            <Server class="w-3.5 h-3.5" /> Tambah Grup
          </button>
        </div>
      </div>

      <!-- Body / Groups -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 space-y-8 relative z-10">

        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <svg class="animate-spin h-10 w-10 mb-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p class="text-base font-bold text-foreground">Menarik Data Akses (Permissions)...</p>
        </div>

        <div v-else-if="filteredGroups.length === 0" class="flex flex-col items-center justify-center py-20 text-muted-foreground">
           <div class="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4 border border-border/50">
             <KeyRound class="w-8 h-8 text-muted-foreground" />
           </div>
           <p class="text-base font-bold text-foreground">Tidak ada permission ditemukan.</p>
           <p class="text-sm mt-1">Ubah kata kunci pencarian Anda atau periksa koneksi server.</p>
        </div>

        <!-- Iterasi Group -->
        <div v-else v-for="(group, gIdx) in filteredGroups" :key="group.id"
             class="space-y-4 transition-all duration-700 ease-out"
             :style="{ transitionDelay: `${(gIdx + 2) * 100}ms` }"
             :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">

          <!-- Group Header -->
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-lg bg-accent text-muted-foreground flex items-center justify-center border border-border/50">
               <component :is="getIconComponent(group.icon)" class="w-4 h-4" />
             </div>
             <h3 class="text-lg font-bold text-foreground tracking-tight">{{ group.name }}</h3>
             <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-accent text-muted-foreground border border-border/50">{{ group.permissions.length }} Item</span>
          </div>

          <!-- Permissions Grid inside Group -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div v-for="perm in group.permissions" :key="perm.id"
                 class="bg-card rounded-2xl p-5 border border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all group/card relative">

              <div class="flex items-start justify-between mb-4">
                <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border"
                     :class="getTypeStyle(perm.type)">
                  <ShieldAlert v-if="perm.type === 'Critical'" class="w-2.5 h-2.5" />
                  {{ perm.type }}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <button class="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus:outline-none">
                      <MoreHorizontal class="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-40 rounded-xl border-border/60 shadow-lg p-1 bg-popover text-popover-foreground">
                    <DropdownMenuItem class="rounded-lg cursor-pointer text-xs font-medium hover:bg-accent focus:bg-accent">
                      <Edit2 class="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Edit Izin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="deletePermission(perm.id)" class="rounded-lg cursor-pointer text-xs font-medium text-destructive hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10">
                      <Trash2 class="w-3.5 h-3.5 mr-2" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h4 class="font-bold text-foreground text-sm tracking-tight mb-1 group-hover/card:text-primary transition-colors">
                {{ perm.name }}
              </h4>
              <p class="text-xs text-muted-foreground font-medium leading-relaxed">
                {{ perm.description }}
              </p>

            </div>

          </div>
        </div>

      </div>
    </div>

  </div>
</template>
