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

        <div v-else-if="filteredStudents.length === 0" class="empty-state-card w-100 mx-auto" style="grid-column: 1 / -1;">
          <div class="empty-icon"><i class="bi bi-people"></i></div>
          <h4 class="empty-title">No Beneficiaries Found</h4>
          <p class="empty-subtitle">We couldn't find any student records matching your search criteria. Try adjusting your filters or adding a new beneficiary.</p>
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
                <span class="stat-value">{{ formatDate(student.admission_date) }}</span>
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
    <Transition name="modal-fade">
      <div v-if="showAddModal || showEditModal" class="custom-modal-backdrop" @click.self="closeModal">
        <div class="custom-modal-wrapper">
          <div class="custom-modal-header">
            <div class="header-titles">
              <div class="header-icon" :class="{ 'edit-icon': isEditing }">
                <i class="bi" :class="isEditing ? 'bi-pencil-square' : 'bi-person-plus-fill'"></i>
              </div>
              <div class="title-group">
                <h3 class="custom-modal-title">{{ isEditing ? 'Edit Beneficiary' : 'New Beneficiary' }}</h3>
                <p class="custom-modal-subtitle">{{ isEditing ? 'Update the details below' : 'Fill in the details to add a beneficiary' }}</p>
              </div>
            </div>
            <button type="button" class="custom-close-btn" @click="closeModal" aria-label="Close">
              <i class="bi bi-x"></i>
            </button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="custom-modal-form">
            <div class="custom-modal-body">
              <div class="form-section">
                <h4 class="section-title">Personal Information</h4>
                <div class="custom-form-grid">
                  <div class="custom-input-group">
                    <label class="custom-label">Full Name <span class="required">*</span></label>
                    <input type="text" class="custom-input" v-model="studentForm.full_name" required placeholder="e.g. John Doe">
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">Email <span class="required">*</span></label>
                    <input type="email" class="custom-input" v-model="studentForm.email" required placeholder="student@example.com">
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">Phone Number <span class="required">*</span></label>
                    <input type="tel" class="custom-input" v-model="studentForm.phone_number" required placeholder="+234...">
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">Gender <span class="required">*</span></label>
                    <select class="custom-select" v-model="studentForm.gender" required>
                      <option value="" disabled>Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div class="custom-input-group full-width">
                    <label class="custom-label">Profile Picture URL</label>
                    <div class="image-upload-wrapper">
                      <div class="image-preview" v-if="previewUrl || studentForm.profile_picture">
                        <img :src="previewUrl || studentForm.profile_picture" alt="Profile Preview" />
                        <button type="button" class="remove-img-btn" @click="removeProfileImage" title="Remove image">
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                      <div v-else class="image-placeholder-box" @click="$refs.profilePicInput.click()">
                        <i class="bi bi-camera"></i>
                        <span>Click to upload image</span>
                      </div>
                      <input type="file" ref="profilePicInput" class="custom-input file-input-hidden" @change="handleFileUpload" accept="image/*">
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h4 class="section-title">Academic Details</h4>
                <div class="custom-form-grid">
                  <div class="custom-input-group">
                    <label class="custom-label">School <span class="required">*</span></label>
                    <input type="text" class="custom-input" v-model="studentForm.school" required placeholder="University Name">
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">Department <span class="required">*</span></label>
                    <input type="text" class="custom-input" v-model="studentForm.department" required placeholder="Course of Study">
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">Course Duration (Years) <span class="required">*</span></label>
                    <input type="number" min="1" max="10" class="custom-input" v-model="studentForm.course_duration" required placeholder="e.g. 4">
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">Admission Date <span class="required">*</span></label>
                    <input type="date" class="custom-input" v-model="studentForm.admission_date" required>
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">Admission Letter URL</label>
                    <input type="file" ref="admissionInput" class="custom-input" accept=".pdf,.doc,.docx" @change="handleAdmissionLetterUpload">
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h4 class="section-title">Financial & Parent Info</h4>
                <div class="custom-form-grid">
                  <div class="custom-input-group">
                    <label class="custom-label">Parent Name</label>
                    <input type="text" class="custom-input" v-model="studentForm.parent_name" placeholder="Name of parent/guardian">
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">Parent Phone</label>
                    <input type="tel" class="custom-input" v-model="studentForm.parent_phone" placeholder="Parent contact number">
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">Bank Name</label>
                    <input type="text" class="custom-input" v-model="studentForm.bank_name" placeholder="Name of Bank">
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">Account Name</label>
                    <input type="text" class="custom-input" v-model="studentForm.account_name" placeholder="Name on bank account">
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">Account Number</label>
                    <input type="text" class="custom-input" v-model="studentForm.account_number" placeholder="Bank account number">
                  </div>
                  <div class="custom-input-group">
                    <label class="custom-label">School Fees (₦)</label>
                    <input type="number" class="custom-input" v-model="studentForm.school_fees" placeholder="0">
                  </div>
                  <div class="custom-input-group full-width">
                    <label class="custom-label">Remarks</label>
                    <textarea class="custom-input custom-textarea" v-model="studentForm.remarks" rows="3" placeholder="Additional notes or remarks..."></textarea>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="custom-modal-footer">
              <button type="button" class="custom-btn custom-btn-outline" @click="closeModal">Cancel</button>
              <button type="submit" class="custom-btn custom-btn-primary" :disabled="modalLoading">
                <span v-if="modalLoading" class="loader-sm mr-2"></span>
                <span v-else>{{ isEditing ? 'Save Changes' : 'Add Beneficiary' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '../../../layouts/AdminLayout.vue'
import { useSupabaseStudents, supabase, isMock } from '../../../composables/useSupabase.js'

const route = useRoute()
const { getStudents, createStudent, updateStudent, deleteStudent } = useSupabaseStudents()

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
const statusFilter = ref('active')
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
const itemsPerPage = ref(8)

// Student form
const studentForm = ref({
  full_name: '',
  email: '',
  admission_date: new Date().toISOString().split('T')[0],
  gender: '',
  phone_number: '',
  profile_picture: '',
  school: '',
  department: '',
  course_duration: '',
  parent_name: '',
  parent_phone: '',
  account_number: '',
  account_name: '',
  bank_name: '',
  school_fees: '',
  remarks: '',
  admission_letter_url: '',
  // payments will be managed separately in detail view
  status: 'active'
})

// File states
const profilePictureFile = ref(null)
const admissionLetterFile = ref(null)
const profilePicInput = ref(null)
const admissionInput = ref(null)
const previewUrl = ref(null)

// Computed properties
const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchesSearch = !searchQuery.value ||
      student.full_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.school.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (student.admission_date ? String(student.admission_date) : '').includes(searchQuery.value)

    const matchesStatus = student.status === 'active'
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
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
  // Reset file selections but PRESERVE existing URLs
  profilePictureFile.value = null
  admissionLetterFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  showEditModal.value = true
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (event.target.accept?.includes('image')) {
    profilePictureFile.value = file
    // Create preview URL
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(file)
  } else {
    admissionLetterFile.value = file
  }
}

const removeProfileImage = () => {
  profilePictureFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  // If we want to allow removing existing image too:
  if (!profilePictureFile.value) {
    studentForm.value.profile_picture = ''
  }
  if (profilePicInput.value) profilePicInput.value.value = ''
}

const handleAdmissionLetterUpload = (event) => {
  const file = event.target.files[0]
  if (file) admissionLetterFile.value = file
}


const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  isEditing.value = false
  editingStudent.value = null
  profilePictureFile.value = null
  admissionLetterFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  if (profilePicInput.value) profilePicInput.value.value = ''
  if (admissionInput.value) admissionInput.value.value = ''
  studentForm.value = {
    full_name: '',
    email: '',
    admission_date: new Date().toISOString().split('T')[0],
    gender: '',
    phone_number: '',
    profile_picture: '',
    school: '',
    department: '',
    course_duration: '',
    parent_name: '',
    parent_phone: '',
    account_number: '',
    account_name: '',
    bank_name: '',
    school_fees: '',
    remarks: '',
    admission_letter_url: '',
    status: 'active'
  }
}

const uploadFileToSupabase = async (file, bucket) => {
  if (isMock) {
    // Return a mock URL for development
    return `https://mock-storage.com/${bucket}/${file.name}`
  }
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
  const filePath = `${fileName}`

  try {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error(`Upload error to ${bucket}:`, uploadError)
      throw uploadError
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
      
    if (!data || !data.publicUrl) {
      throw new Error('Failed to generate public URL')
    }

    return data.publicUrl
  } catch (err) {
    console.error('File upload failed:', err)
    throw err
  }
}

const handleSubmit = async () => {
  modalLoading.value = true

  try {
    // Dynamically calculate level, status, and years remaining before submit
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed (1-12)
    
    const admissionDate = new Date(studentForm.value.admission_date);
    const admissionYear = admissionDate.getFullYear();
    const admissionMonth = admissionDate.getMonth() + 1; // 1-indexed (1-12)
    const duration = Number(studentForm.value.course_duration);
    
    let calculatedLevel = '100';
    let calculatedStatus = 'active';
    let yearsRemaining = duration;

    if (admissionYear && duration) {
       let yearsPassed = currentYear - admissionYear;
       
       // If current month is before admission month, the full academic year hasn't passed yet
       if (currentMonth < admissionMonth) {
         yearsPassed -= 1;
       }

       if (yearsPassed >= duration) {
         calculatedStatus = 'graduated';
         calculatedLevel = `${duration * 100}`;
         yearsRemaining = 0;
       } else {
         calculatedStatus = 'active';
         // Level is years passed + 1 (e.g. 0 years passed = 100L, 1 year passed = 200L)
         const levelValue = Math.max(1, yearsPassed + 1) * 100;
         calculatedLevel = `${levelValue}`;
         yearsRemaining = Math.max(0, duration - yearsPassed);
       }
    }

    const formData = {
      ...studentForm.value,
      school_fees: parseFloat(studentForm.value.school_fees) || 0,
      level: calculatedLevel,
      status: calculatedStatus,
      years_remaining: yearsRemaining
    }
    
    // Upload profile picture if exists
    if (profilePictureFile.value) {
      const url = await uploadFileToSupabase(profilePictureFile.value, 'profile-pictures')
      formData.profile_picture = url
    }
    
    // Upload admission letter if exists
    if (admissionLetterFile.value) {
      const url = await uploadFileToSupabase(admissionLetterFile.value, 'beneficiary-files')
      formData.admission_letter_url = url
    }

    const databaseColumns = [
      'full_name', 'email', 'admission_date', 'gender', 'phone_number', 
      'profile_picture', 'school', 'department', 'level', 'parent_name', 
      'parent_phone', 'account_number', 'account_name', 'bank_name', 
      'school_fees', 'remarks', 'admission_letter_url', 'status',
      'course_duration', 'years_remaining'
    ]

    const sanitizedData = {}
    databaseColumns.forEach(col => {
      if (formData[col] !== undefined) {
        sanitizedData[col] = formData[col]
      }
    })

    if (isEditing.value) {
      await updateStudent(editingStudent.value.id, sanitizedData)
    } else {
      await createStudent(sanitizedData)
    }

    await loadStudents()
    closeModal()
  } catch (err) {
    console.error('Error saving student / uploading file:', err)
    alert('There was an error saving the student record: ' + (err.message || err))
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
      student.admission_date || '',
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

let adminStudentsChannel = null

const setupAdminStudentsRealtime = () => {
  adminStudentsChannel = supabase
    .channel('admin-students-updates')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => loadStudents())
    .subscribe()
}

import { onUnmounted } from 'vue'

onMounted(async () => {
  await loadStudents()
  setupAdminStudentsRealtime()
  
  // Check if we need to auto-edit a student from query param
  if (route.query.edit) {
    const studentToEdit = students.value.find(s => s.id === route.query.edit)
    if (studentToEdit) {
      editStudent(studentToEdit)
    }
  }
})

onUnmounted(() => {
  if (adminStudentsChannel) {
    supabase.removeChannel(adminStudentsChannel)
  }
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

/* Custom Modal Styles */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .custom-modal-wrapper,
.modal-fade-leave-active .custom-modal-wrapper {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .custom-modal-wrapper,
.modal-fade-leave-to .custom-modal-wrapper {
  transform: scale(0.95) translateY(-20px);
}


/* Custom modal styles moved to global components.css */

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
  gap: 1.25rem;
  margin-top: 1rem;
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
  border-radius: var(--radius-2xl);
  transition: transform 0.35s var(--spring), box-shadow 0.35s var(--spring), border-color 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  padding: 1.25rem;
  cursor: pointer;
  position: relative;
}

.beneficiary-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 4%, transparent) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.beneficiary-card:hover {
  /* transform: translateY(-4px); */
  border-color: color-mix(in srgb, var(--color-primary) 40%, transparent);
}

.beneficiary-card:hover::before {
  opacity: 1;
}


.card-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.name-status {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 0.2rem;
  min-width: 0;
}
.name-status h5 {
  font-weight: 700;
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}
.name-status small {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 500;
}

.avatar-wrapper {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: var(--radius-lg);
  box-sizing: border-box;
  overflow: hidden;
  background-color: color-mix(in srgb, var(--color-primary) 10%, var(--surface));
  border: 1.5px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 15%, transparent);
  transition: transform 0.3s var(--spring);
}

.beneficiary-card:hover .avatar-wrapper {
  transform: scale(1.05);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
  display: block;
}

.avatar-placeholder-lg {
  background: linear-gradient(135deg, var(--color-primary), #10b981);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.card-stats {
  display: flex;
  background: var(--surface);
  border-radius: 14px;
  padding: 0.875rem 0;
  border: 1px dashed color-mix(in srgb, var(--color-primary) 12%, transparent);
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
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 3px;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
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
  padding: 0.25rem 0;
}

.detail-row i {
  font-size: 1rem;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.detail-row:nth-child(1) i {
  color: #0099ff;
  background: rgba(0, 153, 255, 0.1);
}
.detail-row:nth-child(2) i {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.detail-text {
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fee-row {
  display: flex;
  justify-content: space-between !important;
  align-items: center;
  border-top: 1px dashed color-mix(in srgb, var(--border-primary) 70%, transparent);
  padding-top: 0.875rem;
  margin-top: 0.25rem;
}

.fee-label {
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fee-value {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-muted);
}

.card-footer-actions {
  border-top: 1px dashed color-mix(in srgb, var(--border-primary) 70%, transparent);
  display: flex;
  gap: 0.625rem;
  padding-top: 0.875rem;
}

.btn-light-primary {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
  border: 1.5px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  font-weight: 700;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.25s var(--spring);
  width: 100%;
  gap: 0.4rem;
  letter-spacing: 0.01em;
}

.btn-light-primary:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: translateY(-1px);
  
}

.btn-light-secondary {
  background: var(--input-bg);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  font-weight: 600;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s ease;
  width: 100%;
  gap: 0.4rem;
}

.btn-light-secondary:hover {
  background: var(--text-secondary);
  color: white;
  border-color: var(--text-secondary);
  transform: translateY(-1px);
}

</style>