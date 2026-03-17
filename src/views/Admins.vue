<template>
  <AdminLayout>
    <div class="page-header mb-4">
      <div>
        <h2 class="page-title">Admins</h2>
        <p class="page-subtitle">Manage access to the Escholar admin portal.</p>
      </div>
      <router-link to="/admin-profile" class="btn-primary as-link">
        My Profile
      </router-link>
    </div>

    <div class="card mb-4 invite-card">
      <h3 class="card-title">Create admin</h3>
      <form class="invite-form" @submit.prevent="createAdminFromForm">
        <div class="field">
          <label>Email</label>
          <input
            v-model="adminForm.email"
            type="email"
            required
            placeholder="admin@example.com"
          />
        </div>
        <div class="field">
          <label>Role</label>
          <select v-model="adminForm.role">
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <div class="actions">
          <span v-if="adminFormMessage" class="invite-message">{{ adminFormMessage }}</span>
          <div class="actions-right">
            <button type="button" class="btn-secondary" @click="resetAdminForm" :disabled="adminFormLoading">
              Clear
            </button>
            <button type="submit" class="btn-primary" :disabled="adminFormLoading">
              {{ adminFormLoading ? 'Saving…' : 'Create Admin' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Admin users</h3>
        <span class="badge">{{ admins.length }} total</span>
      </div>
      <div v-if="adminsError" class="empty-state">
        <p>{{ adminsError }}</p>
      </div>
      <div v-else-if="adminsLoading" class="empty-state">
        <p>Loading admins...</p>
      </div>
      <div v-else-if="admins.length" class="admin-list">
        <div
          v-for="admin in admins"
          :key="admin.id"
          class="admin-item"
          @click="goToAdminProfile(admin)"
        >
          <div class="admin-main">
            <div class="admin-avatar">
              <span>{{ (admin.name || admin.full_name || admin.email).charAt(0).toUpperCase() }}</span>
            </div>
            <div class="admin-text">
              <div class="admin-name-row">
                <span class="admin-name">
                  {{ admin.name || admin.full_name || admin.email.split('@')[0] }}
                </span>
                <span class="role-pill" :class="admin.role">{{ admin.role }}</span>
              </div>
              <div class="admin-email">{{ admin.email }}</div>
            </div>
          </div>
          <div class="admin-meta">
            <div class="admin-status">
              <span class="status-dot" :class="admin.status"></span>
              <span class="status-label">{{ admin.status }}</span>
            </div>
            <div class="admin-last-active">
              Last active: <strong>{{ admin.lastActive }}</strong>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>No admins yet. Use the form above to create your first admin.</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useSupabaseAdmins, useSupabaseAuth } from '../composables/useSupabase.js'

const router = useRouter()

const admins = ref([])
const adminsLoading = ref(false)
const adminsError = ref('')

const adminForm = ref({
  email: '',
  role: 'admin'
})

const adminFormLoading = ref(false)
const adminFormMessage = ref('')

const { getAdmins, createAdmin, ensureAdminForUser } = useSupabaseAdmins()
const { getCurrentUser } = useSupabaseAuth()

const loadAdmins = async () => {
  adminsLoading.value = true
  adminsError.value = ''
  try {
    const { data, error } = await getAdmins()
    if (error) {
      adminsError.value = error.message || 'Unable to load admins.'
    } else {
      admins.value = (data || []).map(a => ({
        ...a,
        lastActive: a.last_active || a.lastActive || '—'
      }))
    }
  } catch (err) {
    adminsError.value = err.message || 'Unable to load admins.'
  } finally {
    adminsLoading.value = false
  }
}

const resetAdminForm = () => {
  adminForm.value = {
    email: '',
    role: 'admin'
  }
  adminFormMessage.value = ''
}

const createAdminFromForm = async () => {
  if (!adminForm.value.email) return

  adminFormLoading.value = true
  adminFormMessage.value = ''

  try {
    const { data, error } = await createAdmin(adminForm.value)
    if (error) {
      adminFormMessage.value = error.message || 'Failed to create admin.'
    } else if (data) {
      admins.value.unshift({
        ...data,
        lastActive: data.last_active || data.lastActive || '—'
      })
      adminFormMessage.value = 'Admin created successfully.'
      resetAdminForm()
    }
  } catch (err) {
    adminFormMessage.value = err.message || 'Failed to create admin.'
  } finally {
    adminFormLoading.value = false
  }
}

const goToAdminProfile = (admin) => {
  router.push({ path: '/admin-profile', query: { id: admin.id } })
}

const ensureCurrentUserAdmin = async () => {
  try {
    const { data, error } = await getCurrentUser()
    if (!data?.user || error) return
    await ensureAdminForUser(data.user)
  } catch (_) {
    // ignore
  }
}

onMounted(() => {
  ensureCurrentUserAdmin().then(loadAdmins)
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.page-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.page-subtitle {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.card {
  background: var(--surface);
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  padding: 1.25rem 1.5rem;
}

.invite-card {
  margin-top: 1rem;
}

.card-title {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
}

.invite-form {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  align-items: flex-end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.field input,
.field select {
  border-radius: 10px;
  border: 1px solid var(--border-primary);
  padding: 0.55rem 0.75rem;
  font-size: 0.9rem;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.invite-message {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.badge {
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  font-size: 0.75rem;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-primary);
}

.role-pill {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.role-pill.owner {
  background: #eef2ff;
  color: #4f46e5;
}

.role-pill.admin {
  background: #ecfdf3;
  color: #15803d;
}

.role-pill.viewer {
  background: #f5f5f5;
  color: #4b5563;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.4rem;
}

.status-dot.active {
  background: #22c55e;
}

.status-dot.invited {
  background: #f97316;
}

.status-label {
  font-size: 0.8rem;
  text-transform: capitalize;
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.admin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0.75rem;
  border-bottom: 1px solid var(--border-primary);
  border-radius: 12px;
  transition: background-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  cursor: pointer;
}

.admin-item:hover {
  background: var(--bg-primary);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.admin-item:last-child {
  border-bottom: none;
}

.admin-main {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-primary);
}

.admin-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.admin-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.admin-email {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.admin-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
  font-size: 0.8rem;
}

.admin-last-active strong {
  font-weight: 600;
}

.empty-state {
  padding: 1.25rem 0.25rem 0.25rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
  padding: 1rem;
  animation: modal-backdrop-fade 0.18s ease-out;
}

.modal-panel {
  width: 100%;
  max-width: 480px;
  background: var(--surface);
  border-radius: 18px;
  border: 1px solid var(--border-primary);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.35);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
  transform: translateY(8px);
  opacity: 0;
  animation: modal-panel-in 0.2s ease-out forwards;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--border-primary);
  background: linear-gradient(
    120deg,
    color-mix(in srgb, var(--color-primary) 10%, transparent),
    transparent 55%
  );
}

.modal-title-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--color-primary);
}

.modal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.modal-subtitle {
  margin: 0.1rem 0 0;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.modal-close {
  border: none;
  background: transparent;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-secondary);
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.modal-close:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
  transform: rotate(4deg);
}

.modal-body {
  padding: 0.9rem 1.25rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.modal-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.88rem;
}

.modal-row .label {
  color: var(--text-secondary);
}

.modal-row .value {
  text-align: right;
}

.permissions {
  list-style: disc;
  padding-left: 1.1rem;
  margin: 0;
  text-align: left;
}

.permissions li {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.modal-footer {
  padding: 0.75rem 1.25rem 1rem;
  border-top: 1px solid var(--border-primary);
  display: flex;
  justify-content: flex-end;
}

@keyframes modal-backdrop-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-panel-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-meta {
    align-items: flex-start;
  }

  .invite-form {
    grid-template-columns: 1fr;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>
