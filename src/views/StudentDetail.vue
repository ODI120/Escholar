<template>
  <AdminLayout>
    <!-- Header with Breadcrumbs & Actions -->
    <div class="page-header mb-4">
      <div class="header-left">
        <button class="back-btn" @click="$router.go(-1)">
          <i class="bi bi-arrow-left"></i>
          <span>Back to List</span>
        </button>
        <div class="breadcrumb-nav">
          <router-link to="/dashboard">Dashboard</router-link>
          <i class="bi bi-chevron-right"></i>
          <router-link to="/students">Beneficiaries</router-link>
          <i class="bi bi-chevron-right"></i>
          <span v-if="student">{{ student.full_name }}</span>
        </div>
      </div>
      <div class="header-right">
        <button class="action-btn edit-btn" @click="editStudent">
          <i class="bi bi-pencil"></i>
          <span>Edit Profile</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="detail-loading">
      <div class="loader-spinner"></div>
      <p>Loading beneficiary profile...</p>
    </div>

    <!-- Main Content -->
    <div v-else-if="student" class="detail-container">
      
      <!-- Top Profile Hero Section -->
      <div class="profile-hero-card mb-4">
        <div class="hero-blur-bg" :style="student.profile_picture ? `background-image: url(${student.profile_picture})` : ''"></div>
        <div class="hero-content">
          <div class="profile-avatar-wrapper">
            <img
              v-if="student.profile_picture"
              :src="student.profile_picture"
              :alt="student.full_name"
              class="profile-avatar-img"
            >
            <div v-else class="profile-avatar-placeholder">
              {{ student.full_name.charAt(0).toUpperCase() }}
            </div>
            <div class="status-indicator" :class="student.status"></div>
          </div>
          <div class="profile-main-info">
            <div class="name-badge-row">
              <h1 class="student-name">{{ student.full_name }}</h1>
              <span class="status-badge" :class="student.status">{{ student.status }}</span>
            </div>
            <p class="student-subtitle">
              <i class="bi bi-mortarboard-fill"></i>
              {{ student.school }} • {{ student.department }}
            </p>
            <div class="quick-stats">
              <div class="quick-stat-item">
                <span class="stat-lbl">Level</span>
                <span class="stat-val">{{ student.level }}L</span>
              </div>
              <div class="quick-stat-item">
                <span class="stat-lbl">Admission</span>
                <span class="stat-val">{{ student.year_of_admission || 'N/A' }}</span>
              </div>
              <div class="quick-stat-item">
                <span class="stat-lbl">Total Received</span>
                <span class="stat-val primary-color">₦{{ formatCurrency(totalReceived) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-main-grid">
        <!-- Left Column: Information Cards -->
        <div class="content-col">
          <!-- Primary Info -->
          <div class="detail-card mb-4">
            <div class="card-head">
              <i class="bi bi-person-lines-fill"></i>
              <h3>Personal & Academic Information</h3>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-group">
                  <label>Full Name</label>
                  <span>{{ student.full_name }}</span>
                </div>
                <div class="info-group">
                  <label>Email Address</label>
                  <span>{{ student.email || '—' }}</span>
                </div>
                <div class="info-group">
                  <label>Phone Number</label>
                  <span>{{ student.phone_number }}</span>
                </div>
                <div class="info-group">
                  <label>Gender</label>
                  <span class="capitalize">{{ student.gender }}</span>
                </div>
                <div class="info-group">
                  <label>Current level</label>
                  <span>{{ student.level }} Level</span>
                </div>
                <div class="info-group">
                  <label>Admission Year</label>
                  <span>{{ student.year_of_admission || '—' }}</span>
                </div>
                <div class="info-group full-width">
                  <label>Institution</label>
                  <span>{{ student.school }}</span>
                </div>
                <div class="info-group full-width">
                  <label>Department / Course</label>
                  <span>{{ student.department }}</span>
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
                  <span>{{ student.parent_name || 'Not provided' }}</span>
                </div>
                <div class="info-group">
                  <label>Guardian Phone</label>
                  <span>{{ student.parent_phone || 'Not provided' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Remarks & Documents -->
          <div class="detail-card mb-4">
            <div class="card-head">
              <i class="bi bi-file-earmark-text-fill"></i>
              <h3>Remarks & Documents</h3>
            </div>
            <div class="card-body">
              <div class="remarks-box mb-4">
                <label class="info-lbl-sm">Remarks / Notes</label>
                <p class="remarks-text">{{ student.remarks || 'No additional remarks registered for this beneficiary.' }}</p>
              </div>
              <div class="doc-links">
                <label class="info-lbl-sm">Uploaded Documents</label>
                <div class="doc-grid">
                  <a v-if="student.admission_letter_url" :href="student.admission_letter_url" target="_blank" class="doc-item">
                    <div class="doc-icon pdf">
                      <i class="bi bi-file-earmark-pdf"></i>
                    </div>
                    <div class="doc-info">
                      <span class="doc-name">Admission Letter</span>
                      <span class="doc-meta">View Document <i class="bi bi-box-arrow-up-right"></i></span>
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

          <!-- Payment History -->
          <div class="detail-card">
            <div class="card-head between">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-credit-card-fill"></i>
                <h3>Payment History</h3>
              </div>
              <button class="add-btn-sm" @click="addPayment">
                <i class="bi bi-plus-lg"></i> Record Payment
              </button>
            </div>
            <div class="card-body p-0">
              <div v-if="student.payments && student.payments.length > 0" class="table-responsive">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="payment in student.payments" :key="payment.id">
                      <td>{{ formatDate(payment.date) }}</td>
                      <td class="text-truncate" style="max-width: 200px;">{{ payment.description }}</td>
                      <td class="fw-bold">₦{{ formatCurrency(payment.amount) }}</td>
                      <td>
                        <span class="status-dot" :class="payment.status"></span>
                        <span class="status-name">{{ payment.status }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="empty-payments py-5">
                <i class="bi bi-cash-stack"></i>
                <p>No payment history recorded for this student.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Sidebar Actions & Financials -->
        <div class="sidebar-col">
          
          <!-- Quick Financial Snapshot -->
          <div class="detail-card financial-card mb-4">
            <div class="card-head">
              <i class="bi bi-wallet2"></i>
              <h3>Financial Overview</h3>
            </div>
            <div class="card-body">
              <div class="financial-stat">
                <label>Total Benefits Received</label>
                <div class="stat-amount primary">₦{{ formatCurrency(totalReceived) }}</div>
              </div>
              <div class="financial-sep"></div>
              <div class="financial-stat">
                <label>Expected School Fees</label>
                <div class="stat-amount blue">₦{{ formatCurrency(student.school_fees) }}</div>
              </div>
              
              <div class="bank-info mt-4">
                <label class="info-lbl-sm">Payment Details</label>
                <div class="bank-item">
                  <i class="bi bi-bank"></i>
                  <div class="bank-det">
                    <span class="bank-name">{{ student.bank_name || 'N/A' }}</span>
                    <span class="bank-acc">{{ student.account_number || 'No Account Number' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="detail-card mb-4">
            <div class="card-head">
              <i class="bi bi-lightning-charge-fill"></i>
              <h3>Quick Actions</h3>
            </div>
            <div class="card-body">
              <div class="actions-stack">
                <button class="stack-btn communication" @click="callStudent">
                  <i class="bi bi-telephone"></i>
                  <span>Call Beneficiary</span>
                </button>
                <button v-if="student.parent_phone" class="stack-btn communication" @click="callParent">
                  <i class="bi bi-person-badge"></i>
                  <span>Call Guardian</span>
                </button>
                <button class="stack-btn success" @click="markAsPaid">
                  <i class="bi bi-check2-circle"></i>
                  <span>Mark Current Fees Paid</span>
                </button>
                <button class="stack-btn info" @click="exportProfile">
                  <i class="bi bi-download"></i>
                  <span>Download Profile PDF</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Audit Log (Mini) -->
          <div class="detail-card">
             <div class="card-body mini-audit">
                <p>Created on {{ formatDate(student.created_at) }}</p>
                <p v-if="student.updated_at">Last updated {{ formatDate(student.updated_at) }}</p>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 404 State -->
    <div v-else class="not-found-state">
      <i class="bi bi-search"></i>
      <h2>Beneficiary Not Found</h2>
      <p>The student record you are looking for doesn't exist or has been removed.</p>
      <router-link to="/students" class="btn-primary mt-3">Return to List</router-link>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useSupabaseStudents } from '../composables/useSupabase.js'

const route = useRoute()
const router = useRouter()
const { getStudent } = useSupabaseStudents()

const loading = ref(true)
const student = ref(null)

const loadStudent = async () => {
  loading.value = true
  try {
    const { data, error } = await getStudent(route.params.id)
    if (!error && data) {
      student.value = data
    } else {
      console.warn('Student load warning:', error)
    }
  } catch (err) {
    console.error('Error loading student:', err)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount || 0)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const totalReceived = computed(() => {
  if (!student.value || !student.value.payments) return 0
  return student.value.payments.reduce((sum, p) => sum + (p.amount || 0), 0)
})

const editStudent = () => {
  // We can pass the student object to the students page or open a modal
  // For now, let's redirect to students list with a query param if we wanted to auto-open modal, 
  // or handle it here if shared state existed. Let's just log for now.
  router.push({ path: '/students', query: { edit: student.value.id } })
}

const callStudent = () => {
  if (student.value.phone_number) {
    window.location.href = `tel:${student.value.phone_number}`
  }
}

const callParent = () => {
  if (student.value.parent_phone) {
    window.location.href = `tel:${student.value.parent_phone}`
  }
}

const addPayment = () => {
  console.log('Add payment for student:', student.value.id)
}

const markAsPaid = () => {
  console.log('Mark as paid for student:', student.value.id)
}

const exportProfile = () => {
  alert('Profile download (PDF) is coming soon!')
}

onMounted(() => {
  loadStudent()
})
</script>

<style scoped>
/* =========================================
   Detail Page Core Styles
   ========================================= */
.detail-container {
  max-width: 1400px;
  margin: 0 auto;
}

.detail-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-secondary);
}

.loader-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Page Header & Breadcrumbs */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.back-btn:hover {
  color: var(--color-primary);
  transform: translateX(-3px);
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.breadcrumb-nav a {
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-nav a:hover {
  color: var(--color-primary);
}

.breadcrumb-nav i {
  font-size: 0.75rem;
}

.breadcrumb-nav span {
  color: var(--text-primary);
  font-weight: 600;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.7rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.edit-btn:hover {
  background: color-mix(in srgb, var(--color-primary) 80%, black);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px color-mix(in srgb, var(--color-primary) 40%, transparent);
}

/* Profile Hero Card */
.profile-hero-card {
  position: relative;
  background: var(--surface);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  min-height: 280px;
  display: flex;
  align-items: flex-end;
}

.hero-blur-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: blur(40px) brightness(0.9);
  opacity: 0.15;
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  gap: 2.5rem;
  width: 100%;
  background: linear-gradient(to top, var(--surface) 20%, transparent 100%);
}

.profile-avatar-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 40px;
  object-fit: cover;
  border: 6px solid white;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.profile-avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 40px;
  background: linear-gradient(135deg, var(--color-primary), #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  font-weight: 700;
  border: 6px solid white;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 4px solid white;
  z-index: 3;
}

.status-indicator.active { background-color: #10b981; }
.status-indicator.graduated { background-color: #3b82f6; }
.status-indicator.inactive { background-color: #f59e0b; }
.status-indicator.suspended { background-color: #ef4444; }

.profile-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name-badge-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.student-name {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.status-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.active { background: #d1fae5; color: #065f46; }
.status-badge.graduated { background: #dbeafe; color: #1e40af; }
.status-badge.inactive { background: #fef3c7; color: #92400e; }
.status-badge.suspended { background: #fee2e2; color: #991b1b; }

.student-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0.5rem 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.quick-stat-item {
  display: flex;
  flex-direction: column;
}

.stat-lbl {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.stat-val {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.primary-color { color: var(--color-primary); }

/* Main Grid Layout */
.detail-main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
}

/* Column Wrappers */
.content-col, .sidebar-col {
  display: flex;
  flex-direction: column;
}

/* Detail Cards */
.detail-card {
  background: var(--surface);
  border-radius: 20px;
  border: 1px solid var(--border-primary);
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.card-head {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border-bottom: 1px solid var(--border-primary);
}

.card-head.between {
  justify-content: space-between;
}

.card-head i {
  font-size: 1.2rem;
  color: var(--color-primary);
}

.card-head h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

/* Information Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-grid.half {
    grid-template-columns: repeat(2, 1fr);
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.info-group.full-width {
  grid-column: 1 / -1;
}

.info-group label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
}

.info-group span {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
}

.capitalize { text-transform: capitalize; }

/* Remarks Box */
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

/* Document Links */
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
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
}

.doc-item:hover {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 2%, transparent);
  transform: translateY(-2px);
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

.doc-info {
  display: flex;
  flex-direction: column;
}

.doc-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.doc-meta {
  font-size: 0.8rem;
  color: var(--color-primary);
  font-weight: 500;
  margin-top: 0.15rem;
}

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
}

.modern-table tr:last-child td {
  border-bottom: none;
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

.status-name {
  font-size: 0.85rem;
  text-transform: capitalize;
  font-weight: 500;
}

.add-btn-sm {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  border: none;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.add-btn-sm:hover {
  background: var(--color-primary);
  color: white;
}

/* Financial Card */
.financial-card {
  background: linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--color-primary) 2%, transparent) 100%);
}

.financial-stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.financial-stat label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.stat-amount {
  font-size: 1.75rem;
  font-weight: 800;
}

.stat-amount.primary { color: var(--color-primary); }
.stat-amount.blue { color: #3b82f6; }

.financial-sep {
  height: 1px;
  background: var(--border-primary);
  margin: 1.5rem 0;
}

.bank-info {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-primary);
}

.bank-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.bank-item i {
  font-size: 1.25rem;
  color: var(--text-muted);
  background: var(--bg-primary);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.bank-det {
  display: flex;
  flex-direction: column;
}

.bank-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.bank-acc {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-family: monospace;
  font-weight: 600;
}

/* Quick Actions Sidebar */
.actions-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stack-btn {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.stack-btn.communication {
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-color: var(--border-primary);
}

.stack-btn.communication:hover {
  background: white;
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateX(4px);
}

.stack-btn.success {
  background: #ecfdf5;
  color: #059669;
}

.stack-btn.success:hover {
  background: #059669;
  color: white;
  transform: translateX(4px);
}

.stack-btn.info {
  background: #f0f9ff;
  color: #0284c7;
}

.stack-btn.info:hover {
  background: #0284c7;
  color: white;
  transform: translateX(4px);
}

.stack-btn i {
  font-size: 1.15rem;
}

/* Mini Audit */
.mini-audit {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mini-audit p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Empty States */
.not-found-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.not-found-state i {
  font-size: 4rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
}

.empty-payments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  gap: 1rem;
}

.empty-payments i {
  font-size: 2.5rem;
  opacity: 0.5;
}

/* =========================================
   Mobile Adjustments
   ========================================= */
@media (max-width: 1024px) {
  .detail-main-grid {
    grid-template-columns: 1fr;
  }
  
  .sidebar-col {
    order: 2;
  }
  
  .hero-content {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }
  
  .profile-main-info {
    align-items: center;
  }
  
  .quick-stats {
    justify-content: center;
  }
  
  .name-badge-row {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .student-name {
    font-size: 1.75rem;
  }
  
  .quick-stats {
    gap: 1rem;
  }
  
  .hero-content {
      gap: 1.5rem;
  }
  
  .profile-avatar-wrapper {
      width: 120px;
      height: 120px;
  }
}
</style>