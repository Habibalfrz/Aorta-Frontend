import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../store/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
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
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../modules/Dashboard/views/DashboardView.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/ess',
    name: 'ESS',
    component: () => import('../modules/Dashboard/views/DashboardView.vue'), // Borrow dashboard component for now
    meta: {
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global Navigation Guard
router.beforeEach((to, from, next) => {
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
