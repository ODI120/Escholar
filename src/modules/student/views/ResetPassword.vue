<template>
  <div class="auth-page-premium">
    <!-- Cinematic Background -->
    <div class="background-overlay"></div>
    
    <!-- Glassmorphic Reset Panel -->
    <div class="auth-card glass-panel">
      <!-- Branding -->
      <div class="brand-header">
        <div class="brand-logo-container staggered-1">
          <div class="brand-logo glow">
            <i class="bi bi-shield-lock-fill"></i>
          </div>
        </div>
        <h2 class="auth-title staggered-2">Reset Password</h2>
        <p class="auth-subtitle staggered-2">Update your beneficiary credentials</p>
      </div>

      <form v-if="!resetSuccess" @submit.prevent="handleResetPassword" class="elegant-form">
        <!-- New Password -->
        <div class="floating-group staggered-3">
          <input
            :type="showNewPassword ? 'text' : 'password'"
            id="new-password"
            v-model="form.newPassword"
            required
            placeholder=" "
            class="floating-input"
            autocomplete="new-password"
          />
          <label class="floating-label" for="new-password">
            <i class="bi bi-key-fill icon-left"></i> New Password
          </label>
          <button 
            type="button" 
            class="password-preview-btn" 
            @click="showNewPassword = !showNewPassword"
            aria-label="Toggle password visibility"
          >
            <i :class="showNewPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
          </button>
        </div>

        <!-- Confirm Password -->
        <div class="floating-group staggered-4">
          <input
            :type="showConfirmPassword ? 'text' : 'password'"
            id="confirm-password"
            v-model="form.confirmPassword"
            required
            placeholder=" "
            class="floating-input"
            autocomplete="new-password"
          />
          <label class="floating-label" for="confirm-password">
            <i class="bi bi-check-circle-fill icon-left"></i> Confirm Password
          </label>
          <button 
            type="button" 
            class="password-preview-btn" 
            @click="showConfirmPassword = !showConfirmPassword"
            aria-label="Toggle password visibility"
          >
            <i :class="showConfirmPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
          </button>
        </div>

        <div class="field-hint staggered-4">
          <small>Choose a secure password (min. 6 characters)</small>
        </div>

        <button type="submit" class="btn-premium btn-pulse staggered-5" :class="{ 'is-loading': loading }" :disabled="loading">
          <span v-if="!loading" class="btn-text">
            Update Password <i class="bi bi-check2-circle icon-right"></i>
          </span>
          <div class="spinner-grow spinner-grow-sm text-light" role="status" v-if="loading">
            <span class="visually-hidden">Loading...</span>
          </div>
        </button>
      </form>

      <!-- Success State -->
      <div v-else class="auth-step-wrapper text-center staggered-1">
        <div class="success-icon glow mb-4">
          <i class="bi bi-patch-check-fill"></i>
        </div>
        <h3 class="student-name">Success!</h3>
        <p class="auth-subtitle mb-4">
          Your password has been updated securely. <br>
          You can now sign in with your new credentials.
        </p>
        <button @click="goToLogin" class="btn-premium">
          Return to Login
        </button>
      </div>

      <!-- Errors -->
      <div v-if="error" class="error-glass mt-3 staggered-6">
        <div class="error-icon"><i class="bi bi-exclamation-octagon"></i></div>
        <div class="error-content">
          <strong>Reset Error</strong>
          <p>{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '../../../composables/useSupabase.js'

  const router = useRouter()
  const loading = ref(false)
  const resetSuccess = ref(false)
  const error = ref('')
  
  const showNewPassword = ref(false)
  const showConfirmPassword = ref(false)

  const form = ref({
    newPassword: '',
    confirmPassword: ''
  })

  // Security check: Ensure we have a session (hash fragment or recovered)
  onMounted(async () => {
    // Supabase automatically picks up the hash fragment for password resets
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      error.value = 'Invalid or expired reset link. Please request a new one.'
    }
  })

  const handleResetPassword = async () => {
    if (form.value.newPassword !== form.value.confirmPassword) {
      error.value = 'Passwords do not match.'
      return
    }

    if (form.value.newPassword.length < 6) {
      error.value = 'Password must be at least 6 characters.'
      return
    }

    loading.value = true
    error.value = ''

    try {
      const { error: resetError } = await supabase.auth.updateUser({
        password: form.value.newPassword
      })

      if (resetError) throw resetError

      resetSuccess.value = true
      
      // Cleanup
      localStorage.removeItem('supabase.auth.token')
      await supabase.auth.signOut() 

    } catch (err) {
      error.value = err.message || 'Unable to reset password.'
    } finally {
      loading.value = false
    }
  }

  const goToLogin = () => {
    router.push('/student/login')
  }
</script>

<style scoped>
/* Core Page Layout (Shared with Login) */
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

.background-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(8, 11, 26, 0.75) 0%, rgba(20, 16, 45, 0.55) 100%);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 1;
}

.auth-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 440px;
  margin: 2rem;
  padding: 3.5rem 2.5rem;
  border-radius: 32px;
  background: rgba(10, 14, 28, 0.75);
  backdrop-filter: blur(45px);
  -webkit-backdrop-filter: blur(45px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 25px 60px -12px rgba(0, 0, 0, 0.7), 
    inset 0 1px 1px rgba(255, 255, 255, 0.2),
    inset 0 -1px 1px rgba(0, 0, 0, 0.4);
}

.brand-header { text-align: center; margin-bottom: 3rem; }
.brand-logo-container { display: flex; justify-content: center; margin-bottom: 1.25rem; }
.brand-logo {
  width: 64px; height: 64px; border-radius: 20px;
  background: linear-gradient(135deg, rgba(107, 89, 255, 0.2), rgba(144, 130, 255, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; color: #fff;
  box-shadow: 0 0 40px rgba(107, 89, 255, 0.4);
}

.auth-title { margin: 0; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; }
.auth-subtitle { margin: 0.25rem 0 0; color: #a0aec0; font-size: 0.95rem; font-weight: 600; letter-spacing: 0.5px; }

.elegant-form { display: flex; flex-direction: column; gap: 1.5rem; }
.floating-group { position: relative; }
.floating-input {
  width: 100%; height: 56px; padding: 1.25rem 1rem 0.25rem;
  border-radius: 14px; background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08); color: #ffffff;
  font-size: 1rem; font-weight: 500; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.floating-input:focus {
  outline: none; background: rgba(255, 255, 255, 0.08);
  border-color: #8b7dff; box-shadow: 0 0 0 4px rgba(107, 89, 255, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.floating-label {
  position: absolute; left: 1rem; top: 50%; transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.918); font-size: 1rem; font-weight: 600;
  pointer-events: none; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex; align-items: center; gap: 0.4rem;
}

.floating-input:focus ~ .floating-label,
.floating-input:not(:placeholder-shown) ~ .floating-label {
  top: 0.8rem; font-size: 0.8rem; color: #b0a8f7; font-weight: 700;
}

.password-preview-btn {
  position: absolute; right: 1rem; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: rgba(255, 255, 255, 0.808);
  cursor: pointer; padding: 0.5rem; font-size: 1.1rem; transition: all 0.2s ease; z-index: 10;
}

.password-preview-btn:hover { color: #fff; transform: translateY(-50%) scale(1.15); }

.field-hint { margin-top: 0.25rem; text-align: left; padding-left: 0.25rem; }
.field-hint small { color: #b0a8f7; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.3px; }

.btn-premium {
  height: 56px; width: 100%; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #6B59FF 0%, #8b7dff 100%); color: white;
  font-size: 1.05rem; font-weight: 700; cursor: pointer;
  display: flex; justify-content: center; align-items: center; margin-top: 0.75rem;
  box-shadow: 0 4px 15px rgba(107, 89, 255, 0.35); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative; overflow: hidden;
}

.btn-premium:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(107, 89, 255, 0.5); }
.icon-right { margin-left: 0.5rem; font-size: 1.1rem; }

.success-icon {
  width: 80px; height: 80px; background: rgba(139, 125, 255, 0.15);
  border: 1px solid rgba(139, 125, 255, 0.3); border-radius: 24px;
  display: flex; align-items: center; justify-content: center; margin: 0 auto;
  font-size: 2.5rem; color: #b0a8f7;
}

.student-name { font-size: 1.75rem; font-weight: 600; color: #ffffff; margin: 0.3rem 0; }

.error-glass {
  background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px; padding: 1rem; display: flex; gap: 0.8rem; align-items: center;
}
.error-icon { color: #ef4444; font-size: 1.5rem; }
.error-content strong { display: block; color: #ef4444; font-size: 0.9rem; }
.error-content p { margin: 0; font-size: 0.85rem; color: rgba(255, 255, 255, 0.8); }

.staggered-1 { animation: fadeSlideUp 0.8s ease 0.1s both; }
.staggered-2 { animation: fadeSlideUp 0.8s ease 0.2s both; }
.staggered-3 { animation: fadeSlideUp 0.8s ease 0.3s both; }
.staggered-4 { animation: fadeSlideUp 0.8s ease 0.4s both; }
.staggered-5 { animation: fadeSlideUp 0.8s ease 0.5s both; }
.staggered-6 { animation: fadeSlideUp 0.8s ease 0.6s both; }

@keyframes fadeSlideUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
