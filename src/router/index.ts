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
      permissions: []
    },
    children: [
      {
        path: '',
        name: 'SysAdminDashboard',
        component: () => import('../modules/SysAdmin/views/SystemMonitorView.vue'),
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: () => import('../modules/SysAdmin/views/RoleManagementView.vue'),
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
        path: 'metrics',
        name: 'API Metrics',
        component: () => import('../modules/SysAdmin/views/SystemMonitorView.vue'),
      },
      {
        path: 'modules',
        name: 'Modules Explorer',
        component: () => import('../modules/SysAdmin/views/ModuleExplorerView.vue'),
      },
      {
        path: 'profile',
        name: 'Profil Saya',
        component: () => import('../modules/Auth/views/ProfileSettingsView.vue'),
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('../modules/SysAdmin/views/UserManagementView.vue'),
      },
      {
        path: 'permissions',
        name: 'PermissionBuilder',
        component: () => import('../modules/SysAdmin/views/PermissionBuilderView.vue'),
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
        component: () => import('../modules/HRIS/views/HrisDashboardView.vue'),
        meta: {
          permissions: ['hris.dashboard.read', 'hris.employees.read']
        }
      },
      {
        path: 'employees',
        name: 'Data Pegawai',
        component: () => import('../modules/HRIS/views/EmployeeListView.vue'),
        meta: {
          permissions: ['hris.employees.read', 'hris.employees.write']
        }
      },
      {
        path: 'employees/:id',
        name: 'Detail Pegawai',
        component: () => import('../modules/HRIS/views/EmployeeDetailView.vue'),
        meta: {
          permissions: ['hris.employees.read', 'hris.employees.write']
        }
      },
      {
        path: 'shifts',
        name: 'Manajemen Shift',
        component: () => import('../modules/HRIS/views/ShiftManagementView.vue'),
        meta: {
          permissions: ['hris.shifts.read', 'hris.shifts.write']
        }
      },
      {
        path: 'attendance',
        name: 'Log Kehadiran',
        component: () => import('../modules/HRIS/views/AttendanceMonitorView.vue'),
        meta: {
          permissions: ['hris.attendance.read', 'hris.attendance.write']
        }
      },
      {
        path: 'leaves',
        name: 'Pengajuan Cuti',
        component: () => import('../modules/HRIS/views/LeaveManagementView.vue'),
        meta: {
          permissions: ['hris.leaves.read', 'hris.leaves.write']
        }
      },
      {
        path: 'payroll',
        name: 'Payroll',
        component: () => import('../modules/HRIS/views/PayrollView.vue'),
        meta: {
          permissions: ['hris.payroll.read', 'hris.payroll.write', 'hris.payroll.generate']
        }
      },
      {
        path: 'settings',
        name: 'HR Settings',
        component: () => import('../modules/HRIS/views/HrisSettingsView.vue'),
        meta: {
          permissions: ['hris.settings.read', 'hris.departments.read', 'hris.jobpositions.read', 'hris.grades.read', 'hris.employees.read']
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

// Global Navigation Guard (Vue Router 4 standard: return path instead of next())
router.beforeEach((to, _from) => {
  // Initialize auth store inside the guard to avoid Pinia active instance error
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to login
    return '/login'
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    // If route is guest only (e.g. login) and user is authenticated, redirect to landing route
    return authStore.determineLandingRoute()
  }

  // Permission Based RBAC Checking
  if (to.meta.requiresAuth && authStore.isAuthenticated) {
    // Superadmin bypass
    if (authStore.hasRole('superadmin') && !authStore.isSimulating) {
      return true
    }

    // Check specific route permissions
    const routePermissions = to.meta.permissions as string[] | undefined

    if (routePermissions && routePermissions.length > 0) {
      // Check if user has AT LEAST ONE of the required permissions
      const hasAccess = routePermissions.some(permission => authStore.hasPermission(permission))

      if (!hasAccess) {
        // Redirect to ESS fallback or 403
        console.warn(`Access denied to route: ${String(to.name)}. Missing permissions.`)
        return '/ess'
      }
    }
  }

  // Otherwise, allow navigation
  return true
})

export default router