<script setup lang="ts">
import { ref, onMounted } from 'vue'
// import api from '@/api/axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  employeeId: string
}>()

const isLoading = ref(true)
const credentials = ref<any[]>([])

const fetchCredentials = async () => {
  isLoading.value = true
  try {
    // const response = await api.get(`/api/hris/employees/${props.employeeId}/credentials`)
    // credentials.value = response.data.data || []

    await new Promise(resolve => setTimeout(resolve, 600))
    credentials.value = [
      { id: 1, type: 'Surat Tanda Registrasi (STR)', number: 'STR-9988776655', issueDate: '2022-01-10', expiryDate: '2027-01-10', status: 'Valid' },
      { id: 2, type: 'Surat Izin Praktik (SIP)', number: 'SIP-11223344', issueDate: '2022-02-15', expiryDate: '2027-02-15', status: 'Valid' }
    ]
  } catch (error) {
    console.error('Failed to fetch credentials:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchCredentials()
})
</script>

<template>
  <div class="space-y-6">
    <Card class="bg-card/50 backdrop-blur-md border-border/50 shadow-sm rounded-2xl">
      <CardHeader class="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle class="text-lg font-bold tracking-tight text-foreground">Kredensial & Lisensi</CardTitle>
      </CardHeader>
      <CardContent class="pt-6">
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton class="h-32 w-full rounded-xl" v-for="i in 2" :key="i" />
        </div>

        <div v-else-if="credentials.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div v-for="cred in credentials" :key="cred.id" class="p-5 border border-border/50 rounded-xl bg-muted/30 hover:bg-muted/50 shadow-sm hover:shadow-md transition-all">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-semibold text-foreground pr-4">{{ cred.type }}</h3>
              <Badge variant="outline" class="bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">
                {{ cred.status }}
              </Badge>
            </div>

            <div class="space-y-3">
              <div>
                <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Nomor Dokumen</p>
                <p class="text-sm font-mono font-medium text-foreground">{{ cred.number }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Tanggal Terbit</p>
                  <p class="text-sm text-foreground">{{ new Date(cred.issueDate).toLocaleDateString('id-ID') }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Berlaku Hingga</p>
                  <p class="text-sm font-medium" :class="new Date(cred.expiryDate) < new Date() ? 'text-red-600' : 'text-foreground'">
                    {{ new Date(cred.expiryDate).toLocaleDateString('id-ID') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-muted-foreground">
          Tidak ada data kredensial atau lisensi yang terdaftar.
        </div>
      </CardContent>
    </Card>
  </div>
</template>
