<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud, FileSpreadsheet, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { uploadRawAttendance } from '@/api/hris'

const isDragging = ref(false)
const isUploading = ref(false)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0]
    // Check if it's CSV or Excel
    if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
      selectedFile.value = file
    } else {
      toast.error('Format file tidak didukung. Harap upload .csv atau .xlsx')
    }
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) return

  isUploading.value = true
  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const response = await uploadRawAttendance(formData)
    toast.success(response.message || 'File berhasil diunggah')
    // Reset after success
    selectedFile.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
  } catch (error: any) {
    console.error('Failed to upload:', error)
    toast.error(error.response?.data?.message || 'Gagal mengunggah file presensi')
  } finally {
    isUploading.value = false
  }
}

const handleCancel = () => {
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>

<template>
  <Card class="bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl shadow-sm p-6 max-w-3xl mx-auto">
    <CardContent class="p-0">
      <div class="text-center mb-6">
        <h2 class="text-xl font-bold text-foreground">Upload Raw Log Presensi</h2>
        <p class="text-sm text-muted-foreground mt-1">Jalur darurat jika koneksi mesin ADMS bermasalah. Upload file tarikan mesin (.csv) di sini.</p>
      </div>

      <div
        class="border-2 border-dashed rounded-3xl p-12 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer relative"
        :class="[
          isDragging ? 'border-primary bg-primary/5' : 'border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-primary/50',
          selectedFile ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/50' : ''
        ]"
        @dragenter.prevent="isDragging = true"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="!selectedFile && triggerFileInput()"
      >
        <input
          type="file"
          ref="fileInputRef"
          class="hidden"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          @change="handleFileSelect"
        />

        <template v-if="!selectedFile">
          <div class="bg-muted p-4 rounded-full mb-4">
            <UploadCloud class="w-8 h-8 text-primary" />
          </div>
          <h3 class="text-base font-bold text-foreground mb-1">Pilih File atau Tarik & Lepas di Sini</h3>
          <p class="text-xs text-muted-foreground">Format yang didukung: .csv (saat ini). Maksimal 10MB.</p>
        </template>

        <template v-else>
          <div class="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-full mb-4">
            <FileSpreadsheet class="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 class="text-base font-bold text-emerald-600 dark:text-emerald-400 mb-1">{{ selectedFile.name }}</h3>
          <p class="text-xs text-muted-foreground">Ukuran: {{ (selectedFile.size / 1024).toFixed(1) }} KB</p>
        </template>
      </div>

      <div v-if="selectedFile" class="mt-6 flex items-center justify-end gap-3">
        <Button
          variant="outline"
          class="rounded-xl font-bold text-xs h-10 px-6"
          :disabled="isUploading"
          @click="handleCancel"
        >
          Batal
        </Button>
        <Button
          class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-xs h-10 px-6"
          :disabled="isUploading"
          @click="handleUpload"
        >
          <Loader2 v-if="isUploading" class="w-4 h-4 mr-2 animate-spin" />
          <UploadCloud v-else class="w-4 h-4 mr-2" />
          {{ isUploading ? 'Mengunggah...' : 'Upload & Proses' }}
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
