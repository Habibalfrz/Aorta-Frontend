<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import api from '@/api/axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  employeeId: string
}>()

const isLoading = ref(true)
const familyMembers = ref<any[]>([])

const fetchFamily = async () => {
  isLoading.value = true
  try {
    // const response = await api.get(`/api/hris/employees/${props.employeeId}/family`)
    // familyMembers.value = response.data.data || []

    await new Promise(resolve => setTimeout(resolve, 500))
    familyMembers.value = [
      { id: 1, name: 'Budi Hartono', relation: 'Suami', gender: 'L', dateOfBirth: '1988-04-12', emergencyContact: true, phone: '08123456789' },
      { id: 2, name: 'Siti Aminah', relation: 'Anak', gender: 'P', dateOfBirth: '2015-08-22', emergencyContact: false, phone: null }
    ]
  } catch (error) {
    console.error('Failed to fetch family members:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchFamily()
})
</script>

<template>
  <div class="space-y-6">
    <Card class="border-slate-200 shadow-sm">
      <CardHeader class="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle class="text-lg text-slate-800">Data Keluarga & Kontak Darurat</CardTitle>
      </CardHeader>
      <CardContent class="pt-6">
        <div v-if="isLoading" class="space-y-4">
          <Skeleton class="h-20 w-full" v-for="i in 2" :key="i" />
        </div>

        <div v-else-if="familyMembers.length > 0" class="overflow-x-auto rounded-lg border border-slate-200">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th class="px-4 py-3">Nama Lengkap</th>
                <th class="px-4 py-3">Hubungan</th>
                <th class="px-4 py-3">L/P</th>
                <th class="px-4 py-3">Tanggal Lahir</th>
                <th class="px-4 py-3">Kontak Darurat</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="member in familyMembers" :key="member.id" class="hover:bg-slate-50/50">
                <td class="px-4 py-3 font-medium text-slate-900">{{ member.name }}</td>
                <td class="px-4 py-3 text-slate-600">{{ member.relation }}</td>
                <td class="px-4 py-3 text-slate-600">{{ member.gender }}</td>
                <td class="px-4 py-3 text-slate-600">{{ new Date(member.dateOfBirth).toLocaleDateString('id-ID') }}</td>
                <td class="px-4 py-3">
                  <div v-if="member.emergencyContact" class="flex flex-col">
                    <span class="inline-flex items-center text-emerald-600 font-medium text-xs mb-1">
                      <svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                      Ya
                    </span>
                    <span class="text-slate-500 text-xs font-mono">{{ member.phone }}</span>
                  </div>
                  <span v-else class="text-slate-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-12 text-slate-500">
          Tidak ada data keluarga yang didaftarkan.
        </div>
      </CardContent>
    </Card>
  </div>
</template>
