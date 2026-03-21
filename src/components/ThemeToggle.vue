<template>
  <button
    class="theme-toggle"
    @click="toggleTheme"
    :class="{ 'theme-toggle--light': isLight, 'theme-toggle--inline': inline }"
    aria-label="Toggle theme"
  >
    <svg
      class="theme-toggle__icon theme-toggle__icon--sun"
      :class="{ 'theme-toggle__icon--visible': isLight }"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2"/>
    </svg>
    <svg
      class="theme-toggle__icon theme-toggle__icon--moon"
      :class="{ 'theme-toggle__icon--visible': !isLight }"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2"/>
    </svg>
  </button>
</template>

<script setup>
import { useTheme } from "../composables/useTheme"

defineProps({
  inline: {
    type: Boolean,
    default: false
  }
})

const { isLight, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--surface);
  border: 2px solid var(--border-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
  z-index: 1000;
  overflow: hidden;
}

.theme-toggle--inline {
  position: static;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-primary);
  box-shadow: none;
}

.theme-toggle--inline:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.theme-toggle:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-lg), 0 0 20px rgba(0, 0, 0, 0.1);
}

.theme-toggle--inline:hover {
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-toggle__icon {
  width: 24px;
  height: 24px;
  color: var(--text-primary);
  transition: all var(--transition-normal);
  position: absolute;
  opacity: 0;
  transform: rotate(0deg) scale(0.8);
}

.theme-toggle--inline .theme-toggle__icon {
  width: 20px;
  height: 20px;
}

.theme-toggle__icon--visible {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.theme-toggle__icon--sun {
  transform: rotate(-180deg) scale(0.8);
}

.theme-toggle--light .theme-toggle__icon--sun {
  transform: rotate(0deg) scale(1);
}

.theme-toggle__icon--moon {
  transform: rotate(180deg) scale(0.8);
}

.theme-toggle:not(.theme-toggle--light) .theme-toggle__icon--moon {
  transform: rotate(0deg) scale(1);
}
</style>
