import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import router from '../router'
import api from '@/api/axios'

export interface User {
  id: string
  name: string
  email: string
  [key: string]: any
}

// .NET default claim types
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
const NAMEID_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
const EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
const NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'

// Custom schema fallback for permissions if backend uses full schema URIs
const PERMISSION_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/permission'

// Helper to normalize claims that can be either string or array of strings
function normalizeArrayClaim(claimValue: any): string[] {
  if (!claimValue) return []
  return Array.isArray(claimValue) ? claimValue : [claimValue]
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const user = ref<User | null>(null)
  const roles = ref<string[]>([])
  const modules = ref<string[]>([])
  const permissions = ref<string[]>([])

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  const hasPermission = computed(() => {
    return (permission: string): boolean => permissions.value.includes(permission)
  })

  const hasRole = computed(() => {
    return (role: string): boolean => {
      const lowerRole = role.toLowerCase()
      return roles.value.some(r => r.toLowerCase() === lowerRole)
    }
  })

  // Actions
  function extractTokenData() {
    if (!token.value) {
      user.value = null
      roles.value = []
      modules.value = []
      permissions.value = []
      return
    }

    try {
      const decoded: any = jwtDecode(token.value)

      // Extract User
      user.value = {
        id: decoded.sub || decoded[NAMEID_CLAIM] || '',
        name: decoded.unique_name || decoded[NAME_CLAIM] || decoded.name || '',
        email: decoded.email || decoded[EMAIL_CLAIM] || '',
      }

      // Extract Roles & Modules (Handle both single string and array from .NET)
      roles.value = normalizeArrayClaim(decoded.role || decoded.roles || decoded.RoleId || decoded[ROLE_CLAIM])
      modules.value = normalizeArrayClaim(decoded.modules)

      // Extract Permissions (custom claim, assuming 'permission', 'permissions' or full schema URL)
      permissions.value = normalizeArrayClaim(decoded.permission || decoded.permissions || decoded.Permission || decoded[PERMISSION_CLAIM])

      console.log('DECODED JWT:', decoded)

    } catch (error) {
      console.error('Failed to decode JWT token:', error)
      logout()
    }
  }

  async function login(payload: any) {
    try {
      const response = await api.post('/api/Auth/login', payload)
      const newToken = response.data.token

      token.value = newToken
      localStorage.setItem('access_token', newToken)
      extractTokenData()

      return response
    } catch (error) {
      throw error
    }
  }

  function logout() {
    token.value = null
    user.value = null
    roles.value = []
    modules.value = []
    permissions.value = []
    localStorage.removeItem('access_token')
    router.push('/login')
  }

  function determineLandingRoute(): string {
    if (hasRole.value('superadmin')) {
      return '/admin-portal'
    }

    return '/ess'
  }

  // Initialize data on load if token exists
  if (token.value) {
    extractTokenData()
  }

  return {
    token,
    user,
    roles,
    modules,
    permissions,
    isAuthenticated,
    hasPermission,
    hasRole,
    login,
    logout,
    extractTokenData,
    determineLandingRoute
  }
})
