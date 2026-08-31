<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import api from '@/api/axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  employeeId: string
}>()

const isLoading = ref(true)
const historyRecords = ref<any[]>([])

const fetchHistory = async () => {
  isLoading.value = true
  try {
    // Assuming backend endpoint for history exists
    // const response = await api.get(`/api/hris/employees/${props.employeeId}/history`)
    // historyRecords.value = response.data.data || []

    // Simulate API delay for demonstration of lazy loading
    await new Promise(resolve => setTimeout(resolve, 800))
    historyRecords.value = [
      { id: 1, title: 'Dipromosikan', department: 'Keperawatan', position: 'Perawat Senior', date: '2023-01-15', notes: 'Berdasarkan evaluasi tahunan.' },
      { id: 2, title: 'Bergabung', department: 'Keperawatan', position: 'Perawat Pelaksana', date: '2020-05-10', notes: 'Rekrutmen Gelombang I 2020.' }
    ]
  } catch (error) {
    console.error('Failed to fetch history:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchHistory()
})
</script>

<template>
  <div class="space-y-6">
    <Card class="bg-card/50 backdrop-blur-md border-border/50 shadow-sm rounded-2xl">
      <CardHeader class="pb-3 border-b border-border/50">
        <CardTitle class="text-lg font-bold tracking-tight text-foreground">Riwayat Penempatan & Mutasi</CardTitle>
      </CardHeader>
      <CardContent class="pt-6">
        <div v-if="isLoading" class="space-y-8">
          <!-- Timeline Skeletons -->
          <div v-for="i in 3" :key="i" class="flex gap-4">
            <div class="flex flex-col items-center">
              <Skeleton class="h-4 w-4 rounded-full" />
              <Skeleton class="h-full w-[2px] mt-2 min-h-[4rem]" />
            </div>
            <div class="space-y-2 flex-1 pb-4">
              <Skeleton class="h-5 w-1/3" />
              <Skeleton class="h-4 w-1/4" />
              <Skeleton class="h-4 w-full" />
            </div>
          </div>
        </div>

        <div v-else-if="historyRecords.length > 0" class="relative border-l-2 border-border/50 ml-3 md:ml-4 space-y-8 pb-4">
          <div v-for="record in historyRecords" :key="record.id" class="relative pl-6 md:pl-8">
            <!-- Timeline dot -->
            <span class="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary/20 border-2 border-primary"></span>

            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
              <h3 class="text-base font-semibold text-foreground">{{ record.title }}</h3>
              <time class="text-sm font-medium text-muted-foreground mt-1 sm:mt-0">
                {{ new Date(record.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) }}
              </time>
            </div>

            <p class="text-sm font-medium text-foreground mt-1">
              {{ record.position }} <span class="text-muted-foreground mx-1">&bull;</span> {{ record.department }}
            </p>

            <p v-if="record.notes" class="text-sm text-muted-foreground mt-2 bg-muted/30 p-3 rounded-xl border border-border/50">
              {{ record.notes }}
            </p>
          </div>
        </div>

        <div v-else class="text-center py-12 text-muted-foreground">
          Belum ada riwayat penempatan yang tercatat.
        </div>
      </CardContent>
    </Card>
  </div>
</template>
