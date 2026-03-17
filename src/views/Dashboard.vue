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

    <!-- best students -->
    <div class="best-students-section">
      <div class="section-header">
        <h5 class="section-title">Best Performing Students</h5>
      </div>
      <div v-if="topStudents.length === 0" class="text-center py-5 text-muted">
        <p>No academic records available yet</p>
      </div>

      <div v-else class="best-students-grid">
        <div v-for="student in topStudents" :key="student.id" class="student-card">
          <div class="card-header-section">
            <div class="card-avatar">
              <img
                v-if="student.profile_picture"
                :src="student.profile_picture"
                :alt="student.full_name"
              >
              <div v-else class="avatar-initial">
                {{ student.full_name.charAt(0).toUpperCase() }}
              </div>
            </div>

            <div class="card-info">
              <h6 class="card-name">{{ student.full_name }}</h6>
              <small>
                {{ student.school }} |
                {{ student.level }}L
              </small>
            </div>
          </div>

          <hr>

          <div class="gpa-chart-section">
            <div class="chart-label">GPA Progression</div>
            <div class="chart-container">
              <canvas class="bar" :id="`gpaChart-${student.id}`"></canvas>
            </div>
          </div>

          <!-- <div class="average-gpa-section">
            <div class="avg-label">Average GPA</div>
            <div class="avg-value">{{ student.averageGPA.toFixed(2) }}</div>
          </div> -->
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
import { ref, onMounted, nextTick } from 'vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import { useSupabaseStudents } from '../composables/useSupabase.js'
import { supabase } from '../composables/useSupabase.js'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const { getStudents } = useSupabaseStudents()

const loading = ref(true)
const students = ref([])
const topStudents = ref([])
const charts = ref({})
const stats = ref({
  totalStudents: 0,
  graduatedStudents: 0,
  nonGraduated: 0,
  fundsDisbursed: 0
})

const recentStudents = ref([])

const fetchAcademicRecords = async (studentIds) => {
  try {
    const { data, error } = await supabase
      .from('academic_records')
      .select('*')
      .in('student_id', studentIds)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching academic records:', error)
      return {}
    }

    // Group records by student_id
    const recordsByStudent = {}
    data?.forEach(record => {
      if (!recordsByStudent[record.student_id]) {
        recordsByStudent[record.student_id] = []
      }
      recordsByStudent[record.student_id].push(record)
    })

    // Calculate average GPA and prepare data
    const studentData = {}
    Object.keys(recordsByStudent).forEach(studentId => {
      const records = recordsByStudent[studentId]
      const averageGPA = records.reduce((sum, r) => sum + r.gpa, 0) / records.length
      studentData[studentId] = {
        averageGPA,
        records: records
      }
    })

    return studentData
  } catch (err) {
    console.error('Error in fetchAcademicRecords:', err)
    return {}
  }
}

const getGPAColor = (gpa) => {
  if (gpa >= 4.5) return '#038a52' // Excellent - Green
  if (gpa >= 4.0) return '#00c2ff' // Very Good - Cyan
  if (gpa >= 3.5) return '#ff9900' // Good - Orange
  return '#6B59FF' // Average - Purple
}

const getTopStudents = async () => {
  try {
    const academicData = await fetchAcademicRecords(students.value.map(s => s.id))
    
    // Add academic data to each student
    const studentsWithGPA = students.value
      .map(student => ({
        ...student,
        averageGPA: academicData[student.id]?.averageGPA || 0,
        academicRecords: academicData[student.id]?.records || []
      }))
      .filter(student => student.averageGPA > 0) // Only show students with academic records
      .sort((a, b) => b.averageGPA - a.averageGPA)
      .slice(0, 3)

    topStudents.value = studentsWithGPA
    
    // Render charts after DOM update
    await nextTick()
    renderCharts()
  } catch (err) {
    console.error('Error getting top students:', err)
  }
}

const renderCharts = () => {
  topStudents.value.forEach(student => {
    const chartId = `gpaChart-${student.id}`
    const canvas = document.getElementById(chartId)
    
    if (!canvas) return
    
    // Destroy existing chart if it exists
    if (charts.value[student.id]) {
      charts.value[student.id].destroy()
    }

    // Calculate expected semesters based on level
    const currentLevel = parseInt(student.level)
    const expectedSemesters = (currentLevel / 100) * 2
    
    // Generate all semester labels expected for this level
    const allSemesterLabels = []
    for (let i = 1; i <= expectedSemesters; i++) {
      const year = Math.ceil(i / 2)
      const sem = i % 2 === 0 ? '2nd' : '1st'
      allSemesterLabels.push(`${sem} - ${year}L`)
    }

    // Create a map of existing academic records for quick lookup
    const academicRecords = student.academicRecords || []
    const gpaMap = {}
    academicRecords.forEach(record => {
      const key = `${record.semester} ${record.session}`
      gpaMap[key] = record.gpa
    })

    // Build data array with all expected semesters
    const gpasData = allSemesterLabels.map(label => {
      // Try to find matching record
      const matchingRecord = academicRecords.find(r => 
        `${r.semester} ${r.session}`.toLowerCase().includes(label.toLowerCase().split(' ')[0])
      )
      return matchingRecord ? matchingRecord.gpa : null
    })
    
    const ctx = canvas.getContext('2d')
    
    // Create color array - filled for existing data, lighter for null
    const backgroundColors = gpasData.map((gpa, idx) => {
      if (gpa === null) return 'rgba(200, 200, 200, 0.3)' // Gray for future/missing
      if (gpa >= 4.5) return '#038a5225' // Green
      if (gpa >= 4.0) return '#00c2ff25' // Cyan
      if (gpa >= 3.5) return '#ff990025' // Orange
      return '#6B59FF25' // Purple
    })
    
    const borderColors = gpasData.map((gpa, idx) => {
      if (gpa === null) return 'rgba(200, 200, 200, 0.5)'
      if (gpa >= 4.5) return '#038a52'
      if (gpa >= 4.0) return '#00c2ff'
      if (gpa >= 3.5) return '#ff9900'
      return '#6B59FF'
    })
    
    charts.value[student.id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: allSemesterLabels,
        datasets: [
          {
            label: 'GPA',
            data: gpasData,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: .5,
            borderRadius: 6 ,
            borderSkipped: false
          }
        ]
      },
      options: {
        indexAxis: undefined,
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: function(context) {
                if (context.parsed.y === null) {
                  return 'Not completed'
                }
                return `GPA: ${context.parsed.y.toFixed(2)}`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5.0,
            ticks: {
              font: { size: 11 },
              color: 'var(--text-secondary)'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            }
          },
          x: {
            ticks: {
              font: { size: 11 },
              color: 'var(--text-secondary)'
            },
            grid: {
              display: false
            }
          }
        }
      }
    })
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const { data, error } = await getStudents()
    if (!error && data) {
      students.value = data
      calculateStats()
      await getTopStudents()
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
    width: 50px;
    height:50px;
    background: var(--color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
    font-size: 1rem;
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

/* Best Students Section */
.best-students-section {
  margin-bottom: 1rem;
  margin-top: 1rem;
  padding: 1rem 0  0 0;
  /* border: 1px solid var(--border-primary); */
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.best-students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.card-header-section {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 1rem;
}

.student-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 1rem;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-avatar {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-subtle);
  overflow: hidden;
  border: 2px solid var(--border-color);
  flex-shrink: 0;
}

.card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initial {
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.4rem;
  width: 100%;
  height: 100%;
}

.student-card .card-header-section .card-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.25rem;
  flex: 1;
}

.student-card .card-header-section .card-info small {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.card-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-meta {
  margin-bottom: 1rem;
}

.level-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: var(--background-subtle);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.gpa-chart-section {
  width: 100%;
  padding: 1rem 0;
}

.chart-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.chart-container {
  width: 100%;
  /* height: 200px; */
  /* position: relative;
  margin-bottom: 1rem; */
}

.chart-container canvas {
  max-height: 200px;
}

.average-gpa-section {
  width: 100%;
  /* padding: 1rem;
  background: var(--background-subtle);
  border-radius: var(--radius-md);
  text-align: center;
  border: 1px solid var(--border-color);
  margin-top: 1rem; */
}
/* .bar {
  display: flex;
  width: 100%;
  align-items: start;
} */

.avg-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.avg-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

@media screen and (max-width: 1024px) {
  .best-students-grid {
    grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
    gap: 1.25rem;
  }

  .chart-container {
    height: 180px;
  }

  .avg-value {
    font-size: 2rem;
  }
}

@media screen and (max-width: 768px) {
  .best-students-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
  }

  .student-card {
    padding: 1rem;
  }

  .card-avatar {
    width: 50px;
    height: 50px;
  }

  .avatar-initial {
    font-size: 1.1rem;
  }

  .card-name {
    font-size: 0.95rem;
  }

  .chart-container {
    height: 160px;
    margin-bottom: 0.75rem;
  }

  .avg-value {
    font-size: 1.75rem;
  }
}

@media screen and (max-width: 480px) {
  .best-students-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .card-header-section {
    /* flex-direction: column; */
    /* align-items: center;
    text-align: center; */
  }

  .student-card .card-header-section .card-info {
    /* align-items: center; */
  }

  .chart-container {
    height: 140px;
  }

  .avg-value {
    font-size: 1.5rem;
  }
}

</style>