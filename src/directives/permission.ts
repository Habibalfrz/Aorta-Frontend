import type { DirectiveBinding } from 'vue'
import { useAuthStore } from '@/store/auth'

export const permissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const authStore = useAuthStore()
    const { value } = binding

    // Bypass for Superadmin
    if (authStore.hasRole('Superadmin')) {
      return
    }

    // Check if permission is provided
    if (value && typeof value === 'string') {
      const hasAccess = authStore.hasPermission(value)

      if (!hasAccess) {
        el.parentNode?.removeChild(el)
      }
    } else {
      console.warn('v-permission directive requires a string value')
      // Default to deny if incorrectly used
      el.parentNode?.removeChild(el)
    }
  }
}
