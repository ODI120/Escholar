<template>
  <StudentLayout>
    <div class="dashboard-container">
      
      <div v-if="loading" class="text-center py-5">
        <p>Loading your portal...</p>
      </div>

      <div v-else-if="studentData">
        <h1>Student Dashboard</h1>
        <p>Welcome back, <strong>{{ studentData.full_name }}</strong>!</p>
        
        <div class="dashboard-cards">
          <div class="card profile-card">
            <h3>Your Profile</h3>
            <ul class="info-list">
              <li><strong>School:</strong> {{ studentData.school || 'N/A' }}</li>
              <li><strong>Department:</strong> {{ studentData.department || 'N/A' }}</li>
              <li><strong>Level:</strong> {{ studentData.level ? `${studentData.level}L` : 'N/A' }}</li>
              <li><strong>Admission Year:</strong> {{ studentData.year_of_admission || 'N/A' }}</li>
            </ul>
          </div>
          <div class="card academic-card">
            <h3>Academic Status</h3>
            <p v-if="studentData.status === 'graduated'" class="text-success">You have graduated. Congratulations!</p>
            <p v-else class="text-primary">Status: {{ studentData.status || 'Active' }}</p>
            <p><strong>Years Remaining:</strong> {{ studentData.years_remaining || 0 }}</p>
          </div>
        </div>
      </div>

      <div v-else class="alert alert-danger mt-4">
        <h4>Connection Error</h4>
        <p>Could not load your student record from the database. Please ensure your account is properly linked by your administrator.</p>
      </div>

    </div>
  </StudentLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StudentLayout from '../../../layouts/StudentLayout.vue'
import { supabase } from '../../../composables/useSupabase.js'

const studentData = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authData?.user) {
      console.error("Auth Error: Could not verify session", authError)
      return
    }

    const { user } = authData
    const email = user.email || ''
    const phone = user.phone || ''

    if (!email && !phone) {
        throw new Error("User has no email or phone attached to their auth profile.")
    }

    // Attempt to match the auth user to a record in the students table
    let query = supabase.from('students').select('*')
    
    if (email && phone) {
      query = query.or(`email.eq.${email},phone_number.eq.${phone}`)
    } else if (email) {
      query = query.eq('email', email)
    } else if (phone) {
      query = query.eq('phone_number', phone)
    }

    const { data, error } = await query.maybeSingle()
    
    if (error && error.code !== 'PGRST116') {
      console.error("Database query failed", error)
    }

    if (data) {
      studentData.value = data
    } else {
      console.warn("No matching record found in the students table for email/phone:", email, phone)
    }
  } catch (err) {
    console.error("Failed to load student data:", err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}
h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 0.5rem;
}
p {
  color: var(--text-secondary, #666);
}

.text-center { text-align: center; }
.py-5 { padding-top: 3rem; padding-bottom: 3rem; }
.mt-4 { margin-top: 1.5rem; }
.text-success { color: #28a745; font-weight: 600; }
.text-primary { color: var(--color-primary, #6B59FF); font-weight: 600; }

.dashboard-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 2rem;
}
.card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  flex: 1;
  min-width: 250px;
  border: 1px solid var(--border-color, #eee);
}
.card h3 {
  margin-top: 0;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-primary, #333);
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}
.card p {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.info-list li {
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: #555;
}
.info-list strong {
  color: #333;
}

.alert-danger {
  color: #dc3545;
  background-color: #f8d7da;
  border-color: #f5c6cb;
  padding: 1rem 1.25rem;
  border-radius: 6px;
}
.alert-danger h4 { margin-top: 0; margin-bottom: 0.5rem; }
</style>
