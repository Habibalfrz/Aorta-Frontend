import axios, { type AxiosError } from 'axios'
import router from '../router'
import { toast } from 'vue-sonner'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5047',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // 1. Detect Network Error / Server Down (Graceful Degradation)
    // Occurs when there is no response at all or when Axios identifies it as a network error
    if (!error.response || error.code === 'ERR_NETWORK') {
      toast.error('Koneksi Terputus', {
        description: 'Gagal terhubung ke server. Pastikan server lokal berjalan atau hubungi Administrator IT.',
      })
      // Return early to ensure the components catch the rejected promise and halt loading states
      return Promise.reject(error)
    }

    // 2. Handle specific HTTP status codes
    if (error.response?.status === 401) {
      // TODO: Implement Refresh Token logic here
      localStorage.removeItem('access_token')
      router.push('/login')
    }

    return Promise.reject(error)
  }
)

export default api
