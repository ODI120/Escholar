export default [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('./views/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import('./views/Students.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/students/:id',
    name: 'StudentDetail',
    component: () => import('./views/StudentDetail.vue'),
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
