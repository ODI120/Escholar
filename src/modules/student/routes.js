import StudentDashboard from './views/StudentDashboard.vue'

export default [
  {
    path: '/student',
    redirect: '/student/dashboard'
  },
  {
    path: '/student/dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { 
      requiresAuth: true,
      role: 'student' // Identifying this route as student-only
    }
  }
]
