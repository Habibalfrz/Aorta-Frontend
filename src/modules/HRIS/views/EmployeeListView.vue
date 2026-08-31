<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EmployeeForm from '../components/EmployeeForm.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/api/axios'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, Filter, MoreHorizontal, FileText, CalendarClock, UserSquare } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'vue-sonner'

// Types based on the expected API response
interface Employee {
  id: string;
  employeeNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  // Fallbacks for UI presentation
  department?: string;
  position?: string;
  status?: 'Aktif' | 'Cuti' | 'Resign';
}

const employees = ref<Employee[]>([])
const isLoading = ref(true)

const searchQuery = ref('')
const isDetailOpen = ref(false)
const selectedEmployee = ref<Employee | null>(null)
const isLoaded = ref(false)

// Form Dialog State
const isFormOpen = ref(false)

const getStatusVariant = (status: Employee['status'] | undefined) => {
  switch (status) {
    case 'Aktif': return 'default'
    case 'Cuti': return 'secondary'
    case 'Resign': return 'destructive'
    default: return 'default' // Default to active look
  }
}

const openDetail = (employee: Employee) => {
  selectedEmployee.value = employee
  isDetailOpen.value = true
}

const fetchEmployees = async () => {
  isLoading.value = true
  try {
    const response = await api.get('/api/hris/employees')
    employees.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    toast.error('Gagal mengambil data pegawai')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchEmployees()
  requestAnimationFrame(() => {
    isLoaded.value = true
  })
})

const handleEmployeeCreated = (_id: string) => {
  fetchEmployees()
}

const deleteEmployeeById = async (emp: Employee) => {
  if (!confirm(`Hapus pegawai ${emp.fullName}?`)) return

  try {
    await api.delete(`/api/hris/employees/${emp.id}`)
    toast.success('Pegawai berhasil dihapus')
    fetchEmployees()
  } catch (error: any) {
    console.error('Failed to delete employee:', error)
    toast.error(error.response?.data?.message || 'Gagal menghapus pegawai')
  }
}
</script>

<template>
  <div class="h-full space-y-8 max-w-[1400px]">
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-between"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Data Pegawai</h1>
        <p class="text-sm text-muted-foreground mt-1 font-medium">Kelola informasi, posisi, dan status seluruh pegawai rumah sakit.</p>
      </div>
      <!-- Add permission protection to the add button -->
      <Button v-permission="'hris.employees.write'" class="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm" @click="isFormOpen = true">
        <Plus class="w-4 h-4" />
        Tambah Pegawai
      </Button>
    </div>

    <!-- Data Table Card -->
    <div class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden transition-all duration-700 delay-100 ease-out flex flex-col"
         :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
      <!-- Toolbar -->
      <div class="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
        <div class="flex items-center gap-2 flex-1">
          <div class="relative w-full max-w-sm">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="Cari NIK atau Nama..."
              class="w-full pl-10 pr-4 h-11 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-foreground"
            />
          </div>
          <Button variant="outline" class="h-11 px-4 bg-card border border-border text-foreground text-xs font-bold rounded-xl hover:bg-accent transition-colors flex items-center gap-2 shadow-sm">
            <Filter class="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        <div class="text-xs font-medium text-muted-foreground">
          Menampilkan <span class="font-bold text-foreground">{{ employees.length }}</span> Pegawai
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto custom-scrollbar">
        <Table class="w-full text-left border-collapse min-w-[800px]">
          <TableHeader class="bg-muted/30 border-b border-border/50">
            <TableRow class="hover:bg-transparent border-b-0">
              <TableHead class="w-[150px] font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">NIK</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Nama Lengkap</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Gender</TableHead>
              <TableHead class="font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Departemen</TableHead>
              <TableHead class="w-[100px] font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Status</TableHead>
              <TableHead class="w-[70px] text-right font-bold text-muted-foreground uppercase tracking-widest text-[10px] px-6 py-4">Opsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody class="divide-y divide-border/30">
            <TableRow v-if="isLoading">
              <TableCell colspan="6" class="h-24 text-center text-muted-foreground font-medium text-sm">
                Memuat data pegawai...
              </TableCell>
            </TableRow>
            <template v-else>
              <TableRow
                v-for="(emp, index) in employees"
                :key="emp.id"
                class="cursor-pointer hover:bg-accent/50 transition-colors group"
                :style="{ transitionDelay: `${(index + 1) * 50}ms` }"
                @click="openDetail(emp)"
              >
                <TableCell class="font-mono text-sm font-bold text-muted-foreground px-6 py-4">{{ emp.employeeNumber }}</TableCell>
                <TableCell class="font-bold text-foreground text-sm tracking-tight px-6 py-4">{{ emp.fullName }}</TableCell>
                <TableCell class="text-muted-foreground text-xs font-medium px-6 py-4">{{ emp.gender === 'L' ? 'Laki-laki' : (emp.gender === 'P' ? 'Perempuan' : emp.gender) }}</TableCell>
                <TableCell class="text-muted-foreground text-xs font-medium px-6 py-4">{{ emp.department || 'Belum diatur' }}</TableCell>
                <TableCell class="px-6 py-4">
                  <Badge :variant="getStatusVariant(emp.status)" class="text-[10px] font-bold uppercase tracking-wider">
                    {{ emp.status || 'Aktif' }}
                  </Badge>
                </TableCell>
                <TableCell class="text-right px-6 py-4" @click.stop>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" class="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        <span class="sr-only">Buka menu</span>
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-48 rounded-xl border-border/60 shadow-lg p-1 bg-popover text-popover-foreground">
                      <DropdownMenuItem @click="openDetail(emp)" class="rounded-lg cursor-pointer text-xs font-medium hover:bg-accent focus:bg-accent">Lihat Detail</DropdownMenuItem>
                      <div v-permission="'hris.employees.write'">
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="toast.info('Fitur edit pegawai akan dilanjutkan pada fase detail form')" class="rounded-lg cursor-pointer text-xs font-medium hover:bg-accent focus:bg-accent">Edit Data</DropdownMenuItem>
                        <DropdownMenuItem @click="deleteEmployeeById(emp)" class="rounded-lg cursor-pointer text-xs font-medium text-destructive hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10">Hapus</DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow v-if="employees.length === 0">
                <TableCell colspan="6" class="h-24 text-center text-muted-foreground text-sm font-medium">
                  Tidak ada data pegawai.
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Side Sheet / Drawer for Details -->
    <Sheet v-model:open="isDetailOpen">
      <SheetContent class="sm:max-w-xl w-[90vw] p-0 flex flex-col h-full bg-slate-50">
        <!-- Header -->
        <div class="p-6 bg-white border-b border-slate-200">
          <SheetHeader>
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-4">
                <Avatar class="w-16 h-16 border border-slate-200 shadow-sm">
                  <AvatarImage src="" />
                  <AvatarFallback class="bg-indigo-100 text-indigo-700 text-xl font-semibold">
                    {{ selectedEmployee?.fullName?.charAt(0) || 'U' }}
                  </AvatarFallback>
                </Avatar>
                <div class="pt-1">
                  <SheetTitle class="text-xl text-slate-900">{{ selectedEmployee?.fullName }}</SheetTitle>
                  <SheetDescription class="text-sm mt-1 flex flex-col gap-1">
                    <span class="font-mono text-slate-500">{{ selectedEmployee?.employeeNumber }}</span>
                    <span class="text-slate-700 font-medium">{{ selectedEmployee?.position || 'Posisi belum diatur' }} &bull; {{ selectedEmployee?.department || 'Departemen belum diatur' }}</span>
                  </SheetDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" @click="selectedEmployee ? $router.push({ path: '/hris/employees/' + selectedEmployee.id }) : null">
                Lihat Lengkap
              </Button>
            </div>
          </SheetHeader>
        </div>

        <!-- Scrollable Tabs Content -->
        <div class="flex-1 overflow-y-auto">
          <Tabs defaultValue="profil" class="w-full flex flex-col h-full">
            <div class="px-6 pt-4 bg-white border-b border-slate-200 sticky top-0 z-10">
              <TabsList class="w-full justify-start h-auto p-0 bg-transparent gap-6">
                <TabsTrigger
                  value="profil"
                  class="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-medium"
                >
                  <UserSquare class="w-4 h-4 mr-2" />
                  Profil
                </TabsTrigger>
                <TabsTrigger
                  value="shift"
                  class="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-medium"
                >
                  <CalendarClock class="w-4 h-4 mr-2" />
                  Riwayat Shift
                </TabsTrigger>
                <TabsTrigger
                  value="dokumen"
                  class="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-3 text-sm font-medium"
                >
                  <FileText class="w-4 h-4 mr-2" />
                  Dokumen
                </TabsTrigger>
              </TabsList>
            </div>

            <!-- Tab Panels -->
            <div class="p-6 flex-1">
              <TabsContent value="profil" class="mt-0 outline-none">
                <Card class="shadow-sm border-slate-200">
                  <CardHeader class="pb-3 border-b border-slate-100">
                    <CardTitle class="text-base">Informasi Personal</CardTitle>
                  </CardHeader>
                  <CardContent class="pt-4 space-y-4">
                    <div class="grid grid-cols-3 gap-4">
                      <div class="col-span-1 text-sm text-slate-500">Status Pegawai</div>
                      <div class="col-span-2 text-sm font-medium">
                        <Badge :variant="getStatusVariant(selectedEmployee?.status || 'Aktif')">
                          {{ selectedEmployee?.status || 'Aktif' }}
                        </Badge>
                      </div>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                      <div class="col-span-1 text-sm text-slate-500">Tanggal Lahir</div>
                      <div class="col-span-2 text-sm font-medium">
                        {{ selectedEmployee?.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString('id-ID') : '-' }}
                      </div>
                    </div>
                    <div class="grid grid-cols-3 gap-4 animate-pulse">
                      <div class="col-span-1 h-4 bg-slate-200 rounded w-24"></div>
                      <div class="col-span-2 h-4 bg-slate-200 rounded w-64"></div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shift" class="mt-0 outline-none">
                <div class="text-center py-12 text-slate-500 text-sm">
                  <CalendarClock class="w-8 h-8 mx-auto text-slate-300 mb-3" />
                  Memuat data riwayat shift...
                </div>
              </TabsContent>

              <TabsContent value="dokumen" class="mt-0 outline-none">
                <div class="text-center py-12 text-slate-500 text-sm">
                  <FileText class="w-8 h-8 mx-auto text-slate-300 mb-3" />
                  Memuat dokumen kepegawaian...
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Create Employee Dialog -->
    <EmployeeForm
      v-model:open="isFormOpen"
      @success="handleEmployeeCreated"
    />
  </div>
</template>