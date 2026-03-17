<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">Escholar</h2>
      <p class="auth-subtitle">Admin Portal</p>

      <form @submit.prevent="handleLogin">
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
            placeholder="Enter your password"
            class="input"
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="text-center mt-3">
        <button type="button" class="btn btn-link btn-sm" @click="testConnection">
          Test Supabase Connection
        </button>
        <br />
        <button type="button" class="btn btn-link btn-sm" @click="checkAuthStatus">
          Check Auth Status
        </button>
      </div>

      <div v-if="error" class="alert alert-danger mt-3 rounded-3">
        <strong>Login Error:</strong> {{ error }}
        <br><small v-if="error.includes('Email not confirmed')" class="text-muted">
          Please check your email and click the confirmation link before logging in.
        </small>
        <small v-else-if="error.includes('Invalid login credentials')" class="text-muted">
          Please check your email and password, or create an account if you haven't already.
        </small>
        <small v-else class="text-muted">
          If this persists, try resetting your password or contact support.
        </small>
      </div>

      <div class="text-center mt-4">
        <p class="mb-0 text-muted">
          Don't have an account?
          <router-link to="/signup" class="text-primary fw-semibold text-decoration-none">
            Sign up
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useSupabaseAuth, useSupabaseAdmins } from '../composables/useSupabase.js'

  const router = useRouter()
  const { signIn, getCurrentUser } = useSupabaseAuth()
  const { ensureAdminForUser } = useSupabaseAdmins()

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
      const { data, error: signInError } = await signIn(form.value.email, form.value.password)

      if (signInError) {
        error.value = signInError.message
      } else {
        // Ensure this authenticated user has an admin record
        try {
          const { data: userData } = await getCurrentUser()
          if (userData?.user) {
            await ensureAdminForUser(userData.user)
          }
        } catch (e) {
          // non-fatal for login; ignore admin sync errors here
          console.warn('Failed to sync admin for user:', e)
        }

        router.push('/dashboard')
      }
    } catch (err) {
      error.value = 'An unexpected error occurred'
    } finally {
      loading.value = false
    }
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

  const checkAuthStatus = async () => {
    try {
      const { data, error } = await getCurrentUser()
      const storedToken = localStorage.getItem('supabase.auth.token')

      let message = 'Auth Status:\n\n'
      message += `Stored Token: ${storedToken ? '✅ Present' : '❌ Missing'}\n`
      message += `Current User: ${data?.user ? '✅ Logged in' : '❌ Not logged in'}\n`

      if (data?.user) {
        message += `Email: ${data.user.email}\n`
        message += `Email Confirmed: ${data.user.email_confirmed_at ? '✅ Yes' : '❌ No'}\n`
      }

      if (error) {
        message += `Error: ${error.message}\n`
      }

      alert(message)
    } catch (err) {
      alert(`Error checking auth status: ${err.message}`)
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
</style>