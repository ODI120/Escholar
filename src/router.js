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

const loginPathForRole = (role) => (role === 'student' ? '/student/login' : '/login')

// Navigation guard for authentication and roles.
// This is a UI gate only — access is enforced by Postgres RLS policies.
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('supabase.auth.token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const routeRole = to.meta.role // 'admin' or 'student'
  const userRole = localStorage.getItem('user_role') // no default: a missing role grants nothing
  const mustChangePassword = localStorage.getItem('must_change_password') === 'true'

  if (requiresAuth && !isAuthenticated) {
    return next(to.path.startsWith('/student') ? '/student/login' : '/login')
  }

  if ((to.path === '/login' || to.path === '/student/login') && isAuthenticated) {
    // Prevent logged-in users from seeing login pages
    if (userRole === 'student') return next('/student/dashboard')
    if (userRole === 'admin') return next('/dashboard')
    return next() // Unknown role: let them authenticate again
  }

  if (
    isAuthenticated &&
    userRole === 'student' &&
    mustChangePassword &&
    to.path !== '/student/change-password'
  ) {
    return next('/student/change-password')
  }

  if (requiresAuth && routeRole && userRole !== routeRole) {
    return next(loginPathForRole(routeRole))
  }

  next()
})

export default router
