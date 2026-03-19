import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Signup from './views/Signup.vue'

// Import Modular Routes
import studentRoutes from './modules/student/routes.js'
import adminRoutes from './modules/admin/routes.js'

const routes = [
  ...studentRoutes,
  ...adminRoutes,
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login', // Admin Login
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication and roles
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('supabase.auth.token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const routeRole = to.meta.role // 'admin' or 'student'

  const userRole = localStorage.getItem('user_role') || 'admin' 

  if (requiresAuth && !isAuthenticated) {
    if (to.path.startsWith('/student')) {
      next('/student/login')
    } else {
      next('/login')
    }
  } else if ((to.path === '/login' || to.path === '/student/login') && isAuthenticated) {
    // Prevent logged-in users from seeing login pages
    if (userRole === 'student') {
      next('/student/dashboard')
    } else {
      next('/dashboard')
    }
  } else if (requiresAuth && isAuthenticated && routeRole) {
    // Role matching checking
    if (routeRole === 'admin' && userRole !== 'admin') {
      next('/student/dashboard') 
    } else if (routeRole === 'student' && userRole !== 'student') {
      next('/dashboard') 
    } else {
      next() // They belong here
    }
  } else {
    next()
  }
})

export default router