<template>
  <StudentLayout>
    <div class="dashboard-wrapper">
      
      <div v-if="loading" class="text-center py-5">
        <p>Loading your portal...</p>
      </div>

      <div v-else-if="studentData" class="dashboard-grid">
        
        <!-- Left Sidebar -->
        <div class="grid-left">
          <div class="dashboard-card profile-card">
            <div class="profile-header">
              <div class="avatar-placeholder">
                <img :src="`https://ui-avatars.com/api/?name=${studentData.full_name || 'Student'}&background=random&size=120`" alt="Avatar" class="avatar-img" />
              </div>
              <h2 class="student-name">{{ studentData.full_name }}</h2>
            </div>
            
            <div class="profile-details">
              <div class="detail-row" v-if="studentData.matric_no">
                <span class="detail-label">Application No:</span>
                <span class="detail-value">{{ studentData.matric_no }}</span>
              </div>
              <div class="detail-row" v-if="studentData.school">
                <span class="detail-label">School:</span>
                <span class="detail-value">{{ studentData.school }}</span>
              </div>
              <div class="detail-row" v-if="studentData.department">
                <span class="detail-label">Program:</span>
                <span class="detail-value">{{ studentData.department }}</span>
              </div>
              <div class="detail-row" v-if="studentData.email">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ studentData.email }}</span>
              </div>
              <div class="detail-row" v-if="studentData.level">
                <span class="detail-label">Academic Level:</span>
                <span class="detail-value">{{ studentData.level }}L</span>
              </div>
              <div class="detail-row" v-if="studentData.year_of_admission">
                <span class="detail-label">Admission Year:</span>
                <span class="detail-value">{{ studentData.year_of_admission }}</span>
              </div>
            </div>
          </div>
          
          <div class="dashboard-card status-card">
            <h3 class="card-title">Registration Status</h3>
            <p v-if="studentData.status === 'graduated'" class="status-badge success">Graduated</p>
            <p v-else class="status-badge active">{{ studentData.status || 'Active' }}</p>

            <div class="mt-4" v-if="studentData.years_remaining !== undefined">
               <span class="detail-label d-block mb-1">Years Remaining:</span>
               <span class="detail-value font-weight-bold">{{ studentData.years_remaining }}</span>
            </div>
          </div>
        </div>
        
        <!-- Center Main Area -->
        <div class="grid-center">
          <div class="dashboard-card main-area-card">
            <h3 class="section-title">Welcome to your Portal</h3>
            <p class="text-muted">More features, coursework, and dynamic services will be made available here soon from our database.</p>
          </div>
        </div>
        
      </div>

      <div v-else class="alert alert-danger mt-4">
        <h4>Connection Error</h4>
        <p>Could not load your student record from the database. Please try logging in again.</p>
      </div>

    </div>
  </StudentLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StudentLayout from '../../../layouts/StudentLayout.vue'

const router = useRouter()
const studentData = ref(null)
const loading = ref(true)

const submitRrr = () => {
  // Logic for submitting RRR code
  alert("Submit RRR code functionality to be implemented.");
}

onMounted(() => {
  try {
    // We fetch the securely authenticated student's data directly from localStorage
    const savedData = localStorage.getItem('student_session')
    
    if (savedData) {
      studentData.value = JSON.parse(savedData)
    } else {
      router.push('/student/login')
    }
  } catch (err) {
    console.error("Failed to load student data:", err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>

.dashboard-wrapper {
  color: var(--text-primary);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* Base Card Styles */
.dashboard-card {
  background-color: var(--card-bg, #ffffff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-sm, 0 4px 15px rgba(0, 0, 0, 0.03));
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--card-border, #f8fafc);
  transition: all var(--transition-normal, 0.3s ease);
}

/* Left Grid - Profile */
.profile-card {
  display: flex;
  flex-direction: column;
}
.profile-header {
  text-align: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-primary, #f1f5f9);
  margin-bottom: 1.5rem;
}
.avatar-placeholder {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.student-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}
.detail-label {
  color: var(--text-secondary);
  font-weight: 500;
}
.detail-value {
  color: var(--text-primary);
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}
.gpa-row {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--border-primary);
}
.gpa-value {
  color: var(--color-primary-soft, #10b981);
  font-size: 1.1rem;
  font-weight: 700;
}

.card-title {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-top: 0;
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.status-card {
  background-color: color-mix(in srgb, var(--color-primary-soft, #10b981) 10%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--color-primary-soft, #10b981) 30%, var(--border-primary));
}
.status-badge {
  display: inline-block;
  padding: 0;
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}
.status-badge.active, .status-badge.success {
  color: var(--color-primary-soft, #10b981);
}

/* Center Grid - Main Content */
.main-area-card {
  padding: 2.5rem 2rem;
  text-align: center;
}
.section-title {
  font-size: 1.35rem;
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 1rem;
  font-weight: 600;
}

.text-muted {
  color: var(--text-secondary);
  font-size: 1.05rem;
}
.font-weight-bold {
  font-weight: bold;
}
.d-block {
  display: block;
}
.mb-1 { margin-bottom: 0.25rem; }
.mt-4 { margin-top: 1.5rem; }
.text-center { text-align: center; }
.py-5 { padding-top: 3rem; padding-bottom: 3rem; }

/* Alert */
.alert-danger {
  color: #dc3545;
  background-color: color-mix(in srgb, #dc3545 15%, var(--surface));
  border-color: color-mix(in srgb, #dc3545 30%, var(--border-primary));
  padding: 1rem 1.25rem;
  border-radius: 6px;
  border: 1px solid;
}
.alert-danger h4 { margin-top: 0; margin-bottom: 0.5rem; }

/* Responsive adjustments */
@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
