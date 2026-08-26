<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HrisLayout from '@/layouts/HrisLayout.vue'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, UserSquare, CalendarClock, ShieldCheck, Users } from 'lucide-vue-next'

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

const goBack = () => {
  router.push('/hris/employees')
}
</script>

<template>
  <HrisLayout>
    <div class="flex items-center gap-4 mb-6">
      <Button variant="outline" size="icon" @click="goBack" class="h-9 w-9 shrink-0">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Detail Pegawai</h1>
        <p class="text-sm text-slate-500">ID: {{ employeeId }}</p>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
      <Tabs v-model="activeTab" class="w-full flex flex-col sm:flex-row h-full">
        <!-- Sidebar Navigation (Desktop) / Top Navigation (Mobile) -->
        <div class="sm:w-64 bg-slate-50 border-b sm:border-b-0 sm:border-r border-slate-200 p-4 shrink-0">
          <TabsList class="flex sm:flex-col h-auto w-full bg-transparent justify-start gap-1 p-0 overflow-x-auto sm:overflow-visible">
            <TabsTrigger
              value="basic-info"
              class="w-full justify-start text-left px-4 py-2.5 rounded-md data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:font-semibold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap"
            >
              <UserSquare class="w-4 h-4 mr-3 shrink-0" />
              Informasi Dasar
            </TabsTrigger>
            <TabsTrigger
              value="history"
              class="w-full justify-start text-left px-4 py-2.5 rounded-md data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:font-semibold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap"
            >
              <CalendarClock class="w-4 h-4 mr-3 shrink-0" />
              Riwayat Penempatan
            </TabsTrigger>
            <TabsTrigger
              value="credentials"
              class="w-full justify-start text-left px-4 py-2.5 rounded-md data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:font-semibold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap"
            >
              <ShieldCheck class="w-4 h-4 mr-3 shrink-0" />
              Kredensial
            </TabsTrigger>
            <TabsTrigger
              value="family"
              class="w-full justify-start text-left px-4 py-2.5 rounded-md data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:font-semibold data-[state=active]:shadow-none transition-colors border border-transparent whitespace-nowrap"
            >
              <Users class="w-4 h-4 mr-3 shrink-0" />
              Keluarga
            </TabsTrigger>
          </TabsList>
        </div>

        <!-- Tab Content Area -->
        <div class="flex-1 p-6 sm:p-8 overflow-y-auto">
          <!-- shadcn-vue TabsContent automatically unmounts content when not active by default, ensuring lazy loading behavior -->
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
  </HrisLayout>
</template>
