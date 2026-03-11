import { ref, onMounted } from "vue"

const isLight = ref(false)

// Function to get system theme preference
const getSystemTheme = () => {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Function to apply theme immediately
const applyTheme = (theme) => {
  if (theme === "light") {
    document.documentElement.classList.add("light-mode")
    isLight.value = true
  } else {
    document.documentElement.classList.remove("light-mode")
    isLight.value = false
  }
  localStorage.setItem("theme", theme)
}

// Initialize theme on load
const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme")
  const theme = savedTheme || 'dark' // Default to dark mode
  applyTheme(theme)
}

export function useTheme() {
  const toggleTheme = () => {
    if (isLight.value) {
      applyTheme("dark")
    } else {
      applyTheme("light")
    }
  }

  // Initialize theme immediately
  initializeTheme()

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    // Only apply system theme if no saved preference
    if (!localStorage.getItem("theme")) {
      applyTheme(e.matches ? 'dark' : 'light')
    }
  })

  return {
    isLight,
    toggleTheme
  }
}
