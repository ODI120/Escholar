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
                {{ studentData.school }} &bull; {{ studentData.department }} | {{ studentData.level ? studentData.level + 'L' : 'Graduated' }}
              </p>
            </div>
            <div class="edit-profile">
              <button class="btn btn-primary">
                <i class="bi bi-pencil-square"></i>
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <!-- New content for detail cards adapted for student module -->
        <div class="metrics-grid mb-4">
          <!-- Digital Wallet Card -->
          <div class="card-details wallet-card">
            <div class="card-header-title">
              <div class="card-icon">
                <i class="bi bi-cash-stack"></i>
              </div>
              <h3>Total Received</h3>
            </div>
            <div class="card-body">
              <h2 class="wallet-balance">₦{{ formatCurrency(totalReceived) }}</h2>
            </div>
            <div class="card-footer">
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

        <!-- Main Detail Grid -->
        <div class="detail-main-grid">
          <!-- Left Column -->
          <div class="content-col">
            <!-- Personal & Academic Information -->
            <div class="detail-card mb-4">
              <div class="card-head">
                <i class="bi bi-person-lines-fill"></i>
                <h3>Personal &amp; Academic Information</h3>
              </div>
              <div class="card-body">
                <div class="info-grid">
                  <div class="info-group">
                    <label>Full Name</label>
                    <span>{{ studentData.full_name }}</span>
                  </div>
                  <div class="info-group">
                    <label>Email Address</label>
                    <span>{{ studentData.email || '—' }}</span>
                  </div>
                  <div class="info-group">
                    <label>Phone Number</label>
                    <span>{{ studentData.phone_number }}</span>
                  </div>
                  <div class="info-group">
                    <label>Gender</label>
                    <span class="capitalize">{{ studentData.gender }}</span>
                  </div>
                  <div class="info-group">
                    <label>Current level</label>
                    <span>{{ studentData.level ? `${studentData.level} Level` : 'Graduated' }}</span>
                  </div>
                  <div class="info-group">
                    <label>Course Duration</label>
                    <span>{{ studentData.course_duration ? `${studentData.course_duration} Years` : '—' }}</span>
                  </div>
                  <div class="info-group">
                    <label>Admission Year</label>
                    <span>{{ studentData.year_of_admission || '—' }}</span>
                  </div>
                  <div class="info-group full-width">
                    <label>Institution</label>
                    <span>{{ studentData.school }}</span>
                  </div>
                  <div class="info-group full-width">
                    <label>Department / Course</label>
                    <span>{{ studentData.department }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Parent / Guardian -->
            <div class="detail-card mb-4">
              <div class="card-head">
                <i class="bi bi-people-fill"></i>
                <h3>Parent / Guardian Information</h3>
              </div>
              <div class="card-body">
                <div class="info-grid half">
                  <div class="info-group">
                    <label>Guardian Name</label>
                    <span>{{ studentData.parent_name || 'Not provided' }}</span>
                  </div>
                  <div class="info-group">
                    <label>Guardian Phone</label>
                    <span>{{ studentData.parent_phone || 'Not provided' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Remarks & Documents -->
            <div class="detail-card mb-4">
              <div class="card-head">
                <i class="bi bi-file-earmark-text-fill"></i>
                <h3>Remarks &amp; Documents</h3>
              </div>
              <div class="card-body">
                <div class="remarks-box mb-4">
                  <label class="info-lbl-sm">Remarks / Notes</label>
                  <p class="remarks-text">{{ studentData.remarks || 'No additional remarks registered for this beneficiary.' }}</p>
                </div>
                <div class="doc-links">
                  <label class="info-lbl-sm">Uploaded Documents</label>
                  <div class="doc-grid">
                    <a
                      v-if="studentData.admission_letter_url"
                      :href="studentData.admission_letter_url"
                      download
                      class="doc-item"
                    >
                      <div class="doc-icon pdf">
                        <i class="bi bi-file-earmark-pdf"></i>
                      </div>
                      <div class="doc-info">
                        <span class="doc-name">Admission Letter</span>
                        <span class="doc-meta">Download Document <i class="bi bi-download"></i></span>
                      </div>
                    </a>
                    <div v-else class="no-docs">
                      <i class="bi bi-info-circle"></i>
                      <span>No admission letter uploaded yet.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment History (read-only) -->
            <div class="detail-card mb-4">
              <div class="card-head between">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-credit-card-fill"></i>
                  <h3>Payment History</h3>
                </div>
              </div>
              <div class="card-body p-0">
                <div v-if="studentData.payments && studentData.payments.length > 0" class="table-responsive">
                  <table class="modern-table">
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
                        <td data-label="Date">{{ formatDate(payment.date) }}</td>
                        <td data-label="Description" class="text-truncate" style="max-width: 200px;">{{ payment.description }}</td>
                        <td data-label="Amount" class="fw-bold">₦{{ formatCurrency(payment.amount) }}</td>
                        <td data-label="Status">
                          <span class="status-dot" :class="payment.status"></span>
                          <span class="status-name">{{ payment.status }}</span>
                        </td>
                        <td data-label="Receipt" class="text-end">
                          <a
                            v-if="payment.evidence_url"
                            :href="payment.evidence_url"
                            target="_blank"
                            class="action-icon-btn primary"
                            title="View Receipt"
                          >
                            <i class="bi bi-file-earmark-text"></i>
                          </a>
                          <span v-else class="text-muted" style="font-size: 0.8rem;">—</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="empty-payments py-5">
                  <i class="bi bi-cash-stack"></i>
                  <p>No payment history recorded yet.</p>
                </div>
              </div>
            </div>

            <!-- Academic Performance -->
            <div class="detail-card mb-4">
              <div class="card-head between">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-mortarboard-fill"></i>
                  <h3>Academic Performance</h3>
                </div>
              </div>
              <div class="card-body">
                <div v-if="academicProgressStats.total > 0" class="academic-progress-container">
                  <div class="progress-header">
                    <div class="progress-info">
                      <span class="progress-label">Academic Progress</span>
                      <span class="progress-count">{{ academicProgressStats.recorded }} of {{ academicProgressStats.total }} semesters</span>
                    </div>
                    <div class="progress-percentage">{{ academicProgressStats.percentage }}%</div>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar-fill" :style="{ width: academicProgressStats.percentage + '%' }"></div>
                  </div>
                </div>
                <div v-if="academicProgress && academicProgress.length > 0" class="chart-wrapper">
                  <canvas ref="academicChart" id="academic-performance-chart"></canvas>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Sidebar -->
          <div class="sidebar-col">
            <!-- Financial Overview -->
            <div class="detail-card financial-card mb-4">
              <div class="card-head">
                <i class="bi bi-wallet2"></i>
                <h3>Financial Overview</h3>
              </div>
              <div class="fin-card-body">
                <div class="financial-stat">
                  <label>Total Amount Received</label>
                  <div class="stat-amount primary">₦{{ formatCurrency(totalReceived) }}</div>
                </div>
                <div class="financial-sep"></div>
                <div class="financial-stat">
                  <label>School Fees</label>
                  <div class="stat-amount blue">₦{{ formatCurrency(studentData.school_fees) }}</div>
                </div>
                <div class="bank-info">
                  <label class="info-lbl-sm">Payment Details</label>
                  <div class="bank-item">
                    <i class="bi bi-bank"></i>
                    <div class="bank-det">
                      <span class="bank-name">{{ studentData.bank_name || 'N/A' }}</span>
                      <span class="bank-acc-name">{{ studentData.account_name || 'No Account Name' }}</span>
                      <span class="bank-acc">{{ studentData.account_number || 'No Account Number' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Academic Records List -->
            <div v-if="academicProgress && academicProgress.some(r => r.status === 'Recorded')" class="detail-card mb-4">
              <div class="card-head">
                <i class="bi bi-award"></i>
                <h3>Academic Records</h3>
              </div>
              <div class="card-body">
                <div class="records-stack">
                  <div v-for="record in academicProgress.filter(r => r.status === 'Recorded')" :key="record.record_id" class="record-item">
                    <div class="record-info">
                      <span class="sem-label">{{ record.expected_semester_label || `${record.semester}-${Math.ceil(record.semester_number/2)}` }}</span>
                      <span class="record-gpa-val">GPA: <strong>{{ record.gpa }}</strong></span>
                    </div>
                    <div class="record-actions">
                      <a
                        v-if="record.evidence_url"
                        :href="record.evidence_url"
                        target="_blank"
                        class="record-action-btn view"
                        title="View Evidence"
                      >
                        <i class="bi bi-file-earmark-check"></i>
                        <span>View</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-records py-4 px-3 text-center mb-4">
              <i class="bi bi-award text-muted mb-2 d-block" style="font-size: 1.5rem;"></i>
              <p class="small text-muted mb-0">No academic records found yet.</p>
            </div>

            <!-- Audit Log -->
            <div class="detail-card">
              <div class="card-body mini-audit">
                <p>Created on {{ formatDate(studentData.created_at) }}</p>
                <p v-if="studentData.updated_at">Last updated {{ formatDate(studentData.updated_at) }}</p>
              </div>
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
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import StudentLayout from '../../../layouts/StudentLayout.vue'
import { useSupabaseStudents } from '../../../composables/useSupabase.js'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const router = useRouter()
const { getStudent, getAcademicProgress } = useSupabaseStudents()

const studentData = ref(null)
const academicProgress = ref([])
const loading = ref(true)
const academicChart = ref(null)
const chartInstance = ref(null)

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

const renderAcademicChart = async () => {
  await nextTick()
  if (!academicChart.value) return
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  const ctx = academicChart.value.getContext('2d')
  const isDark = document.documentElement.classList.contains('dark-mode') ||
                 document.body.classList.contains('dark-mode')
  const textColor = isDark ? '#9CA3AF' : '#4B5563'
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const tooltipBg = isDark ? 'rgba(17,24,39,0.95)' : 'rgba(15,15,30,0.88)'

  const labels = academicProgress.value.map(r => {
    const semNum = r.semester_number
    const semPos = semNum % 2 === 0 ? 2 : 1
    const yearNum = Math.ceil(semNum / 2)
    const levelStr = `${yearNum * 100}L`
    const ordinal = semPos === 1 ? '1st' : '2nd'
    return `${ordinal}-${levelStr}`
  })
  const gpas = academicProgress.value.map(r => r.gpa ?? null)

  const primaryHex = isDark ? '#8475f850' : '#6B59FF50'
  const backgroundColors = gpas.map(gpa => {
    if (gpa === null) return isDark ? 'rgba(156,163,175,0.30)' : 'rgba(156,163,175,0.20)'
    if (gpa >= 4.5) return 'rgba(3,138,82,0.22)'
    if (gpa >= 4.0) return 'rgba(0,194,255,0.18)'
    if (gpa >= 3.5) return 'rgba(255,153,0,0.20)'
    const r = parseInt(primaryHex.slice(1,3),16)
    const g = parseInt(primaryHex.slice(3,5),16)
    const b = parseInt(primaryHex.slice(5,7),16)
    return `rgba(${r},${g},${b},0.22)`
  })
  const borderColors = gpas.map(gpa => {
    if (gpa === null) return isDark ? 'rgba(156,163,175,0.4)' : 'rgba(156,163,175,0.5)'
    if (gpa >= 4.5) return '#038a5226'
    if (gpa >= 4.0) return '#00c2ff26'
    if (gpa >= 3.5) return '#ff990026'
    return primaryHex
  })

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'GPA per Semester',
        data: gpas,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 'flex',
        maxBarThickness: 56
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { size: 12, weight: '600', family: 'inherit' },
            color: textColor,
            padding: 16,
            usePointStyle: true,
            pointStyle: 'rectRounded'
          }
        },
        tooltip: {
          backgroundColor: tooltipBg,
          padding: 12,
          titleFont: { size: 13, weight: '700' },
          bodyFont: { size: 12 },
          cornerRadius: 10,
          displayColors: true,
          callbacks: {
            title: (items) => items[0].label,
            label: (ctx) => {
              if (ctx.parsed.y === null) return '  Not yet recorded'
              return `  GPA: ${ctx.parsed.y.toFixed(2)}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5.0,
          title: {
            display: true,
            text: 'GPA',
            color: textColor,
            font: { size: 11, weight: '600' }
          },
          ticks: { font: { size: 10 }, color: textColor, stepSize: 0.5 },
          grid: { color: gridColor, drawBorder: false }
        },
        x: {
          ticks: { font: { size: 10 }, color: textColor, maxRotation: 45, minRotation: 0, autoSkip: false },
          grid: { display: false }
        }
      }
    }
  })
}

watch(academicProgress, () => {
  renderAcademicChart()
}, { deep: true })

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
  gap: 1rem;
  margin-top: -45px;
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
  padding-bottom:.5rem 0;
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
.edit-profile button{
  color: var(--color-primary);
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s ease);
}
.edit-profile button:hover {
  background-color: var(--color-primary);
  color: #fff;
  border: 1px solid var(--border-primary);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast, 0.2s ease);
}
.edit-profile button i{
  margin-right: 0.5rem;
  
}
.edit-profile button:hover i{
  color: #fff;
}


/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}

.metric-card {
  background-color: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg, 12px);
  padding: 1rem;
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

/* ------ Detail Cards (from StudentDetail) ------ */
.detail-main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1rem;
}

.content-col, .sidebar-col {
  display: flex;
  flex-direction: column;
}

.detail-card {
  background: var(--surface);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--border-primary);
  overflow: hidden;
}

.detail-card .card-head {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border-bottom: 1px solid var(--border-primary);
  background: color-mix(in srgb, var(--color-primary) 2%, var(--surface));
}

.detail-card .card-head.between {
  justify-content: space-between;
}

.detail-card .card-head i {
  font-size: 1.1rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  flex-shrink: 0;
}

.detail-card .card-head h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

/* card-body scoped to detail-card to avoid wallet conflict */
.detail-card .card-body {
  padding: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .2rem;
  padding: .2rem;
  border-radius: 10px;
}

.info-grid.half {
  grid-template-columns: repeat(2, 1fr);
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  transition: background 0.2s ease;
  background: var(--bg-primary);
}

.info-group label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.info-group span {
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 600;
}

.capitalize { text-transform: capitalize; }

.remarks-box {
  background: var(--bg-primary);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.info-lbl-sm {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
  display: block;
}

.remarks-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
}

.doc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  text-decoration: none;
  transition: all 0.25s;
  box-shadow: var(--shadow-xs);
}

.doc-item:hover {
  border-color: color-mix(in srgb, var(--color-primary) 40%, transparent);
  background: color-mix(in srgb, var(--color-primary) 3%, var(--surface));
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.doc-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.doc-icon.pdf { background: #fee2e2; color: #ef4444; }

.doc-info { display: flex; flex-direction: column; }

.doc-name { font-weight: 600; color: var(--text-primary); font-size: 0.95rem; }

.doc-meta { font-size: 0.8rem; color: var(--color-primary); font-weight: 500; margin-top: 0.15rem; }

.no-docs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  color: var(--text-muted);
  background: var(--bg-primary);
  border-radius: 12px;
  font-size: 0.9rem;
}

/* Modern Table */
.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: var(--bg-primary);
  text-align: left;
  padding: 1rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-primary);
}

.modern-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-primary);
  font-size: 0.95rem;
  color: var(--text-primary);
  vertical-align: middle;
}

.modern-table tr:last-child td { border-bottom: none; }

.modern-table tbody tr { transition: background 0.15s ease; }

.modern-table tbody tr:hover {
  background: color-mix(in srgb, var(--color-primary) 3%, var(--surface));
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.status-dot.paid { background: #10b981; }
.status-dot.pending { background: #f59e0b; }
.status-dot.failed { background: #ef4444; }

.status-name { font-size: 0.85rem; text-transform: capitalize; font-weight: 500; }

.action-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-icon-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }

.action-icon-btn.primary { color: var(--color-primary); background: rgba(107, 89, 255, 0.1); }
.action-icon-btn.primary:hover { background: var(--color-primary); color: white; }

.empty-payments {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-payments i {
  font-size: 2.5rem;
  opacity: 0.4;
  display: block;
  margin-bottom: 0.75rem;
}

/* Academic Progress */
.academic-progress-container { margin-bottom: 1rem; }

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-info { display: flex; flex-direction: column; }

.progress-label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }

.progress-count { font-size: 0.8rem; color: var(--text-muted); }

.progress-percentage { font-size: 1.1rem; font-weight: 700; color: var(--color-primary); }

.chart-wrapper { height: 260px; margin-top: 1rem; }

/* Financial Card */
.financial-card {
  background: linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--color-primary) 2%, transparent) 100%);
}

.fin-card-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.financial-stat { display: flex; flex-direction: column; gap: 0.5rem; }

.financial-stat label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }

.stat-amount { font-size: 1.75rem; font-weight: 800; }

.stat-amount.primary { color: var(--color-primary); }
.stat-amount.blue { color: #3b82f6; }

.financial-sep { height: 1px; background: var(--border-primary); }

.bank-info {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.bank-item { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; }

.bank-item i {
  font-size: 1.25rem;
  color: var(--text-muted);
  background: var(--surface);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.bank-det { display: flex; flex-direction: column; }

.bank-name { font-weight: 700; color: var(--text-primary); font-size: 0.95rem; }

.bank-acc-name { font-size: 0.85rem; color: var(--text-secondary); }

.bank-acc { font-size: 0.85rem; color: var(--text-muted); font-family: monospace; font-weight: 600; }

/* Academic Records */
.records-stack { display: flex; flex-direction: column; gap: 0.5rem; }

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  transition: all 0.2s ease;
}

.record-item:hover {
  border-color: var(--color-primary);
  transform: translateX(4px);
  background: var(--surface);
}

.record-info { display: flex; flex-direction: column; }

.sem-label { font-weight: 600; color: var(--text-primary); font-size: 0.95rem; }

.record-gpa-val { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.1rem; }

.record-actions { display: flex; align-items: center; gap: 0.5rem; }

.record-action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  text-decoration: none;
}

.record-action-btn.view { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.record-action-btn.view:hover { background: #10b981; color: white; }

.empty-records {
  background: var(--bg-primary);
  border-radius: 12px;
  border: 2px dashed var(--border-primary);
}

/* Mini Audit */
.mini-audit { font-size: 0.8rem; color: var(--text-muted); }
.mini-audit p { margin: 0.2rem 0; }

/* card-details (wallet card) */
.card-details {
  background-color: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: 1rem;
  overflow: hidden;
}

.card-header-title {
  padding: 1rem;
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-primary);
}

.card-header-title .card-icon {
  padding: .3rem .5rem;
  border-radius: 10px;
  font-size: 1.2rem;
  background-color: #4834d425;
}

.card-header-title .card-icon i {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-primary);
}

.card-body { padding: 1rem; }

.card-footer {
  padding: 1rem;
  border-top: 1px dashed var(--border-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  color: var(--text-primary);
}

.wallet-card .card-header-title { border-bottom: none; }
.wallet-card .card-icon { background-color: #fff; color: var(--color-primary); }

/* Responsive */
@media (max-width: 992px) {
  .detail-main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -50px;
  }

  .premium-badge {
    background-color: #4834d412;
    color: #4834d4;
    border: 1px solid #4834d412;
  }

  .edit-profile { display: none; }

  .hero-info {
    padding-bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .info-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (max-width: 640px) {
  .modern-table thead { display: none; }

  .modern-table tbody tr {
    display: block;
    margin: 0.75rem 0;
    padding: 1rem;
    background: var(--surface);
    border: 1px solid var(--border-primary);
    border-radius: 12px;
    margin-bottom: 1rem;
    box-shadow: var(--shadow-sm);
  }

  .modern-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-primary);
    text-align: right;
  }

  .modern-table td:last-child {
    border-bottom: none;
    padding-bottom: 0.25rem;
  }

  .modern-table td::before {
    content: attr(data-label);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.7rem;
    color: var(--text-muted);
  }
}
</style>

