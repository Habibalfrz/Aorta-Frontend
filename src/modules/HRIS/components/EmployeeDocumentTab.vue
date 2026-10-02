<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Loader2, Download, Upload, Image as ImageIcon, FileWarning, Trash2 } from 'lucide-vue-next'
import { uploadEmployeeDocument, deleteEmployeeDocument } from '@/api/hris'
import api from '@/api/axios'
import { toast } from 'vue-sonner'

const props = defineProps<{
  employeeId: string
  documents: any[]
  isLoadingDocuments: boolean
}>()

const emit = defineEmits<{
  (e: 'refetch'): void
}>()

const isUploadModalOpen = ref(false)
const isUploading = ref(false)
const isDownloadingZip = ref(false)

const uploadForm = ref({
  documentType: '',
  file: null as File | null
})

const documentTypes = [
  'KTP', 'Kartu Keluarga', 'NPWP', 'Ijazah', 'Transkrip Nilai', 
  'Kontrak Kerja', 'STR', 'SIP', 'Sertifikat Pelatihan', 'Surat Paklaring', 'Lainnya'
]

const openUploadModal = () => {
  uploadForm.value = { documentType: '', file: null }
  isUploadModalOpen.value = true
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const selectedFile = target.files[0]
    // Validate size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar', { description: 'Maksimal ukuran file adalah 5 MB.' })
      target.value = ''
      uploadForm.value.file = null
      return
    }
    uploadForm.value.file = selectedFile
  }
}

const submitUpload = async () => {
  if (!uploadForm.value.documentType || !uploadForm.value.file) {
    toast.error('Jenis Dokumen dan File wajib diisi')
    return
  }

  isUploading.value = true
  try {
    await uploadEmployeeDocument(props.employeeId, uploadForm.value.file, uploadForm.value.documentType)
    toast.success('Dokumen berhasil diunggah', {
      description: 'Dokumen akan otomatis dikonversi dan disimpan.'
    })
    isUploadModalOpen.value = false
    emit('refetch')
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal mengunggah dokumen')
  } finally {
    isUploading.value = false
  }
}

const downloadZip = async () => {
  if (!props.documents || props.documents.length === 0) {
    toast.error('Tidak ada dokumen', { description: 'Pegawai belum memiliki dokumen yang dapat diunduh.' })
    return
  }

  isDownloadingZip.value = true
  try {
    const response = await api.get(`/api/hris/employees/${props.employeeId}/documents/download-all`, {
      responseType: 'blob'
    })

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Berkas_Pegawai_${props.employeeId.split('-')[0]}.zip`)
    document.body.appendChild(link)
    link.click()

    // Cleanup
    link.remove()
    window.URL.revokeObjectURL(url)
    toast.success('Berhasil mengunduh kumpulan berkas')
  } catch (error) {
    toast.error('Gagal mengunduh berkas ZIP')
  } finally {
    isDownloadingZip.value = false
  }
}

const handleDeleteDoc = async (docId: string) => {
  if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini secara permanen?')) return;

  try {
    await deleteEmployeeDocument(props.employeeId, docId);
    toast.success('Dokumen berhasil dihapus');
    emit('refetch');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Gagal menghapus dokumen');
  }
}

const getFileIcon = (filePath: string) => {
  if (!filePath) return FileWarning
  if (filePath.endsWith('.pdf')) return FileText
  if (filePath.match(/\.(jpeg|jpg|gif|png|webp)$/i)) return ImageIcon
  return FileText
}

const getFullUrl = (relativePath: string) => {
  if (!relativePath) return ''
  // Use the baseURL from Axios config
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5047'
  return `${baseURL}${relativePath}`
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="bg-card border-none shadow-none rounded-sm">
      <div class="p-6 sm:p-8 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40">
        <div>
          <h3 class="font-bold text-lg text-foreground flex items-center gap-2">
            <FileText class="w-5 h-5 text-primary" />
            Dokumen Pegawai
          </h3>
          <p class="text-xs text-muted-foreground mt-1">Kelola arsip KTP, KK, Sertifikat, STR, dan SIP (Max: 5MB).</p>
        </div>
        <div class="flex items-center gap-2">
          <Button @click="downloadZip" variant="outline" class="font-bold text-xs h-9 px-4 rounded-sm shadow-sm border-border/60 hover:bg-muted/50" :disabled="isDownloadingZip || documents.length === 0">
            <Loader2 v-if="isDownloadingZip" class="w-4 h-4 mr-2 animate-spin" />
            <Download v-else class="w-4 h-4 mr-2" />
            Download ZIP
          </Button>
          <Button @click="openUploadModal" class="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-4 rounded-sm shadow-sm">
            <Upload class="w-4 h-4 mr-2" />
            Upload Dokumen
          </Button>
        </div>
      </div>

      <div class="p-6 sm:p-8">
        <div v-if="isLoadingDocuments" class="flex flex-col items-center justify-center p-12 text-center">
          <Loader2 class="w-8 h-8 text-primary/40 animate-spin mb-4" />
          <p class="text-sm font-medium text-muted-foreground">Memuat dokumen...</p>
        </div>

        <div v-else-if="!documents || documents.length === 0" class="flex flex-col items-center justify-center p-12 text-center bg-muted/20 border border-dashed border-border/60 rounded-sm">
          <FileText class="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h4 class="text-sm font-bold text-foreground mb-1">Belum Ada Dokumen</h4>
          <p class="text-xs text-muted-foreground max-w-[250px]">Karyawan ini belum memiliki dokumen atau arsip apapun.</p>
        </div>

        <!-- Document Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="doc in documents" :key="doc.id" class="group flex flex-col bg-card border border-border/60 hover:border-primary/30 rounded-sm overflow-hidden shadow-sm transition-all hover:shadow-md">
            <!-- Preview Area -->
            <div class="h-32 bg-muted/30 border-b border-border/40 relative flex items-center justify-center overflow-hidden">
              <img v-if="doc.contentType?.startsWith('image')" :src="getFullUrl(doc.filePath)" alt="Preview" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div v-else class="flex flex-col items-center justify-center text-muted-foreground">
                <component :is="getFileIcon(doc.filePath)" class="w-10 h-10 mb-2 opacity-50" />
                <span class="text-[10px] font-bold uppercase tracking-wider bg-background px-2 py-0.5 rounded-md border border-border/50">PDF Document</span>
              </div>
              
              <!-- Hover Action Overlay -->
              <div class="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <a :href="getFullUrl(doc.filePath)" target="_blank" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform" title="Download">
                  <Download class="w-4 h-4" />
                </a>
                <button @click.stop="handleDeleteDoc(doc.id)" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-destructive text-destructive-foreground shadow-sm hover:scale-105 transition-transform" title="Hapus Dokumen">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Meta Area -->
            <div class="p-4 flex-1 flex flex-col">
              <div class="flex items-start justify-between gap-2 mb-2">
                <Badge variant="default" class="bg-primary/10 text-primary hover:bg-primary/10 border-none font-bold text-[10px] px-2 py-0 h-5 shrink-0">{{ doc.documentType }}</Badge>
                <span class="text-[10px] text-muted-foreground font-medium text-right">{{ formatDate(doc.uploadedAt) }}</span>
              </div>
              <h4 class="text-sm font-bold text-foreground line-clamp-1 mb-1" :title="doc.originalFileName">{{ doc.originalFileName }}</h4>
              <p class="text-[10px] text-muted-foreground font-mono mt-auto">ID: {{ doc.id.split('-')[0] }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <Dialog :open="isUploadModalOpen" @update:open="isUploadModalOpen = $event">
      <DialogContent class="sm:max-w-[420px] bg-card border-border/60 rounded-sm p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle class="text-xl font-bold text-foreground">Upload Dokumen</DialogTitle>
          <DialogDescription class="text-xs text-muted-foreground">Format yang didukung: JPG, PNG, WEBP, PDF. Maksimal 5 MB.</DialogDescription>
        </DialogHeader>

        <form @submit.prevent="submitUpload" class="space-y-5 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jenis Dokumen <span class="text-destructive">*</span></Label>
            <Select v-model="uploadForm.documentType">
              <SelectTrigger class="bg-muted border-border rounded-sm">
                <SelectValue placeholder="Pilih Jenis Dokumen" />
              </SelectTrigger>
              <SelectContent class="rounded-sm border-border shadow-xl bg-card z-50">
                <SelectItem v-for="type in documentTypes" :key="type" :value="type" class="text-xs">{{ type }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pilih File <span class="text-destructive">*</span></Label>
            <div class="relative">
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                @change="handleFileChange"
                class="bg-muted border-border rounded-sm file:bg-primary file:text-primary-foreground file:border-0 file:mr-4 file:px-4 file:py-1.5 file:rounded-md file:text-xs file:font-bold hover:file:bg-primary/90 file:cursor-pointer text-sm"
              />
            </div>
          </div>

          <DialogFooter class="pt-4 border-t border-border/40">
            <Button variant="outline" type="button" @click="isUploadModalOpen = false" class="rounded-sm font-bold text-xs h-10">Batal</Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm font-bold text-xs h-10 px-6" :disabled="isUploading">
              <Loader2 v-if="isUploading" class="w-3.5 h-3.5 mr-2 animate-spin" />
              <Upload v-else class="w-3.5 h-3.5 mr-2" />
              Upload & Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
