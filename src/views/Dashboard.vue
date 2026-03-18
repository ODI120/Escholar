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
        <p>Top 3 students with the highest GPA</p>
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

          <div class="gpa-chart-section">
            <div class="chart-label">GPA Progression</div>
            <div class="chart-container">
              <canvas class="bar" :id="`gpaChart-${student.id}`"></canvas>
            </div>
          </div>

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
      .order('semester_number', { ascending: true })

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

    // Compute per-student stats
    const studentData = {}
    Object.keys(recordsByStudent).forEach(studentId => {
      const records = recordsByStudent[studentId]
      // Only count semesters with an actual GPA value
      const recorded = records.filter(r => r.gpa !== null && r.gpa !== undefined)
      const averageGPA = recorded.length
        ? recorded.reduce((sum, r) => sum + r.gpa, 0) / recorded.length
        : 0
      studentData[studentId] = {
        averageGPA,
        recordedCount: recorded.length,
        records
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

const MIN_RECORDED_SEMESTERS = 2   // must have at least this many GPA entries to qualify

const getTopStudents = async () => {
  try {
    const academicData = await fetchAcademicRecords(students.value.map(s => s.id))

    const studentsWithGPA = students.value
      .map(student => {
        const data          = academicData[student.id]
        const averageGPA    = data?.averageGPA    || 0
        const recordedCount = data?.recordedCount || 0
        const records       = data?.records       || []

        // Total expected semesters = course_duration × 2
        const courseDuration    = student.course_duration || Math.ceil(parseInt(student.level || 100) / 100)
        const totalExpected     = courseDuration * 2

        // Composite score: high GPA + good completion rate
        // A student with avg 4.8 but only 1 semester scores lower than
        // one with avg 4.5 and 6/8 semesters completed.
        const completionRatio   = totalExpected > 0 ? recordedCount / totalExpected : 0
        const compositeScore    = averageGPA * completionRatio

        return {
          ...student,
          averageGPA,
          recordedCount,
          totalExpected,
          completionRatio: Math.round(completionRatio * 100),  // as %
          compositeScore,
          academicRecords: records
        }
      })
      // Must have at least MIN_RECORDED_SEMESTERS entries with a real GPA
      .filter(s => s.recordedCount >= MIN_RECORDED_SEMESTERS)
      // Sort by composite score (avg GPA weighted by completion rate)
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 3)

    topStudents.value = studentsWithGPA

    await nextTick()
    renderCharts()
  } catch (err) {
    console.error('Error getting top students:', err)
  }
}

const renderCharts = () => {
  // ── Detect dark mode ──────────────────────────────────────────────────
  const isDark = document.documentElement.classList.contains('dark-mode') ||
                 document.body.classList.contains('dark-mode')

  const textColor  = isDark ? '#9CA3AF' : '#4B5563'
  const gridColor  = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const tooltipBg  = isDark ? 'rgba(17,24,39,0.95)' : 'rgba(15,15,30,0.88)'
  const primaryHex = isDark ? '#8475f8' : '#6B59FF'

  topStudents.value.forEach(student => {
    const chartId = `gpaChart-${student.id}`
    const canvas  = document.getElementById(chartId)
    if (!canvas) return

    // Destroy existing chart instance
    if (charts.value[student.id]) {
      charts.value[student.id].destroy()
    }

    // ── Build semester slots from course_duration (or derive from level) ──
    const courseDuration = student.course_duration || Math.ceil(parseInt(student.level || 100) / 100)
    const totalSemesters = courseDuration * 2

    // ── Labels: 1st-100L, 2nd-100L, 1st-200L … (matches StudentDetail) ──
    const allSemesterLabels = []
    for (let semNum = 1; semNum <= totalSemesters; semNum++) {
      const semPos   = semNum % 2 === 0 ? 2 : 1
      const yearNum  = Math.ceil(semNum / 2)
      const ordinal  = semPos === 1 ? '1st' : '2nd'
      allSemesterLabels.push(`${ordinal}-${yearNum * 100}L`)
    }

    // ── Match records by semester_number (same as StudentDetail) ─────────
    const academicRecords = student.academicRecords || []
    const gpasData = allSemesterLabels.map((_, idx) => {
      const semNum  = idx + 1
      const record  = academicRecords.find(r => r.semester_number === semNum)
      return record ? (record.gpa ?? null) : null
    })

    // ── Colour palette (identical to StudentDetail) ───────────────────────
    const backgroundColors = gpasData.map(gpa => {
      if (gpa === null) return isDark ? 'rgba(156,163,175,0.30)' : 'rgba(156,163,175,0.20)'
      if (gpa >= 4.5)   return 'rgba(3,138,82,0.22)'
      if (gpa >= 4.0)   return 'rgba(0,194,255,0.18)'
      if (gpa >= 3.5)   return 'rgba(255,153,0,0.20)'
      const r = parseInt(primaryHex.slice(1,3), 16)
      const g = parseInt(primaryHex.slice(3,5), 16)
      const b = parseInt(primaryHex.slice(5,7), 16)
      return `rgba(${r},${g},${b},0.22)`
    })

    const borderColors = gpasData.map(gpa => {
      if (gpa === null) return isDark ? 'rgba(156,163,175, .5)' : 'rgba(156,163,175, .5)'
      if (gpa >= 4.5)   return '#038a5250'
      if (gpa >= 4.0)   return '#00c2ff50'
      if (gpa >= 3.5)   return '#ff990050'
      if (gpa <= 3.4)   return '#6B59FF50'
      return primaryHex
    })

    const ctx = canvas.getContext('2d')

    charts.value[student.id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: allSemesterLabels,
        datasets: [{
          label: 'GPA per Semester',
          data: gpasData,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false,
          barThickness: 'flex',
          maxBarThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: tooltipBg,
            padding: 10,
            titleFont: { size: 12, weight: '700' },
            bodyFont:  { size: 11 },
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (items) => items[0].label,
              label: (ctx) => {
                if (ctx.parsed.y === null) return '  Not yet recorded'
                return `  GPA: ${ctx.parsed.y.toFixed(2)}`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5.0,
            ticks: {
              font: { size: 10 },
              color: textColor,
              stepSize: 1
            },
            grid: {
              color: gridColor,
              drawBorder: false
            }
          },
          x: {
            ticks: {
              font: { size: 9 },
              color: textColor,
              maxRotation: 45,
              minRotation: 0,
              autoSkip: false
            },
            grid: { display: false }
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
  padding: 1rem 0 0 0;
}

.section-header {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.section-header p{
  font-size: .8rem;
  color: var(--text-secondary);
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.best-students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1rem;
}

.student-card {
  position: relative;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  /* gap: 1rem; */
  overflow: hidden;
}

/* .student-card:hover {
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
} */

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
.student-card .card-header-section{
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: .7rem;
 
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
  position: relative;
  width: 100%;
  height: 180px;   /* canvas height driven by this — matches maintainAspectRatio:false */
}

.chart-container canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.average-gpa-section {
  width: 100%;

}
.bar {
  /* display: flex; */
  width: 100% !important;
  /* align-items: start; */
}

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


  .chart-container {
    height: 140px;
  }

  .avg-value {
    font-size: 1.5rem;
  }
}

</style>