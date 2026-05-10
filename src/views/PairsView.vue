<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t("pairs.breedingPairs") }}</h1>
        <p class="text-base text-slate-600 mt-0.5">{{ pairs.length }} {{ $t('common.pairs') }} · {{ activePairs }} {{
          $t('common.active') }}</p>
      </div>
      <Button icon="pi pi-plus" :label="$t('pairs.createPair')" @click="openAddDialog" />
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="n in 6" :key="n" class="card p-5 space-y-3 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        <div class="h-3 bg-gray-200 rounded"></div>
        <div class="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- Pairs Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="pair in pairs" :key="pair.id" class="card p-5 hover:shadow-md transition-shadow duration-200">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <StatusBadge :variant="pair.active ? 'green' : 'gray'"
              :label="pair.active ? $t('common.active') : $t('common.inactive')" />
            <span class="text-sm text-slate-600">{{
              $t('common.pairId') }} {{ pair.id }}</span>
          </div>
          <div class="flex gap-1">
            <Button icon="pi pi-eye" text rounded size="small" severity="secondary" @click="viewPairHistory(pair)" />
            <Button icon="pi pi-pencil" text rounded size="small" @click="editPair(pair)" />
            <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDeletePair(pair)" />
          </div>
        </div>

        <!-- Birds -->
        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-3">
            <div class="p-1.5 bg-blue-100 rounded-full">
              <i class="pi pi-mars text-blue-600 text-sm"></i>
            </div>
            <div class="min-w-0">
              <p class="font-medium text-gray-900 text-base truncate">{{ getBirdName(pair.maleBirdId) }} - {{
                getBirdRingNumber(pair.maleBirdId) }}</p>
              <p class="text-sm text-slate-600 truncate">{{ getBirdSpecies(pair.maleBirdId) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-1.5 bg-pink-100 rounded-full">
              <i class="pi pi-venus text-pink-600 text-sm"></i>
            </div>
            <div class="min-w-0">
              <p class="font-medium text-gray-900 text-base truncate">{{ getBirdName(pair.femaleBirdId) }} - {{
                getBirdRingNumber(pair.femaleBirdId) }}</p>
              <p class="text-sm text-slate-600 truncate">{{ getBirdSpecies(pair.femaleBirdId) }}</p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-2 mb-4">
          <div class="text-center p-2.5 bg-slate-50 rounded-lg">
            <p class="text-xl font-bold text-blue-600">{{ calcPairSuccessRate(pair) }}%</p>
            <p class="text-sm text-slate-600">{{ $t("pairs.success") }}</p>
          </div>
          <div class="text-center p-2.5 bg-slate-50 rounded-lg">
            <p class="text-xl font-bold text-emerald-600">{{ getBreedingCount(pair.id) }}</p>
            <p class="text-sm text-slate-600">{{ $t("pairs.cycle") }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-3 border-t border-gray-100">
          <Button :label="$t('pairs.viewHistory')" text size="small" class="flex-1" @click="viewPairHistory(pair)" />
          <Button :label="pair.active ? $t('pairs.deactivate') : $t('pairs.activate')"
            :severity="pair.active ? 'danger' : 'success'" text size="small" class="flex-1"
            @click="togglePairStatus(pair)" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && pairs.length === 0" class="col-span-full">
        <EmptyState icon="pi pi-heart" :title="$t('pairs.noPairs')" :description="$t('pairs.noPairsDescription')" />
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <Dialog v-model:visible="showAddDialog" :header="editingPair ? $t('pairs.editPair') : $t('pairs.createNewPair')"
      modal :draggable="false" class="w-full max-w-md">
      <form @submit.prevent="savePair" class="form-shell">
        <section class="form-section">
          <div class="form-section-header">
            <h3 class="form-section-title">{{ $t('pairs.selectPair') }}</h3>
            <p class="form-section-description">{{ $t('pairs.selectPairDescription') }}</p>
          </div>
          <div class="form-fields">
            <div class="form-field">
              <label class="form-label">{{ $t("pairs.maleBird") }} *</label>
              <Select v-model="pairForm.maleBirdId" :options="availableMales" option-label="displayName"
                option-value="id" :placeholder="$t('pairs.selectMaleBird')" class="w-full" filter required />
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t("pairs.femaleBird") }} *</label>
              <Select v-model="pairForm.femaleBirdId" :options="availableFemales" option-label="displayName"
                option-value="id" :placeholder="$t('pairs.selectFemaleBird')" class="w-full" filter required />
            </div>
          </div>
        </section>
        <section class="form-section">
          <div class="form-section-header">
            <h3 class="form-section-title">{{ $t('pairs.statusAndNotes') }}</h3>
            <p class="form-section-description">{{ $t('pairs.statusAndNotesDescription') }} </p>
          </div>
          <div class="form-fields">
            <div class="form-toggle-row">
              <ToggleSwitch v-model="pairForm.active" />
              <label class="text-base font-medium text-gray-700">{{ $t("pairs.activePair") }}</label>
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t("common.notes") }}</label>
              <Textarea v-model="pairForm.notes" rows="3" class="w-full" />
            </div>
          </div>
        </section>
        <div class="form-actions">
          <Button type="button" :label="$t('common.cancel')" severity="secondary" text @click="showAddDialog = false" />
          <Button type="submit" :label="editingPair ? $t('common.save') : $t('common.add')" :loading="saving" />
        </div>
      </form>
    </Dialog>

    <!-- Pair History Dialog -->
    <Dialog v-model:visible="showHistoryDialog" :header="$t('pairs.breedingHistory')" modal :draggable="false"
      class="w-full max-w-3xl">
      <div v-if="selectedPair" class="space-y-5">
        <!-- Pair header -->
        <div class="flex items-center gap-6 p-4 bg-slate-50 rounded-xl">
          <div class="text-center">
            <div class="p-2 bg-blue-100 rounded-full mb-1 inline-block">
              <i class="pi pi-mars text-blue-600"></i>
            </div>
            <p class="font-medium text-base text-gray-900">{{ getBirdName(selectedPair.maleBirdId) }}</p>
          </div>
          <div class="flex-1 text-center"><i class="pi pi-heart text-red-400 text-xl"></i></div>
          <div class="text-center">
            <div class="p-2 bg-pink-100 rounded-full mb-1 inline-block">
              <i class="pi pi-venus text-pink-600"></i>
            </div>
            <p class="font-medium text-base text-gray-900">{{ getBirdName(selectedPair.femaleBirdId) }}</p>
          </div>
        </div>

        <!-- Breeding records -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ $t("pairs.breedingRecords") }}</h3>
          <div v-if="getPairRecords(selectedPair.id).length === 0" class="text-center py-8 text-slate-500 text-base">{{
            $t("pairs.noBreedingRecords") }}</div>
          <div v-else class="space-y-3">
            <div v-for="rec in getPairRecords(selectedPair.id)" :key="rec.id"
              class="border border-gray-200 rounded-lg p-4 bg-white">
              <div class="flex justify-between items-center mb-3">
                <p class="text-base text-slate-600">{{ formatDate(rec.breedingCycleStart) }} – {{ rec.breedingCycleEnd ?
                  formatDate(rec.breedingCycleEnd) : "Probíhá" }}</p>
                <StatusBadge
                  :variant="calcSuccessRate(rec) >= 70 ? 'green' : calcSuccessRate(rec) >= 40 ? 'amber' : 'red'"
                  :label="`${calcSuccessRate(rec)}% úspěšnost`" />
              </div>
              <div class="grid grid-cols-4 gap-2">
                <div class="text-center p-2 bg-blue-50 rounded">
                  <p class="text-base font-bold text-blue-600">{{ rec.eggsLaid }}</p>
                  <p class="text-sm text-slate-600">Vajec</p>
                </div>
                <div class="text-center p-2 bg-emerald-50 rounded">
                  <p class="text-base font-bold text-emerald-600">{{ rec.hatchedChicks }}</p>
                  <p class="text-sm text-slate-600">Vylíhnuto</p>
                </div>
                <div class="text-center p-2 bg-purple-50 rounded">
                  <p class="text-base font-bold text-purple-600">{{ rec.survivedChicks }}</p>
                  <p class="text-sm text-slate-600">Přeživší</p>
                </div>
                <div class="text-center p-2 bg-red-50 rounded">
                  <p class="text-base font-bold text-red-600">{{ rec.deadChicks }}</p>
                  <p class="text-sm text-slate-600">Uhynulí</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <DeleteConfirmDialog v-model="showDeleteDialog"
      :title="`${selectedPair?.maleBirdId ? getBirdName(selectedPair.maleBirdId) : 'Pták'} – ${selectedPair?.femaleBirdId ? getBirdName(selectedPair.femaleBirdId) : 'Pták'}?`"
      :message="$t('messages.confirmDelete')" :loading="deleting" @confirm="doDeletePair" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useToast } from "primevue/usetoast"
import { pairsApi, birdsApi, breedingApi } from "../services/api"
import { formatDate, calcSuccessRate } from "../utils"
import StatusBadge from "../components/StatusBadge.vue"
import EmptyState from "../components/EmptyState.vue"
import DeleteConfirmDialog from "../components/DeleteConfirmDialog.vue"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import Select from "primevue/select"
import ToggleSwitch from "primevue/toggleswitch"
import Textarea from "primevue/textarea"

const toast = useToast()
const { t } = useI18n()

const pairs = ref([])
const birds = ref([])
const breedingRecords = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showAddDialog = ref(false)
const showHistoryDialog = ref(false)
const showDeleteDialog = ref(false)
const editingPair = ref(null)
const selectedPair = ref(null)
const pairToDelete = ref(null)

const defaultForm = () => ({ maleBirdId: null, femaleBirdId: null, active: true, notes: "" })
const pairForm = ref(defaultForm())

const activePairs = computed(() => pairs.value.filter((p) => p.active).length)

// Add displayName for filter search
const availableMales = computed(() => {
  const usedIds = pairs.value.filter((p) => !editingPair.value || p.id != editingPair.value.id).map((p) => p.maleBirdId)
  return birds.value.filter((b) => b.gender === "samec" && b.status === "aktivní" && !usedIds.includes(b.id))
    .map((b) => ({ ...b, displayName: `${b.name} (${b.ringNumber || b.species})` }))
})

const availableFemales = computed(() => {
  const usedIds = pairs.value.filter((p) => !editingPair.value || p.id !== editingPair.value.id).map((p) => p.femaleBirdId)
  return birds.value.filter((b) => b.gender === "samice" && b.status === "aktivní" && !usedIds.includes(b.id))
    .map((b) => ({ ...b, displayName: `${b.name} (${b.ringNumber || b.species})` }))
})

const getBirdName = (id) => {
  const b = birds.value.find((b) => b.id == id || b.id == +id)
  return b ? b.name : `Pták ${id}`
}
const getBirdRingNumber = (id) => {
  const b = birds.value.find((b) => b.id == id || b.id == +id)
  return b ? b.ringNumber : `Kroužek ${id}`
}
const getBirdSpecies = (id) => {
  const b = birds.value.find((b) => b.id == id || b.id == +id)
  return b ? `${b.species} · ${b.variety || ""}` : ""
}
const getBreedingCount = (pairId) => breedingRecords.value.filter((r) => r.pairId == pairId || r.pairId == +pairId).length
const getPairRecords = (pairId) => breedingRecords.value.filter((r) => r.pairId == pairId || r.pairId == +pairId)
const calcPairSuccessRate = (pair) => {
  const recs = getPairRecords(pair.id)
  if (!recs.length) return 0
  const totalEggs = recs.reduce((s, r) => s + (r.eggsLaid || 0), 0)
  const totalSurvived = recs.reduce((s, r) => s + (r.survivedChicks || 0), 0)
  return totalEggs > 0 ? Math.round((totalSurvived / totalEggs) * 100) : 0
}

const loadData = async () => {
  loading.value = true
  try {
    const [pRes, bRes, brRes] = await Promise.all([pairsApi.getAll(), birdsApi.getAll(), breedingApi.getAll()])
    pairs.value = pRes.data
    birds.value = bRes.data
    breedingRecords.value = brRes.data
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.networkError"), life: 4000 })
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => { editingPair.value = null; pairForm.value = defaultForm(); showAddDialog.value = true }
const editPair = (pair) => { editingPair.value = pair; pairForm.value = { ...pair }; showAddDialog.value = true }
const viewPairHistory = (pair) => { selectedPair.value = pair; showHistoryDialog.value = true }
const confirmDeletePair = (pair) => { pairToDelete.value = pair; showDeleteDialog.value = true }

const savePair = async () => {
  saving.value = true
  try {
    const payload = { ...pairForm.value, createdDate: editingPair.value?.createdDate ?? new Date().toISOString().split("T")[0] }
    if (editingPair.value) {
      await pairsApi.update(editingPair.value.id, payload)
      toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.updated"), life: 3000 })
    } else {
      await pairsApi.create(payload)
      toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.created"), life: 3000 })
    }
    showAddDialog.value = false
    await loadData()
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.error"), life: 4000 })
  } finally {
    saving.value = false
  }
}

const togglePairStatus = async (pair) => {
  try {
    await pairsApi.update(pair.id, { ...pair, active: !pair.active })
    toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.updated"), life: 3000 })
    await loadData()
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.error"), life: 4000 })
  }
}

const doDeletePair = async () => {
  if (!pairToDelete.value) return
  deleting.value = true
  try {
    await pairsApi.delete(pairToDelete.value.id)
    toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.deleted"), life: 3000 })
    showDeleteDialog.value = false
    await loadData()
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.error"), life: 4000 })
  } finally {
    deleting.value = false; pairToDelete.value = null
  }
}

onMounted(loadData)
</script>

<style scoped>
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(55 65 81);
}

:global(.dark) .form-label {
  color: rgb(209 213 219);
}
</style>