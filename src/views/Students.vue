 <template>
  <AdminLayout>
    <template #header-actions>
      <button class="btn btn-primary" @click="showAddModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Student
      </button>
    </template>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-grid">
        <input
          type="text"
          class="input"
          placeholder="Search students..."
          v-model="searchQuery"
        />

        <select class="select" v-model="statusFilter">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="graduated">Graduated</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>

        <select class="select" v-model="levelFilter">
          <option value="">All Levels</option>
          <option value="100">100 Level</option>
          <option value="200">200 Level</option>
          <option value="300">300 Level</option>
          <option value="400">400 Level</option>
          <option value="500">500 Level</option>
        </select>

        <input
          type="text"
          class="input"
          placeholder="Filter by school..."
          v-model="schoolFilter"
        />

        <button class="btn btn-outline-secondary w-full" @click="clearFilters">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Students Table -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">Students ({{ filteredStudents.length }})</h5>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" @click="exportData">
            Export
          </button>
        </div>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="loader"></div>
          <span class="visually-hidden">Loading...</span>
        </div>

        <div v-else-if="filteredStudents.length === 0" class="text-center py-4">
          <p class="text-muted mb-0">No students found</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Admission Year</th>
                <th>School</th>
                <th>Department</th>
                <th>Level</th>
                <th>Status</th>
                <th>School Fees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in paginatedStudents" :key="student.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar me-3">
                      <img
                        v-if="student.profile_picture"
                        :src="student.profile_picture"
                        :alt="student.full_name"
                        class="rounded-circle"
                      >
                      <div v-else class="avatar-placeholder rounded-circle">
                        {{ student.full_name.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div>
                      <div class="fw-semibold">{{ student.full_name }}</div>
                      <small class="text-muted">{{ student.phone_number }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ student.email || '—' }}</td>
                <td>{{ student.year_of_admission || '—' }}</td>
                <td>{{ student.school }}</td>
                <td>{{ student.department }}</td>
                <td>{{ student.level }}</td>
                <td>
                  <span class="badge" :class="getStatusBadgeClass(student.status)">
                    {{ student.status }}
                  </span>
                </td>
                <td>₦{{ formatCurrency(student.school_fees) }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <router-link :to="`/students/${student.id}`" class="btn btn-sm btn-outline-primary">
                      View
                    </router-link>
                    <button class="btn btn-sm btn-outline-secondary" @click="editStudent(student)">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="card-footer">
        <nav aria-label="Students pagination">
          <ul class="pagination justify-content-center mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                Previous
              </button>
            </li>
            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Add/Edit Student Modal -->
    <div class="modal" :class="{ show: showAddModal || showEditModal }" :style="{ display: (showAddModal || showEditModal) ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Edit Student' : 'Add New Student' }}</h5>
            <button type="button" class="close-btn" @click="closeModal">&times;</button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="info-grid">
                <div>
                  <label class="form-label">Full Name *</label>
                  <input type="text" class="form-control" v-model="studentForm.full_name" required>
                </div>
                <div>
                  <label class="form-label">Email *</label>
                  <input type="email" class="form-control" v-model="studentForm.email" required placeholder="student@example.com">
                </div>
                <div>
                  <label class="form-label">Year of Admission</label>
                  <input type="number" min="1900" class="form-control" v-model="studentForm.year_of_admission" placeholder="2024">
                </div>
                <div>
                  <label class="form-label">Gender *</label>
                  <select class="form-select" v-model="studentForm.gender" required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Phone Number *</label>
                  <input type="tel" class="form-control" v-model="studentForm.phone_number" required>
                </div>
                <div>
                  <label class="form-label">Profile Picture URL</label>
                  <input type="url" class="form-control" v-model="studentForm.profile_picture" placeholder="https://...">
                </div>
                <div>
                  <label class="form-label">School *</label>
                  <input type="text" class="form-control" v-model="studentForm.school" required>
                </div>
                <div>
                  <label class="form-label">Department *</label>
                  <input type="text" class="form-control" v-model="studentForm.department" required>
                </div>
                <div>
                  <label class="form-label">Level *</label>
                  <select class="form-select" v-model="studentForm.level" required>
                    <option value="">Select Level</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Status *</label>
                  <select class="form-select" v-model="studentForm.status" required>
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="graduated">Graduated</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Parent Name</label>
                  <input type="text" class="form-control" v-model="studentForm.parent_name">
                </div>
                <div>
                  <label class="form-label">Parent Phone</label>
                  <input type="tel" class="form-control" v-model="studentForm.parent_phone">
                </div>
                <div>
                  <label class="form-label">Account Number</label>
                  <input type="text" class="form-control" v-model="studentForm.account_number">
                </div>
                <div>
                  <label class="form-label">Bank Name</label>
                  <input type="text" class="form-control" v-model="studentForm.bank_name">
                </div>
                <div>
                  <label class="form-label">School Fees (₦)</label>
                  <input type="number" class="form-control" v-model="studentForm.school_fees" placeholder="0">
                </div>
                <div>
                  <label class="form-label">Admission Letter URL</label>
                  <input type="url" class="form-control" v-model="studentForm.admission_letter_url" placeholder="https://...">
                </div>
                <div>
                  <label class="form-label">Remarks</label>
                  <textarea class="form-control" v-model="studentForm.remarks" rows="3"></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="modalLoading">
                <span v-if="modalLoading" class="loader-sm me-2"></span>
                {{ modalLoading ? 'Saving...' : (isEditing ? 'Update Student' : 'Add Student') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useSupabaseStudents } from '../composables/useSupabase.js'

const { getStudents, createStudent, updateStudent } = useSupabaseStudents()

const loading = ref(true)
const modalLoading = ref(false)
const students = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const isEditing = ref(false)
const editingStudent = ref(null)

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const levelFilter = ref('')
const schoolFilter = ref('')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Student form
const studentForm = ref({
  full_name: '',
  email: '',
  year_of_admission: '',
  gender: '',
  phone_number: '',
  profile_picture: '',
  school: '',
  department: '',
  level: '',
  parent_name: '',
  parent_phone: '',
  account_number: '',
  bank_name: '',
  school_fees: '',
  remarks: '',
  admission_letter_url: '',
  // payments will be managed separately in detail view
  status: 'active'
})

// Computed properties
const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchesSearch = !searchQuery.value ||
      student.full_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.school.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (student.year_of_admission ? String(student.year_of_admission) : '').includes(searchQuery.value)

    const matchesStatus = !statusFilter.value || student.status === statusFilter.value
    const matchesLevel = !levelFilter.value || student.level === levelFilter.value
    const matchesSchool = !schoolFilter.value ||
      student.school.toLowerCase().includes(schoolFilter.value.toLowerCase())

    return matchesSearch && matchesStatus && matchesLevel && matchesSchool
  })
})

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / itemsPerPage.value))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredStudents.value.slice(start, end)
})

// Methods
const loadStudents = async () => {
  loading.value = true
  try {
    const { data, error } = await getStudents()
    if (!error && data) {
      students.value = data
    }
  } catch (err) {
    console.error('Error loading students:', err)
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

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  levelFilter.value = ''
  schoolFilter.value = ''
  currentPage.value = 1
}

const editStudent = (student) => {
  isEditing.value = true
  editingStudent.value = student
  studentForm.value = { ...student }
  showEditModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  isEditing.value = false
  editingStudent.value = null
  studentForm.value = {
    full_name: '',
    email: '',
    year_of_admission: '',
    gender: '',
    phone_number: '',
    profile_picture: '',
    school: '',
    department: '',
    level: '',
    parent_name: '',
    parent_phone: '',
    account_number: '',
    bank_name: '',
    school_fees: '',
    remarks: '',
    admission_letter_url: '',
    status: 'active'
  }
}

const handleSubmit = async () => {
  modalLoading.value = true

  try {
    const formData = {
      ...studentForm.value,
      school_fees: parseFloat(studentForm.value.school_fees) || 0
    }

    if (isEditing.value) {
      await updateStudent(editingStudent.value.id, formData)
    } else {
      await createStudent(formData)
    }

    await loadStudents()
    closeModal()
  } catch (err) {
    console.error('Error saving student:', err)
  } finally {
    modalLoading.value = false
  }
}

const exportData = () => {
  // Simple CSV export
  const headers = ['Full Name', 'Email', 'Admission Year', 'Gender', 'Phone', 'School', 'Department', 'Level', 'Status', 'School Fees']
  const csvContent = [
    headers.join(','),
    ...filteredStudents.value.map(student => [
      `"${student.full_name}"`,
      `"${student.email || ''}"`,
      student.year_of_admission || '',
      student.gender,
      `"${student.phone_number}"`,
      `"${student.school}"`,
      `"${student.department}"`,
      student.level,
      student.status,
      student.school_fees
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'students.csv'
  a.click()
  window.URL.revokeObjectURL(url)
}

// Watchers
watch([searchQuery, statusFilter, levelFilter, schoolFilter], () => {
  currentPage.value = 1
})

onMounted(() => {
  loadStudents()
})
</script>

<style scoped>
.filters-section {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
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
  padding: 0;
}

.card-footer {
  background: var(--surface);
  border-top: 1px solid var(--border-primary);
  padding: 1rem;
}

.table {
  color: var(--text-primary);
  margin: 0;
}

.table th {
  background: var(--surface);
  border-bottom: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-weight: 600;
  padding: 1rem;
}

.table-responsive {
  overflow-x: auto;
}

.table-hover tbody tr:hover {
  background: var(--surface-hover);
}

.table td {
  border-bottom: 1px solid var(--border-primary);
  padding: 1rem;
  vertical-align: middle;
}

.avatar {
  width: 40px;
  height: 40px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
}

.btn-group .btn {
  border-radius: 0;
}

.btn-group .btn:first-child {
  border-top-left-radius: var(--radius-md);
  border-bottom-left-radius: var(--radius-md);
}

.btn-group .btn:last-child {
  border-top-right-radius: var(--radius-md);
  border-bottom-right-radius: var(--radius-md);
}

.form-control, .form-select {
  background: var(--input-bg) !important;
  border-color: var(--input-border) !important;
  color: var(--text-primary) !important;
}

.form-control:focus, .form-select:focus {
  background: var(--input-bg) !important;
  border-color: var(--color-primary) !important;
  color: var(--text-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(34, 197, 94, 0.25);
}

.modal-content {
  background: var(--surface);
  color: var(--text-primary);
}

.modal-header {
  border-bottom-color: var(--border-primary);
}

.modal-footer {
  border-top-color: var(--border-primary);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  max-width: 800px;
  width: 100%;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-secondary);
}

.close-btn:hover {
  color: var(--text-primary);
}

.pagination .page-link {
  background: var(--surface);
  border-color: var(--border-primary);
  color: var(--text-primary);
}

.pagination .page-link:hover {
  background: var(--surface-hover);
  border-color: var(--border-secondary);
  color: var(--text-primary);
}

.pagination .page-item.active .page-link {
  background: var(--color-primary);
  border-color: var(--color-primary);
}
</style>