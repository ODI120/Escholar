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

      <form @submit.prevent="resetSent ? null : (step === 1 ? handleEmailCheck() : handleLogin())" class="elegant-form">
        <!-- Transition for Steps -->
        <Transition name="auth-slide" mode="out-in">
          <!-- Step 3: Reset Success (Checked first so it takes priority) -->
          <div v-if="resetSent" key="reset-success" class="auth-step-wrapper text-center">
            <div class="success-icon glow mb-4 staggered-1">
              <i class="bi bi-envelope-check-fill"></i>
            </div>
            <h3 class="student-name staggered-2">Check your email</h3>
            <p class="auth-subtitle staggered-3 mb-4">
              We've sent a password reset link to <br>
              <strong>{{ studentData?.email }}</strong>
            </p>
            <button type="button" @click="resetSent = false; step = 1" class="btn-premium staggered-4">
              Return to Login
            </button>
          </div>

          <!-- Step 1: Email Verification -->
          <div v-else-if="step === 1" key="email-step">
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
            <div class="field-hint staggered-4">
              <small>Verify your beneficiary account to proceed</small>
            </div>
          </div>

          <!-- Step 2: Password Entry -->
          <div v-else key="password-step" class="auth-step-wrapper">
            <!-- Personalized Greeting -->
            <div class="user-welcome staggered-1">
              <p class="greeting-pre">Welcome back,</p>
              <h3 class="student-name">{{ studentData?.full_name?.split(' ')[0] }}!</h3>
              <p class="greeting-email">{{ studentData?.email }}</p>
            </div>

            <div class="floating-group staggered-2">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="form.password"
                required
                placeholder=" "
                class="floating-input"
                autocomplete="current-password"
                autofocus
              />
              <label class="floating-label" for="password">
                <i class="bi bi-key-fill icon-left"></i> Password
              </label>
              <button 
                type="button" 
                class="password-preview-btn" 
                @click="showPassword = !showPassword"
                aria-label="Toggle password visibility"
              >
                <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
              </button>
            </div>

            <div class="password-hint staggered-3">
              <button type="button" @click="step = 1" class="secondary-auth-btn">
                <i class="bi bi-arrow-left"></i> Not you? Change email
              </button>
              <button type="button" @click="handleForgotPassword" class="forgot-password-link">
                Forgot Password?
              </button>
            </div>
            
            <p class="micro-hint staggered-4">(Default: 000000)</p>
          </div>
        </Transition>

        <button type="submit" class="btn-premium btn-pulse staggered-5" :class="{ 'is-loading': loading }" :disabled="loading">
          <span v-if="!loading" class="btn-text">
            {{ step === 1 ? 'Continue' : 'Sign In' }}
            <i class="bi" :class="step === 1 ? 'bi-arrow-right icon-right' : 'bi-shield-lock-fill icon-right'"></i>
          </span>
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
  import { supabase, useSupabaseAuth } from '../../../composables/useSupabase.js'

  const router = useRouter()
  const form = ref({
    email: '',
    password: ''
  })

  const loading = ref(false)
  const step = ref(1) // 1: Email, 2: Password
  const showPassword = ref(false)
  const studentEmailVerified = ref(false)
  const studentData = ref(null)
  const resetSent = ref(false)
  const error = ref('')

  const handleEmailCheck = async () => {
    if (!form.value.email) return

    loading.value = true
    error.value = ''

    try {
      // 1. Verify if the email exists in the `students` table
      const { data: student, error: profileError } = await supabase
        .from('students')
        .select('full_name, email')
        .eq('email', form.value.email.trim())
        .single()

      if (profileError || !student) {
        throw new Error('No account found with this email addresses.')
      }

      studentData.value = student
      step.value = 2
    } catch (err) {
      error.value = err.message || 'Verification failed.'
    } finally {
      loading.value = false
    }
  }

  const handleForgotPassword = async () => {
    if (!studentData.value?.email) return
    
    loading.value = true
    error.value = ''
    
    try {
      const { resetPassword } = useSupabaseAuth()
      const { error: resetError } = await resetPassword(studentData.value.email)
      
      if (resetError) throw resetError
      
      resetSent.value = true
    } catch (err) {
      error.value = 'Failed to send reset email: ' + err.message
    } finally {
      loading.value = false
    }
  }

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
        // More specific error message for step 2
        error.value = 'Incorrect password. Please try again.'
        return
      }

      // Fix navigation guard race condition
      if (authData?.session?.access_token) {
        localStorage.setItem('supabase.auth.token', authData.session.access_token)
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
  max-width: 440px; /* Slightly wider for new flow */
  margin: 2rem;
  padding: 3.5rem 2.5rem;
  border-radius: 32px;
  background: rgba(10, 14, 28, 0.295); /* Darker for better contrast */
  backdrop-filter: blur(45px);
  -webkit-backdrop-filter: blur(45px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 25px 60px -12px rgba(0, 0, 0, 0.7), 
    inset 0 1px 1px rgba(255, 255, 255, 0.2),
    inset 0 -1px 1px rgba(0, 0, 0, 0.4);
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
  background: linear-gradient(135deg, rgba(107, 89, 255, 0.2), rgba(144, 130, 255, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #fff;
  box-shadow: 0 0 40px rgba(107, 89, 255, 0.4);
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
  color: #a0aec0; /* Bolder grey for better visibility */
  font-size: 0.95rem;
  font-weight: 600; /* Increased weight for micro-text contrast */
  letter-spacing: 0.5px;
}
  
@media (max-width: 768px) {
  .auth-card {
    padding: 2rem 1rem;
    margin: 1rem;
  }
  .auth-title {
    font-size: 1.5rem;
  }
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
  border-color: rgba(107, 89, 255, 0.5);
  box-shadow: 
    0 0 0 4px rgba(107, 89, 255, 0.15),
    inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.floating-label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.918); /* Higher contrast */
  font-size: 1rem;
  font-weight: 600; /* Bolder contrast */
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.password-preview-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.808);
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  z-index: 10;
}

.password-preview-btn:hover {
  color: #fff;
  transform: translateY(-50%) scale(1.15);
}

.forgot-password-link {
  background: none;
  border: none;
  color: #b0a8f7;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.forgot-password-link:hover {
  color: #fff;
  text-decoration: underline;
}

.micro-hint {
  text-align: right;
  margin-top: 0.5rem;
  color: #a0aec0;
  font-size: 0.75rem;
  font-weight: 600;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: rgba(139, 125, 255, 0.15);
  border: 1px solid rgba(139, 125, 255, 0.3);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 2.5rem;
  color: #b0a8f7;
}

.field-hint {
  margin-top: 0.75rem;
  text-align: left;
  padding-left: 0.25rem;
}

.field-hint small {
  color: #b0a8f7;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  opacity: 0.9;
}

.password-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
}

.secondary-auth-btn {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
}

.secondary-auth-btn:hover {
  color: #fff;
}

.password-hint small {
  color: #b0a8f7; /* Higher contrast purple */
  font-size: 0.82rem; /* Larger micro-text */
  font-weight: 500; /* Bolder contrast */
}

@media (max-width: 320px) {
  .password-hint {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* Floating label magic */
.floating-input:focus ~ .floating-label,
.floating-input:not(:placeholder-shown) ~ .floating-label {
  top: 0.8rem;
  font-size: 0.8rem; /* Larger micro-text contrast */
  color: #b0a8f7; /* Solid color for visibility */
  font-weight: 700;
}

.user-welcome {
  text-align: center;
  margin-bottom: 2.25rem;
}

.greeting-pre {
  display: block;
  font-size: 0.95rem;
  color: #a0aec0;
  font-weight: 500;
}

.student-name {
  font-size: 1.75rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0.3rem 0;
  letter-spacing: -0.01em;
}

.greeting-email {
  font-size: 0.85rem;
  color: #b0a8f7;
  font-weight: 700;
  letter-spacing: 0.3px;
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
  background: linear-gradient(135deg, #6B59FF 0%, #8b7dff 100%);
  color: white;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.5rem;
  box-shadow: 0 4px 15px rgba(107, 89, 255, 0.35);
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
  box-shadow: 0 8px 25px rgba(107, 89, 255, 0.5);
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

/* Authentication Flow Transitions */
.auth-slide-enter-active,
.auth-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.auth-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
