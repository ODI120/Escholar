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
            <!-- <div class="status-indicator" :class="student.status"></div> -->
          </div>
          <div class="profile-main-info">
            <div class="name-badge-row">
              <h1 class="student-name">{{ student.full_name }}</h1>
              <!-- <span class="status-badge" :class="student.status">{{ student.status }}</span> -->
            </div>
            <p class="student-subtitle">
              <i class="bi bi-mortarboard-fill"></i>
              {{ student.school }} • <span class="Department">{{ student.department }}</span>
            </p>
            <div class="quick-stats">
              <div class="quick-stat-item">
                <span class="stat-lbl">Remaining</span>
                <span class="stat-val">{{ student.years_remaining !== undefined ? `${student.years_remaining} yrs` : '—' }}</span>
              </div>

              <div class="vertical-line"></div>

              <div class="quick-stat-item">
                <span class="stat-lbl">Admission</span>
                <span class="stat-val">{{ student.year_of_admission || 'N/A' }}</span>
              </div>

              <div class="vertical-line"></div>

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
                  <span>{{ student.level ? `${student.level} Level` : 'Graduated' }}</span>
                </div>
                <div class="info-group">
                  <label>Course Duration</label>
                  <span>{{ student.course_duration ? `${student.course_duration} Years` : '—' }}</span>
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
                  <a
                    v-if="student.admission_letter_url"
                    :href="student.admission_letter_url"
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
                  <!-- Payment History -->
          <div class="detail-card mb-4">
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

          <!-- Academic Performance -->
          <div class="detail-card mb-4">
            <div class="card-head between">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-mortarboard-fill"></i>
                <h3>Academic Performance</h3>
              </div>
              <button class="add-btn-sm" @click="addAcademicRecord">
                <i class="bi bi-plus-lg"></i> Record GPA
              </button>
            </div>
            <div class="card-body p-0">
              <div v-if="student.academic_records && student.academic_records.length > 0" class="table-responsive">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th>Semester</th>
                      <th>Level</th>
                      <th>GPA</th>
                      <th>Status</th>
                      <th>Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="record in student.academic_records" :key="record.id">
                      <td>{{ record.semester }}</td>
                      <td>{{ record.session }}</td>
                      <td>
                        <div class="d-flex align-items-center gap-2">
                          <span class="fw-bold fs-5">{{ record.gpa }}</span>
                          <span v-if="record.gpa >= 4.0" class="incentive-badge" title="Eligible for GPA Incentive">
                            <i class="bi bi-star-fill"></i> Incentive
                          </span>
                        </div>
                      </td>
                      <td>
                        <span v-if="record.gpa >= 4.0" class="badge bg-success-subtle text-success border border-success-subtle">Elite</span>
                        <span v-else class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Standard</span>
                      </td>
                      <td>
                        <a
                          v-if="record.evidence_url"
                          :href="record.evidence_url"
                          download
                          class="btn-icon-link"
                          title="Download Evidence"
                        >
                          <i class="bi bi-file-earmark-check"></i>
                        </a>
                        <span v-else class="text-muted small">No evidence</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="empty-payments py-5">
                <i class="bi bi-award"></i>
                <p>No academic records found. Record a GPA to track performance.</p>
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
            <div class="fin-card-body">
              <div class="financial-stat">
                <label>Total Amount Received</label>
                <div class="stat-amount primary">₦{{ formatCurrency(totalReceived) }}</div>
              </div>
              <div class="financial-sep"></div>
              <div class="financial-stat">
                <label>School Fees</label>
                <div class="stat-amount blue">₦{{ formatCurrency(student.school_fees) }}</div>
              </div>
              
              <div class="bank-info">
                <label class="info-lbl-sm">Payment Details</label>
                <div class="bank-item">
                  <i class="bi bi-bank"></i>
                  <div class="bank-det">
                    <span class="bank-name">{{ student.bank_name || 'N/A' }}</span>
                    <span class="bank-acc-name">{{ student.account_name || 'No Account Name' }}</span>
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
          <button class="action-btn delete-btn" @click="showDeleteModal = true">
            <i class="bi bi-trash3"></i>
            <span>Delete</span>
          </button>
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

    <!-- Delete Confirmation Modal -->
    <Transition name="modal-fade">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="delete-modal">
          <div class="delete-modal-icon">
            <i class="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h3>Delete Beneficiary?</h3>
          <p>You are about to permanently delete <strong>{{ student?.full_name }}</strong>. This action cannot be undone and will remove all associated records.</p>
          <div class="delete-modal-actions">
            <button class="cancel-del-btn" @click="showDeleteModal = false" :disabled="deleteLoading">Cancel</button>
            <button class="confirm-del-btn" @click="deleteStudentRecord" :disabled="deleteLoading">
              <span v-if="deleteLoading">Deleting...</span>
              <span v-else><i class="bi bi-trash3"></i> Delete Permanently</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Add Payment Modal -->
    <Transition name="modal-fade">
      <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
        <div class="payment-modal form-card">
          <div class="card-head between">
            <div class="d-flex align-items-center gap-2">
              <div class="icon-box-sm primary">
                <i class="bi bi-cash-stack"></i>
              </div>
              <h3>Record Payment</h3>
            </div>
            <button class="close-btn" @click="showPaymentModal = false" :disabled="paymentLoading">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <form @submit.prevent="submitPayment" class="card-body">
            <div class="form-group mb-3">
              <label>Amount (₦) <span class="text-danger">*</span></label>
              <div class="input-with-icon">
                <i class="bi bi-currency-exchange"></i>
                <input type="number" v-model="paymentForm.amount" class="form-control" required min="1" step="0.01" placeholder="e.g. 50000">
              </div>
            </div>

            <div class="form-group mb-3">
              <label>Description <span class="text-danger">*</span></label>
              <div class="input-with-icon">
                <i class="bi bi-card-text"></i>
                <input type="text" v-model="paymentForm.description" class="form-control" required placeholder="e.g. First semester fees">
              </div>
            </div>

            <div class="form-group mb-4">
              <label>Date <span class="text-danger">*</span></label>
              <div class="input-with-icon">
                <i class="bi bi-calendar-event"></i>
                <input type="date" v-model="paymentForm.date" class="form-control" required>
              </div>
            </div>

            <div class="modal-actions pt-2 border-top">
              <button type="button" class="btn-light-secondary" @click="showPaymentModal = false" :disabled="paymentLoading">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="paymentLoading">
                <span v-if="paymentLoading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check2-circle me-1"></i>
                {{ paymentLoading ? 'Saving...' : 'Save Payment' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Add Academic Record Modal -->
    <Transition name="modal-fade">
      <div v-if="showAcademicModal" class="modal-overlay" @click.self="showAcademicModal = false">
        <div class="payment-modal form-card">
          <div class="card-head between">
            <div class="d-flex align-items-center gap-2">
              <div class="icon-box-sm success">
                <i class="bi bi-award"></i>
              </div>
              <h3>Record Semester GPA</h3>
            </div>
            <button class="close-btn" @click="showAcademicModal = false" :disabled="academicLoading">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <form @submit.prevent="submitAcademicRecord" class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-group">
                  <label>Semester <span class="text-danger">*</span></label>
                  <select v-model="academicForm.semester" class="form-control" required>
                    <option value="" disabled>Select Semester</option>
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                  </select>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label>Level <span class="text-danger">*</span></label>
                  <input type="text" v-model="academicForm.session" class="form-control" placeholder="e.g. 100L" required>
                </div>
              </div>
            </div>

            <div class="form-group mt-3">
              <label>GPA (0.00 - 5.00) <span class="text-danger">*</span></label>
              <div class="input-with-icon">
                <i class="bi bi-calculator"></i>
                <input type="number" v-model="academicForm.gpa" class="form-control" required min="0" max="5.0" step="0.01" placeholder="e.g. 4.25">
              </div>
              <div v-if="academicForm.gpa >= 4.0" class="mt-1">
                <small class="text-success fw-600"><i class="bi bi-stars"></i> This student is eligible for the high performance incentive!</small>
              </div>
            </div>

            <div class="form-group mt-3 mb-4">
              <label>Evidence (Result/Transcript) <span class="text-danger">*</span></label>
              <div class="file-upload-wrapper">
                <input type="file" @change="handleFileUpload" class="form-control" accept=".pdf,image/*">
                <div class="form-text mt-1">Upload a clear PDF or image of the result as evidence.</div>
              </div>
            </div>

            <div class="modal-actions pt-2 border-top">
              <button type="button" class="btn-light-secondary" @click="showAcademicModal = false" :disabled="academicLoading">Cancel</button>
              <button type="submit" class="btn-primary" :disabled="academicLoading">
                <span v-if="academicLoading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check2-circle me-1"></i>
                {{ academicLoading ? 'Saving...' : 'Record GPA' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useSupabaseStudents } from '../composables/useSupabase.js'

const route = useRoute()
const router = useRouter()
const { getStudent, deleteStudent, createPayment, createAcademicRecord, uploadAcademicEvidence } = useSupabaseStudents()

const loading = ref(true)
const student = ref(null)

const showDeleteModal = ref(false)
const deleteLoading = ref(false)

const showPaymentModal = ref(false)
const paymentLoading = ref(false)
const paymentForm = ref({ amount: '', description: '', date: new Date().toISOString().split('T')[0] })

const showAcademicModal = ref(false)
const academicLoading = ref(false)
const academicEvidenceFile = ref(null)
const academicForm = ref({
  semester: '',
  session: '',
  gpa: '',
  student_id: ''
})

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
  router.push({ path: '/students', query: { edit: student.value.id } })
}

const deleteStudentRecord = async () => {
  deleteLoading.value = true
  try {
    const { error } = await deleteStudent(student.value.id)
    if (error) {
      console.error('Delete error:', error)
      alert('Failed to delete student: ' + (error.message || 'Unknown error'))
    } else {
      router.push({ path: '/students' })
    }
  } catch (err) {
    console.error('Delete failed:', err)
    alert('Something went wrong. Please try again.')
  } finally {
    deleteLoading.value = false
    showDeleteModal.value = false
  }
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
  paymentForm.value = { amount: '', description: '', date: new Date().toISOString().split('T')[0] }
  showPaymentModal.value = true
}

const submitPayment = async () => {
  paymentLoading.value = true
  try {
    const payload = {
      student_id: student.value.id,
      amount: paymentForm.value.amount,
      description: paymentForm.value.description,
      date: paymentForm.value.date,
      status: 'paid'
    }
    const { data, error } = await createPayment(payload)
    if (error) throw error
    
    // Update local state instead of reloading to save a request
    if (!student.value.payments) student.value.payments = []
    student.value.payments.unshift(data)
    showPaymentModal.value = false
  } catch (err) {
    console.error('Error saving payment:', err)
    alert('Failed to save payment. Please try again.')
  } finally {
    paymentLoading.value = false
  }
}

const markAsPaid = () => {
  console.log('Mark as paid for student:', student.value.id)
}

const addAcademicRecord = () => {
  academicForm.value = {
    semester: '',
    session: '',
  gpa: '',
    student_id: student.value.id
  }
  academicEvidenceFile.value = null
  showAcademicModal.value = true
}

const handleFileUpload = (event) => {
  academicEvidenceFile.value = event.target.files[0]
}

const submitAcademicRecord = async () => {
  academicLoading.value = true
  try {
    let evidence_url = ''
    
    if (academicEvidenceFile.value) {
      const { url, error } = await uploadAcademicEvidence(student.value.id, academicEvidenceFile.value)
      if (error) throw error
      evidence_url = url
    }

    const payload = {
      ...academicForm.value,
      // Ensure types match typical DB schemas (numeric gpa, string fields)
      gpa: academicForm.value.gpa === '' ? null : Number.parseFloat(academicForm.value.gpa),
      evidence_url,
      student_id: student.value.id
    }

    const { data, error } = await createAcademicRecord(payload)
    if (error) throw error
    
    if (!student.value.academic_records) student.value.academic_records = []
    student.value.academic_records.unshift(data)
    showAcademicModal.value = false
    
    if ((payload.gpa ?? 0) >= 4.0) {
      alert('Congratulations! This student is eligible for the High Performance Incentive.')
    }
  } catch (err) {
    console.error('Error saving GPA record:', err)
    alert(err?.message ? `Failed to save academic record: ${err.message}` : 'Failed to save academic record. Please try again.')
  } finally {
    academicLoading.value = false
  }
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

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.7rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  margin-top: 1rem;
  width: 100%;
}

.delete-btn:hover {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* Profile Hero Card */
.profile-hero-card {
  background: var(--surface);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--border-primary);
  display: flex;
  align-items: flex-end;
  padding: 1.25rem;
  position: relative;
  transition: box-shadow 0.35s ease;
}

.profile-hero-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 5%, transparent) 0%, transparent 55%);
  pointer-events: none;
}

.hero-blur-bg {
  /* position: absolute; */
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
  /* position: relative; */
  z-index: 2;
  /* padding: 2.5rem; */
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  background: linear-gradient(to top, var(--surface) 20%, transparent 100%);
}

.profile-avatar-wrapper {
  position: relative;
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}
/* .Department {
  color: var(--color-primary);
} */

.profile-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-2xl);
  object-fit: cover;
  border: 2.5px solid rgba(255, 255, 255, 0.85);
  box-shadow: var(--shadow-lg), 0 0 0 1px rgba(0,0,0,0.05);
  transition: transform 0.35s var(--spring);
}

.profile-avatar-img:hover {
  transform: scale(1.03);
}

.profile-avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-2xl);
  background: linear-gradient(135deg, var(--color-primary), #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  border: 2.5px solid rgba(255, 255, 255, 0.85);
  box-shadow: var(--shadow-lg);
}

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid white;
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
  gap: 10px;
  
}

.name-badge-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.student-name {
  font-size: clamp(1.5rem, 1vw, 1rem);
  font-weight: 600;
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
  font-size: 1rem;
  /* margin: 0.5rem 0 1.5rem 0; */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-style: italic;
}

.quick-stats {
  display: flex;
  border: 1px solid var(--border-primary);
  padding: 10px 14px;
  border-radius: 10px;
  align-items: center;
  width: 370px;
  background: var(--bg-primary);
  justify-content: space-between;
  box-shadow: var(--shadow-xs);
}

.vertical-line {
  width: 1px;
  height: 2rem;
  background-color: var(--border-primary);
}

.quick-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.stat-lbl {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.stat-val {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.primary-color { color: var(--color-primary); }

/* Main Grid Layout */
.detail-main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1rem;
}

/* Column Wrappers */
.content-col, .sidebar-col {
  display: flex;
  flex-direction: column;
}

/* Detail Cards */
.detail-card {
  background: var(--surface);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--border-primary);
  overflow: hidden;
}

.detail-card:hover {
  box-shadow: none;
}

.card-head {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border-bottom: 1px solid var(--border-primary);
  background: color-mix(in srgb, var(--color-primary) 2%, var(--surface));
}

.card-head.between {
  justify-content: space-between;
}

.card-head i {
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

.card-head h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

.card-body {
  padding: 1rem;
}

/* Information Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: .2rem;
  /* background: var(--bg-primary); */
  padding: .2rem;
  border-radius: 10px;
  /* border: 1px solid var(--border-primary); */

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

/* .info-group:hover {
  background: var(--bg-primary);
} */

/* .info-group.full-width {
  grid-column: 1 / -1;
} */

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
  border-radius: var(--radius-xl);
  text-decoration: none;
  transition: all 0.25s var(--spring);
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

.financial-card .fin-card-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: .5rem;
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

}

.bank-info {
  background: var(--bg-primary);
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
  border-radius: var(--radius-lg);
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.25s var(--spring);
  text-align: left;
  font-size: 0.9rem;
}

.stack-btn.communication {
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-color: var(--border-primary);
}

.stack-btn.communication:hover {
  background: var(--surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateX(5px);
  box-shadow: var(--shadow-sm);
}

.stack-btn.success {
  background: #ecfdf5;
  color: #059669;
}

.stack-btn.success:hover {
  background: #059669;
  color: white;
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.stack-btn.info {
  background: #f0f9ff;
  color: #0284c7;
}

.stack-btn.info:hover {
  background: #0284c7;
  color: white;
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
}

.stack-btn i {
  font-size: 1.1rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: rgba(0,0,0,0.05);
  flex-shrink: 0;
  transition: transform 0.25s var(--spring);
}

.stack-btn:hover i {
  transform: scale(1.1);
}

/* Delete Confirmation Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.delete-modal {
  background: var(--surface);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--border-primary);
  padding: 2.5rem 2rem;
  max-width: 420px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: modal-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-pop {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}

.delete-modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fee2e2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.delete-modal-icon i {
  font-size: 2rem;
  color: #dc2626;
}

.delete-modal h3 {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.delete-modal p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

.delete-modal strong {
  color: var(--text-primary);
  font-weight: 700;
}

.delete-modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  justify-content: center;
}

.cancel-del-btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-del-btn:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.confirm-del-btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: var(--radius-lg);
  background: #dc2626;
  border: none;
  color: white;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.confirm-del-btn:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);
}

.confirm-del-btn:disabled,
.cancel-del-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal fade transition */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

/* Payment Modal Specifics */
.payment-modal {
  background: var(--surface);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--border-primary);
  max-width: 480px;
  width: 100%;
  animation: modal-pop 0.3s var(--spring);
  overflow: hidden;
}

.payment-modal .card-head {
  padding: 1.25rem 1.5rem;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
}

.icon-box-sm {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  font-size: 1.15rem;
}

.icon-box-sm.primary {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: var(--text-muted);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon i {
  position: absolute;
  left: 1rem;
  color: var(--text-muted);
  pointer-events: none;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.8rem;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  background: var(--surface);
  color: var(--text-primary);
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-light-secondary {
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  font-weight: 600;
  border-radius: var(--radius-lg);
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-light-secondary:hover {
  background: var(--border-primary);
  color: var(--text-primary);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
  font-weight: 600;
  border-radius: var(--radius-lg);
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s var(--spring);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-primary) 85%, black);
  border-color: color-mix(in srgb, var(--color-primary) 85%, black);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.btn-primary:disabled, .btn-light-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-btn-sm {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s var(--spring);
}

.add-btn-sm:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent);
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

.incentive-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  background: #fef9c3;
  color: #854d0e;
  border: 1px solid #fde047;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  animation: pulse-gold 2s infinite;
}

@keyframes pulse-gold {
  0% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(250, 204, 21, 0); }
  100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0); }
}

.btn-icon-link {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--color-primary);
  border: 1px solid var(--border-primary);
  transition: all 0.2s;
}

.btn-icon-link:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
}

.file-upload-wrapper {
  position: relative;
}

.icon-box-sm.success {
  background: #d1fae5;
  color: #059669;
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

}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .student-name {
    font-size: 1rem;
    font-weight: 600;
  }

  .hero-content {
      gap: 1.5rem;
  }
  
  .profile-avatar-wrapper {
      width: 120px;
      height: 120px;
  }
}
@media (max-width: 567px) {
  .hero-content {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 0!important;
  }
  .name-badge-row {
    justify-content: center;
  }
  .profile-main-info {
    align-items: center;
    width: 100%;
    
  }
  .profile-avatar-wrapper img{
    border-radius: 50%;
  }
  .breadcrumb-nav span, .breadcrumb-nav a, .breadcrumb-nav i{
   display: none;
  }

}

@media (max-width: 425px) {
  .quick-stats {

     width: 100% ;
  }
  
  .page-header{
    flex-direction: row;
  }
}

@media (max-width: 320px) {
  .profile-main-info i{
    display: none;
  }

}
</style>