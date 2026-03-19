import StudentDashboard from './views/StudentDashboard.vue'
import StudentLogin from './views/StudentLogin.vue'

export default [
  {
    path: '/student',
    redirect: '/student/dashboard'
  },
  {
    path: '/student/login',
    name: 'StudentLogin',
    component: StudentLogin,
    meta: { 
      requiresAuth: false,
      role: 'student' 
    }
  },
  {
    path: '/student/dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { 
      requiresAuth: true,
      role: 'student'
    }
  }
]
