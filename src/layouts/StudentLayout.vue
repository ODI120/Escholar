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
          <div class="switch-mode">
            <ThemeToggle inline />
          </div>
          <button class="logout-btn" @click="handleLogout">Logout</button>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ThemeToggle from '../components/ThemeToggle.vue'

const router = useRouter()
const imageError = ref(false)

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
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--text-primary);
  transition: background-color var(--transition-normal, 0.3s ease), color var(--transition-normal, 0.3s ease);
}

.top-nav-container {
  padding: 1rem;
}

.suspended-topnav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--surface);
  padding: 0.75rem 2rem;
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.05));
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
  gap: 1.5rem;
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
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: var(--radius-2xl, 20px);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s ease);
}

.logout-btn:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

.student-main {
  max-width: 1400px;
  margin: 0 auto;
}

.content {
  padding: 0 2rem 2rem 2rem;
}

@media (max-width: 768px) {
  .portal-name {
    display: none;
  }
  .welcome-text {
    display: none;
  }
  .top-nav-container {
    padding: 1rem;
  }
  .content {
    padding: 0 1rem 1rem 1rem;
  }
}
</style>
