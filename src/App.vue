<template>
  <div class="app-shell min-h-screen transition-colors duration-200" :class="{ 'opacity-90': isTransitioning }">
    <!-- Sidebar -->
    <aside class="app-sidebar fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r shadow-sm">
      <!-- Logo UDĚLAT POZDĚJI VLASTNI OPRAVDU IKONU-->
      <div
        class="flex items-center gap-3 h-16 px-5 bg-gradient-to-r from-sky-50 to-blue-100 border-b border-blue-200 flex-shrink-0">
        <h1 class="text-lg font-bold text-blue-900 tracking-tight">{{ $t('app.name') }}</h1>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <RouterLink to="/" class="nav-link">
          <i class="pi pi-home w-5 text-center"></i>
          {{ $t('nav.dashboard') }}
        </RouterLink>
        <RouterLink to="/birds" class="nav-link">
          <i class="pi pi-send w-5 text-center"></i>
          {{ $t('nav.birds') }}
        </RouterLink>
        <RouterLink to="/aviaries" class="nav-link">
          <i class="pi pi-building w-5 text-center"></i>
          {{ $t('nav.aviaries') }}
        </RouterLink>
        <RouterLink to="/pairs" class="nav-link">
          <i class="pi pi-heart w-5 text-center"></i>
          {{ $t('nav.pairs') }}
        </RouterLink>
        <RouterLink to="/breeding" class="nav-link">
          <i class="pi pi-chart-line w-5 text-center"></i>
          {{ $t('nav.breeding') }}
        </RouterLink>
        <RouterLink to="/feeding" class="nav-link">
          <i class="pi pi-shopping-cart w-5 text-center"></i>
          {{ $t('nav.feeding') }}
        </RouterLink>
        <RouterLink to="/health" class="nav-link">
          <i class="pi pi-heart w-5 text-center"></i>
          {{ $t('nav.health') }}
        </RouterLink>
        <RouterLink to="/statistics" class="nav-link">
          <i class="pi pi-chart-bar w-5 text-center"></i>
          {{ $t('nav.statistics') }}
        </RouterLink>
        <RouterLink to="/settings" class="nav-link">
          <i class="pi pi-cog w-5 text-center"></i>
          {{ $t('nav.settings') }}
        </RouterLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="ml-64 flex flex-col min-h-screen">
      <!-- Header -->
      <header class="sticky top-0 z-40 h-16 flex-shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div class="flex items-center justify-between h-full px-6">
          <!-- Left -->
          <div class="flex items-center gap-3">
            <div>
              <h2 class="text-xl font-semibold text-slate-900 leading-tight">
                {{ currentPageTitle }}
              </h2>

              <p class="text-xs text-slate-500">
                {{ new Date().toLocaleDateString(locale, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                }) }}
              </p>
            </div>
          </div>

          <!-- Right -->
          <div class="flex items-center gap-4">
            <!-- Language Pills -->
            <div class="flex items-center rounded-2xl bg-slate-100 p-1 border border-slate-200">
              <button v-for="lang in availableLanguages" :key="lang.code" @click="setLanguage(lang.code)"
                class="px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200" :class="locale === lang.code
                  ? 'bg-white shadow-sm text-slate-900 border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/70'
                  ">
                <span class="mr-1">{{ lang.flag }}</span>
                {{ lang.code.toUpperCase() }}
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Click-outside overlay for language menu -->
    <div v-if="showLanguageMenu" @click="showLanguageMenu = false" class="fixed inset-0 z-40"></div>

    <Toast position="top-right" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLanguage, getCurrentLanguage, getAvailableLanguages } from './i18n'
import Button from 'primevue/button'
import Toast from 'primevue/toast'

const route = useRoute()
const { t, locale } = useI18n()
const isTransitioning = ref(false)

const showLanguageMenu = ref(false)

const currentLanguageCode = computed(() => getCurrentLanguage())

const availableLanguages = getAvailableLanguages()

const currentLanguageFlag = computed(() => {
  const lang = availableLanguages.find(l => l.code === currentLanguageCode.value)
  return lang ? lang.flag : '🇨🇿'
})

const currentPageTitle = computed(() => {
  const titles = {
    '/': 'nav.dashboard',
    '/birds': 'nav.birds',
    '/aviaries': 'nav.aviaries',
    '/pairs': 'nav.pairs',
    '/breeding': 'nav.breeding',
    '/feeding': 'nav.feeding',
    '/health': 'nav.health',
    '/statistics': 'nav.statistics',
    '/settings': 'nav.settings',
  }
  return t(titles[route.path] || 'app.title')
})

const changeLanguage = (newLocale) => {
  setLanguage(newLocale)

  showLanguageMenu.value = false
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showLanguageMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.app-shell {
  background: #ffffff;
}

.app-sidebar {
  background: #ffffff;
  border-color: #e5e7eb;
}

.app-header {
  background: rgba(255, 255, 255, 0.96);
  border-color: #e5e7eb;
  backdrop-filter: blur(14px);
}

.language-button {
  color: #1f2937;
}

.language-menu {
  background: #ffffff;
  border-color: #e5e7eb;
  box-shadow: 0 20px 45px -28px rgba(15, 23, 42, 0.35);
}

.language-menu-item:hover {
  background: #f8fafc;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>