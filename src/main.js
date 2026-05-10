import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { i18n, initializeLocale, getCurrentLanguage, getPrimeVueLocale } from './i18n'
import { initializeTheme } from './composables/useTheme'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'

import 'primeicons/primeicons.css'
import './assets/main.css'

// Nastavíme téma (světlé/tmavé) ještě před mountováním, aby nedošlo k probliknutí
initializeTheme()
// Načteme uložený jazyk z localStorage (nebo použijeme výchozí češtinu)
initializeLocale()
const initialLocale = getCurrentLanguage()

const app = createApp(App)

app.use(router)
app.use(i18n)

// PrimeVue — UI knihovna; Aura je vizulní předvolba, tmavý režim říí třída .dark na <html>
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark',
      // CSS vrstvy zajišťují správné pořadí specificity mezi Tailwindem a PrimeVue
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, primevue, tailwind-utilities'
      }
    }
  },
  locale: getPrimeVueLocale(initialLocale),
  ripple: true
})
app.use(ToastService)

app.mount('#app')
