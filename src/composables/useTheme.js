import { ref, computed, onMounted, watch } from 'vue'

// Klíč pro uložení volby v localStorage
const THEME_KEY = 'nest-theme'
// Aplikace v současné době používá pouze světlý motiv (asi ani dark mode nebude potřeba)
const LIGHT_THEME = 'light'
const isDark = ref(false)
const isTransitioning = ref(false)

const getSystemTheme = () => {
  return LIGHT_THEME
}

// Pokuší se načíst uloženou preferenci; pokud nebyla uložena, vrátí systémovou
const getSavedTheme = () => {
  return localStorage.getItem(THEME_KEY) === 'dark' ? LIGHT_THEME : getSystemTheme()
}

const applyTheme = (theme) => {
  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }

  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff')
  }
}

const setTheme = (theme, skipTransition = false) => {
  if (!skipTransition) {
    isTransitioning.value = true
    setTimeout(() => {
      isTransitioning.value = false
    }, 300)
  }

  isDark.value = false
  applyTheme(LIGHT_THEME)
  localStorage.setItem(THEME_KEY, LIGHT_THEME)
}

export const initializeTheme = () => {
  isDark.value = false
  applyTheme(LIGHT_THEME)
  localStorage.setItem(THEME_KEY, LIGHT_THEME)
}

export function useTheme() {
  const toggleTheme = () => {
    setTheme(LIGHT_THEME)
  }

  onMounted(() => {
    setTheme(LIGHT_THEME, true)
  })

  watch(isDark, (newValue) => {
    applyTheme(newValue ? 'dark' : LIGHT_THEME)
  })

  return {
    isDark: computed(() => isDark.value),
    isTransitioning: computed(() => isTransitioning.value),
    currentTheme: computed(() => LIGHT_THEME),
    toggleTheme,
    setTheme: (theme) => setTheme(theme),
    getSystemTheme,
    getSavedTheme
  }
}
