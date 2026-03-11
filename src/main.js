import { createApp } from 'vue'
import './styles/main.css'
import App from './App.vue'
import router from './router.js'

// Initialize theme before mounting to prevent flicker
const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme")
  const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  // Default to dark mode, but respect saved preference
  const theme = savedTheme || 'dark'

  if (theme === "light") {
    document.documentElement.classList.add("light-mode")
  } else {
    document.documentElement.classList.remove("light-mode")
  }
}

initializeTheme()

const app = createApp(App)
app.use(router)
app.mount('#app')
