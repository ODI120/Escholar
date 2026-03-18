import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import Students from './views/Students.vue'
import StudentDetail from './views/StudentDetail.vue'
import Login from './views/Login.vue'
import Signup from './views/Signup.vue'

// Import Student Module Routes
import studentRoutes from './modules/student/routes.js'

const routes = [
  ...studentRoutes,
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
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/students',
    name: 'Students',
    component: Students,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/students/:id',
    name: 'StudentDetail',
    component: StudentDetail,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/graduates',
    name: 'Graduates',
    component: () => import('./views/Graduates.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admins',
    name: 'Admins',
    component: () => import('./views/Admins.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./views/Settings.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin-profile',
    name: 'AdminProfile',
    component: () => import('./views/AdminProfile.vue'),
    meta: { requiresAuth: true, role: 'admin' }
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

  // NOTE: Assuming user role is stored locally after login. 
  // You might need to adjust this depending on how you read user profiles from Supabase.
  const userRole = localStorage.getItem('user_role') || 'admin' 

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // if already signed in, prevent revisiting login
    if (userRole === 'student') {
      next('/student/dashboard')
    } else {
      next('/dashboard')
    }
  } else if (requiresAuth && isAuthenticated && routeRole) {
    // Role-based access control checking
    if (routeRole === 'admin' && userRole !== 'admin') {
      next('/student/dashboard') // Redirect students trying to access admin routes
    } else if (routeRole === 'student' && userRole !== 'student') {
      next('/dashboard') // Redirect admins trying to access student routes
    } else {
      next() // Access granted
    }
  } else {
    // allow access to public routes or signup
    next()
  }
})

export default router