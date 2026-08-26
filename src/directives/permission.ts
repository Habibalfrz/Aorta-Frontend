import type { DirectiveBinding } from 'vue'
import { useAuthStore } from '@/store/auth'

export const permissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const authStore = useAuthStore()
    const { value } = binding

    // Bypass for Superadmin (case-insensitive via hasRole implementation)
    if (authStore.hasRole('Superadmin') || authStore.hasRole('superadmin')) {
      return // Langsung keluar, jangan sembunyikan/hapus elemen dari DOM
    }

    // Check if permission is provided
    if (value && typeof value === 'string') {
      // Exact match for dot-notation permissions
      const hasAccess = authStore.hasPermission(value)

      if (!hasAccess) {
        el.parentNode?.removeChild(el)
      }
    } else {
      console.warn('v-permission directive requires a string value')
      // Default to deny if incorrectly used
      el.parentNode?.removeChild(el)
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    // Re-evaluate if component updates (rarely needed for auth but good practice)
    const authStore = useAuthStore()
    const { value } = binding

    if (authStore.hasRole('Superadmin') || authStore.hasRole('superadmin')) {
      return
    }

    if (value && typeof value === 'string') {
      if (!authStore.hasPermission(value)) {
        if (el.parentNode) {
           el.parentNode.removeChild(el)
        }
      }
    }
  }
}
