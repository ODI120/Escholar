<template>
  <StudentLayout>
    <div class="dashboard-wrapper">
      <div v-if="loading" class="loading-state py-5 text-center">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-3 text-muted">Loading your secure portal...</p>
      </div>

      <div v-else-if="studentData" class="dashboard-content">
        <!-- Hero Section -->
        <div class="hero-section mb-4">
          <div class="hero-bg" :style="studentData.profile_picture ? `background-image: url(${studentData.profile_picture})` : ''"></div>
          <div class="hero-content">
            <div class="avatar-wrapper">
              <img :src="studentData.profile_picture || `https://ui-avatars.com/api/?name=${studentData.full_name}&background=random`" alt="Avatar" class="avatar-img" />
            </div>
            <div class="hero-info">
              <div class="badge-row">
                <span class="premium-badge">
                  <i class="bi bi-star-fill text-warning"></i> Active Beneficiary
                </span>
              </div>
              <h1 class="beneficiary-name">{{ studentData.full_name }}</h1>
              <p class="academic-subtitle">
                <i class="bi bi-mortarboard-fill"></i>
                {{ studentData.school }} &bull; {{ studentData.department }} ({{ studentData.level ? studentData.level + 'L' : 'Graduated' }})
              </p>
            </div>
          </div>
        </div>

        <div class="metrics-grid mb-4">
          <!-- Digital Wallet Card -->
          <div class="metric-card wallet-card">
            <div class="card-head between">
              <span class="card-label">Total Disbursed</span>
              <div class="icon-box-sm glass">
                <i class="bi bi-wallet2"></i>
              </div>
            </div>
            <h2 class="wallet-balance">₦{{ formatCurrency(totalReceived) }}</h2>
            <div class="wallet-footer">
              <div class="fee-info">
                <span class="text-sm opacity-75" style="font-size: 0.8rem;">Current School Fees</span>
                <span class="text-md fw-bold" style="font-size: 1.1rem;">₦{{ formatCurrency(studentData.school_fees) }}</span>
              </div>
              <div class="bank-pill" v-if="studentData.bank_name">
                <i class="bi bi-bank2"></i> {{ studentData.bank_name }}
              </div>
            </div>
          </div>

          <!-- Academic Progress Card -->
          <div class="metric-card academic-card">
            <div class="card-head between">
              <span class="card-label">Academic Progress</span>
              <div class="icon-box-sm bg-glass">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
            </div>
            <div class="progress-stats mt-3">
              <div class="stat-big">{{ academicProgressStats.percentage }}%</div>
              <div class="stat-desc">{{ academicProgressStats.recorded }} of {{ academicProgressStats.total }} Semesters Configured</div>
            </div>
            <div class="progress-bar-container mt-3">
               <div class="progress-bar-fill" :style="{ width: academicProgressStats.percentage + '%' }"></div>
            </div>
          </div>

          <!-- Quick Info Card -->
          <div class="metric-card info-card">
            <div class="card-head between">
              <span class="card-label">Student Profile</span>
              <div class="icon-box-sm bg-glass">
                <i class="bi bi-person-badge"></i>
              </div>
            </div>
            <div class="info-list mt-3">
               <div class="info-item">
                 <span class="info-lbl">Admission</span>
                 <span class="info-val">{{ studentData.year_of_admission || 'N/A' }}</span>
               </div>
               <div class="info-item">
                 <span class="info-lbl">Duration</span>
                 <span class="info-val">{{ studentData.course_duration ? studentData.course_duration + ' Years' : 'N/A' }}</span>
               </div>
               <div class="info-item">
                 <span class="info-lbl">Remaining</span>
                 <span class="info-val">{{ studentData.years_remaining !== undefined ? studentData.years_remaining + ' Years' : 'N/A' }}</span>
               </div>
            </div>
          </div>
        </div>

        <div class="data-grid">
          <!-- Payment History -->
          <div class="data-card">
            <div class="card-head border-bottom pb-3 mb-3">
              <h3 style="display: flex; align-items: center; font-size: 1.2rem; margin: 0;"><i class="bi bi-credit-card-fill text-primary me-2"></i> Payment History</h3>
            </div>
            <div class="table-responsive" v-if="studentData.payments && studentData.payments.length > 0">
              <table class="modern-table w-100">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th class="text-end">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in studentData.payments" :key="payment.id">
                    <td>{{ formatDate(payment.date) }}</td>
                    <td>{{ payment.description }}</td>
                    <td class="fw-bold">₦{{ formatCurrency(payment.amount) }}</td>
                    <td>
                      <span class="status-pill" :class="payment.status.toLowerCase()">{{ payment.status }}</span>
                    </td>
                    <td class="text-end">
                      <a v-if="payment.evidence_url" :href="payment.evidence_url" target="_blank" class="receipt-btn">
                        <i class="bi bi-download"></i>
                      </a>
                      <span v-else class="text-muted">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              <i class="bi bi-cash-stack mb-2 d-block"></i>
              <p>No payment history recorded yet.</p>
            </div>
          </div>

          <!-- Academic History -->
          <div class="data-card">
            <div class="card-head border-bottom pb-3 mb-3">
              <h3 style="display: flex; align-items: center; font-size: 1.2rem; margin: 0;"><i class="bi bi-award-fill text-success me-2"></i> Academic Records</h3>
            </div>
            <div class="records-list" v-if="academicProgress && academicProgress.filter(r => r.status === 'Recorded').length > 0">
               <div v-for="record in academicProgress.filter(r => r.status === 'Recorded')" :key="record.record_id" class="record-item">
                 <div class="record-info">
                   <div class="record-sem">{{ record.expected_semester_label || `Semester ${record.semester_number}` }}</div>
                   <div class="record-gpa">GPA: <strong>{{ record.gpa }}</strong></div>
                 </div>
                 <a v-if="record.evidence_url" :href="record.evidence_url" target="_blank" class="receipt-btn">
                    <i class="bi bi-file-earmark-check border-0"></i>
                 </a>
               </div>
            </div>
            <div v-else class="empty-state">
              <i class="bi bi-journal-x mb-2 d-block"></i>
              <p>No GPAs recorded yet.</p>
            </div>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import StudentLayout from '../../../layouts/StudentLayout.vue'
import { useSupabaseStudents } from '../../../composables/useSupabase.js'

const router = useRouter()
const { getStudent, getAcademicProgress } = useSupabaseStudents()

const studentData = ref(null)
const academicProgress = ref([])
const loading = ref(true)

const totalReceived = computed(() => {
  if (!studentData.value || !studentData.value.payments) return 0
  return studentData.value.payments
    .filter(p => typeof p.status === 'string' && p.status.toLowerCase() === 'paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
})

const academicProgressStats = computed(() => {
  if (!studentData.value) return { total: 0, recorded: 0, percentage: 0 }
  const total = (studentData.value.course_duration || 4) * 2
  const recorded = academicProgress.value.filter(r => r.status === 'Recorded').length
  const percentage = total > 0 ? Math.round((recorded / total) * 100) : 0
  return { total, recorded, percentage }
})

const formatCurrency = (amount) => {
  if (!amount) return '0.00'
  return Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

onMounted(async () => {
  try {
    const savedData = localStorage.getItem('student_session')
    
    if (savedData) {
      const parsed = JSON.parse(savedData)
      studentData.value = parsed // Show cached instantly
      
      // Fetch rich data from Supabase using the student's ID for payments & academics
      const [studentRes, progressRes] = await Promise.all([
        getStudent(parsed.id),
        getAcademicProgress(parsed.id)
      ])
      
      if (studentRes.data) {
        studentData.value = studentRes.data
        // optionally update cache so next load is rich
        localStorage.setItem('student_session', JSON.stringify(studentRes.data))
      }
      
      if (progressRes.data) {
        academicProgress.value = progressRes.data
      }
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
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 3rem;
}

/* Hero Section */
.hero-section {
  position: relative;
  border-radius: var(--radius-xl, 16px);
  overflow: hidden;
  background-color: var(--surface);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.05));
  margin-top: 1rem;
}

.hero-bg {
  height: 140px;
  background-size: cover;
  background-position: center;
  position: relative;
  background-color: var(--border-primary);
}

.hero-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  filter: blur(8px) brightness(0.6);
  transform: scale(1.1);
}
.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%);
}

.hero-content {
  position: relative;
  padding: 0 2rem 2rem;
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  margin-top: -60px;
}

.avatar-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--surface);
  background-color: var(--surface);
  box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.05));
  overflow: hidden;
  flex-shrink: 0;
  z-index: 2;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-info {
  flex-grow: 1;
  padding-bottom: 0.5rem;
  z-index: 2;
}

.badge-row {
  margin-bottom: 0.5rem;
}

.premium-badge {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.beneficiary-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.3rem 0;
  color: var(--text-primary);
}

.academic-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background-color: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg, 12px);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.02));
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md, 0 4px 15px rgba(0, 0, 0, 0.05));
}

.wallet-card {
  background: linear-gradient(135deg, var(--color-primary), #4834d4);
  color: white;
  border: none;
}

.wallet-card .card-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.wallet-card .icon-box-sm.glass {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.wallet-balance {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 1rem 0;
  letter-spacing: -1px;
}

.wallet-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1rem;
}

.fee-info {
  display: flex;
  flex-direction: column;
}

.bank-pill {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-label {
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.bg-glass {
  background: var(--bg-primary);
  color: var(--color-primary);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.progress-stats {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.stat-big {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.progress-bar-container {
  height: 8px;
  background-color: var(--border-primary);
  border-radius: 4px;
  overflow: hidden;
  margin-top: auto;
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: auto;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--border-primary);
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-lbl {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.info-val {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.95rem;
}

/* Data Grid */
.data-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.data-card {
  background-color: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg, 12px);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.02));
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.modern-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.modern-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  border-bottom: 2px solid var(--border-primary);
}

.modern-table td {
  padding: 1rem;
  color: var(--text-primary);
  font-size: 0.95rem;
  border-bottom: 1px solid var(--border-primary);
  vertical-align: middle;
}

.modern-table tr:last-child td {
  border-bottom: none;
}

.status-pill {
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pill.paid {
  background-color: color-mix(in srgb, #10b981 15%, transparent);
  color: #10b981;
}
.status-pill.pending {
  background-color: color-mix(in srgb, #f59e0b 15%, transparent);
  color: #f59e0b;
}

.receipt-btn {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  transition: all 0.2s;
  display: inline-flex;
}

.receipt-btn:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  margin-bottom: 0.8rem;
}

.record-item:last-child {
  margin-bottom: 0;
}

.record-sem {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 0.2rem;
}

.record-gpa {
  font-size: 1.1rem;
  color: var(--text-primary);
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}
.empty-state i {
  font-size: 3rem;
  opacity: 0.4;
}

/* Responsive */
@media (max-width: 992px) {
  .data-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -80px;
  }
  
  .premium-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
  
  .modern-table th, .modern-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }
  
  .hero-info {
    padding-bottom: 0;
  }
}
</style>
