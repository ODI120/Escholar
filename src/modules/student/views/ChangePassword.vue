<template>
  <div class="auth-page-premium">
    <div class="background-overlay"></div>

    <div class="auth-card glass-panel">
      <div class="brand-header">
        <div class="brand-logo-container staggered-1">
          <div class="brand-logo glow">
            <i class="bi bi-shield-lock-fill"></i>
          </div>
        </div>
        <h2 class="auth-title staggered-2">Set Your Password</h2>
        <p class="auth-subtitle staggered-2">
          Choose a new password before continuing to your portal
        </p>
      </div>

      <form @submit.prevent="handleChangePassword" class="elegant-form">
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
          <small>Minimum 8 characters. Do not reuse your temporary password.</small>
        </div>

        <button
          type="submit"
          class="btn-premium staggered-5"
          :class="{ 'is-loading': loading }"
          :disabled="loading"
        >
          <span v-if="!loading" class="btn-text">
            Update Password <i class="bi bi-check2-circle icon-right"></i>
          </span>
          <div class="spinner-grow spinner-grow-sm text-light" role="status" v-if="loading">
            <span class="visually-hidden">Loading...</span>
          </div>
        </button>
      </form>

      <div class="secondary-actions">
        <button type="button" class="secondary-auth-btn" @click="handleSignOut">
          <i class="bi bi-box-arrow-left"></i> Sign out
        </button>
      </div>

      <div v-if="error" class="error-glass mt-3 staggered-6">
        <div class="error-icon"><i class="bi bi-exclamation-octagon"></i></div>
        <div class="error-content">
          <strong>Unable to update password</strong>
          <p>{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase, isMock, useSupabaseAuth } from '../../../composables/useSupabase.js'

const router = useRouter()
const { signOut } = useSupabaseAuth()

const loading = ref(false)
const error = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const form = ref({
  newPassword: '',
  confirmPassword: ''
})

const handleChangePassword = async () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    error.value = 'Passwords do not match.'
    return
  }

  if (form.value.newPassword.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    if (isMock) {
      localStorage.removeItem('must_change_password')
      router.push('/student/dashboard')
      return
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw userError || new Error('Your session has expired. Please sign in again.')

    const { error: updateError } = await supabase.auth.updateUser({
      password: form.value.newPassword,
      data: { must_change_password: false }
    })
    if (updateError) throw updateError

    const { error: profileError } = await supabase
      .from('students')
      .update({ must_change_password: false })
      .eq('id', user.id)
    if (profileError) throw profileError

    localStorage.removeItem('must_change_password')
    router.push('/student/dashboard')
  } catch (err) {
    error.value = err.message || 'Unable to update password.'
  } finally {
    loading.value = false
  }
}

const handleSignOut = async () => {
  await signOut()
  localStorage.removeItem('user_role')
  localStorage.removeItem('student_session')
  localStorage.removeItem('must_change_password')
  router.push('/student/login')
}
</script>

<style scoped>
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
  background: rgba(10, 14, 28, 0.35);
  backdrop-filter: blur(45px);
  -webkit-backdrop-filter: blur(45px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 25px 60px -12px rgba(0, 0, 0, 0.7),
    inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.brand-header {
  text-align: center;
  margin-bottom: 2.5rem;
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
  margin: 0.5rem 0 0;
  color: #a0aec0;
  font-size: 0.95rem;
  font-weight: 600;
}

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
}

.floating-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(107, 89, 255, 0.5);
  box-shadow: 0 0 0 4px rgba(107, 89, 255, 0.15);
}

.floating-label {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-weight: 600;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.floating-input:focus ~ .floating-label,
.floating-input:not(:placeholder-shown) ~ .floating-label {
  top: 0.8rem;
  font-size: 0.8rem;
  color: #b0a8f7;
  font-weight: 700;
}

.password-preview-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1.1rem;
  z-index: 10;
}

.field-hint small {
  color: #b0a8f7;
  font-size: 0.8rem;
  font-weight: 600;
}

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
  box-shadow: 0 4px 15px rgba(107, 89, 255, 0.35);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(107, 89, 255, 0.5);
}

.btn-premium.is-loading {
  opacity: 0.8;
  cursor: wait;
}

.secondary-actions {
  margin-top: 1.25rem;
  display: flex;
  justify-content: center;
}

.secondary-auth-btn {
  background: none;
  border: none;
  color: #a0aec0;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.secondary-auth-btn:hover {
  color: #fff;
}

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

.icon-right {
  margin-left: 0.3rem;
  font-size: 1.2rem;
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
</style>
