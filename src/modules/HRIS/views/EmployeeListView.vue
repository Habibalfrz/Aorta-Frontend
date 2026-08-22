<script setup lang="ts">
import { ref } from 'vue'
import HrisLayout from '@/layouts/HrisLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

// Types
interface Employee {
  id: string;
  nik: string;
  name: string;
  department: string;
  position: string;
  status: 'Aktif' | 'Cuti' | 'Resign';
}

// Dummy Data
const employees = ref<Employee[]>([
  { id: '1', nik: 'EMP-2023-001', name: 'Dr. Sarah Wilson', department: 'Medis', position: 'Dokter Spesialis Anak', status: 'Aktif' },
  { id: '2', nik: 'EMP-2023-045', name: 'Budi Santoso', department: 'Keperawatan', position: 'Perawat Senior', status: 'Aktif' },
  { id: '3', nik: 'EMP-2023-082', name: 'Linda Kusuma', department: 'Farmasi', position: 'Apoteker', status: 'Cuti' },
  { id: '4', nik: 'EMP-2022-114', name: 'Ahmad Fadil', department: 'IT', position: 'System Administrator', status: 'Aktif' },
  { id: '5', nik: 'EMP-2021-033', name: 'Dr. Hendra Wijaya', department: 'Medis', position: 'Dokter Umum', status: 'Resign' },
  { id: '6', nik: 'EMP-2024-012', name: 'Siti Rahma', department: 'Administrasi', position: 'Front Desk', status: 'Aktif' },
  { id: '7', nik: 'EMP-2023-099', name: 'Anton Syah', department: 'Keamanan', position: 'Security Officer', status: 'Aktif' },
])

const searchQuery = ref('')
const isDetailOpen = ref(false)
const selectedEmployee = ref<Employee | null>(null)

const getStatusVariant = (status: Employee['status']) => {
  switch (status) {
    case 'Aktif': return 'default'
    case 'Cuti': return 'secondary'
    case 'Resign': return 'destructive'
    default: return 'outline'
  }
}

const openDetail = (employee: Employee) => {
  selectedEmployee.value = employee
  isDetailOpen.value = true
}
</script>

<template>
  <HrisLayout>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Data Pegawai</h1>
        <p class="text-sm text-slate-500">Kelola informasi, posisi, dan status seluruh pegawai rumah sakit.</p>
      </div>
      <Button class="bg-indigo-600 hover:bg-indigo-700">
        <Plus class="w-4 h-4 mr-2" />
        Tambah Pegawai
      </Button>
    </div>

    <!-- Data Table Card -->
    <Card class="shadow-sm border-slate-200">
      <!-- Toolbar -->
      <div class="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-white rounded-t-lg">
        <div class="flex items-center gap-2 flex-1">
          <div class="relative w-full max-w-sm">
            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              v-model="searchQuery" 
              placeholder="Cari NIK atau Nama..." 
              class="pl-9 bg-slate-50 border-slate-200" 
            />
          </div>
          <Button variant="outline" class="border-slate-200">
            <Filter class="w-4 h-4 mr-2 text-slate-500" />
            Filter
          </Button>
        </div>
        <div class="text-sm text-slate-500 font-medium">
          Total: {{ employees.length }} Pegawai
        </div>
      </div>

      <!-- Table -->
      <div class="rounded-b-lg overflow-hidden bg-white">
        <Table>
          <TableHeader class="bg-slate-50 border-b border-slate-200">
            <TableRow class="hover:bg-transparent">
              <TableHead class="w-[150px] font-semibold text-slate-700">NIK</TableHead>
              <TableHead class="font-semibold text-slate-700">Nama Lengkap</TableHead>
              <TableHead class="font-semibold text-slate-700">Departemen</TableHead>
              <TableHead class="font-semibold text-slate-700">Jabatan</TableHead>
              <TableHead class="w-[100px] font-semibold text-slate-700">Status</TableHead>
              <TableHead class="w-[70px] text-right font-semibold text-slate-700"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow 
              v-for="emp in employees" 
              :key="emp.id" 
              class="cursor-pointer hover:bg-slate-50"
              @click="openDetail(emp)"
            >
              <TableCell class="font-mono text-sm text-slate-600">{{ emp.nik }}</TableCell>
              <TableCell class="font-medium text-slate-900">{{ emp.name }}</TableCell>
              <TableCell class="text-slate-600">{{ emp.department }}</TableCell>
              <TableCell class="text-slate-600">{{ emp.position }}</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(emp.status)" class="font-medium">
                  {{ emp.status }}
                </Badge>
              </TableCell>
              <TableCell class="text-right" @click.stop>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" class="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                      <span class="sr-only">Buka menu</span>
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-40">
                    <DropdownMenuItem @click="openDetail(emp)">Lihat Detail</DropdownMenuItem>
                    <DropdownMenuItem>Edit Data</DropdownMenuItem>
                    <DropdownMenuItem class="text-red-600">Nonaktifkan</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="employees.length === 0">
              <TableCell colspan="6" class="h-24 text-center text-slate-500">
                Tidak ada data pegawai.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <!-- Pagination (Dummy) -->
      <div class="p-4 border-t border-slate-200 flex items-center justify-between bg-white rounded-b-lg">
        <div class="text-sm text-slate-500">Menampilkan 1-7 dari 7</div>
        <div class="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled>Prev</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </Card>

    <!-- Side Sheet / Drawer for Details -->
    <Sheet v-model:open="isDetailOpen">
      <SheetContent class="sm:max-w-xl w-[90vw] p-0 flex flex-col h-full bg-slate-50">
        <!-- Header -->
        <div class="p-6 bg-white border-b border-slate-200">
          <SheetHeader>
            <div class="flex items-start gap-4">
              <Avatar class="w-16 h-16 border border-slate-200 shadow-sm">
                <AvatarImage src="" />
                <AvatarFallback class="bg-indigo-100 text-indigo-700 text-xl font-semibold">
                  {{ selectedEmployee?.name?.charAt(0) || 'U' }}
                </AvatarFallback>
              </Avatar>
              <div class="pt-1">
                <SheetTitle class="text-xl text-slate-900">{{ selectedEmployee?.name }}</SheetTitle>
                <SheetDescription class="text-sm mt-1 flex flex-col gap-1">
                  <span class="font-mono text-slate-500">{{ selectedEmployee?.nik }}</span>
                  <span class="text-slate-700 font-medium">{{ selectedEmployee?.position }} &bull; {{ selectedEmployee?.department }}</span>
                </SheetDescription>
              </div>
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
                          {{ selectedEmployee?.status }}
                        </Badge>
                      </div>
                    </div>
                    <!-- Skeleton for lazy loaded content -->
                    <div class="grid grid-cols-3 gap-4 animate-pulse">
                      <div class="col-span-1 h-4 bg-slate-200 rounded w-20"></div>
                      <div class="col-span-2 h-4 bg-slate-200 rounded w-48"></div>
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
  </HrisLayout>
</template>
