<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">Escholar</h2>
      <p class="auth-subtitle">Student Portal</p>

      <!-- Step 1: Verify Identifier -->
      <form v-if="step === 1" @submit.prevent="verifyIdentifier">
        <div class="form-group">
          <label class="form-label" for="identifier">Email or Phone Number</label>
          <input
            type="text"
            id="identifier"
            v-model="form.identifier"
            required
            placeholder="e.g. student@school.edu or 0801234..."
            class="input"
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Verifying...' : 'Next' }}
        </button>
      </form>

      <!-- Step 2: Login -->
      <form v-else @submit.prevent="handleLogin">
        <div class="form-group">
          <div class="d-flex justify-content-between align-items-center mb-1">
             <label class="form-label mb-0" for="identifier_disabled">Email or Phone Number</label>
             <button type="button" class="btn-link text-primary" @click="step = 1; error = ''">Change</button>
          </div>
          <input
            type="text"
            id="identifier_disabled"
            :value="form.identifier"
            disabled
            class="input text-muted bg-light"
          />
        </div>

        <div v-if="verifiedStudentName" class="welcome-text mb-3">
          Hi, <strong>{{ verifiedStudentName }}</strong>! Please enter your password to continue.
        </div>

        <div class="form-group">
          <div class="d-flex justify-content-between align-items-center mb-1">
             <label class="form-label mb-0" for="password">Password</label>
             <small class="text-primary" style="font-size: 0.8rem;">(Default: 000000)</small>
          </div>
          <input
            type="password"
            id="password"
            v-model="form.password"
            required
            placeholder="Enter your password"
            class="input"
            autofocus
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div v-if="error" class="alert alert-danger mt-3 rounded-3">
        <strong>Auth Error:</strong> {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '../../../composables/useSupabase.js'

  const router = useRouter()
  const step = ref(1)

  const form = ref({
    identifier: '',
    password: ''
  })

  const loading = ref(false)
  const error = ref('')
  const verifiedStudentName = ref('')

  const verifyIdentifier = async () => {
    loading.value = true
    error.value = ''
    verifiedStudentName.value = ''

    try {
      let identifier = form.value.identifier.trim()
      let searchPhone = identifier
      
      // Attempt to format phone number to E.164 if it looks like one
      if (searchPhone.startsWith('0') && searchPhone.length === 11) {
        searchPhone = '+234' + searchPhone.substring(1)
      } else if (searchPhone.length > 0 && !searchPhone.includes('@') && !searchPhone.startsWith('+')) {
        searchPhone = '+' + searchPhone
      }

      // Check if student exists in the database
      const { data, error: dbError } = await supabase
        .from('students')
        .select('id, full_name, email, phone_number')
        .or(`email.eq.${identifier},phone_number.eq.${searchPhone},phone_number.eq.${identifier}`)
        .maybeSingle()

      if (dbError && dbError.code !== 'PGRST116') {
        throw dbError
      }

      if (!data) {
        error.value = 'No student found with this email or phone number. Please contact your administrator.'
        return // Stay on step 1
      }

      // Student verified!
      verifiedStudentName.value = data.full_name
      step.value = 2
    } catch (err) {
      error.value = 'An error occurred while verifying: ' + err.message
    } finally {
      loading.value = false
    }
  }

  const handleLogin = async () => {
    loading.value = true
    error.value = ''

    try {
      let identifier = form.value.identifier.trim()
      let authPayload = { password: form.value.password }

      if (identifier.includes('@')) {
        authPayload.email = identifier
      } else {
        if (identifier.startsWith('0') && identifier.length === 11) {
          identifier = '+234' + identifier.substring(1)
        } else if (!identifier.startsWith('+')) {
          identifier = '+' + identifier
        }
        authPayload.phone = identifier
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword(authPayload)

      if (signInError) {
        // Provide friendly error if password mismatch, as the student is already verified to exist
        if (signInError.message.toLowerCase().includes('invalid login credentials')) {
            error.value = 'Incorrect password. Remember, the default is 000000.'
        } else {
            error.value = signInError.message
        }
      } else {
        localStorage.setItem('user_role', 'student')
        if (data?.session?.access_token) {
          localStorage.setItem('supabase.auth.token', data.session.access_token)
        }
        router.push('/student/dashboard')
      }
    } catch (err) {
      error.value = 'An unexpected error occurred: ' + err.message
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
  font-weight: 500;
  color: var(--text-primary, #333);
}

.welcome-text {
  font-size: 0.95rem;
  color: var(--text-secondary, #555);
  text-align: center;
  background-color: rgba(107, 89, 255, 0.05);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid rgba(107, 89, 255, 0.1);
}

.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.align-items-center { align-items: center; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-0 { margin-bottom: 0; }
.mb-3 { margin-bottom: 1rem; }
.text-primary { color: var(--color-primary, #6B59FF); }
.text-muted { color: var(--text-secondary, #888); }
.bg-light { background-color: #f8f9fa; }

.btn-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
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
.input:disabled {
  cursor: not-allowed;
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
