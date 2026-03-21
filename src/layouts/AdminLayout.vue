<template>
  <div class="admin-layout" :class="{ 'mobile-nav-open': mobileOpen }">
    <!-- Mobile Backdrop -->
    <div 
      class="sidebar-backdrop" 
      v-if="mobileOpen" 
      @click="closeMobileNav"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="sidebar" 
      :class="{ 'sidebar-collapsed': sidebarCollapsed }"
    >
      <div class="sidebar-header">
        <router-link to="/dashboard" class="logo-wrapper" @click="closeMobileNavOnNav">
          <img :src="logo" alt="Escholar Logo" class="logo-img" />
          <h2 class="logo-text" v-if="!sidebarCollapsed">Escholar</h2>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/dashboard" class="nav-link" active-class="active" @click="closeMobileNavOnNav">
              <i class="bi bi-grid nav-icon"></i>
              <span class="nav-label" v-if="!sidebarCollapsed">Dashboard</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/students" class="nav-link" :class="{ active: $route.path.startsWith('/students') }" @click="closeMobileNavOnNav">
              <i class="bi bi-people nav-icon"></i>
              <span class="nav-label" v-if="!sidebarCollapsed">Beneficiaries</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/graduates" class="nav-link" active-class="active" @click="closeMobileNavOnNav">
              <i class="bi bi-trophy nav-icon"></i>
              <span class="nav-label" v-if="!sidebarCollapsed">Graduates</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admins" class="nav-link" active-class="active" @click="closeMobileNavOnNav">
              <i class="bi bi-person nav-icon"></i>
              <span class="nav-label" v-if="!sidebarCollapsed">Admins</span>
            </router-link>
          </li>
          <li class="nav-item mt-auto">
            <router-link to="/settings" class="nav-link" active-class="active" @click="closeMobileNavOnNav">
              <i class="bi bi-gear nav-icon"></i>
              <span class="nav-label" v-if="!sidebarCollapsed">Settings</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-button" @click="handleLogout">
          <i class="bi bi-box-arrow-right logout-icon"></i>
          <span class="logout-label" v-if="!sidebarCollapsed">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content wrapper -->
    <div class="main-wrapper">
      <!-- Header -->
      <header class="top-header">
        <div class="header-left">
          <button class="icon-button mobile-toggle" @click="toggleMobileNav" aria-label="Open Sidebar">
            <i class="bi bi-list"></i>
          </button>
          <button class="icon-button desktop-toggle" @click="toggleSidebar" aria-label="Toggle Sidebar">
            <i class="bi bi-layout-sidebar-inset" v-if="!sidebarCollapsed"></i>
            <i class="bi bi-layout-sidebar" v-else></i>
          </button>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>

        <div class="header-right">
          <ThemeToggle inline style="margin-right: 0.5rem;" />
          <button class="icon-button notification-btn" aria-label="Notifications">
             <i class="bi bi-bell"></i>
             <span class="notification-badge"></span>
          </button>

          <div class="profile-dropdown-wrapper" ref="profileDropdownRef">
            <button class="profile-trigger" @click="toggleDropdown" :aria-expanded="dropdownOpen">
              <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Profile" class="profile-avatar" />
              <div class="profile-info desktop-only">
                <span class="profile-name" v-if="adminName && adminName !== 'Admin'">{{ adminName }}</span>
                <span class="profile-role" v-else>{{ adminRole }}</span>
              </div>
              <i class="bi bi-chevron-down profile-chevron desktop-only" :class="{ 'rotate': dropdownOpen }"></i>
            </button>

            <!-- Dropdown Menu -->
            <transition name="dropdown-fade">
              <div class="dropdown-menu" v-if="dropdownOpen">
                <div class="dropdown-header mobile-only">
                  <span class="dropdown-name" v-if="adminName">{{ adminName }}</span>
                  <span class="dropdown-role">{{ adminRole }}</span>
                  <span class="dropdown-email" v-if="adminEmail">{{ adminEmail }}</span>
                </div>
                <!-- Profile actions -->
                <a href="#" class="dropdown-item" @click.prevent="closeDropdown"><i class="bi bi-person"></i> Profile</a>
                <a href="#" class="dropdown-item" @click.prevent="closeDropdown"><i class="bi bi-gear"></i> Settings</a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item text-danger" @click.prevent="handleLogout"><i class="bi bi-box-arrow-right"></i> Logout</a>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Page Content Slot -->
      <main class="content-scrollable">
        <div class="content-container">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSupabaseAuth } from '../composables/useSupabase.js'
import logo from '../assets/logo.png'
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()
const { signOut, getCurrentUser } = useSupabaseAuth()

// Responsive logic state
const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)
const dropdownOpen = ref(false)
const profileDropdownRef = ref(null)

// Admin info state
const adminName = ref('Admin')
const adminRole = ref('Admin')
const adminEmail = ref('')

const pageTitle = computed(() => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/students': 'Beneficiaries',
    '/graduates': 'Graduates',
    '/admins': 'Admins',
    '/settings': 'Settings'
  }
  // Find matching base path for sub-routes
  for (const path in titles) {
     if (route.path === path || route.path.startsWith(path + '/')) {
       return titles[path]
     }
  }
  return 'Dashboard'
})

const loadAdmin = async () => {
  // Use getCurrentUser either directly or from the returned composable structure
  const auth = useSupabaseAuth()
  const { data } = await (auth.getCurrentUser ? auth.getCurrentUser() : Promise.resolve({ data: null }))
  if (data?.user) {
    adminEmail.value = data.user.email || ''
    adminName.value =
      data.user.user_metadata?.first_name ||
      data.user.user_metadata?.full_name ||
      data.user.email?.split('@')[0] ||
      'Admin'
    adminRole.value = data.user.app_metadata?.role || 'Administrator'
  }
}

// Subroutines for toggling
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleMobileNav = () => {
  mobileOpen.value = true
  document.body.style.overflow = 'hidden' // Prevent scroll
}

const closeMobileNav = () => {
  mobileOpen.value = false
  document.body.style.overflow = ''
}

const closeMobileNavOnNav = () => {
  if (window.innerWidth <= 1024) {
    closeMobileNav()
  }
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

// Global click listener to close dropdown
const handleClickOutside = (e) => {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(e.target)) {
    closeDropdown()
  }
}

// Handle window resize to auto-close mobile nav if expanded to desktop
const handleResize = () => {
  if (window.innerWidth > 1024 && mobileOpen.value) {
    closeMobileNav()
  }
  if (window.innerWidth <= 1024 && window.innerWidth > 768) {
    sidebarCollapsed.value = true // Optional tablet auto-collapse
  }
}

const handleLogout = async () => {
  await signOut()
  router.push('/login')
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  await loadAdmin()
  
  // Initialize collapsed based on window size
  if (window.innerWidth > 768 && window.innerWidth < 1280) {
    sidebarCollapsed.value = true
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* CSS Variables Fallbacks (in case not globally defined) */
.admin-layout {
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 88px;
  --header-height: 72px;
  --app-padding: 1rem;
  --layout-bg: var(--bg-primary, #f0f4f8);
  --glass-border: rgba(255, 255, 255, 0.1);

  display: flex;
  height: 100vh;
  /* width: 100vw; */
  /* overflow: hidden; */
  background-color: var(--layout-bg);
  color: var(--text-primary, #111827);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  padding: var(--app-padding);
  box-sizing: border-box;
  gap: var(--app-padding);
}

/* Base resets inside layout */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
a {
  text-decoration: none;
}
button {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

/* =========================================
   Sidebar
   ========================================= */
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--surface, #ffffff);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal), transform var(--transition-normal);
  z-index: 40;
  flex-shrink: 0;
  border-radius: 16px;
  border: 1px solid var(--border-primary, #e5e7eb);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.sidebar.sidebar-collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  border-bottom: 1px solid var(--border-primary, #f3f4f6);
}

.sidebar-collapsed .sidebar-header {
  justify-content: center;
  padding: 0;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  /* gap: 0.75rem; */
  overflow: hidden;
}

.logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 8px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-primary, #0d9488);
  white-space: nowrap;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: var(--text-secondary, #6b7280);
  transition: all var(--transition-fast);
  background-color: transparent;
}

.icon-button:hover {
  background-color: var(--surface-hover, #f3f4f6);
  color: var(--text-primary, #111827);
}

.icon-button i {
  font-size: 1.25rem;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}
.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-nav::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 10px;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  height: 100%;
}

.nav-item.mt-auto {
  margin-top: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  color: var(--text-secondary, #4b5563);
  font-weight: 500;
  transition: all var(--transition-fast);
  white-space: nowrap;
  position: relative;
}

.nav-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.nav-link:hover {
  background-color: #6B59FF10;
  color: var(--color-primary, #0d9488);
  transform: translateX(3px);
}

.nav-link.active {
  background-color: #6B59FF10; /* Fallback tint */
  color: var(--color-primary);
  font-weight: 600;
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 50%;
  transform: translateY(-50%);
  height: 50%;
  width: 4px;
  background-color: var(--color-primary, #0d9488);
  border-radius: 0 4px 4px 0;
  opacity: 1;
}

/* Collapsed Nav Adjustments */
.sidebar-collapsed .nav-link {
  justify-content: center;
  padding: 0.75rem 0;
}

.sidebar-collapsed .nav-link:hover {
  transform: scale(1.05);
}

.sidebar-collapsed .nav-link.active::before {
  left: 0;
  height: 100%;
  width: 3px;
  border-radius: 0;
}

.sidebar-collapsed .nav-label {
  display: none;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 1.25rem 1rem;
  border-top: 1px solid var(--border-primary, #f3f4f6);
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 12px;
  color: var(--text-secondary, #4b5563);
  font-weight: 600;
  transition: all var(--transition-fast);
  background-color: transparent;
  border: 1px solid transparent;
}

.logout-icon {
  font-size: 1.25rem;
}

.logout-button:hover {
  background-color: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
  transform: translateY(-1px);
}

.sidebar-collapsed .logout-label {
  display: none;
}

/* =========================================
   Main Content Area
   ========================================= */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; 
  gap: var(--app-padding);
}

/* Top Header */
.top-header {
  height: var(--header-height);
  background-color: var(--surface, #ffffff);
  border-radius: 16px;
  border: 1px solid var(--border-primary, #e5e7eb);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  z-index: 30;
  flex-shrink: 0;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-toggle {
  display: none;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-primary, #111827);
  margin: 0;
  /* margin-left: 0.5rem; */
}

.notification-btn {
  position: relative;
  background-color: var(--bg-primary, #f9fafb);
  border: 1px solid var(--border-primary, #e5e7eb);
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2px solid var(--surface, #ffffff);
}

/* Profile Dropdown */
.profile-dropdown-wrapper {
  position: relative;
  margin-left: 0.25rem;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0.5rem 0.375rem 0.375rem;
  border-radius: 50px;
  transition: all var(--transition-fast);
  background-color: var(--bg-primary, #f9fafb);
  border: 1px solid var(--border-primary, #e5e7eb);
}

.profile-trigger:hover, .profile-trigger[aria-expanded="true"] {
  background-color: var(--surface-hover, #f3f4f6);
  border-color: var(--color-primary, #0d9488);
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.profile-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
  line-height: 1.2;
}

.profile-role {
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
}

.profile-chevron {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  transition: transform var(--transition-fast);
  margin-left: 0.25rem;
}

.profile-chevron.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  width: 220px;
  background-color: var(--surface, #ffffff);
  border: 1px solid var(--border-primary, #e5e7eb);
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  padding: 0.5rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-header {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
}

.dropdown-name {
  font-weight: 600;
  color: var(--text-primary, #111827);
  font-size: 0.875rem;
}

.dropdown-role {
  color: var(--text-secondary, #6b7280);
  font-size: 0.75rem;
  margin-top: 0.15rem;
}

.dropdown-email {
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
  margin-top: 0.25rem;
  word-break: break-all;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-primary, #f3f4f6);
  margin: 0.35rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.85rem;
  border-radius: 8px;
  color: var(--text-primary, #374151);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: var(--surface-hover, #f3f4f6);
  color: var(--color-primary, #0d9488);
  padding-left: 1.1rem;
}

.dropdown-item.text-danger {
  color: #dc2626;
}

.dropdown-item.text-danger:hover {
  background-color: #fee2e2;
  color: #b91c1c;
}

/* =========================================
   Content Scrollable Area
   ========================================= */
.content-scrollable {
  flex: 1;
  overflow-y: auto;
  /* border-radius: 16px; */
  /* Instead of solid background, it lets the inner slots govern the look */
  /* Scrollbar styles */
}

.content-scrollable::-webkit-scrollbar {
  width: 6px;
}
.content-scrollable::-webkit-scrollbar-track {
  background: transparent;
}
.content-scrollable::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}

.content-container {
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  padding-bottom: 2rem;
}

/* =========================================
   Responsive Design (Media Queries)
   ========================================= */

@media (min-width: 1025px) {
  .mobile-only {
    display: none !important;
  }
}

@media (max-width: 1024px) {
  .desktop-only {
    display: none !important;
  }
  
  .desktop-toggle {
    display: none;
  }

  .mobile-toggle {
    display: flex;
  }

  .mobile-only {
    display: flex;
  }

  /* Sidebar off-canvas */
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    height: 100vh;
    border-radius: 0;
    transform: translateX(-100%);
    width: var(--sidebar-width);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.1);
    border: none;
    z-index: 50;
  }

  .admin-layout {
    padding: 0;
    gap: 0;
  }
  
  .main-wrapper {
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .sidebar.sidebar-collapsed {
    width: var(--sidebar-width); /* Disable collapse on mobile, full nav only */
  }

  .admin-layout.mobile-nav-open .sidebar {
    transform: translateX(0);
  }

  /* Backdrop */
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 45;
    backdrop-filter: blur(2px);
    animation: fadeIn var(--transition-fast) ease-in-out;
  }
}

@media (max-width: 640px) {
  .page-title {
    font-size: 1.1rem;
  }
  
  .profile-trigger {
    padding: 0.25rem;
  }
  
  .profile-avatar {
    width: 28px;
    height: 28px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>