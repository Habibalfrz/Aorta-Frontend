import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
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
    component: () => import('../layouts/MainLayout.vue'),
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
  }
]

const router = createRouter({
  history: createWebHistory(),
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