<template>
  <AdminLayout>
    <div class="page-header mb-4">
      <div class="d-flex align-items-center gap-3">
        <button class="back-btn" @click="router.back()">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div>
          <h2 class="page-title">Admin Profile</h2>
          <p class="page-subtitle">Manage administrative account details and permissions.</p>
        </div>
      </div>
      <div class="header-actions">
        <span v-if="admin?.role === 'owner'" class="owner-badge">
          <i class="bi bi-shield-check"></i> System Owner
        </span>
      </div>
    </div>

    <div v-if="loading" class="profile-loader">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Fetching profile details...</p>
    </div>

    <div v-else-if="error" class="error-state card">
      <i class="bi bi-exclamation-triangle"></i>
      <h3>Profile Not Found</h3>
      <p>{{ error }}</p>
      <button class="btn-primary mt-3" @click="router.push('/admins')">Back to Admins</button>
    </div>

    <div v-else class="profile-grid">
      <!-- Left: Profile Summary Card -->
      <div class="profile-left">
        <div class="card summary-card text-center">
          <div class="profile-avatar-large">
            {{ (admin.full_name || admin.email).charAt(0).toUpperCase() }}
          </div>
          <h3 class="admin-name-big">{{ admin.full_name || 'Administrator' }}</h3>
          <p class="admin-email-text">{{ admin.email }}</p>
          <div class="role-status-row mt-3">
            <span class="role-pill" :class="admin.role">{{ admin.role }}</span>
            <span class="status-badge" :class="admin.status">{{ admin.status }}</span>
          </div>
          <div class="meta-info mt-4">
            <div class="meta-item">
              <span class="label">Member Since</span>
              <span class="value">{{ formatDate(admin.created_at) }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Last Activity</span>
              <span class="value">{{ admin.last_active ? formatDate(admin.last_active) : 'Just now' }}</span>
            </div>
          </div>
        </div>

        <div class="card mt-4 danger-zone" v-if="isOwnProfile">
          <h4>Account Actions</h4>
          <p class="text-secondary small mb-3">Manage your account security and access sessions.</p>
          <button class="btn-outline-danger w-100" @click="handleSignOut">
            <i class="bi bi-box-arrow-right"></i> Sign Out
          </button>
        </div>
      </div>

      <!-- Right: Detailed Info & Editing -->
      <div class="profile-right">
        <div class="card">
          <div class="card-header between">
            <h3 class="card-title">Account Details</h3>
            <button v-if="!isEditing" class="btn-sm btn-outline" @click="startEditing">
              <i class="bi bi-pencil"></i> Edit Profile
            </button>
          </div>
          
          <div class="card-body">
            <form @submit.prevent="saveProfile">
              <div class="row g-4">
                <div class="col-md-12">
                  <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input 
                      type="text" 
                      v-model="editForm.full_name" 
                      class="form-control" 
                      :disabled="!isEditing"
                      placeholder="Enter full name"
                    >
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="form-group">
                    <label class="form-label">Email Address</label>
                    <input 
                      type="email" 
                      v-model="editForm.email" 
                      class="form-control" 
                      disabled
                      placeholder="email@example.com"
                    >
                    <small class="text-muted">Email address cannot be changed once registered.</small>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Account Role</label>
                    <select v-model="editForm.role" class="form-select" :disabled="!canEditRole">
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label class="form-label">Account Status</label>
                    <select v-model="editForm.status" class="form-select" :disabled="!canEditRole">
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              <div v-if="isEditing" class="edit-actions mt-5">
                <button type="button" class="btn-secondary" @click="cancelEditing" :disabled="saving">
                  Cancel
                </button>
                <button type="submit" class="btn-primary" :disabled="saving">
                  {{ saving ? 'Saving Changes...' : 'Save Profile' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Permissions Overview -->
        <div class="card mt-4">
          <h3 class="card-title mb-3">Permissions Overview</h3>
          <div class="permission-grid">
            <div class="perm-item" :class="{ granted: admin.role !== 'viewer' }">
              <i class="bi" :class="admin.role !== 'viewer' ? 'bi-check-circle-fill' : 'bi-x-circle'"></i>
              <span>Create/Edit Beneficiaries</span>
            </div>
            <div class="perm-item" :class="{ granted: admin.role !== 'viewer' }">
              <i class="bi" :class="admin.role !== 'viewer' ? 'bi-check-circle-fill' : 'bi-x-circle'"></i>
              <span>Record Payments & GPA</span>
            </div>
            <div class="perm-item" :class="{ granted: admin.role === 'owner' }">
              <i class="bi" :class="admin.role === 'owner' ? 'bi-check-circle-fill' : 'bi-x-circle'"></i>
              <span>Manage Admin Users</span>
            </div>
            <div class="perm-item" :class="{ granted: admin.role === 'owner' }">
              <i class="bi" :class="admin.role === 'owner' ? 'bi-check-circle-fill' : 'bi-x-circle'"></i>
              <span>System Settings Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSupabaseAdmins, useSupabaseAuth } from '../../../composables/useSupabase'
import AdminLayout from '../../../layouts/AdminLayout.vue'

const router = useRouter()
const route = useRoute()
const { getAdmins, updateAdmin } = useSupabaseAdmins()
const { getCurrentUser, signOut } = useSupabaseAuth()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const admin = ref(null)
const currentUser = ref(null)
const isEditing = ref(false)

const editForm = ref({
  full_name: '',
  role: '',
  status: ''
})

const isOwnProfile = computed(() => {
  return currentUser.value?.email === admin.value?.email
})

// Only owners can edit roles, and you can't edit your own role unless you're an owner (safety)
const canEditRole = computed(() => {
  // Mock logic: assume requester has permissions if they are owner or accessing their own if owner
  return admin.value?.role === 'owner' || (isOwnProfile.value && admin.value?.role === 'owner')
})

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const loadProfile = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data: userData } = await getCurrentUser()
    currentUser.value = userData?.user

    const adminId = route.query.id
    
    const { data: adminList, error: fetchError } = await getAdmins()
    if (fetchError) throw fetchError

    if (adminId) {
      admin.value = adminList.find(a => a.id === adminId)
    } else if (currentUser.value?.email) {
      admin.value = adminList.find(a => a.email === currentUser.value.email)
    }

    if (!admin.value) {
      error.value = 'We could not find the specified administrator profile.'
    }
  } catch (err) {
    console.error('Error loading profile:', err)
    error.value = 'Failed to load administrator data.'
  } finally {
    loading.value = false
  }
}

const startEditing = () => {
  editForm.value = {
    full_name: admin.value.full_name || '',
    role: admin.value.role,
    status: admin.value.status
  }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
}

const saveProfile = async () => {
  saving.value = true
  try {
    const { data, error: updateError } = await updateAdmin(admin.value.id, editForm.value)
    if (updateError) throw updateError
    
    admin.value = { ...admin.value, ...data }
    isEditing.value = false
    alert('Profile updated successfully.')
  } catch (err) {
    alert('Failed to update profile: ' + (err.message || 'Unknown error'))
  } finally {
    saving.value = false
  }
}

const handleSignOut = async () => {
  if (confirm('Are you sure you want to sign out?')) {
    await signOut()
    router.push('/login')
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border-primary);
  background: var(--surface);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--bg-primary);
  transform: translateX(-2px);
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.page-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.owner-badge {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #fff;
  padding: 0.4rem 0.9rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.profile-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
}

.card {
  background: var(--surface);
  border-radius: 20px;
  border: 1px solid var(--border-primary);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-avatar-large {
  width: 90px;
  height: 90px;
  border-radius: 28px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
  box-shadow: 0 8px 24px rgba(var(--color-primary-rgb), 0.15);
}

.admin-name-big {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.admin-email-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.role-status-row {
  display: flex;
  gap: 0.75rem;
}

.role-pill {
  padding: 0.2rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.role-pill.owner { background: #fee2e2; color: #dc2626; }
.role-pill.admin { background: #dcfce7; color: #166534; }
.role-pill.viewer { background: #f3f4f6; color: #4b5563; }

.status-badge {
  padding: 0.2rem 0.75rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active { background: #ecfdf5; color: #10b981; }
.status-badge.suspended { background: #fff1f2; color: #f43f5e; }

.meta-info {
  width: 100%;
  border-top: 1px solid var(--border-primary);
  padding-top: 1.25rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
}

.meta-item .label { color: var(--text-secondary); }
.meta-item .value { font-weight: 600; color: var(--text-primary); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--border-primary);
  padding: 0.4rem 0.8rem;
  border-radius: 10px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: var(--bg-primary);
}

.form-label {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  display: block;
}

.form-control, .form-select {
  border-radius: 12px;
  border: 1.5px solid var(--border-primary);
  padding: 0.65rem 0.9rem;
  font-size: 0.95rem;
  background: var(--bg-primary);
  width: 100%;
}

.form-control:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.permission-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.perm-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--bg-primary);
  font-size: 0.85rem;
  opacity: 0.6;
}

.perm-item.granted {
  opacity: 1;
  background: var(--color-primary-light);
}

.perm-item i { font-size: 1.1rem; }
.perm-item.granted i { color: var(--color-primary); }

.detail-card h4 { margin: 0 0 0.5rem; font-size: 0.95rem; font-weight: 700; }

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.error-state i {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.profile-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 0;
  gap: 1rem;
  color: var(--text-secondary);
}

@media (max-width: 992px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
