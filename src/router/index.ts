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
      requiresAuth: true
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
        component: () => import('../modules/SysAdmin/views/SystemMonitorView.vue'),
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
      requiresAuth: true
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
      },
      {
        path: 'shifts',
        name: 'Manajemen Shift',
        component: () => import('../modules/HRIS/views/EmployeeListView.vue'), // Dummy fallback
      },
      {
        path: 'leaves',
        name: 'Pengajuan Cuti',
        component: () => import('../modules/HRIS/views/EmployeeListView.vue'), // Dummy fallback
      },
      {
        path: 'payroll',
        name: 'Payroll',
        component: () => import('../modules/HRIS/views/EmployeeListView.vue'), // Dummy fallback
      }
    ]
  }
];;

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
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    // If route is guest only (e.g. login) and user is authenticated, redirect to landing route
    next(authStore.determineLandingRoute())
  } else {
    // Otherwise, allow navigation
    next()
  }
})

export default router