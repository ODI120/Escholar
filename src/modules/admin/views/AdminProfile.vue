<template>
  <AdminLayout>
    <div class="admin-profile-container">
      <div class="page-header mb-4">
        <div class="d-flex align-items-center gap-3">
          <button class="back-btn" @click="router.back()">
            <i class="bi bi-arrow-left"></i>
          </button>
          <div class="header-titles">
            <h2 class="page-title">Admin Profile</h2>
            <p class="page-subtitle">Manage administrative account details and permissions.</p>
          </div>
        </div>
        <div class="header-actions">
          <span v-if="admin?.role === 'super_admin'" class="owner-badge">
            <i class="bi bi-shield-check"></i> System Super Admin
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
          <div class="card summary-card text-center glass-card">
            <div class="avatar-wrapper">
              <div class="profile-avatar-large animated-gradient">
                {{ (admin.full_name || admin.email).charAt(0).toUpperCase() }}
              </div>
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

          <div class="card mt-4 danger-zone glass-card" v-if="isOwnProfile">
            <div class="danger-header">
              <div class="danger-icon"><i class="bi bi-shield-exclamation"></i></div>
              <h4>Account Actions</h4>
            </div>
            <p class="text-secondary small mb-3">Manage your account security and current session.</p>
            <button class="btn-danger-action w-100" @click="handleSignOut">
              <i class="bi bi-box-arrow-right"></i> Sign Out
            </button>
          </div>
        </div>

        <!-- Right: Detailed Info & Editing -->
        <div class="profile-right">
          <div class="card glass-card form-card">
            <div class="card-header between">
              <h3 class="card-title">Account Details</h3>
              <button v-if="!isEditing && (isOwnProfile || canEditRole)" class="btn-sm btn-outline btn-edit-trigger" @click="startEditing">
                <i class="bi bi-pencil"></i> Edit Profile
              </button>
            </div>
            
            <div class="card-body">
              <form @submit.prevent="saveProfile" class="modern-form">
                <div class="row g-4">
                  <div class="col-md-12">
                    <div class="form-group premium-field">
                      <label class="form-label">Full Name</label>
                      <div class="input-with-icon">
                        <i class="bi bi-person input-icon"></i>
                        <input 
                          type="text" 
                          v-model="editForm.full_name" 
                          class="form-control" 
                          :disabled="!isEditing"
                          placeholder="Enter full name"
                        >
                      </div>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="form-group premium-field disabled-field">
                      <label class="form-label">Email Address</label>
                      <div class="input-with-icon">
                        <i class="bi bi-envelope input-icon"></i>
                        <input 
                          type="email" 
                          v-model="editForm.email" 
                          class="form-control" 
                          disabled
                          placeholder="email@example.com"
                        >
                      </div>
                      <small class="text-muted"><i class="bi bi-info-circle"></i> Email address cannot be changed.</small>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group premium-field">
                      <label class="form-label">Account Role</label>
                      <div class="select-wrapper">
                        <select v-model="editForm.role" class="form-select" :disabled="!isEditing || !canEditRole">
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <i class="bi bi-chevron-down select-caret"></i>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group premium-field">
                      <label class="form-label">Account Status</label>
                      <div class="select-wrapper">
                        <select v-model="editForm.status" class="form-select" :disabled="!isEditing || !canEditRole">
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                        <i class="bi bi-chevron-down select-caret"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="isEditing" class="edit-actions mt-5 fade-in-up">
                  <button type="button" class="btn-secondary" @click="cancelEditing" :disabled="saving">
                    Cancel
                  </button>
                  <button type="submit" class="btn-primary btn-save" :disabled="saving">
                    <i class="bi bi-save" v-if="!saving"></i>
                    {{ saving ? 'Saving Changes...' : 'Save Profile' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Change Password form (only for isOwnProfile) -->
          <div class="card glass-card form-card" v-if="isOwnProfile">
            <div class="card-header">
              <h3 class="card-title">Security Settings</h3>
            </div>
            <div class="card-body">
              <form @submit.prevent="updateMyPassword" class="modern-form">
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="form-group premium-field">
                      <label class="form-label">New Password</label>
                      <div class="input-with-icon">
                        <i class="bi bi-lock input-icon"></i>
                        <input type="password" v-model="pwdForm.newPassword" class="form-control" placeholder="Enter new password" minlength="6" required>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group premium-field">
                      <label class="form-label">Confirm Password</label>
                      <div class="input-with-icon">
                        <i class="bi bi-lock input-icon"></i>
                        <input type="password" v-model="pwdForm.confirmPassword" class="form-control" placeholder="Confirm new password" minlength="6" required>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- error/success messages -->
                <p v-if="pwdMessage" :class="{'text-success': pwdSuccess, 'text-danger': !pwdSuccess}" class="mt-3 mb-0 small" style="font-weight:600;">{{ pwdMessage }}</p>
                <div class="edit-actions mt-4">
                  <button type="submit" class="btn-primary btn-save" :disabled="pwdLoading || !pwdForm.newPassword">
                    <i class="bi bi-key"></i> {{ pwdLoading ? 'Updating...' : 'Update Password' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Permissions Overview -->
          <div class="card glass-card features-card">
            <h3 class="card-title mb-4">Permissions Overview</h3>
            <div class="permission-grid">
              <div class="perm-feature-card" :class="{ 'granted': admin.role !== 'viewer' }">
                <div class="perm-icon">
                  <i class="bi" :class="admin.role !== 'viewer' ? 'bi-person-plus' : 'bi-x-circle'"></i>
                </div>
                <div class="perm-content">
                  <h5>Beneficiaries</h5>
                  <p>Create & Edit Students</p>
                </div>
              </div>
              
              <div class="perm-feature-card" :class="{ 'granted': admin.role !== 'viewer' }">
                <div class="perm-icon">
                  <i class="bi" :class="admin.role !== 'viewer' ? 'bi-cash-stack' : 'bi-x-circle'"></i>
                </div>
                <div class="perm-content">
                  <h5>Financials</h5>
                  <p>Record Payments & GPA</p>
                </div>
              </div>

              <div class="perm-feature-card" :class="{ 'granted': admin.role === 'super_admin' }">
                <div class="perm-icon">
                  <i class="bi" :class="admin.role === 'super_admin' ? 'bi-people' : 'bi-x-circle'"></i>
                </div>
                <div class="perm-content">
                  <h5>Administrators</h5>
                  <p>Manage Staff Access</p>
                </div>
              </div>

              <div class="perm-feature-card" :class="{ 'granted': admin.role === 'super_admin' }">
                <div class="perm-icon">
                  <i class="bi" :class="admin.role === 'super_admin' ? 'bi-gear' : 'bi-x-circle'"></i>
                </div>
                <div class="perm-content">
                  <h5>System</h5>
                  <p>Global Configuration</p>
                </div>
              </div>
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
const { getCurrentUser, signOut, updatePassword } = useSupabaseAuth()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const admin = ref(null)
const currentUser = ref(null)
const currentUserRole = ref('')
const isEditing = ref(false)

const pwdForm = ref({ newPassword: '', confirmPassword: '' })
const pwdLoading = ref(false)
const pwdMessage = ref('')
const pwdSuccess = ref(false)

const editForm = ref({
  full_name: '',
  role: '',
  status: ''
})

const isOwnProfile = computed(() => {
  return currentUser.value?.email === admin.value?.email
})

// Only Super Admins can edit ANY role or access another person's profile to edit
const canEditRole = computed(() => {
  return currentUserRole.value === 'super_admin'
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

    if (currentUser.value?.email) {
      const myData = adminList.find(a => a.email === currentUser.value.email)
      if (myData) currentUserRole.value = myData.role
    }

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

const updateMyPassword = async () => {
  if (pwdForm.value.newPassword !== pwdForm.value.confirmPassword) {
    pwdMessage.value = 'Passwords do not match.'
    pwdSuccess.value = false
    return
  }
  pwdLoading.value = true
  pwdMessage.value = ''
  
  try {
    const { error } = await updatePassword(pwdForm.value.newPassword)
    if (error) throw error
    pwdMessage.value = 'Password updated successfully.'
    pwdSuccess.value = true
    pwdForm.value.newPassword = ''
    pwdForm.value.confirmPassword = ''
  } catch(err) {
    pwdMessage.value = err.message || 'Failed to update password.'
    pwdSuccess.value = false
  } finally {
    pwdLoading.value = false
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
/* Page Animations */
.admin-profile-container {
  animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeSlideUp {
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Header Adjustments */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: 1px solid var(--border-primary);
  background: var(--surface);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
}

.back-btn:hover {
  background: var(--bg-primary);
  transform: translateX(-4px);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.back-btn:active {
  transform: translateX(-2px) scale(0.95);
}

.page-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.page-subtitle {
  margin: 0.2rem 0 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Owner Badge */
.owner-badge {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
  text-transform: uppercase;
}

/* Grid Layout */
.profile-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 1rem;
}

/* Premium Glass Cards */
.glass-card {
  background: var(--surface);
  border-radius: 24px;
  border: 1px solid var(--border-primary);
  padding: 1.75rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03), 0 1px 3px rgba(15, 23, 42, 0.02);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.02);
}

/* Avatar with Breathing Gradient */
.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.avatar-wrapper {
  position: relative;
  padding: 4px;
  border-radius: 36px;
  background: linear-gradient(135deg, var(--color-primary), #6366f1, #ec4899);
  background-size: 200% 200%;
  animation: breathingGradient 4s ease infinite;
  margin-bottom: 1.5rem;
}

@keyframes breathingGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.profile-left, .profile-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-avatar-large {
  width: 96px;
  height: 96px;
  border-radius: 32px;
  background: var(--surface);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  border: 4px solid var(--surface);
}

.admin-name-big {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.admin-email-text {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

/* Rich Identity Pills */
.role-status-row {
  display: flex;
  gap: 0.75rem;
}

.role-pill, .status-badge {
  padding: 0.3rem 0.85rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-pill.super_admin { background: rgba(220, 38, 38, 0.1); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.2); }
.role-pill.admin { background: rgba(22, 163, 74, 0.1); color: #16a34a; border: 1px solid rgba(22, 163, 74, 0.2); }
.role-pill.viewer { background: rgba(75, 85, 99, 0.1); color: #4b5563; border: 1px solid rgba(75, 85, 99, 0.2); }

.status-badge.active { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
.status-badge.suspended { background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.2); }

/* Meta Info */
.meta-info {
  width: 100%;
  border-top: 1px solid var(--border-primary);
  padding-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.meta-item .label { color: var(--text-secondary); font-weight: 500; }
.meta-item .value { font-weight: 600; color: var(--text-primary); }

/* Danger Zone */
.danger-zone {
  border: 1px solid rgba(239, 68, 68, 0.2);
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.02) 0%, rgba(239, 68, 68, 0.05) 100%);
}

.danger-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.danger-icon {
  width: 32px;
  height: 32px;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.danger-header h4 {
  margin: 0;
  font-weight: 700;
  font-size: 1.05rem;
  color: #b91c1c;
}

.btn-danger-action {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger-action:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.25);
}

.btn-danger-action:active {
  transform: translateY(0) scale(0.98);
}

/* Modded Forms */
.card-header.between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
}

.btn-edit-trigger {
  border-radius: 12px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.premium-field .form-label {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-tertiary);
  font-size: 1.1rem;
  pointer-events: none;
  transition: color 0.2s;
}

.input-with-icon .form-control {
  padding-left: 2.75rem;
}

.form-control, .form-select {
  border-radius: 14px;
  border: 2px solid transparent;
  background: var(--bg-primary);
  padding: 0.8rem 1rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  width: 100%;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: inset 0 2px 4px rgba(15, 23, 42, 0.02);
}

.form-control:focus, .form-select:focus {
  background: var(--surface);
  border-color: var(--color-primary);
  box-shadow: 0 4px 14px rgba(var(--color-primary-rgb), 0.15), inset 0 2px 4px rgba(15, 23, 42, 0.02);
  outline: none;
}

.form-control:focus ~ .input-icon {
  color: var(--color-primary);
}

.form-control:disabled {
  background: var(--bg-primary);
  opacity: 0.6;
  cursor: not-allowed;
}

.disabled-field small {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.5rem;
  opacity: 0.8;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.select-caret {
  position: absolute;
  right: 1.25rem;
  color: var(--text-secondary);
  pointer-events: none;
  font-size: 1.2rem;
}

.form-select {
  appearance: none;
  padding-right: 3rem;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.fade-in-up {
  animation: fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Feature Cards Grid (Permissions) */
.permission-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.perm-feature-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border: 1px solid transparent;
  opacity: 0.6;
  filter: grayscale(1);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.perm-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--surface);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.25rem;
  color: var(--text-secondary);
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.05);
}

.perm-content h5 {
  margin: 0 0 0.15rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.perm-content p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Active State for Permissions */
.perm-feature-card.granted {
  opacity: 1;
  filter: grayscale(0);
  background: rgba(var(--color-primary-rgb), 0.03);
  border-color: var(--color-primary);
}

.perm-feature-card.granted .perm-icon {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.perm-feature-card.granted:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
  background: rgba(var(--color-primary-rgb), 0.05);
}

/* Global Buttons for Form */
.btn-primary.btn-save {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  border-radius: 14px;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 14px;
}

@media (max-width: 992px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
