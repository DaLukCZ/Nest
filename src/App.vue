<template>
  <div class="app-shell min-h-screen transition-colors duration-200" :class="{ 'opacity-90': isTransitioning }">
    <!-- Sidebar -->
    <aside class="app-sidebar fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r shadow-sm">
      <!-- Logo -->
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
      <header class="app-header sticky top-0 z-40 border-b h-16 flex-shrink-0">
        <div class="flex items-center justify-between h-full px-6">
          <h2 class="text-xl font-semibold text-gray-900">{{ currentPageTitle }}</h2>
          <div class="flex items-center gap-3">
            <!-- Language Switcher -->
            <div class="relative">
              <Button text rounded @click="showLanguageMenu = !showLanguageMenu"
                v-tooltip.bottom="$t('language.select')" class="language-button !px-3 !py-2">
                <span class="text-lg">{{ currentLanguageFlag }}</span>
                <span class="text-base font-semibold ml-1.5 text-gray-800">{{ currentLanguageCode.toUpperCase()
                  }}</span>
                <i class="pi pi-chevron-down text-sm ml-1 text-gray-500"></i>
              </Button>
              <div v-if="showLanguageMenu"
                class="language-menu absolute right-0 mt-2 w-40 rounded-xl shadow-lg border z-50 py-1.5">
                <div v-for="lang in availableLanguages" :key="lang.code" @click="changeLanguage(lang.code)"
                  class="language-menu-item flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors text-base"
                  :class="{ 'text-blue-600 font-semibold': lang.code === currentLanguageCode, 'text-slate-700': lang.code !== currentLanguageCode }">
                  <span class="text-base">{{ lang.flag }}</span>
                  <span>{{ lang.name }}</span>
                </div>
              </div>
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
const { t } = useI18n()
const isTransitioning = ref(false)

const showLanguageMenu = ref(false)
const currentLanguageCode = ref(getCurrentLanguage())
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

const changeLanguage = (locale) => {
  setLanguage(locale)
  currentLanguageCode.value = locale
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