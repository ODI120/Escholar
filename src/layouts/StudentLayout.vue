<template>
  <div class="student-layout">
    <nav class="student-sidebar">
      <div class="logo">Escholar Student</div>
      <ul>
        <li><router-link to="/student/dashboard">Dashboard</router-link></li>
        <!-- Add more student links here later -->
      </ul>
    </nav>
    <main class="student-main">
      <header class="student-header">
        <div class="user-info">Student Portal</div>
      </header>
      <div class="content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.student-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-body, #f4f6f9);
}
.student-sidebar {
  width: 250px;
  background-color: var(--bg-sidebar, #1e1e2d);
  color: white;
  padding: 1.5rem;
}
.student-sidebar .logo {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 2.5rem;
  color: white;
}
.student-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.student-sidebar li {
  margin-bottom: 1rem;
}
.student-sidebar a {
  color: #adb5bd;
  text-decoration: none;
  font-weight: 500;
  display: block;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}
.student-sidebar a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}
.student-sidebar a.router-link-active {
  background-color: var(--color-primary, #6B59FF);
  color: white;
}
.student-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.student-header {
  height: 70px;
  background-color: white;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  font-weight: 600;
}
.content {
  padding: 2rem;
  flex: 1;
}
</style>
