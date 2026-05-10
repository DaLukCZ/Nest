<template>
  <div class="space-y-5">
    <!-- Welcome Banner -->
    <div class="bg-gradient-to-r from-sky-50 to-blue-100 border border-blue-200 rounded-xl p-6">
      <h1 class="text-2xl font-bold text-slate-900 mb-1">{{ $t("dashboard.welcome.title") }}</h1>
      <p class="text-slate-600 text-base">{{ $t("dashboard.welcome.subtitle") }}</p>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard :label="$t('dashboard.metrics.totalBirds')" :value="stats.totalBirds" icon="pi pi-send" color="blue" />
      <StatCard :label="$t('dashboard.metrics.activePairs')" :value="stats.activePairs" icon="pi pi-heart"
        color="green" />
      <StatCard :label="$t('dashboard.metrics.totalHatchlings')" :value="stats.totalHatchlings" icon="pi pi-star"
        color="purple" />
      <StatCard :label="$t('dashboard.metrics.successRate')" :value="`${stats.successRate}%`" icon="pi pi-percentage"
        color="orange" />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Species Distribution -->
      <div class="card p-5">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("dashboard.charts.speciesDistribution") }}</h3>
        <div v-if="loading" class="h-48 flex items-center justify-center">
          <i class="pi pi-spin pi-spinner text-3xl text-gray-300"></i>
        </div>
        <Chart v-else type="doughnut" :data="speciesChartData" :options="{
          ...doughnutOptions,
          responsive: true,
          maintainAspectRatio: false
        }" class="w-full" :style="{ height: '400px' }" />
      </div>

      <!-- Recent Activities -->
      <div class="card p-5">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("dashboard.charts.recentActivities") }}</h3>
        <div v-if="!recentActivities.length" class="text-center py-8 text-slate-500 text-base">Žádná nedávná aktivita
        </div>
        <div v-else class="space-y-3">
          <div v-for="act in recentActivities" :key="act.id" class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <div :class="['p-2 rounded-full flex-shrink-0', act.iconBg]">
              <i :class="[act.icon, 'text-sm', act.iconColor]"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-gray-900 truncate">{{ act.title }}</p>
              <p class="text-sm text-slate-600 truncate">{{ act.description }}</p>
            </div>
            <span class="text-sm text-slate-500 flex-shrink-0">{{ act.timeAgo }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Breeding Cycles -->
    <div class="card p-5">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("dashboard.charts.activeBreedingCycles") }}</h3>
      <div v-if="!activeCycles.length" class="text-center py-8 text-slate-500 text-base">Žádné aktivní chovné cykly
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="cycle in activeCycles" :key="cycle.id" class="border border-gray-200 rounded-lg p-4 bg-white">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h4 class="text-base font-medium text-gray-900">{{ getPairLabel(cycle.pairId) }}</h4>
              <p class="text-sm text-slate-600">Začátek: {{ formatDate(cycle.breedingCycleStart) }}</p>
            </div>
            <div class="text-right">
              <p class="text-base font-medium text-gray-900">{{ cycle.eggsLaid }} vajec</p>
              <p class="text-sm text-slate-600">{{ cycle.hatchedChicks }} vylíhnuto</p>
            </div>
          </div>
          <OccupancyBar :current="cycle.hatchedChicks" :capacity="cycle.eggsLaid" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useI18n } from "vue-i18n"
import { birdsApi, pairsApi, breedingApi, feedingApi } from "../services/api"
import { formatDate, formatTimeAgo } from "../utils"
import { SPECIES_COLORS } from "../constants"
import StatCard from "../components/StatCard.vue"
import OccupancyBar from "../components/OccupancyBar.vue"
import Chart from "primevue/chart"

const { t } = useI18n()
const birds = ref([])
const pairs = ref([])
const breedingRecords = ref([])
const feedingLogs = ref([])
const loading = ref(false)

const stats = computed(() => {
  const totalBirds = birds.value.length
  const activePairs = pairs.value.filter((p) => p.active).length
  const totalHatchlings = breedingRecords.value.reduce((s, r) => s + (r.survivedChicks || 0), 0)
  const totalEggs = breedingRecords.value.reduce((s, r) => s + (r.eggsLaid || 0), 0)
  const successRate = totalEggs > 0 ? Math.round((totalHatchlings / totalEggs) * 100) : 0
  return { totalBirds, activePairs, totalHatchlings, successRate }
})

const speciesChartData = computed(() => {
  const counts = {}
  birds.value.forEach((b) => { counts[b.species] = (counts[b.species] || 0) + 1 })
  const labels = Object.keys(counts)
  return {
    labels,
    datasets: [{
      data: Object.values(counts),
      backgroundColor: labels.map((l) => SPECIES_COLORS[l] || "#94a3b8"),
      borderWidth: 0,
    }],
  }
})

const doughnutOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { position: "bottom", labels: { usePointStyle: true, padding: 12 } } },
  cutout: "65%",
}

const recentActivities = computed(() => {
  const acts = []
  breedingRecords.value.slice(-3).forEach((r) => {
    acts.push({
      id: `b-${r.id}`,
      title: t("dashboard.activity.breedingRecordAdded"),
      description: `Pár ${r.pairId} – ${r.hatchedChicks} mláďat`,
      date: r.breedingCycleEnd || r.breedingCycleStart,
      icon: "pi pi-heart",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    })
  })
  feedingLogs.value.slice(-2).forEach((l) => {
    acts.push({
      id: `f-${l.id}`,
      title: t("dashboard.activity.feedingCompleted"),
      description: `${l.foodType}`,
      date: l.feedingDate,
      icon: "pi pi-shopping-cart",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    })
  })
  return acts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6).map((a) => ({ ...a, timeAgo: formatTimeAgo(a.date) }))
})

const activeCycles = computed(() =>
  breedingRecords.value.filter((r) => !r.breedingCycleEnd).slice(0, 4)
)

const getPairLabel = (pairId) => {
  const pair = pairs.value.find((p) => p.id === pairId || p.id === +pairId)
  if (!pair) return `Pár ${pairId}`
  const male = birds.value.find((b) => b.id === pair.maleBirdId || b.id === +pair.maleBirdId)
  const female = birds.value.find((b) => b.id === pair.femaleBirdId || b.id === +pair.femaleBirdId)
  return `${male?.name || "?"} × ${female?.name || "?"}`
}

const loadData = async () => {
  loading.value = true
  try {
    const [bRes, pRes, brRes, fRes] = await Promise.all([
      birdsApi.getAll(), pairsApi.getAll(), breedingApi.getAll(), feedingApi.getAll(),
    ])
    birds.value = bRes.data
    pairs.value = pRes.data
    breedingRecords.value = brRes.data
    feedingLogs.value = fRes.data
  } catch (e) {
    console.error("Dashboard load failed:", e)
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>