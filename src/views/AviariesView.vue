<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t("aviaries.aviaries") }}</h1>
        <p class="text-base text-slate-600 mt-0.5">{{ aviaries.length }} {{ $t("common.total").toLowerCase() }}</p>
      </div>
      <Button icon="pi pi-plus" :label="$t('aviaries.addAviary')" @click="openAddDialog" />
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="n in 6" :key="n" class="card p-6 space-y-3 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        <div class="h-2 bg-gray-200 rounded-full"></div>
      </div>
    </div>

    <!-- Aviary Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="aviary in sortedAviaries" :key="aviary.id"
        class="card p-5 hover:shadow-md transition-shadow duration-200">
        <!-- Card Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ aviary.name }}</h3>
              <p class="text-sm text-slate-600">{{ aviary.type }} · {{ aviary.location }}</p>
            </div>
          </div>
          <div class="flex gap-1">
            <Button icon="pi pi-pencil" text rounded size="small" @click="openEditDialog(aviary)" />
            <Button icon="pi pi-trash" text rounded size="small" severity="danger"
              @click="confirmDeleteAviary(aviary)" />
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-3 gap-2 mb-4 text-center">
          <div class="bg-slate-50 rounded-lg p-2">
            <p class="text-lg font-bold text-gray-900">{{ getOccupancy(aviary.id) }}</p>
            <p class="text-sm text-slate-600">{{ $t("aviaries.occupied") }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-2">
            <p class="text-lg font-bold text-gray-900">{{ aviary.capacity }}</p>
            <p class="text-sm text-slate-600">{{ $t("aviaries.capacity") }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-2">
            <p class="text-lg font-bold" :class="getFreeColor(aviary)">{{ aviary.capacity - getOccupancy(aviary.id) }}
            </p>
            <p class="text-sm text-slate-600">{{ $t("aviaries.free") }}</p>
          </div>
        </div>

        <!-- Occupancy Bar -->
        <OccupancyBar :current="getOccupancy(aviary.id)" :capacity="aviary.capacity" showWarning />

        <!-- Footer meta -->
        <div class="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm text-slate-600">
          <span>{{ aviary.dimensions || "—" }}</span>
          <span>{{ aviary.temperatureNotes || "—" }}</span>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && aviaries.length === 0" class="col-span-full">
        <EmptyState icon="pi pi-building" :title="$t('aviaries.noAviaries')"
          :description="$t('aviaries.noAviariesDescription')" />
      </div>
    </div>

    <!-- Add / Edit Dialog -->
    <Dialog v-model:visible="showDialog" :header="editingAviary ? $t('aviaries.editAviary') : $t('aviaries.addAviary')"
      modal :draggable="false" class="w-full max-w-md">
      <form @submit.prevent="saveAviary" class="form-shell">
        <section class="form-section">
          <div class="form-section-header">
            <h3 class="form-section-title">{{ $t("aviaries.basicInfo") }}</h3>
            <p class="form-section-description">{{ $t("aviaries.basicInfoDescription") }}</p>
          </div>
          <div class="form-fields">
            <div class="form-field">
              <label class="form-label">{{ $t("aviaries.name") }} *</label>
              <InputText v-model="aviaryForm.name" required class="w-full" />
            </div>
            <div class="form-grid form-grid--2">
              <div class="form-field">
                <label class="form-label">{{ $t("aviaries.type") }}</label>
                <Select v-model="aviaryForm.type" :options="typeOptions" class="w-full" />
              </div>
              <div class="form-field">
                <label class="form-label">{{ $t("aviaries.location") }}</label>
                <InputText v-model="aviaryForm.location" class="w-full" />
              </div>
            </div>
          </div>
        </section>
        <section class="form-section">
          <div class="form-section-header">
            <h3 class="form-section-title">{{ $t("aviaries.capacityAndEnvironment") }}</h3>
            <p class="form-section-description">{{ $t("aviaries.capacityAndEnvironmentDescription") }}</p>
          </div>
          <div class="form-fields">
            <div class="form-field">
              <label class="form-label">{{ $t("aviaries.dimensions") }}</label>
              <InputText v-model="aviaryForm.dimensions" :placeholder="$t('aviaries.dimensionsExample')"
                class="w-full" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t("aviaries.capacity") }}</label>
              <InputNumber v-model="aviaryForm.capacity" :min="1" :max="100" showButtons class="w-full" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t("aviaries.temperatureNotes") }}</label>
              <InputText v-model="aviaryForm.temperatureNotes" :placeholder="$t('aviaries.temperatureExample')"
                class="w-full" />
            </div>
          </div>
        </section>
        <div class="form-actions">
          <Button type="button" :label="$t('common.cancel')" severity="secondary" text @click="showDialog = false" />
          <Button type="submit" :label="editingAviary ? $t('common.save') : $t('common.add')" :loading="saving" />
        </div>
      </form>
    </Dialog>

    <!-- Delete Confirmation -->
    <DeleteConfirmDialog v-model="showDeleteDialog" :title="$t('messages.delete') + ` ${aviaryToDelete?.name}?`"
      :message="$t('aviaries.confirmDelete')" :loading="deleting" @confirm="doDeleteAviary" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useToast } from "primevue/usetoast"
import { aviariesApi, birdsApi } from "../services/api"
import { AVIARY_TYPE_LIST } from "../constants"
import OccupancyBar from "../components/OccupancyBar.vue"
import EmptyState from "../components/EmptyState.vue"
import DeleteConfirmDialog from "../components/DeleteConfirmDialog.vue"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import InputText from "primevue/inputtext"
import InputNumber from "primevue/inputnumber"
import Select from "primevue/select"

const toast = useToast()
const { t } = useI18n()

const aviaries = ref([])
const birds = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingAviary = ref(null)
const aviaryToDelete = ref(null)

const typeOptions = AVIARY_TYPE_LIST

const defaultForm = () => ({
  name: "", type: "Vnitřní", location: "", dimensions: "", capacity: 10, temperatureNotes: "",
})
const aviaryForm = ref(defaultForm())

// Sort: outdoor first, then indoor, then basement
const sortedAviaries = computed(() =>
  [...aviaries.value].sort((a, b) => {
    const order = { "Venkovní": 0, "Vnitřní": 1, "Sklep": 2 }
    return (order[a.type] ?? 3) - (order[b.type] ?? 3)
  })
)

const getOccupancy = (aviaryId) =>
  birds.value.filter((b) => (b.aviaryId === aviaryId || b.aviaryId === +aviaryId) && b.status === "aktivní").length

const getFreeColor = (aviary) => {
  const free = aviary.capacity - getOccupancy(aviary.id)
  if (free <= 0) return "text-red-600"
  if (free <= 2) return "text-amber-600"
  return "text-emerald-600"
}

const loadData = async () => {
  loading.value = true
  try {
    const [avRes, birdRes] = await Promise.all([aviariesApi.getAll(), birdsApi.getAll()])
    aviaries.value = avRes.data
    birds.value = birdRes.data
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.networkError"), life: 4000 })
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  editingAviary.value = null
  aviaryForm.value = defaultForm()
  showDialog.value = true
}

const openEditDialog = (aviary) => {
  editingAviary.value = aviary
  aviaryForm.value = { ...aviary }
  showDialog.value = true
}

const saveAviary = async () => {
  saving.value = true
  try {
    if (editingAviary.value) {
      await aviariesApi.update(editingAviary.value.id, aviaryForm.value)
      toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.updated"), life: 3000 })
    } else {
      await aviariesApi.create(aviaryForm.value)
      toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.created"), life: 3000 })
    }
    showDialog.value = false
    await loadData()
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.error"), life: 4000 })
  } finally {
    saving.value = false
  }
}

const confirmDeleteAviary = (aviary) => { aviaryToDelete.value = aviary; showDeleteDialog.value = true }

const doDeleteAviary = async () => {
  if (!aviaryToDelete.value) return
  deleting.value = true
  try {
    await aviariesApi.delete(aviaryToDelete.value.id)
    toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.deleted"), life: 3000 })
    showDeleteDialog.value = false
    await loadData()
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.error"), life: 4000 })
  } finally {
    deleting.value = false
    aviaryToDelete.value = null
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