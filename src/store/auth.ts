import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import router from '../router'
import api from '@/api/axios'

export interface User {
  id: string
  name: string
  email: string
  is_superadmin?: boolean
  is_simulating?: boolean
  simulated_by_user_id?: string
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
  const originalToken = ref<string | null>(localStorage.getItem('original_access_token')) // To store real superadmin token during simulation
  const user = ref<User | null>(null)
  const roles = ref<string[]>([])
  const modules = ref<string[]>([])
  const permissions = ref<string[]>([])
  const simulatableRoles = ref<any[]>([]) // Store dynamic roles for the current module

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isSimulating = computed(() => !!user.value?.is_simulating)
  const isSuperadmin = computed(() => user.value?.is_superadmin === true)

  const hasPermission = computed(() => {
    return (permission: string): boolean => {
      if (user.value?.is_superadmin && !user.value?.is_simulating) return true
      return permissions.value.includes(permission)
    }
  })

  const hasRole = computed(() => {
    return (role: string): boolean => {
      if (user.value?.is_superadmin && !user.value?.is_simulating) return true
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

      // Handle custom claims for simulation and superadmin
      const isSuperadminClaim = decoded.is_superadmin === 'true' || decoded.is_superadmin === true
      const isSimulatingClaim = !!decoded.simulated_by_user_id

      // Extract User
      user.value = {
        id: decoded.sub || decoded[NAMEID_CLAIM] || '',
        name: decoded.unique_name || decoded[NAME_CLAIM] || decoded.name || '',
        email: decoded.email || decoded[EMAIL_CLAIM] || '',
        is_superadmin: isSuperadminClaim,
        is_simulating: isSimulatingClaim,
        simulated_by_user_id: decoded.simulated_by_user_id
      }

      // Extract Roles & Modules
      roles.value = normalizeArrayClaim(decoded.role || decoded.roles || decoded.RoleId || decoded[ROLE_CLAIM])
      modules.value = normalizeArrayClaim(decoded.modules)

      // Extract Permissions
      permissions.value = normalizeArrayClaim(decoded.permission || decoded.permissions || decoded.Permission || decoded[PERMISSION_CLAIM])

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
      localStorage.removeItem('original_access_token') // Clear any stale simulation token
      originalToken.value = null

      extractTokenData()
      return response
    } catch (error) {
      throw error
    }
  }

  // --- Role Simulation Actions ---

  async function fetchSimulatableRoles(moduleName: string) {
    // Only fetch if genuinely superadmin (not currently simulating someone else)
    if (!isSuperadmin.value || isSimulating.value) return []

    try {
      const response = await api.get(`/api/Auth/simulatable-roles?module=${moduleName}`)
      simulatableRoles.value = response.data.data || []
      return simulatableRoles.value
    } catch (error) {
      console.error('Failed to fetch simulatable roles:', error)
      return []
    }
  }

  async function simulateRole(roleName: string) {
    if (!isSuperadmin.value || isSimulating.value) return

    try {
      const response = await api.post('/api/Auth/simulate-role', { role: roleName })
      const newToken = response.data.token

      // Save original superadmin token to allow reverting later
      if (!originalToken.value) {
        originalToken.value = token.value
        localStorage.setItem('original_access_token', token.value as string)
      }

      // Apply simulated token
      token.value = newToken
      localStorage.setItem('access_token', newToken)
      extractTokenData()

      // Force reload to reset all app states / routers safely
      window.location.reload()

    } catch (error) {
      console.error('Failed to simulate role:', error)
      throw error
    }
  }

  function stopSimulation() {
    if (!isSimulating.value || !originalToken.value) return

    // Revert to the original superadmin token
    token.value = originalToken.value
    localStorage.setItem('access_token', originalToken.value)
    localStorage.removeItem('original_access_token')
    originalToken.value = null

    extractTokenData()
    window.location.reload()
  }

  function logout() {
    token.value = null
    originalToken.value = null
    user.value = null
    roles.value = []
    modules.value = []
    permissions.value = []
    localStorage.removeItem('access_token')
    localStorage.removeItem('original_access_token')
    router.push('/')
  }

  function determineLandingRoute(): string {
    if (hasRole.value('superadmin') && !isSimulating.value) {
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
    simulatableRoles,
    isAuthenticated,
    isSimulating,
    isSuperadmin,
    hasPermission,
    hasRole,
    login,
    logout,
    extractTokenData,
    determineLandingRoute,
    fetchSimulatableRoles,
    simulateRole,
    stopSimulation
  }
})
