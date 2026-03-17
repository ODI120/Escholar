<template>
  <AdminLayout>


    <div class="page-header">
      <div class="page-header-content">
        <h1>Overview summary</h1>
        <p>Welcome back, here's what's happening with your scholarship program</p>
      </div>
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

    <div class="best-students">
      <div class="best-students-header">
        <h5 class="best-students-title">Best Students</h5>
      </div>
      <div class="best-students-body">
        <div class="best-students-item">
          <div class="best-students-item-avatar"></div>
        </div>
      </div>
    </div>

    <!-- Recent Students -->
    <div class="cards">
      <div class="card-header">
        <h5 class="card-title">Recent Activities</h5>
        <!-- <router-link to="/admin/students" class="view-all">View All</router-link> -->
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
          <div class="table table-hover">
            
            
              <router-link :to="`/students/${student.id}`" class="row" v-for="student in recentStudents" :key="student.id">
                <div class="item">
                  <div class="avatar-container">
                    <div class="avatar">
                      <img
                        v-if="student.profile_picture"
                        :src="student.profile_picture"
                        :alt="student.full_name"
                        
                      >
                      <div v-else class="avatar-placeholder rounded-circle">
                        {{ student.full_name.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <div class="info">
                      <div class="name">{{ student.full_name }}</div>
                      <small class="level">
                        {{ student.school }} | {{ student.level }}L
                      </small>
                      <small class="text-muted" style="font-size: 0.75rem;">
                        Added: {{ new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                      </small>
                    </div>
                  </div>
                </div>
                
              </router-link>
            
          </div>
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

/* ---------------------------------------- */
  .stat-card {
    background: var(--card-bg);
    border-radius: var(--radius-lg);
    padding: 1rem;
    display: flex;
    flex: 1;
    align-items: center;
    gap: 1rem;
    transition: all var(--transition-fast);
    box-sizing: border-box;
    box-shadow: var(--shadow-xs);
  }
  .stats{
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    box-sizing: border-box;
    margin-bottom: 1rem;
  }
  @media screen and (max-width: 425px) {
    .stats{
      gap: .5rem;
      flex-direction: column;
    }
    .stat-card{
      padding: .5rem 1rem;
    }
  }
   

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

/* ------------- */
a{
  text-decoration: none;
  color: var(--text-primary);
}
  

/* ------------- */
 

  .avatar-container{
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
  }
  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #038a5229;
    overflow: hidden;
    gap: 1rem;
    border-radius: 4px;
    box-sizing: border-box;

  }

  .avatar img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 8px;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    background: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
    font-size: .4rem;
  }

.info{
  display: flex;
  flex-direction: column;
  gap: .2rem;
}
.name{
  font-weight: 600;
  font-size: 1rem;
}
.level{
  font-weight: 400;
  font-size: .8rem;
  color: var(--text-secondary);
}

</style>