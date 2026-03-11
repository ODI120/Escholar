<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <nav class="sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-title">Escholar</h3>
        <p class="sidebar-subtitle">Admin Portal</p>
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
            <slot name="header-actions"></slot>
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
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: var(--surface);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-header {
  padding: 2rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border-primary);
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
  margin-left: 280px;
  display: flex;
  flex-direction: column;
}

.main-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border-primary);
  padding: 1.5rem 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.content-wrapper {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
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