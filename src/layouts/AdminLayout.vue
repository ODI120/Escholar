<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <nav class="sidebar">
      <div class="sidebar-header">
        <img :src="logo" alt="">
        <!-- <p class="sidebar-subtitle">Admin Portal</p> -->
      </div>

      <ul class="sidebar-nav">
        <li class="nav-item">
          <router-link to="/dashboard" class="nav-link" :class="{ active: $route.path === '/dashboard' }">
            <span class="nav-icon">🏠</span>
            Dashboard
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/students" class="nav-link" :class="{ active: $route.path.startsWith('/students') }">
            <span class="nav-icon">🎓</span>
            Beneficiaries
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/graduates" class="nav-link" :class="{ active: $route.path === '/graduates' }">
            <span class="nav-icon">🎖️</span>
            Graduates
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/admins" class="nav-link" :class="{ active: $route.path === '/admins' }">
            <span class="nav-icon">👤</span>
            Admins
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/settings" class="nav-link" :class="{ active: $route.path === '/settings' }">
            <span class="nav-icon">⚙️</span>
            Settings
          </router-link>
        </li>
      </ul>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="sidebar-logout">
          <svg class="icon-logout" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <header class="main-header">
        <div class="header-content">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <div class="header-actions">
            <div class="notification">
              <i class="bi bi-bell"></i>
            </div>
            <div class="admin_profile">
              <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="">
              <div class="admin_profile_info">
                <h5 class="admin_name">Timothy</h5>
                <p class="admin_role">Admin</p>
              </div>
              <i class="bi bi-chevron-down"></i>
                <div class="admin_profile_dropdown">
                <a href="#"><i class="bi bi-person"></i>Profile</a>
                <a href="#"><i class="bi bi-gear"></i>Settings</a>
                <a href="#"><i class="bi bi-box-arrow-right"></i>Logout</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="content-wrapper">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSupabaseAuth } from '../composables/useSupabase.js'
import logo from '../assets/logo.png'

const router = useRouter()
const route = useRoute()
const { signOut } = useSupabaseAuth()

const pageTitle = computed(() => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/students': 'Students',
  }
  return titles[route.path] || 'Escholar'
})

const handleLogout = async () => {
  await signOut()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 8px;  
  box-sizing: border-box;
  gap: 1rem;
}

/* Sidebar */
.sidebar img{
  width: 70%;
}
.sidebar {
  width: 280px;
  background: var(--surface);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  /* position: fixed; */
  height: 100vh;
  z-index: 100;
  padding: 16px; 
  box-sizing: border-box;
  overflow-y: auto;
  border-radius: 14px;
  border: 1px solid var(--border-primary);
}

.sidebar-header {
  padding: .5rem;
  /* border: 1px solid var(--border-primary); */
  border-radius: 8px;
  background-color: #0399990c;
 
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.sidebar-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  margin-bottom: 0.25rem;
  list-style: none;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  font-weight: 500;
}

.nav-link:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.nav-link.active {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-primary);
  border-right: 3px solid var(--color-primary);
}

.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-primary);
}

.btn-outline-light {
  border-color: var(--border-primary);
  color: var(--text-secondary);
}

.btn-outline-light:hover {
  background: var(--surface-hover);
  border-color: var(--border-secondary);
  color: var(--text-primary);
}

/* Main Content */
.main-content {
  flex: 1;
  /* margin-left: 280px; */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  

}

.main-header {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  padding: 1rem 2rem;
  border-radius: 14px ;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  border-radius: 24px;  
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  border-radius: 50px;
  align-items: center;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  /* padding: 2rem; */
  overflow-y: auto;
  gap: 1rem;
}
.notification{
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-primary);
  /* border: 1px solid var(--border-primary); */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.notification i{
  font-size: 1.5rem;
  color: var(--text-primary);
}
.admin_profile{
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background-color: #0399990c;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  border-radius: 50px;
  border: 1px solid #039999;
}
.admin_profile img{
  width: 38px;
  height: 38px;
  border-radius: 50%;
}
.admin_profile_info{
  display: flex;
  flex-direction: column;
}
.admin_profile h5{
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;

}
.admin_profile p{
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}
.admin_profile i{
  font-size: 1rem;
  color: var(--text-primary);
}
.admin_profile_dropdown{
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.admin_profile_dropdown a{
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: all var(--transition-fast);
}
.admin_profile_dropdown a:hover{
  background: var(--surface-hover);
  color: var(--text-primary);
}
/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
  }

  .sidebar.show {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }
}
</style>