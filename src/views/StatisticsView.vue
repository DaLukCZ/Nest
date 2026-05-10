<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">{{ $t("statistics.title") }}</h1>
      <Button icon="pi pi-refresh" :label="$t('statistics.refresh')" @click="loadData" :loading="loading" />
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard :label="$t('statistics.cards.totalBirds')" :value="stats.totalBirds" icon="pi pi-send" color="blue" />
      <StatCard :label="$t('statistics.cards.activePairs')" :value="stats.activePairs" icon="pi pi-heart"
        color="green" />
      <StatCard :label="$t('statistics.cards.hatchSuccess')" :value="`${stats.hatchSuccessRate}%`"
        icon="pi pi-chart-line" color="purple" />
      <StatCard :label="$t('statistics.cards.healthIssues')" :value="stats.healthIssues"
        icon="pi pi-exclamation-triangle" color="orange" />
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="card p-5">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("statistics.charts.birdsBySpecies") }}</h3>
        <div v-if="loading" class="h-48 flex items-center justify-center"><i
            class="pi pi-spin pi-spinner text-3xl text-gray-300"></i></div>
        <Chart v-else type="doughnut" :data="speciesChartData" :options="doughnutOptions" style="height:200px" />
      </div>
      <div class="card p-5">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("statistics.charts.breedingSuccessTrends") }}</h3>
        <div v-if="loading" class="h-48 flex items-center justify-center"><i
            class="pi pi-spin pi-spinner text-3xl text-gray-300"></i></div>
        <Chart v-else type="line" :data="breedingChartData" :options="lineOptions" style="height:200px" />
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="card p-5">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("statistics.charts.healthIssuesByType") }}</h3>
        <div v-if="loading" class="h-48 flex items-center justify-center"><i
            class="pi pi-spin pi-spinner text-3xl text-gray-300"></i></div>
        <Chart v-else type="bar" :data="healthChartData" :options="barOptions" style="height:200px" />
      </div>
      <div class="card p-5">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("statistics.charts.aviaryOccupancy") }}</h3>
        <div v-if="loading" class="h-48 flex items-center justify-center"><i
            class="pi pi-spin pi-spinner text-3xl text-gray-300"></i></div>
        <Chart v-else type="bar" :data="aviaryChartData" :options="barOptions" style="height:200px" />
      </div>
    </div>

    <!-- Top Breeding Pairs -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="card p-5">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("statistics.topBreedingPairs") }}</h3>
        <div v-if="!topPairs.length" class="text-center py-6 text-slate-500 text-base">Žádná data</div>
        <div v-else class="space-y-3">
          <div v-for="pair in topPairs" :key="pair.id"
            class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900 text-base">Pár #{{ pair.id }}</p>
              <p class="text-sm text-slate-600">{{ pair.successRate }}% úspěšnost</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-emerald-600">{{ pair.totalChicks }}</p>
              <p class="text-sm text-slate-600">mláďat</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-5">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("statistics.recentActivity") }}</h3>
        <div v-if="!recentActivities.length" class="text-center py-6 text-slate-500 text-base">Žádná nedávná aktivita
        </div>
        <div v-else class="space-y-3">
          <div v-for="act in recentActivities" :key="act.id" class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <div :class="['p-2 rounded-full flex-shrink-0', act.iconBg]">
              <i :class="[act.icon, 'text-sm', act.iconColor]"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-gray-900">{{ act.title }}</p>
              <p class="text-sm text-slate-600">{{ act.description }}</p>
              <p class="text-sm text-slate-500 mt-0.5">{{ act.date }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { birdsApi, pairsApi, breedingApi, healthApi, aviariesApi, feedingApi } from "../services/api"
import { formatDate, calcSuccessRate } from "../utils"
import { SPECIES_COLORS } from "../constants"
import StatCard from "../components/StatCard.vue"
import Button from "primevue/button"
import Chart from "primevue/chart"

const birds = ref([])
const pairs = ref([])
const breedingRecords = ref([])
const healthRecords = ref([])
const aviaries = ref([])
const feedingLogs = ref([])
const loading = ref(false)

const stats = computed(() => {
  const totalBirds = birds.value.length
  const activePairs = pairs.value.filter((p) => p.active).length
  const totalEggs = breedingRecords.value.reduce((s, r) => s + (r.eggsLaid || 0), 0)
  const totalHatched = breedingRecords.value.reduce((s, r) => s + (r.hatchedChicks || 0), 0)
  const hatchSuccessRate = totalEggs > 0 ? Math.round((totalHatched / totalEggs) * 100) : 0
  const healthIssues = healthRecords.value.filter((r) => ["Zranění", "Nemoc"].includes(r.type)).length
  return { totalBirds, activePairs, hatchSuccessRate, healthIssues }
})

const speciesChartData = computed(() => {
  const counts = {}
  birds.value.forEach((b) => { counts[b.species] = (counts[b.species] || 0) + 1 })
  const labels = Object.keys(counts)
  return {
    labels,
    datasets: [{ data: Object.values(counts), backgroundColor: labels.map((l) => SPECIES_COLORS[l] || "#94a3b8"), borderWidth: 0 }],
  }
})

const breedingChartData = computed(() => {
  const monthlyData = {}
  breedingRecords.value.forEach((r) => {
    const month = new Date(r.breedingCycleStart).toLocaleDateString("cs-CZ", { month: "short", year: "numeric" })
    if (!monthlyData[month]) monthlyData[month] = { eggs: 0, hatched: 0 }
    monthlyData[month].eggs += r.eggsLaid || 0
    monthlyData[month].hatched += r.hatchedChicks || 0
  })
  const labels = Object.keys(monthlyData)
  return {
    labels,
    datasets: [{
      label: "Úspěšnost líhnutí (%)",
      data: labels.map((m) => monthlyData[m].eggs > 0 ? Math.round((monthlyData[m].hatched / monthlyData[m].eggs) * 100) : 0),
      borderColor: "#10B981", backgroundColor: "rgba(16,185,129,0.1)", tension: 0.4, fill: true,
    }],
  }
})

const healthChartData = computed(() => {
  const counts = {}
  healthRecords.value.forEach((r) => { counts[r.type] = (counts[r.type] || 0) + 1 })
  return {
    labels: Object.keys(counts),
    datasets: [{ label: "Počet", data: Object.values(counts), backgroundColor: "#EF4444" }],
  }
})

// Fix: calculate occupancy dynamically from birds (not from stored currentOccupancy)
const aviaryChartData = computed(() => {
  return {
    labels: aviaries.value.map((a) => a.name),
    datasets: [{
      label: "Obsazenost (%)",
      data: aviaries.value.map((a) => {
        const occupied = birds.value.filter((b) => (b.aviaryId === a.id || b.aviaryId === +a.id) && b.status === "aktivní").length
        return a.capacity > 0 ? Math.round((occupied / a.capacity) * 100) : 0
      }),
      backgroundColor: "#3B82F6",
    }],
  }
})

const topPairs = computed(() => {
  const pairStats = {}
  breedingRecords.value.forEach((r) => {
    if (!pairStats[r.pairId]) pairStats[r.pairId] = { totalChicks: 0, totalEggs: 0 }
    pairStats[r.pairId].totalChicks += r.survivedChicks || 0
    pairStats[r.pairId].totalEggs += r.eggsLaid || 0
  })
  return Object.entries(pairStats)
    .map(([id, s]) => ({ id: +id, totalChicks: s.totalChicks, successRate: s.totalEggs > 0 ? Math.round((s.totalChicks / s.totalEggs) * 100) : 0 }))
    .sort((a, b) => b.totalChicks - a.totalChicks)
    .slice(0, 5)
})

const recentActivities = computed(() => {
  const acts = []
  breedingRecords.value.slice(-3).forEach((r) => {
    acts.push({ id: `b-${r.id}`, title: "Nový chovný záznam", description: `Pár ${r.pairId} – ${r.hatchedChicks} mláďat`, date: formatDate(r.breedingCycleEnd || r.breedingCycleStart), icon: "pi pi-heart", iconBg: "bg-purple-100", iconColor: "text-purple-600" })
  })
  healthRecords.value.slice(-2).forEach((r) => {
    acts.push({ id: `h-${r.id}`, title: "Zdravotní záznam", description: `${r.type}`, date: formatDate(r.date), icon: "pi pi-heart-fill", iconBg: "bg-red-100", iconColor: "text-red-600" })
  })
  feedingLogs.value.slice(-2).forEach((l) => {
    acts.push({ id: `f-${l.id}`, title: "Krmení dokončeno", description: `${l.foodType}`, date: formatDate(l.feedingDate), icon: "pi pi-shopping-cart", iconBg: "bg-green-100", iconColor: "text-green-600" })
  })
  return acts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)
})

const chartBaseOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
const doughnutOptions = { ...chartBaseOptions, cutout: "65%", plugins: { legend: { position: "bottom", labels: { usePointStyle: true } } } }
const lineOptions = { ...chartBaseOptions, plugins: { legend: { display: true, position: "bottom" } }, scales: { y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } } } }
const barOptions = { ...chartBaseOptions, scales: { y: { beginAtZero: true } } }

const loadData = async () => {
  loading.value = true
  try {
    const [bRes, pRes, brRes, hRes, avRes, fRes] = await Promise.all([
      birdsApi.getAll(), pairsApi.getAll(), breedingApi.getAll(), healthApi.getAll(), aviariesApi.getAll(), feedingApi.getAll(),
    ])
    birds.value = bRes.data
    pairs.value = pRes.data
    breedingRecords.value = brRes.data
    healthRecords.value = hRes.data
    aviaries.value = avRes.data
    feedingLogs.value = fRes.data
  } catch (e) { console.error("Statistics load failed:", e) }
  finally { loading.value = false }
}

onMounted(loadData)
</script>