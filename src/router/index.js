import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import BirdsView from '../views/BirdsView.vue'
import AviariesView from '../views/AviariesView.vue'
import PairsView from '../views/PairsView.vue'
import BreedingView from '../views/BreedingView.vue'
import FeedingView from '../views/FeedingView.vue'
import HealthView from '../views/HealthView.vue'
import StatisticsView from '../views/StatisticsView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Hlavní přehled — první stránka po otevření aplikace
    {
      path: '/',
      component: DashboardView,
    },
    // Správa ptáků — přidávání, úprava, mazání
    {
      path: '/birds',
      component: BirdsView,
    },
    // Voliéry — přehled s obsazeností
    {
      path: '/aviaries',
      component: AviariesView,
    },
    // Chovné páry — kdo s kým
    {
      path: '/pairs',
      component: PairsView,
    },
    // Záznamy o hnízdění — průběh chovného cyklu
    {
      path: '/breeding',
      component: BreedingView,
    },
    // Krmení — co a kolik dostaly jednotlivé voliéry
    {
      path: '/feeding',
      component: FeedingView,
    },
    // Zdravotní záznamy — nemoci, prohlídky, léky
    {
      path: '/health',
      component: HealthView,
    },
    // Statistiky — grafy a přehledy
    {
      path: '/statistics',
      component: StatisticsView,
    },
    // Nastavení — jazyk, motiv, export/import dat
    {
      path: '/settings',
      component: SettingsView,
    },
  ],
})

export default router
