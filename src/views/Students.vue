 <template>
  <AdminLayout>
    <div class="page-header">
      <div class="page-header-content">
        <h1>Active Beneficiaries</h1>
        <p>Manage all beneficiaries in the scholarship program</p>
      </div>
      <div class="page-header-actions">
        <button class="add-btn" @click="showAddModal = true">
          <i class="bi bi-plus-circle"></i>
          Add Beneficiary
        </button>
      </div>
    </div>
    

    <!-- Students Table -->
    <div class="cards">

      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">Active Beneficiaries ({{ filteredStudents.length }})</h5>

      </div>

      <!-- Filters -->
      <div class="filters-section">
        <!-- Search Input -->
        <div class="search-container flex-grow-1">
          <i class="bi bi-search search-icon"></i>
          <input
            type="text"
            class="search-input"
            placeholder="Search beneficiaries..."
            v-model="searchQuery"
          />
        </div>
      </div>

      <div class="card-body table">
        <div v-if="loading" class="text-center py-4">
          <div class="loader"></div>
          <span class="visually-hidden">Loading...</span>
        </div>

        <div v-else-if="filteredStudents.length === 0" class="text-center py-4">
          <p class="text-muted mb-0">No beneficiaries found</p>
        </div>

        <div v-else class="beneficiaries-grid">
          <div v-for="student in paginatedStudents" :key="student.id" class="beneficiary-card">
            
            <!-- Context Menu / Top Right Actions -->
                        
            <!-- User Profile Info -->
            <div class="card-profile">
              <div class="avatar-wrapper">
                <img
                  v-if="student.profile_picture"
                  :src="student.profile_picture"
                  :alt="student.full_name"
                  class="avatar-img"
                >
                <img
                  v-else
                  :src="`https://ui-avatars.com/api/?name=${student.full_name ? student.full_name.split(' ').join('+') : 'U'}&background=e9ecef&color=6c757d&size=100&font-size=0.4&bold=true`"
                  :alt="student.full_name"
                  class="avatar-img"
                >
              </div>
              <div class="name-status">
                <h5 class="fw-bold mb-1 text-truncate w-100 px-2" :title="student.full_name">{{ student.full_name }}</h5>
                <small class="small text-truncate" :title="student.status">
                  {{ student.status }}
                </small>
              </div>
              
            </div>

            <!-- Divided Stats -->
            <div class="card-stats">
              <div class="stat-box">
                <span class="stat-label">Level</span>
                <span class="stat-value">{{ student.level }}L</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-box">
                <span class="stat-label">Admitted</span>
                <span class="stat-value">{{ student.year_of_admission || 'N/A' }}</span>
              </div>
            </div>

            <!-- List Details -->
            <div class="card-details">
              <div class="detail-row">
                <i class="bi bi-building text-primary"></i>
                <span class="detail-text text-truncate" :title="student.school">{{ student.school }}</span>
              </div>
              <div class="detail-row">
                <i class="bi bi-journal-text text-primary"></i>
                <span class="detail-text text-truncate" :title="student.department">{{ student.department }}</span>
              </div>
              <div class="detail-row fee-row mt-2 pt-2 border-top">
                <span class="fee-label">School Fees</span>
                <span class="fee-value text-primary fw-bold">₦{{ formatCurrency(student.school_fees) }}</span>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="card-footer-actions">
              <router-link :to="`/students/${student.id}`" class="btn btn-light-primary w-100">
                <i class="bi bi-eye me-1"></i> View
              </router-link>
              <button class="btn btn-light-secondary w-100" @click="editStudent(student)">
                <i class="bi bi-pencil me-1"></i> Edit
              </button>
            </div>

          </div>
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
const showFiltersDropdown = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const levelFilter = ref('')
const schoolFilter = ref('')
const genderFilter = ref('')

const levels = ['100', '200', '300', '400', '500']
const statuses = ['active', 'graduated', 'inactive', 'suspended']
const genders = ['male', 'female']

const activeFiltersCount = computed(() => {
  let count = 0
  if (statusFilter.value) count++
  if (levelFilter.value) count++
  if (genderFilter.value) count++
  return count
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(6)

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
    const matchesGender = !genderFilter.value || student.gender === genderFilter.value
    const matchesSchool = !schoolFilter.value ||
      student.school.toLowerCase().includes(schoolFilter.value.toLowerCase())

    return matchesSearch && matchesStatus && matchesLevel && matchesGender && matchesSchool
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
  genderFilter.value = ''
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
watch([searchQuery, statusFilter, levelFilter, schoolFilter, genderFilter], () => {
  currentPage.value = 1
})

onMounted(() => {
  loadStudents()
})
</script>

<style scoped>

.filters-section {
  display: flex;
  gap: 1rem;
  /* margin-bottom: 1rem; */
}

.search-container {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 16px 12px 16px 36px; /* space for icon */
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 14px;
  transition: var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.card-footer {
  background: var(--surface);
  border-top: 1px solid var(--border-primary);
  padding: 1rem;
}

.table {
  color: var(--text-primary);
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Modern Card Grid */
.beneficiaries-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1rem;
  /* padding: 1rem; */
}

@media (min-width: 640px) {
  .beneficiaries-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .beneficiaries-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1400px) {
  .beneficiaries-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.beneficiary-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  /* box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); */
  padding: 1rem;
  cursor: pointer;
} 

.beneficiary-card:hover {
  /* transform: translateY(-5px); */
  box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
  border-color: var(--color-primary);
}


.card-profile {
  /* padding: 0 0 1rem 0; */
  display: flex;
  align-items: center;
  /* background: linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 5%, transparent) 0%, transparent 100%); */
  gap: .5rem;
}
.name-status{
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: .3rem;
}
.name-status h5{
  font-weight: 600;
  margin: 0;
  font-size: clamp(1rem, 1rem, 1rem);
}
.name-status small{
  margin: 0;
  color: var(--text-muted);
}
.avatar-wrapper {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 10px;
  box-sizing: border-box;
  overflow: hidden;
  background-color: #e0e0e0;
  border: 3px solid color-mix(in srgb, var(--color-primary) 10%, transparent);;
}

.avatar-img{
  width: 50px;
  height: 50px;
  border-radius: 10px;
  object-fit: cover;
}

.avatar-placeholder-lg {
  background: linear-gradient(135deg, var(--color-primary), #10b981); /* green/emerald tint */
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
}

.card-stats {
  display: flex;
  background: var(--input-bg);
  border-radius: 12px;
  padding: 0.75rem 0;
  border: 1px solid var(--border-primary);
}

.stat-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-divider {
  width: 1px;
  background: var(--border-primary);
}

.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-grow: 1;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.detail-row i {
  font-size: 1.1rem;
  opacity: 0.8;
  width: 20px;
  text-align: center;
}
.detail-row:nth-child(1) i {
  color: #0099ff;
}
.detail-row:nth-child(2) i {
  color: #ffa600;
}


.detail-text {
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 0;
}

.fee-row {
  display: flex;
  justify-content: space-between !important;
  align-items: center;
  border-top: 1px dashed var(--border-primary);
  padding-top: 1rem;
}

.fee-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.fee-value {
  font-size: 1.1rem;
}

.card-footer-actions {
  border-top: 1px dashed var(--border-primary);
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
}

.btn-light-primary {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  border: none;
  font-weight: 600;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s;
  width: 100%;
  gap: .5rem;
}

.btn-light-primary:hover {
  background: var(--color-primary);
  color: white;
}

.btn-light-secondary {
  background: var(--input-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  font-weight: 600;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s;
  width: 100%;
  gap: .5rem;
}

.btn-light-secondary:hover {
  background: var(--text-secondary);
  color: white;
  border-color: var(--text-secondary);
}

</style>