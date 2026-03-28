<template>
  <div class="auth-page-premium">
    <!-- Cinematic Background -->
    <div class="background-overlay"></div>
    
    <!-- Glassmorphic Login Panel -->
    <div class="auth-card glass-panel">
      <!-- Branding / Entry Graphic -->
      <div class="brand-header">
        <div class="brand-logo-container staggered-1">
          <div class="brand-logo glow">
            <i class="bi bi-mortarboard-fill"></i>
          </div>
        </div>
        <h2 class="auth-title staggered-2">Escholar Portal</h2>
        <p class="auth-subtitle staggered-2">Beneficiary Access Terminal</p>
      </div>

      <form @submit.prevent="handleLogin" class="elegant-form">
        <!-- Floating Label Inputs -->
        <div class="floating-group staggered-3">
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            placeholder=" "
            class="floating-input"
            autocomplete="email"
          />
          <label class="floating-label" for="email">
            <i class="bi bi-envelope-fill icon-left"></i> Email Address
          </label>
        </div>

        <div class="floating-group staggered-4">
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            placeholder=" "
            class="floating-input"
            autocomplete="current-password"
          />
          <label class="floating-label" for="password">
            <i class="bi bi-key-fill icon-left"></i> Password
          </label>
          <div class="password-hint">
            <small>(Default password is 000000)</small>
          </div>
        </div>

        <button type="submit" class="btn-premium btn-pulse staggered-5" :class="{ 'is-loading': loading }" :disabled="loading">
          <span v-if="!loading" class="btn-text">Log In <i class="bi bi-arrow-right icon-right"></i></span>
          <div class="spinner-grow spinner-grow-sm text-light" role="status" v-if="loading">
            <span class="visually-hidden">Loading...</span>
          </div>
        </button>
      </form>

      <!-- Errors -->
      <div v-if="error" class="error-glass mt-3 staggered-6">
        <div class="error-icon"><i class="bi bi-exclamation-octagon"></i></div>
        <div class="error-content">
          <strong>Authentication Error</strong>
          <p>{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '../../../composables/useSupabase.js'

  const router = useRouter()
  const form = ref({
    email: '',
    password: ''
  })

  const loading = ref(false)
  const error = ref('')

  const handleLogin = async () => {
    loading.value = true
    error.value = ''

    try {
      // 1. Authenticate with Supabase Auth using email
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: form.value.email.trim(),
        password: form.value.password
      })

      if (authError) {
        error.value = 'Incorrect email or password. Please try again.'
        return
      }

      // 2. Fetch the corresponding student profile from the `students` table
      const { data: studentProfile, error: profileError } = await supabase
        .from('students')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !studentProfile) {
        throw new Error('Student profile not found. Please contact administration.')
      }

      // Store student session
      localStorage.setItem('user_role', 'student')
      localStorage.setItem('student_session', JSON.stringify(studentProfile))
      
      router.push('/student/dashboard')

    } catch (err) {
      error.value = 'An unexpected error occurred: ' + err.message
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
/* Core Page Layout */
.auth-page-premium {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('/login-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #fff;
}

/* Deep immersive overlay */
.background-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(8, 11, 26, 0.7) 0%, rgba(20, 16, 45, 0.5) 100%);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 1;
}

/* The Glassmorphic Container */
.auth-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 420px;
  margin: 2rem;
  padding: 3.5rem 2.8rem;
  border-radius: 28px;
  background: rgba(14, 18, 36, 0.45);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.6), 
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    inset 0 -1px 1px rgba(0, 0, 0, 0.3);
}

/* Branding Header */
.brand-header {
  text-align: center;
  margin-bottom: 3rem;
}

.brand-logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.brand-logo {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #fff;
  box-shadow: 0 0 40px rgba(99, 102, 241, 0.4);
}

.auth-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.auth-subtitle {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  font-weight: 500;
}

/* Elegant Floating Forms */
.elegant-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.floating-group {
  position: relative;
}

.floating-input {
  width: 100%;
  height: 56px;
  padding: 1.25rem 1rem 0.25rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.floating-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 
    0 0 0 4px rgba(99, 102, 241, 0.1),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.floating-label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.95rem;
  font-weight: 500;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.password-hint {
  text-align: right;
  margin-top: 0.4rem;
}

.password-hint small {
  color: rgba(236, 72, 153, 0.8);
  font-size: 0.75rem;
  font-weight: 600;
}

/* Floating label magic */
.floating-input:focus ~ .floating-label,
.floating-input:not(:placeholder-shown) ~ .floating-label {
  top: 0.8rem;
  font-size: 0.75rem;
  color: rgba(99, 102, 241, 0.9);
}

.icon-left {
  font-size: 1.05rem;
}

.icon-right {
  margin-left: 0.3rem;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

/* Premium Button */
.btn-premium {
  height: 56px;
  width: 100%;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
  color: white;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.5rem;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.btn-premium::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.btn-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(236, 72, 153, 0.5);
}

.btn-premium:hover:not(:disabled)::after {
  opacity: 1;
}

.btn-premium:hover:not(:disabled) .icon-right {
  transform: translateX(4px);
}

.btn-premium:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.btn-premium.is-loading {
  opacity: 0.8;
  cursor: wait;
}

/* Error State UI */
.error-glass {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.error-icon {
  color: #ef4444;
  font-size: 1.5rem;
}

.error-content strong {
  display: block;
  color: #ef4444;
  font-size: 0.9rem;
}

.error-content p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Micro-animations Staggered Loading */
.staggered-1 { animation: fadeSlideUp 0.8s ease 0.1s both; }
.staggered-2 { animation: fadeSlideUp 0.8s ease 0.2s both; }
.staggered-3 { animation: fadeSlideUp 0.8s ease 0.3s both; }
.staggered-4 { animation: fadeSlideUp 0.8s ease 0.4s both; }
.staggered-5 { animation: fadeSlideUp 0.8s ease 0.5s both; }
.staggered-6 { animation: fadeSlideUp 0.8s ease 0.6s both; }

@keyframes fadeSlideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
