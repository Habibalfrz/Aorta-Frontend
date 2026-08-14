import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import router from '../router'

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

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const user = ref<User | null>(null)
  const roles = ref<string[]>([])
  const permissions = ref<string[]>([])

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  const hasPermission = computed(() => {
    return (permission: string): boolean => permissions.value.includes(permission)
  })

  const hasRole = computed(() => {
    return (role: string): boolean => roles.value.includes(role)
  })

  // Actions
  function extractTokenData() {
    if (!token.value) {
      user.value = null
      roles.value = []
      permissions.value = []
      return
    }

    try {
      const decoded: any = jwtDecode(token.value)

      // Extract User
      user.value = {
        id: decoded[NAMEID_CLAIM] || decoded.sub || '',
        name: decoded[NAME_CLAIM] || decoded.name || '',
        email: decoded[EMAIL_CLAIM] || decoded.email || '',
      }

      // Extract Roles (Handle both single string and array from .NET)
      const tokenRoles = decoded[ROLE_CLAIM] || decoded.role || []
      roles.value = Array.isArray(tokenRoles) ? tokenRoles : [tokenRoles]

      // Extract Permissions (custom claim, assuming 'permissions' or 'Permission')
      const tokenPermissions = decoded.permissions || decoded.Permission || []
      permissions.value = Array.isArray(tokenPermissions) ? tokenPermissions : [tokenPermissions]

    } catch (error) {
      console.error('Failed to decode JWT token:', error)
      logout()
    }
  }

  function login(newToken: string) {
    token.value = newToken
    localStorage.setItem('access_token', newToken)
    extractTokenData()
  }

  function logout() {
    token.value = null
    user.value = null
    roles.value = []
    permissions.value = []
    localStorage.removeItem('access_token')
    router.push('/login')
  }

  function determineLandingRoute(): string {
    if (roles.value.length === 1 && roles.value[0] === 'Superadmin') {
      return '/admin-portal'
    }

    // Multi-role or default regular users
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
