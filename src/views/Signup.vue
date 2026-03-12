<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">Escholar</h2>
      <p class="auth-subtitle">Create Admin Account</p>

      <div v-if="isAuthenticated" class="alert alert-info">
        You are currently signed in. <button class="btn btn-link p-0" @click="handleLogout">Logout</button> to add another admin.
      </div>
      <form v-if="!isAuthenticated" @submit.prevent="handleSignup">
        <div class="form-group">
          <label class="form-label" for="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            v-model="form.firstName"
            required
            placeholder="Your first name"
            class="input"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            placeholder="admin@escholar.com"
            class="input"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            placeholder="Create a strong password"
            minlength="6"
            class="input"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            required
            placeholder="Confirm your password"
            minlength="6"
            class="input"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading || !form.firstName || form.password !== form.confirmPassword"
        >
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <div class="text-center mt-3">
        <button type="button" class="btn btn-link btn-sm" @click="testConnection">
          Test Supabase Connection
        </button>
      </div>

      <div v-if="error" class="alert alert-danger mt-3 rounded-3">
        <strong>Signup Error:</strong> {{ error }}
        <br><small class="text-muted">Check your Supabase configuration if this persists.</small>
      </div>

      <div v-if="success" class="alert alert-success mt-3 rounded-3">
        <strong>Account Created Successfully!</strong>
        <br>Please check your email and click the confirmation link before logging in.
        <br><small class="text-muted">Don't forget to check your spam folder!</small>
      </div>

      <div class="text-center mt-4">
        <p class="mb-0 text-muted">
          Already have an account?
          <router-link to="/login" class="text-primary fw-semibold text-decoration-none">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabaseAuth } from '../composables/useSupabase.js'

const router = useRouter()
const { signUp, signOut } = useSupabaseAuth()
const isAuthenticated = ref(!!localStorage.getItem('supabase.auth.token'))

const form = ref({
  firstName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleSignup = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    // include first name as metadata for display
    const metadata = { full_name: form.value.firstName, first_name: form.value.firstName }
    const { data, error: signUpError } = await signUp(
      form.value.email,
      form.value.password,
      metadata
    )

    if (signUpError) {
      error.value = signUpError.message
    } else {
      success.value = true
      // Clear form
      form.value = { firstName: '', email: '', password: '', confirmPassword: '' }
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  await signOut()
  isAuthenticated.value = false
  router.push('/login')
}

const testConnection = async () => {
  try {
    // Test basic connection to Supabase
    const response = await fetch('https://rhpwrkfwcocqkvjdscyd.supabase.co/rest/v1/', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHdya2Z3Y29jcWt2amRzY3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTQzMjgsImV4cCI6MjA4ODczMDMyOH0.rVVpg3gYMdxym9MfpzUhHiyQWY73mhWpsLm683WR73I',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHdya2Z3Y29jcWt2amRzY3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTQzMjgsImV4cCI6MjA4ODczMDMyOH0.rVVpg3gYMdxym9MfpzUhHiyQWY73mhWpsLm683WR73I'
      }
    })

    if (response.ok) {
      alert('✅ Supabase connection successful!')
    } else {
      alert(`❌ Connection failed: ${response.status} ${response.statusText}`)
    }
  } catch (err) {
    alert(`❌ Connection error: ${err.message}`)
  }
}
</script>

<style scoped>
.bg-light {
  background: var(--bg-primary) !important;
}

.card {
  background: var(--surface) !important;
  border-color: var(--border-primary) !important;
}

.form-control {
  background: var(--input-bg) !important;
  border-color: var(--input-border) !important;
  color: var(--text-primary) !important;
}

.form-control:focus {
  background: var(--input-bg) !important;
  border-color: var(--color-primary) !important;
  color: var(--text-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(34, 197, 94, 0.25);
}

.btn-primary {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

.btn-primary:hover {
  background: var(--color-primary-hover) !important;
  border-color: var(--color-primary-hover) !important;
}

.text-primary {
  color: var(--color-primary) !important;
}

.text-muted {
  color: var(--text-secondary) !important;
}

.alert-danger {
  background: rgba(220, 53, 69, 0.1) !important;
  border-color: rgba(220, 53, 69, 0.2) !important;
  color: #dc3545 !important;
}

.alert-success {
  background: rgba(25, 135, 84, 0.1) !important;
  border-color: rgba(25, 135, 84, 0.2) !important;
  color: #198754 !important;
}
</style>