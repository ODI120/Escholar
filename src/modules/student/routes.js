export default [
  {
    path: '/student',
    redirect: '/student/dashboard'
  },
  {
    path: '/student/login',
    name: 'StudentLogin',
    component: () => import('./views/StudentLogin.vue'),
    meta: { 
      requiresAuth: false,
      role: 'student' 
    }
  },
  {
    path: '/student/dashboard',
    name: 'StudentDashboard',
    component: () => import('./views/StudentDashboard.vue'),
    meta: { 
      requiresAuth: true,
      role: 'student'
    }
  },
  {
    path: '/student/reset-password',
    name: 'ResetPassword',
    component: () => import('./views/ResetPassword.vue'),
    meta: { 
      requiresAuth: false,
      role: 'student'
    }
  }
]
