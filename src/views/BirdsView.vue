<template>
  <div class="space-y-5">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t("birds.title") }}</h1>
        <p class="text-base text-slate-600 mt-0.5">
          {{ filteredBirds.length }} {{ $t("common.total").toLowerCase() }}
          <template v-if="birds.length !== filteredBirds.length">/ {{ birds.length }}</template>
        </p>
      </div>
      <Button icon="pi pi-plus" :label="$t('birds.add')" @click="openAddDialog" />
    </div>

    <!-- Filters Bar -->
    <div class="card p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div class="lg:col-span-2">
          <InputText v-model="searchQuery" :placeholder="$t('birds.search')" class="w-full" />
        </div>
        <Select v-model="filters.species" :options="speciesOptions" :placeholder="$t('birds.species')" showClear
          class="w-full" />
        <Select v-model="filters.gender" :options="genderOptions" option-label="label" option-value="value"
          :placeholder="$t('birds.gender')" showClear class="w-full" />
        <Select v-model="filters.status" :options="statusOptions" option-label="label" option-value="value"
          :placeholder="$t('birds.status')" showClear class="w-full" />
      </div>
      <div class="flex justify-end mt-2">
        <Button text size="small" icon="pi pi-filter-slash" :label="$t('common.noFilter')" @click="resetFilters" />
      </div>
    </div>

    <!-- Birds Table -->
    <div class="card overflow-hidden">
      <DataTable :value="filteredBirds" :loading="loading" paginator :rows="15" :rowsPerPageOptions="[10, 15, 25, 50]"
        dataKey="id" removableSort stripedRows class="p-datatable-sm">
        <template #empty>
          <EmptyState icon="pi pi-send" :title="$t('birds.noBirds')" :description="$t('common.noResults')" />
        </template>
        <Column field="name" :header="$t('birds.name')" sortable style="min-width:160px">
          <template #body="{ data }">
            <div>
              <p class="font-semibold text-gray-900 text-base">{{ data.name }}</p>
              <p class="text-sm text-slate-600 font-mono">{{ data.ringNumber || "—" }}</p>
            </div>
          </template>
        </Column>
        <Column field="species" :header="$t('birds.species')" sortable style="min-width:140px">
          <template #body="{ data }">
            <div>
              <p class="text-gray-900 text-base">{{ data.species }}</p>
              <p class="text-sm text-slate-600">{{ data.variety }}</p>
            </div>
          </template>
        </Column>
        <Column field="mutation" :header="$t('birds.mutation')" sortable>
          <template #body="{ data }">
            <span class="text-slate-700 text-base">{{ data.mutation || "—" }}</span>
          </template>
        </Column>
        <Column field="gender" :header="$t('birds.gender')" sortable style="width:110px">
          <template #body="{ data }">
            <StatusBadge :variant="data.gender === 'samec' ? 'blue' : data.gender === 'samice' ? 'pink' : 'gray'"
              :icon="data.gender === 'samec' ? 'pi pi-mars' : data.gender === 'samice' ? 'pi pi-venus' : 'pi pi-question-circle'"
              :label="data.gender" />
          </template>
        </Column>
        <Column :header="$t('birds.age')" style="width:110px">
          <template #body="{ data }">
            <span class="text-base text-slate-700">{{ calcAge(data.hatchDate) }}</span>
          </template>
        </Column>
        <Column field="status" :header="$t('birds.status')" sortable style="width:120px">
          <template #body="{ data }">
            <StatusBadge :variant="statusVariant(data.status)" :label="data.status" />
          </template>
        </Column>
        <Column :header="$t('birds.aviary')" style="width:130px">
          <template #body="{ data }">
            <span class="text-base text-slate-700">{{ getAviaryName(data.aviaryId) }}</span>
          </template>
        </Column>
        <Column :header="$t('common.actions')" style="width:110px">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button icon="pi pi-eye" text rounded size="small" severity="secondary" @click="viewBird(data)" />
              <Button icon="pi pi-pencil" text rounded size="small" @click="editBird(data)" />
              <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDeleteBird(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Add / Edit Dialog -->
    <Dialog v-model:visible="showAddDialog" :header="editingBird ? $t('birds.edit') : $t('birds.add')" modal
      :draggable="false" class="w-full max-w-2xl">
      <form @submit.prevent="saveBird" class="form-shell">
        <div class="form-grid form-grid--2">
          <section class="form-section">
            <div class="form-section-header">
              <h3 class="form-section-title">{{ $t('birds.identity') }}</h3>
              <p class="form-section-description">{{ $t('birds.identityDescription') }}</p>
            </div>
            <div class="form-fields">
              <div class="form-field">
                <label class="form-label">{{ $t("birds.name") }} *</label>
                <InputText v-model="birdForm.name" required class="w-full" />
              </div>
              <div class="form-field">
                <label class="form-label">{{ $t("birds.species") }} *</label>
                <Select v-model="birdForm.species" :options="speciesOptions" :placeholder="$t('birds.selectSpecies')"
                  class="w-full" required @change="birdForm.variety = ''; birdForm.mutation = ''" />
              </div>
              <div class="form-field">
                <label class="form-label">{{ $t("birds.variety") }}</label>
                <Select v-model="birdForm.variety" :options="availableVarieties"
                  :placeholder="$t('birds.selectVariety')" :disabled="!birdForm.species" class="w-full" />
              </div>
              <div class="form-field">
                <label class="form-label">{{ $t("birds.mutation") }}</label>
                <Select v-model="birdForm.mutation" :options="availableMutations"
                  :placeholder="$t('birds.selectMutation')" :disabled="!birdForm.species" class="w-full" />
              </div>
              <div class="form-field">
                <label class="form-label">{{ $t("birds.gender") }} *</label>
                <Select v-model="birdForm.gender" :options="genderOptions" option-label="label" option-value="value"
                  :placeholder="$t('birds.selectGender')" class="w-full" required />
              </div>
            </div>
          </section>
          <section class="form-section">
            <div class="form-section-header">
              <h3 class="form-section-title">{{ $t('birds.evidence') }}</h3>
              <p class="form-section-description">{{ $t('birds.evidenceDescription') }}</p>
            </div>
            <div class="form-fields">
              <div class="form-field">
                <label class="form-label">{{ $t("birds.ringNumber") }}</label>
                <InputText v-model="birdForm.ringNumber" class="w-full" />
              </div>
              <div class="form-field">
                <label class="form-label">{{ $t("birds.hatchDate") }}</label>
                <InputText v-model="birdForm.hatchDate" type="date" class="w-full" />
              </div>
              <div class="form-field">
                <label class="form-label">{{ $t("birds.status") }}</label>
                <Select v-model="birdForm.status" :options="statusOptions" option-label="label" option-value="value"
                  class="w-full" />
              </div>
              <div class="form-field">
                <label class="form-label">{{ $t("birds.aviary") }}</label>
                <Select v-model="birdForm.aviaryId" :options="aviaries" option-label="name" option-value="id"
                  :placeholder="$t('birds.selectAviary')" showClear class="w-full" />
              </div>
              <div class="form-field">
                <label class="form-label">{{ $t("birds.origin") }}</label>
                <Select v-model="birdForm.origin" :options="originOptions" :placeholder="$t('birds.origin')" editable
                  class="w-full" />
              </div>
            </div>
          </section>
        </div>
        <section class="form-section">
          <div class="form-section-header">
            <h3 class="form-section-title">{{ $t('birds.notes') }}</h3>
            <p class="form-section-description">{{ $t('birds.notesDescription') }}</p>
          </div>
          <div class="form-field">
            <label class="form-label">{{ $t("common.notes") }}</label>
            <Textarea v-model="birdForm.notes" rows="3" class="w-full" />
          </div>
        </section>
        <div class="form-actions">
          <Button type="button" :label="$t('common.cancel')" severity="secondary" text @click="showAddDialog = false" />
          <Button type="submit" :label="editingBird ? $t('common.save') : $t('birds.add')" :loading="saving" />
        </div>
      </form>
    </Dialog>

    <!-- View Details Dialog -->
    <Dialog v-model:visible="showViewDialog" :header="selectedBird?.name" modal :draggable="false"
      class="w-full max-w-lg">
      <div v-if="selectedBird" class="space-y-5">
        <div class="flex items-center gap-4">
          <div
            class="w-14 h-14 rounded-full bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center flex-shrink-0 border border-blue-200">
            <i class="pi pi-send text-blue-700 text-2xl"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ selectedBird.name }}</h2>
            <p class="text-base text-slate-600">{{ selectedBird.species }} · {{ selectedBird.variety }}</p>
            <div class="flex gap-2 mt-1">
              <StatusBadge :variant="selectedBird.gender === 'samec' ? 'blue' : 'pink'"
                :icon="selectedBird.gender === 'samec' ? 'pi pi-mars' : 'pi pi-venus'" :label="selectedBird.gender" />
              <StatusBadge :variant="statusVariant(selectedBird.status)" :label="selectedBird.status" />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div v-for="field in detailFields" :key="field.key" class="space-y-0.5">
            <p class="text-slate-500 text-sm uppercase tracking-wide">{{ field.label }}</p>
            <p class="font-medium text-gray-900 text-base">{{ field.value }}</p>
          </div>
        </div>
        <div v-if="selectedBird.notes" class="bg-slate-50 rounded-lg p-3">
          <p class="text-sm text-slate-500 uppercase tracking-wide mb-1">{{ $t("common.notes") }}</p>
          <p class="text-base text-slate-700">{{ selectedBird.notes }}</p>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-2">
          <Button :label="$t('birds.editBird')" icon="pi pi-pencil"
            @click="showViewDialog = false; editBird(selectedBird)" />
          <Button :label="$t('common.close')" severity="secondary" text @click="showViewDialog = false" />
        </div>
      </template>
    </Dialog>

    <!-- Delete Confirmation -->
    <DeleteConfirmDialog v-model="showDeleteDialog" :title="`Smazat ${birdToDelete?.name}?`"
      :message="$t('birds.confirmDelete')" :loading="deleting" @confirm="doDeleteBird" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useToast } from "primevue/usetoast"
import { birdsApi, aviariesApi } from "../services/api"
import { calculateAge, formatDate, debounce } from "../utils"
import { SPECIES_LIST, SPECIES_VARIETIES, SPECIES_MUTATIONS, GENDER, BIRD_STATUS, ORIGIN_LIST } from "../constants"
import StatusBadge from "../components/StatusBadge.vue"
import EmptyState from "../components/EmptyState.vue"
import DeleteConfirmDialog from "../components/DeleteConfirmDialog.vue"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import InputText from "primevue/inputtext"
import Select from "primevue/select"
import Textarea from "primevue/textarea"

const toast = useToast()
const { t } = useI18n()

const birds = ref([])
const aviaries = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showAddDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const editingBird = ref(null)
const selectedBird = ref(null)
const birdToDelete = ref(null)

const searchQuery = ref("")
const debouncedSearch = ref("")
const filters = ref({ species: null, gender: null, status: null })

watch(searchQuery, debounce((val) => { debouncedSearch.value = val }, 300))

const resetFilters = () => {
  searchQuery.value = ""
  debouncedSearch.value = ""
  filters.value = { species: null, gender: null, status: null }
}

const defaultForm = () => ({
  name: "", species: "", variety: "", mutation: "", gender: "",
  ringNumber: "", hatchDate: "", origin: "Vlastni odchov",
  status: BIRD_STATUS.ACTIVE, photoUrl: "", aviaryId: null, notes: "",
})

const birdForm = ref(defaultForm())

const speciesOptions = SPECIES_LIST
const genderOptions = computed(() => [
  { label: t("birds.male"), value: GENDER.MALE },
  { label: t("birds.female"), value: GENDER.FEMALE },
  { label: t("birds.unknown"), value: GENDER.UNKNOWN },
])
const statusOptions = computed(() => [
  { label: t("birds.active"), value: "aktivni" },
  { label: t("birds.inactive"), value: "neaktivni" },
  { label: t("birds.quarantine"), value: "karantena" },
  { label: t("birds.sold"), value: "prodano" },
  { label: t("birds.deceased"), value: "zemrely" },
])
const originOptions = ORIGIN_LIST
const availableVarieties = computed(() => SPECIES_VARIETIES[birdForm.value.species] ?? [])
const availableMutations = computed(() => SPECIES_MUTATIONS[birdForm.value.species] ?? [])

const filteredBirds = computed(() => {
  const q = debouncedSearch.value.toLowerCase()
  return birds.value.filter((b) => {
    const matchesSearch = !q || b.name?.toLowerCase().includes(q) || b.ringNumber?.toLowerCase().includes(q) || b.species?.toLowerCase().includes(q) || b.variety?.toLowerCase().includes(q)
    const matchesSpecies = !filters.value.species || b.species === filters.value.species
    const matchesGender = !filters.value.gender || b.gender === filters.value.gender
    const matchesStatus = !filters.value.status || b.status === filters.value.status
    return matchesSearch && matchesSpecies && matchesGender && matchesStatus
  })
})

const getAviaryName = (aviaryId) => {
  if (!aviaryId) return "—"
  const av = aviaries.value.find((a) => a.id == aviaryId || a.id == +aviaryId)
  return av ? av.name : `Voliéra ${aviaryId}`
}

const statusVariant = (status) => ({ "aktivni": "green", "neaktivni": "gray", "karantena": "orange", "prodano": "blue", "zemrely": "red", "aktivní": "green", "neaktivní": "gray", "karanténa": "orange", "prodáno": "blue", "zemřelý": "red" }[status] ?? "gray")


const calcAge = (hatchDate) => {
  const age = calculateAge(hatchDate)

  if (!age.parts.years && !age.parts.months) {
    return "—"
  }

  const parts = []

  if (age.parts.years > 0) {
    parts.push(t("age.yearsShort", { count: age.parts.years }))
  }

  parts.push(t("age.monthsShort", { count: age.parts.months }))

  return parts.join(" ")
}

const detailFields = computed(() => {
  if (!selectedBird.value) return []
  const b = selectedBird.value
  return [
    { key: "ring", label: t("birds.ringNumber"), value: b.ringNumber || "—" },
    { key: "age", label: t("birds.age"), value: calcAge(b.hatchDate) },
    { key: "hatch", label: t("birds.hatchDate"), value: formatDate(b.hatchDate) },
    { key: "mutation", label: t("birds.mutation"), value: b.mutation || "—" },
    { key: "aviary", label: t("birds.aviary"), value: getAviaryName(b.aviaryId) },
    { key: "origin", label: t("birds.origin"), value: b.origin || "—" },
  ]
})

const loadData = async () => {
  loading.value = true
  try {
    const [birdsRes, aviariesRes] = await Promise.all([birdsApi.getAll(), aviariesApi.getAll()])
    birds.value = birdsRes.data
    aviaries.value = aviariesRes.data
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.networkError"), life: 4000 })
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  editingBird.value = null
  birdForm.value = defaultForm()
  showAddDialog.value = true
}

const viewBird = (bird) => { selectedBird.value = bird; showViewDialog.value = true }

const editBird = (bird) => {
  editingBird.value = bird
  birdForm.value = { ...bird }
  showAddDialog.value = true
}

const saveBird = async () => {
  saving.value = true
  try {
    const payload = { ...birdForm.value }
    delete payload.age  // never persist calculated field
    if (editingBird.value) {
      await birdsApi.update(editingBird.value.id, payload)
      toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.updated"), life: 3000 })
    } else {
      await birdsApi.create(payload)
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

const confirmDeleteBird = (bird) => { birdToDelete.value = bird; showDeleteDialog.value = true }

const doDeleteBird = async () => {
  if (!birdToDelete.value) return
  deleting.value = true
  try {
    await birdsApi.delete(birdToDelete.value.id)
    toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.deleted"), life: 3000 })
    showDeleteDialog.value = false
    await loadData()
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.error"), life: 4000 })
  } finally {
    deleting.value = false
    birdToDelete.value = null
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