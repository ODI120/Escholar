import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Students from './views/Students.vue'
import StudentDetail from './views/StudentDetail.vue'
import Login from './views/Login.vue'
import Signup from './views/Signup.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/students',
    name: 'Students',
    component: Students,
    meta: { requiresAuth: true }
  },
  {
    path: '/students/:id',
    name: 'StudentDetail',
    component: StudentDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/graduates',
    name: 'Graduates',
    component: () => import('./views/Graduates.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admins',
    name: 'Admins',
    component: () => import('./views/Admins.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./views/Settings.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('supabase.auth.token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // if already signed in, prevent revisiting login
    next('/dashboard')
  } else {
    // allow signup even when authenticated (for creating additional admins)
    next()
  }

  // Temporarily disable auth for development - COMMENTED OUT
  // next()
})

export default router