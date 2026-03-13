<template>
  <AdminLayout>
    <!-- <template #header-actions>
      <button class="btn btn-primary" @click="refreshData">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="23,4 23,10 17,10"/>
          <polyline points="1,20 1,14 7,14"/>
          <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4l-4.64,4.36A9,9,0,0,1,3.51,15"/>
        </svg>
        Refresh
      </button>
    </template> -->

    <div class="page-header">
      <div class="page-header-content">
        <h1>Overview summary</h1>
        <p>Welcome back, here's what's happening with your scholarship program</p>
      </div>
      <!-- <div class="page-header-actions">
            <button class="btn btn-primary" @click="refreshData">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="23,4 23,10 17,10"/>
                    <polyline points="1,20 1,14 7,14"/>
                    <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4l-4.64,4.36A9,9,0,0,1,3.51,15"/>
                </svg>
                Refresh
            </button>
        </div> -->
    </div>

    <!-- Stats Cards -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="bi bi-people"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.totalStudents }}</h3>
          <p class="stat-label">Total Beneficiaries</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="bi bi-mortarboard"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.graduatedStudents }}</h3>
          <p class="stat-label">Graduates</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="bi bi-book"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stats.nonGraduated }}</h3>
          <p class="stat-label">Non‑Graduates</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <i class="bi bi-cash-coin"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">₦{{ formatCurrency(stats.fundsDisbursed) }}</h3>
          <p class="stat-label">Funds Disbursed</p>
        </div>
      </div>
    </div>

    <!-- Recent Students -->
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">Recent Students</h5>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="loader"></div>
          <span class="visually-hidden">Loading...</span>
        </div>

        <div v-else-if="recentStudents.length === 0" class="text-center py-4">
          <p class="text-muted mb-0">No students found</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Student</th>
                <th>School</th>
                <th>Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in recentStudents" :key="student.id">
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
                      <small class="text-muted">
                        {{ student.email || student.phone_number || '' }}
                      </small>
                    </div>
                  </div>
                </td>
                <td>{{ student.school }}</td>
                <td>{{ student.level }}</td>
                <td>
                  <span class="badge" :class="getStatusBadgeClass(student.status)">
                    {{ student.status }}
                  </span>
                </td>
                <td>
                  <router-link :to="`/students/${student.id}`" class="btn btn-sm btn-outline-primary">
                    View
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useSupabaseStudents } from '../composables/useSupabase.js'

const { getStudents } = useSupabaseStudents()

const loading = ref(true)
const students = ref([])
const stats = ref({
  totalStudents: 0,
  graduatedStudents: 0,
  nonGraduated: 0,
  fundsDisbursed: 0
})

const recentStudents = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const { data, error } = await getStudents()
    if (!error && data) {
      students.value = data
      calculateStats()
      recentStudents.value = data.slice(0, 5) // Show last 5 students
    }
  } catch (err) {
    console.error('Error loading students:', err)
  } finally {
    loading.value = false
  }
}

const calculateStats = () => {
  const total = students.value.length
  const graduated = students.value.filter(s => s.status === 'graduated').length
  const funds = students.value.reduce((sum, s) => {
    if (s.payments && Array.isArray(s.payments)) {
      return sum + s.payments.reduce((sub, p) => sub + (p.amount || 0), 0)
    }
    return sum
  }, 0)

  stats.value = {
    totalStudents: total,
    graduatedStudents: graduated,
    nonGraduated: total - graduated,
    fundsDisbursed: funds
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

const refreshData = () => {
  loadData()
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG').format(amount || 0)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--card-bg);
    padding: .75rem;
    border-radius: var(--radius-lg);
    margin-bottom: 1rem;
    box-shadow: var(--shadow-xs);
    border: 1px solid var(--border-primary);
 
  }

  .page-header .page-header-content h1 {
    font-size: clamp(1.2rem, 1.5rem, 2rem);
    font-weight: 600;
    margin: 0;
  }
  .page-header .page-header-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
  }

  .page-header .page-header-content p {
    font-size: clamp(0.8rem, .4rem, .4rem);
    color: var(--text-muted);
    margin: 0;
  }

  .page-header .page-header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .page-header .page-header-actions .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .page-header .page-header-actions .btn svg {
    width: 16px;
    height: 16px;
  }

  .page-header .page-header-actions .btn:hover {
    background: var(--color-primary);
    color: var(--text-primary);
  }
  
  .stat-card {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: 1rem;
    display: flex;
    flex: 1;
    align-items: center;
    gap: 1rem;
    transition: all var(--transition-fast);
    margin-bottom: 1rem;
    box-sizing: border-box;
    box-shadow: var(--shadow-xs);
  }
  .stats{
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    box-sizing: border-box;
  }
  /* .stat-card:hover {
    border: 1px solid var(--color-primary);
  } */

  .stat-icon {
    width: 48px;
    height: 48px; 
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .stat-icon i{
    font-size: clamp(1rem, 1.5rem, 2rem);
  }
  .stat-card:nth-child(1) {
    background: #6B59FF29;
    color: var(--color-primary);
    border: 1px solid #6B59FF25;
    .stat-icon{
      background: #6B59FF25;
      color: #6B59FF;
    }
  }
  .stat-card:nth-child(2) {
    background: #ff990029;
    color: var(--color-primary);
    border: 1px solid #ff990025;
    .stat-icon{
      background: #ff990025;
      color: #ff9900;
    }
  }
  .stat-card:nth-child(3) {
    background: #00c2ff29;
    color: var(--color-primary);
    border: 1px solid #00c2ff25;
    .stat-icon{
      background: #00c2ff25;
      color: #00c2ff;
    }
  }
  .stat-card:nth-child(4) {
    background: #038a5229;
    color: var(--text-primary);
    border: 1px solid #038a5225;
    .stat-icon{
      background: #038a5225;
      color: #038a52;
    }
  }
  

  /* .stat-icon svg {
    width: 24px;
    height: 24px;
    stroke: currentColor;
    stroke-width: 2;
  } */

  .stat-content h3 {
    font-size: 2rem;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0;
  }

  .stat-label {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin: 0.25rem 0 0 0;
  }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
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

  .table {
    color: var(--text-primary);
  }

  .table th {
    background: var(--surface);
    border-bottom: 1px solid var(--border-primary);
    color: var(--text-secondary);
    font-weight: 600;
    padding: 1rem;
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

  .btn-outline-primary {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .btn-outline-primary:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
  }
</style>