<template>
  <div class="student-layout">
    <div class="top-nav-container">
      <nav class="suspended-topnav">
        <div class="nav-brand">
          <div class="logo-circle">
            <img src="/logo.png" alt="Logo" class="fallback-logo" @error="handleImageError" v-if="!imageError" />
            <span class="logo-text" v-else>E</span>
          </div>
          <span class="portal-name">Escholar</span>
        </div>
        <div class="nav-actions">
          <!-- Desktop Actions -->
          <div class="switch-mode desktop-only">
            <ThemeToggle inline />
          </div>
          <button class="logout-btn desktop-only" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i>
            Logout
          </button>
          
          <!-- Mobile Dropdown -->
          <div class="dropdown-btn mobile-only" ref="dropdownRef">
            <div 
              class="btn btn-secondary dropdown-toggle action-btn" 
              type="button" 
              @click="toggleDropdown"
              :aria-expanded="isDropdownOpen"
            >
              <i class="bi bi-list"></i>
            </div>
            
            <transition name="dropdown">
              <ul class="dropdown-menu dropdown-menu-end shadow-sm" v-show="isDropdownOpen">
                <!-- Mobile Tabs -->
                
                <!-- Existing Actions -->
                <li><a class="dropdown-item" href="#" @click.prevent="closeDropdown(true)"><i class="bi bi-person me-2"></i> Edit Profile</a></li>
                <li><a class="dropdown-item" href="#" @click.prevent="handleThemeToggle"><i class="bi bi-moon-stars me-2"></i> Toggle Theme</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout"><i class="bi bi-box-arrow-right me-2"></i> Logout</a></li>
              </ul>
            </transition>
          </div>
        </div>
      </nav>
    </div>
    
    <main class="student-main">
      <div class="content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '../components/ThemeToggle.vue'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const imageError = ref(false)
const { toggleTheme } = useTheme()

const emit = defineEmits(['edit-profile'])

const isDropdownOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = (triggerEdit = false) => {
  isDropdownOpen.value = false
  if (triggerEdit === true) {
    emit('edit-profile')
  }
}

const handleThemeToggle = () => {
  toggleTheme()
  closeDropdown()
}

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleImageError = () => {
  imageError.value = true
}

const handleLogout = () => {
  localStorage.removeItem('student_session')
  localStorage.removeItem('user_role')
  localStorage.removeItem('supabase.auth.token')
  router.push('/student/login')
}
</script>

<style scoped>
.student-layout {
  min-height: 100vh;
  background-color: var(--bg-primary);
  /* font-family: 'Inter', system-ui, -apple-system, sans-serif; */
  color: var(--text-primary);
  transition: background-color var(--transition-normal, 0.3s ease), color var(--transition-normal, 0.3s ease);
}

.top-nav-container {
  padding: 1rem 0;
  max-width: 1400px;
  margin: 0 auto;
  /* position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; */
}

.suspended-topnav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--surface);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg, 12px);
  /* box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.05)); */
  border: 1px solid var(--border-primary);
  /* max-width: 1400px; */
  /* margin: 0 auto; */
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.logo-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  /* background: linear-gradient(135deg, #0d6efd, #0099ff); */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  overflow: hidden;
}

.fallback-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.portal-name {
  font-weight: 600;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mobile-only {
  display: none;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 1000;
  background-color: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.1));
  padding: 0.5rem;
  width: 240px; 
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  list-style: none;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s ease);
}

.dropdown-item i {
  font-size: 1.1rem;
  color: var(--text-secondary);
  transition: color var(--transition-fast, 0.2s ease);
}

.dropdown-item:hover {
  background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  transform: translateX(4px);
}

.dropdown-item:hover i {
  color: var(--color-primary);
}

.dropdown-item.text-danger {
  color: #f8293d;
}

.dropdown-item.text-danger i {
  color: #f8293d;
}

.dropdown-item.text-danger:hover {
  background-color: color-mix(in srgb, #f8293d 10%, transparent);
  color: #f8293d;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-primary);
  margin: 0.5rem 0;
  border: none;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.switch-mode {
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-text {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
}

.logout-btn {
  /* background-color: ; */
  color: #f8293d;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s ease);
  border: 1px solid #f8293d35;
}
button i{
 font-size: 1rem;
}
button {
  background-color: transparent;
}

.logout-btn:hover {
  background-color: #f8293d;
  transform: translateY(-1px);
  color: white;
}

.dropdown-btn {
  position: relative;
}

.action-btn {
  background-color: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.8rem;
}

.action-btn:hover, .action-btn:focus {
  background-color: var(--card-bg);
  color: var(--color-primary);
  box-shadow: none;
}

/* Base Visibility Rules */
.mobile-only {
  display: none !important;
}

.student-main {
  /* max-width: 1400px; */
  margin: 0 auto;
}

.content {
  padding: 0 1rem;
}

/* Responsive Overrides */
@media (max-width: 768px) {
  /* .portal-name {
    display: none;
  } */
  .welcome-text {
    display: none;
  }
  .top-nav-container {
    padding: 1rem;
  }
  
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block !important;
  }
  .nav-actions {
 
  gap: 0;
}
}
</style>
