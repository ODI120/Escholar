<template>
  <StudentLayout>
    <div class="dashboard-container">
      <h1>Student Dashboard</h1>
      <p>Welcome to the new student portal!</p>
      
      <div class="dashboard-cards">
        <div class="card">
          <h3>Your Profile</h3>
          <p>View and edit your personal information.</p>
        </div>
        <div class="card">
          <h3>Academic Records</h3>
          <p>Check your GPA and semester results.</p>
        </div>
      </div>
    </div>
  </StudentLayout>
</template>

<script setup>
import StudentLayout from '../../../layouts/StudentLayout.vue'
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}
h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary, #333);
  margin-bottom: 0.5rem;
}
p {
  color: var(--text-secondary, #666);
}
.dashboard-cards {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
}
.card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  flex: 1;
  border: 1px solid var(--border-color, #eee);
}
.card h3 {
  margin-top: 0;
  font-size: 1.2rem;
  color: var(--text-primary, #333);
}
.card p {
  margin-bottom: 0;
  font-size: 0.95rem;
}
</style>
