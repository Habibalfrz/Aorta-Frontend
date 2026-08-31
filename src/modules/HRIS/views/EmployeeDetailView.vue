<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HrisLayout from '@/layouts/HrisLayout.vue'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, UserSquare, CalendarClock, ShieldCheck, Users } from 'lucide-vue-next'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

// Import lazy-loaded child components for the tabs
import EmployeeBasicInfoTab from '../components/EmployeeBasicInfoTab.vue'
import EmployeeHistoryTab from '../components/EmployeeHistoryTab.vue'
import EmployeeCredentialsTab from '../components/EmployeeCredentialsTab.vue'
import EmployeeFamilyTab from '../components/EmployeeFamilyTab.vue'

const route = useRoute()
const router = useRouter()
const employeeId = computed(() => route.params.id as string)

// State for active tab
const activeTab = ref('basic-info')
const employeeData = ref<any>(null)
const isLoading = ref(true)

const fetchEmployeeDetail = async () => {
  try {
    const response = await api.get(`/api/hris/employees/${employeeId.value}`)
    employeeData.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch employee detail:', error)
    toast.error('Gagal memuat detail pegawai')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchEmployeeDetail()
})

const goBack = () => {
  router.push('/hris/employees')
}
</script>

<template>
  <div class="h-full space-y-8 max-w-[1400px]">
    <div class="transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center gap-4 mb-6"
         :class="!isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'">
      <Button variant="outline" size="icon" @click="goBack" class="h-9 w-9 shrink-0 bg-card border-border hover:bg-accent text-foreground">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-foreground">Detail Pegawai</h1>
        <p class="text-sm font-medium text-muted-foreground mt-1">ID: {{ employeeId }}</p>
      </div>
    </div>

    <div class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[600px] transition-all duration-700 delay-100 ease-out"
         :class="!isLoading ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'">
      <Tabs v-model="activeTab" class="w-full flex flex-col sm:flex-row h-full">
        <!-- Sidebar Navigation (Desktop) / Top Navigation (Mobile) -->
        <div class="sm:w-64 bg-muted/20 border-b sm:border-b-0 sm:border-r border-border/50 p-6 shrink-0 relative">
          <!-- Ambient Glow -->
          <div class="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

          <TabsList class="flex sm:flex-col h-auto w-full bg-transparent justify-start gap-2 p-0 overflow-x-auto sm:overflow-visible relative z-10">
            <TabsTrigger
              value="basic-info"
              class="w-full justify-start text-left px-4 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap text-muted-foreground font-medium hover:bg-accent/50"
            >
              <UserSquare class="w-4 h-4 mr-3 shrink-0" />
              Informasi Dasar
            </TabsTrigger>
            <TabsTrigger
              value="history"
              class="w-full justify-start text-left px-4 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap text-muted-foreground font-medium hover:bg-accent/50"
            >
              <CalendarClock class="w-4 h-4 mr-3 shrink-0" />
              Riwayat Penempatan
            </TabsTrigger>
            <TabsTrigger
              value="credentials"
              class="w-full justify-start text-left px-4 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap text-muted-foreground font-medium hover:bg-accent/50"
            >
              <ShieldCheck class="w-4 h-4 mr-3 shrink-0" />
              Kredensial
            </TabsTrigger>
            <TabsTrigger
              value="family"
              class="w-full justify-start text-left px-4 py-3 rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap text-muted-foreground font-medium hover:bg-accent/50"
            >
              <Users class="w-4 h-4 mr-3 shrink-0" />
              Keluarga
            </TabsTrigger>
          </TabsList>
        </div>

        <!-- Tab Content Area -->
        <div class="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10 bg-transparent">
          <TabsContent value="basic-info" class="mt-0 outline-none">
            <EmployeeBasicInfoTab v-if="activeTab === 'basic-info'" :employee-id="employeeId" />
          </TabsContent>

          <TabsContent value="history" class="mt-0 outline-none">
            <EmployeeHistoryTab v-if="activeTab === 'history'" :employee-id="employeeId" />
          </TabsContent>

          <TabsContent value="credentials" class="mt-0 outline-none">
            <EmployeeCredentialsTab v-if="activeTab === 'credentials'" :employee-id="employeeId" />
          </TabsContent>

          <TabsContent value="family" class="mt-0 outline-none">
            <EmployeeFamilyTab v-if="activeTab === 'family'" :employee-id="employeeId" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  </div>
</template>
