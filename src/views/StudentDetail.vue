<template>
  <AdminLayout>
    <template #header-actions>
      <button class="btn btn-outline-secondary me-2" @click="$router.go(-1)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12,19 5,12 12,5"/>
        </svg>
        Back
      </button>
      <button class="btn btn-primary" @click="editStudent">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Edit Student
      </button>
    </template>

    <div v-if="loading" class="text-center py-5">
      <div class="loader"></div>
      <span class="visually-hidden">Loading...</span>
    </div>

    <div v-else-if="student">
      <!-- Student Header -->
      <div class="student-header mb-4">
        <div class="d-flex align-items-center">
          <div class="avatar-lg me-4">
            <img
              v-if="student.profile_picture"
              :src="student.profile_picture"
              :alt="student.full_name"
              class="rounded-circle"
            >
            <div v-else class="avatar-placeholder-lg rounded-circle">
              {{ student.full_name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div>
            <h2 class="mb-1">{{ student.full_name }}</h2>
            <p class="text-muted mb-2">{{ student.school }} • {{ student.department }}</p>
            <span class="badge" :class="getStatusBadgeClass(student.status)">
              {{ student.status }}
            </span>
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <!-- Student Information -->
        <div>
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">Student Information</h5>
            </div>
            <div class="card-body">
              <div class="info-grid">
                  <div class="info-item">
                    <label class="info-label">Full Name</label>
                    <p class="info-value">{{ student.full_name }}</p>
                  </div>
                  <div class="info-item">
                    <label class="info-label">Email</label>
                    <p class="info-value">{{ student.email || '—' }}</p>
                  </div>
                  <div class="info-item">
                    <label class="info-label">Year of Admission</label>
                    <p class="info-value">{{ student.year_of_admission || '—' }}</p>
                  </div>
                  <div class="info-item">
                    <label class="info-label">Gender</label>
                    <p class="info-value">{{ student.gender }}</p>
                  </div>
                  <div class="info-item">
                    <label class="info-label">Phone Number</label>
                    <p class="info-value">{{ student.phone_number }}</p>
                  </div>
                  <div class="info-item">
                    <label class="info-label">Level</label>
                    <p class="info-value">{{ student.level }} Level</p>
                  </div>
                  <div class="info-item">
                    <label class="info-label">School</label>
                    <p class="info-value">{{ student.school }}</p>
                  </div>
                  <div class="info-item">
                    <label class="info-label">Department</label>
                    <p class="info-value">{{ student.department }}</p>
                  </div>
              </div>
            </div>
          </div>

          <!-- Parent Information -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">Parent/Guardian Information</h5>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <label class="info-label">Parent Name</label>
                  <p class="info-value">{{ student.parent_name || 'Not provided' }}</p>
                </div>
                <div class="info-item">
                  <label class="info-label">Parent Phone</label>
                  <p class="info-value">{{ student.parent_phone || 'Not provided' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Remarks & Documents -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">Remarks & Documents</h5>
            </div>
            <div class="card-body">
              <div class="info-item mb-3">
                <label class="info-label">Remarks</label>
                <p class="info-value">{{ student.remarks || 'None' }}</p>
              </div>
              <div class="info-item">
                <label class="info-label">Admission Letter</label>
                <p class="info-value">
                  <a v-if="student.admission_letter_url" :href="student.admission_letter_url" target="_blank" rel="noopener">
                    View Document
                  </a>
                  <span v-else>Not uploaded</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Payment History -->
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Payment History</h5>
              <button class="btn btn-sm btn-outline-primary" @click="addPayment">
                Add Payment
              </button>
            </div>
            <div class="card-body">
              <div v-if="student.payments && student.payments.length > 0">
                <div class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="payment in student.payments" :key="payment.id">
                        <td>{{ formatDate(payment.date) }}</td>
                        <td>₦{{ formatCurrency(payment.amount) }}</td>
                        <td>{{ payment.description }}</td>
                        <td>
                          <span class="badge" :class="payment.status === 'paid' ? 'bg-success' : 'bg-warning'">
                            {{ payment.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <p class="text-muted mb-0">No payment history available</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div>
          <!-- Financial Information -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">Financial Information</h5>
            </div>
            <div class="card-body">
              <div class="info-item mb-3">
                <label class="info-label">Total Received</label>
                <p class="info-value fs-5 fw-bold text-primary">₦{{ formatCurrency(totalReceived) }}</p>
              </div>

              <div class="info-item mb-3">
                <label class="info-label">School Fees</label>
                <p class="info-value fs-5 fw-bold text-primary">₦{{ formatCurrency(student.school_fees) }}</p>
              </div>

              <div class="info-item mb-3">
                <label class="info-label">Account Number</label>
                <p class="info-value">{{ student.account_number || 'Not provided' }}</p>
              </div>

              <div class="info-item">
                <label class="info-label">Bank Name</label>
                <p class="info-value">{{ student.bank_name || 'Not provided' }}</p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button class="btn btn-outline-primary" @click="callStudent">
                  <svg class="me-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Call Student
                </button>
                <button v-if="student.parent_phone" class="btn btn-outline-primary" @click="callParent">
                  <svg class="me-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Call Parent
                </button>
                <button class="btn btn-outline-success" @click="markAsPaid">
                  <svg class="me-2" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Mark as Paid
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">
      <p class="text-muted">Student not found</p>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useSupabaseStudents } from '../composables/useSupabase.js'

const route = useRoute()
const { getStudent } = useSupabaseStudents()

const loading = ref(true)
const student = ref(null)

const loadStudent = async () => {
  loading.value = true
  try {
    const { data, error } = await getStudent(route.params.id)
    if (!error && data) {
      student.value = data
    }
  } catch (err) {
    console.error('Error loading student:', err)
  } finally {
    loading.value = false
  }
}

const getStatusBadgeClass = (status) => {
  const classes = {
    active: 'bg-success',
    graduated: 'bg-info',
    inactive: 'bg-warning',
    suspended: 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount || 0)
}

const formatDate = (dateString) => {
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
  // Navigate to edit mode - could be implemented later
  console.log('Edit student:', student.value.id)
}

const callStudent = () => {
  if (student.value.phone_number) {
    window.open(`tel:${student.value.phone_number}`)
  }
}

const callParent = () => {
  if (student.value.parent_phone) {
    window.open(`tel:${student.value.parent_phone}`)
  }
}

const addPayment = () => {
  // Could open a modal to add payment
  console.log('Add payment for student:', student.value.id)
}

const markAsPaid = () => {
  // Could update payment status
  console.log('Mark as paid for student:', student.value.id)
}

onMounted(() => {
  loadStudent()
})
</script>

<style scoped>
.student-header {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.avatar-lg {
  width: 80px;
  height: 80px;
}

.avatar-lg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-lg {
  width: 100%;
  height: 100%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 2rem;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border-primary);
  padding: 1.5rem;
}

.card-title {
  color: var(--text-primary);
  font-weight: 600;
}

.card-body {
  padding: 1.5rem;
}

.info-item {
  margin-bottom: 1rem;
}

.info-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  margin: 0;
  color: var(--text-primary);
  font-weight: 500;
}

.table {
  color: var(--text-primary);
}

.table th {
  background: var(--surface);
  border-bottom: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-weight: 600;
  padding: 0.75rem;
}

.table td {
  border-bottom: 1px solid var(--border-primary);
  padding: 0.75rem;
  vertical-align: middle;
}

.table-hover tbody tr:hover {
  background: var(--surface-hover);
}

.table-responsive {
  overflow-x: auto;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
}

.btn-outline-primary {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-outline-primary:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.btn-outline-success {
  border-color: #198754;
  color: #198754;
}

.btn-outline-success:hover {
  background: #198754;
  border-color: #198754;
}
</style>