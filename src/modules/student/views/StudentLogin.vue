<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">Escholar</h2>
      <p class="auth-subtitle">Student Portal</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="email">Student Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            placeholder="student@university.edu"
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

      <div v-if="error" class="alert alert-danger mt-3 rounded-3">
        <strong>Login Error:</strong> {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useSupabaseAuth } from '../../../composables/useSupabase.js'

  const router = useRouter()
  const { signIn } = useSupabaseAuth()

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
        // Explicitly set the user role to student upon successful login on this page
        localStorage.setItem('user_role', 'student')
        router.push('/student/dashboard')
      }
    } catch (err) {
      error.value = 'An unexpected error occurred'
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-body, #f4f6f9);
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 400px;
}

.auth-title {
  text-align: center;
  color: var(--color-primary, #6B59FF);
  font-weight: bold;
  font-size: 1.8rem;
  margin-bottom: 0.2rem;
}

.auth-subtitle {
  text-align: center;
  color: var(--text-secondary, #666);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary, #333);
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color, #dee2e6);
  border-radius: 6px;
  box-sizing: border-box;
}
.input:focus {
  outline: none;
  border-color: var(--color-primary, #6B59FF);
}

.btn-primary {
  width: 100%;
  padding: 0.8rem;
  background-color: var(--color-primary, #6B59FF);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  font-size: 1rem;
}

.btn-primary:hover {
  background-color: color-mix(in srgb, var(--color-primary) 80%, black);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.alert-danger {
  color: #dc3545;
  background-color: #f8d7da;
  border-color: #f5c6cb;
  padding: 0.75rem 1.25rem;
  margin-top: 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
}
</style>
