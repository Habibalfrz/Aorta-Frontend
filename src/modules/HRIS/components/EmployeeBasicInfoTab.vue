<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  employeeId: string
}>()

const isLoading = ref(true)
const basicInfo = ref<any>(null)

const fetchBasicInfo = async () => {
  isLoading.value = true
  try {
    // Simulated endpoint for basic info or just reuse the general endpoint
    const response = await api.get(`/api/hris/employees/${props.employeeId}`)
    basicInfo.value = response.data.data || response.data
  } catch (error) {
    console.error('Failed to fetch basic info:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBasicInfo()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Using Card to encapsulate content -->
    <Card class="border-slate-200 shadow-sm">
      <CardHeader class="pb-3 border-b border-slate-100">
        <CardTitle class="text-lg text-slate-800">Informasi Dasar Pegawai</CardTitle>
      </CardHeader>
      <CardContent class="pt-6">
        <div v-if="isLoading" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Skeleton class="h-4 w-24" />
              <Skeleton class="h-10 w-full" />
            </div>
            <div class="space-y-2">
              <Skeleton class="h-4 w-32" />
              <Skeleton class="h-10 w-full" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-10 w-full" />
            </div>
            <div class="space-y-2">
              <Skeleton class="h-4 w-28" />
              <Skeleton class="h-10 w-full" />
            </div>
          </div>
          <div class="space-y-2">
            <Skeleton class="h-4 w-16" />
            <Skeleton class="h-24 w-full" />
          </div>
        </div>

        <div v-else-if="basicInfo" class="space-y-6">
          <!-- Two-column layout for details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm font-medium text-slate-500 mb-1">Nomor Induk Kepegawaian (NIK)</p>
              <p class="text-base text-slate-900 font-mono">{{ basicInfo.employeeNumber }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500 mb-1">Nama Lengkap</p>
              <p class="text-base text-slate-900">{{ basicInfo.fullName }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm font-medium text-slate-500 mb-1">Jenis Kelamin</p>
              <p class="text-base text-slate-900">
                {{ basicInfo.gender === 'L' ? 'Laki-laki' : (basicInfo.gender === 'P' ? 'Perempuan' : basicInfo.gender) }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500 mb-1">Tanggal Lahir</p>
              <p class="text-base text-slate-900">
                {{ basicInfo.dateOfBirth ? new Date(basicInfo.dateOfBirth).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-' }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p class="text-sm font-medium text-slate-500 mb-1">Status Kepegawaian</p>
              <p class="text-base text-slate-900">{{ basicInfo.status || 'Aktif' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-500 mb-1">Tanggal Bergabung</p>
              <p class="text-base text-slate-900">
                {{ basicInfo.joinDate ? new Date(basicInfo.joinDate).toLocaleDateString('id-ID') : '-' }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-slate-500">
          Gagal memuat data informasi dasar.
        </div>
      </CardContent>
    </Card>
  </div>
</template>
