import { createRouter, createWebHistory, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../store/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../modules/Public/views/LandingView.vue'),
    meta: {
      guestOnly: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../modules/Auth/views/LoginView.vue'),
    meta: {
      guestOnly: true
    }
  },
  {
    path: '/ess',
    component: () => import('../layouts/EssLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../modules/Dashboard/views/DashboardView.vue'),
      }
    ]
  },
  {
    path: '/admin-portal',
    component: () => import('../layouts/SysAdminLayout.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['sysadmin.access']
    },
    children: [
      {
        path: '',
        name: 'System Monitor',
        component: () => import('../modules/SysAdmin/views/SystemMonitorView.vue'),
      },
      {
        path: 'health',
        name: 'System Health',
        component: () => import('../modules/SysAdmin/views/SystemMonitorView.vue'),
      },
      {
        path: 'logs',
        name: 'Error Logs',
        component: () => import('../modules/SysAdmin/views/SystemMonitorView.vue'),
      },
      {
        path: 'roles',
        name: 'Role Access',
        component: () => import('../modules/SysAdmin/views/RoleManagementView.vue'),
      },
      {
        path: 'metrics',
        name: 'API Metrics',
        component: () => import('../modules/SysAdmin/views/SystemMonitorView.vue'),
      }
    ]
  },
  {
    path: '/hris',
    component: () => import('../layouts/HrisLayout.vue'),
    meta: {
      requiresAuth: true,
      permissions: ['hris.access']
    },
    children: [
      {
        path: '',
        name: 'HR Dashboard',
        component: () => import('../modules/HRIS/views/EmployeeListView.vue'), // Dummy fallback
      },
      {
        path: 'employees',
        name: 'Data Pegawai',
        component: () => import('../modules/HRIS/views/EmployeeListView.vue'),
        meta: {
          permissions: ['hris.employees.view']
        }
      },
      {
        path: 'employees/:id',
        name: 'Detail Pegawai',
        component: () => import('../modules/HRIS/views/EmployeeDetailView.vue'),
        meta: {
          permissions: ['hris.employees.view']
        }
      },
      {
        path: 'shifts',
        name: 'Manajemen Shift',
        component: () => import('../modules/HRIS/views/EmployeeListView.vue'), // Dummy fallback
        meta: {
          permissions: ['hris.shifts.view']
        }
      },
      {
        path: 'leaves',
        name: 'Pengajuan Cuti',
        component: () => import('../modules/HRIS/views/EmployeeListView.vue'), // Dummy fallback
        meta: {
          permissions: ['hris.leaves.view']
        }
      },
      {
        path: 'payroll',
        name: 'Payroll',
        component: () => import('../modules/HRIS/views/EmployeeListView.vue'), // Dummy fallback
        meta: {
          permissions: ['hris.payroll.view']
        }
      }
    ]
  },
  // Add a 403 Forbidden route
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../modules/Auth/views/LoginView.vue'), // Fallback for now
    meta: {
      requiresAuth: true
    }
  }
];

const history = import.meta.env.VITE_APP_PLATFORM === 'desktop'
  ? createWebHashHistory()
  : createWebHistory()

const router = createRouter({
  history,
  routes
})

// Global Navigation Guard
router.beforeEach((to, _from, next) => {
  // Initialize auth store inside the guard to avoid Pinia active instance error
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to login
    next('/login')
    return
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    // If route is guest only (e.g. login) and user is authenticated, redirect to landing route
    next(authStore.determineLandingRoute())
    return
  }

  // Permission Based RBAC Checking
  if (to.meta.requiresAuth && authStore.isAuthenticated) {
    // Superadmin bypass
    if (authStore.hasRole('Superadmin') || authStore.hasRole('superadmin')) {
      next()
      return
    }

    // Check specific route permissions
    const routePermissions = to.meta.permissions as string[] | undefined

    if (routePermissions && routePermissions.length > 0) {
      // Check if user has AT LEAST ONE of the required permissions
      const hasAccess = routePermissions.some(permission => authStore.hasPermission(permission))

      if (!hasAccess) {
        // Redirect to ESS fallback or 403
        console.warn(`Access denied to route: ${String(to.name)}. Missing permissions.`)
        next('/ess')
        return
      }
    }
  }

  // Otherwise, allow navigation
  next()
})

export default router
