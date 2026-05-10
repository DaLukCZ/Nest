<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t("breeding.breedingRecords") }}</h1>
        <p class="text-base text-slate-600 mt-0.5">{{ breedingRecords.length }} záznamů</p>
      </div>
      <Button icon="pi pi-plus" :label="$t('breeding.addRecord')" @click="openAddDialog" />
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard :label="$t('breeding.totalRecords')" :value="breedingRecords.length" icon="pi pi-database"
        color="blue" />
      <StatCard :label="$t('breeding.avgSuccessRate')" :value="`${averageSuccessRate}%`" icon="pi pi-chart-line"
        color="green" />
      <StatCard :label="$t('breeding.totalChicks')" :value="totalChicks" icon="pi pi-heart" color="purple" />
      <StatCard :label="$t('breeding.activeCycles')" :value="activeCyclesCount" icon="pi pi-calendar" color="orange" />
    </div>

    <!-- Breeding Records Table -->
    <div class="card overflow-hidden">
      <DataTable :value="breedingRecords" :loading="loading" paginator :rows="15" dataKey="id" stripedRows removableSort
        class="p-datatable-sm">
        <template #empty>
          <EmptyState icon="pi pi-chart-line" title="Žádné chovné záznamy"
            description="Přidejte první chovný záznam pomocí tlačítka výše." />
        </template>
        <Column :header="$t('breeding.pair')" sortable>
          <template #body="{ data }">
            <span class="font-medium text-gray-900">{{ getPairLabel(data.pairId) }}</span>
          </template>
        </Column>
        <Column field="eggsLaid" :header="$t('pairs.eggsLaid')" sortable style="width:100px">
          <template #body="{ data }"><span class="text-blue-600 font-semibold">{{ data.eggsLaid }}</span></template>
        </Column>
        <Column field="hatchedChicks" :header="$t('pairs.hatched')" sortable style="width:100px">
          <template #body="{ data }"><span class="text-emerald-600 font-semibold">{{ data.hatchedChicks
              }}</span></template>
        </Column>
        <Column field="survivedChicks" :header="$t('pairs.survived')" sortable style="width:100px">
          <template #body="{ data }"><span class="text-purple-600 font-semibold">{{ data.survivedChicks
              }}</span></template>
        </Column>
        <Column :header="$t('pairs.success')" sortable style="width:110px">
          <template #body="{ data }">
            <StatusBadge
              :variant="calcSuccessRate(data) >= 70 ? 'green' : calcSuccessRate(data) >= 40 ? 'amber' : 'red'"
              :label="`${calcSuccessRate(data)}%`" />
          </template>
        </Column>
        <Column field="breedingCycleStart" :header="$t('breeding.startDate')" sortable>
          <template #body="{ data }">{{ formatDate(data.breedingCycleStart) }}</template>
        </Column>
        <Column field="breedingCycleEnd" :header="$t('breeding.endDate')">
          <template #body="{ data }">
            <span v-if="data.breedingCycleEnd">{{ formatDate(data.breedingCycleEnd) }}</span>
            <StatusBadge v-else variant="amber" label="Probíhá" />
          </template>
        </Column>
        <Column :header="$t('common.actions')" style="width:100px">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button icon="pi pi-eye" text rounded size="small" severity="secondary" @click="viewRecord(data)" />
              <Button icon="pi pi-pencil" text rounded size="small" @click="editRecord(data)" />
              <Button icon="pi pi-trash" text rounded size="small" severity="danger"
                @click="confirmDeleteRecord(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- View Dialog -->
    <Dialog v-model:visible="showViewDialog" :header="$t('breeding.breedingRecordDetails')" modal :draggable="false"
      class="w-full max-w-lg">
      <div v-if="selectedRecord" class="space-y-4">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-500 text-sm uppercase tracking-wide mb-1">Pár</p>
            <p class="font-semibold text-gray-900">{{ getPairLabel(selectedRecord.pairId) }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs uppercase tracking-wide mb-1">Úspěšnost</p>
            <StatusBadge :variant="calcSuccessRate(selectedRecord) >= 70 ? 'green' : 'amber'"
              :label="`${calcSuccessRate(selectedRecord)}%`" />
          </div>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <p class="text-xl font-bold text-blue-600">{{ selectedRecord.eggsLaid }}</p>
            <p class="text-sm text-slate-600">Vajec</p>
          </div>
          <div class="text-center p-3 bg-emerald-50 rounded-lg">
            <p class="text-xl font-bold text-emerald-600">{{ selectedRecord.hatchedChicks }}</p>
            <p class="text-sm text-slate-600">Vylíhnuto</p>
          </div>
          <div class="text-center p-3 bg-purple-50 rounded-lg">
            <p class="text-xl font-bold text-purple-600">{{ selectedRecord.survivedChicks }}</p>
            <p class="text-sm text-slate-600">Přeživší</p>
          </div>
          <div class="text-center p-3 bg-red-50 rounded-lg">
            <p class="text-xl font-bold text-red-600">{{ selectedRecord.deadChicks }}</p>
            <p class="text-sm text-slate-600">Uhynulí</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-500 text-sm uppercase tracking-wide mb-1">Začátek cyklu</p>
            <p class="text-base text-slate-700">{{ formatDate(selectedRecord.breedingCycleStart) }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-sm uppercase tracking-wide mb-1">Konec cyklu</p>
            <p class="text-base text-slate-700">{{ selectedRecord.breedingCycleEnd ?
              formatDate(selectedRecord.breedingCycleEnd) : "Probíhá" }}</p>
          </div>
        </div>
        <div v-if="selectedRecord.notes" class="bg-slate-50 rounded-lg p-3">
          <p class="text-sm text-slate-500 uppercase tracking-wide mb-1">Poznámky</p>
          <p class="text-base text-slate-700">{{ selectedRecord.notes }}</p>
        </div>
      </div>
    </Dialog>

    <!-- Add/Edit Dialog -->
    <Dialog v-model:visible="showAddDialog"
      :header="editingRecord ? $t('breeding.editBreedingRecord') : $t('breeding.addBreedingRecord')" modal
      :draggable="false" class="w-full max-w-lg">
      <form @submit.prevent="saveRecord" class="form-shell">
        <section class="form-section">
          <div class="form-section-header">
            <h3 class="form-section-title">Par a cyklus</h3>
            <p class="form-section-description">Vyberte par a nastavte casovy ramec zaznamu.</p>
          </div>
          <div class="form-fields">
            <div class="form-field">
              <label class="form-label">{{ $t("breeding.pair") }} *</label>
              <Select v-model="recordForm.pairId" :options="pairsWithLabel" option-label="label" option-value="id"
                :placeholder="$t('breeding.selectPair')" class="w-full" required />
            </div>
            <div class="form-grid form-grid--2">
              <div class="form-field">
                <label class="form-label">{{ $t("pairs.eggsLaid") }}</label>
                <InputNumber v-model="recordForm.eggsLaid" :min="0" class="w-full" />
              </div>
              <div class="form-field">
                <label class="form-label">Plodná vejce</label>
                <InputNumber v-model="recordForm.fertileEggs" :min="0" class="w-full" />
              </div>
            </div>
            <div class="form-grid form-grid--2">
              <div class="form-field">
                <label class="form-label">{{ $t("breeding.cycleStart") }}</label>
                <InputText v-model="recordForm.breedingCycleStart" type="date" class="w-full" />
              </div>
              <div class="form-field">
                <label class="form-label">{{ $t("breeding.cycleEnd") }}</label>
                <InputText v-model="recordForm.breedingCycleEnd" type="date" class="w-full" />
              </div>
            </div>
          </div>
        </section>
        <section class="form-section">
          <div class="form-section-header">
            <h3 class="form-section-title">Vysledky hnizdeni</h3>
            <p class="form-section-description">Zadejte pocet mladych v jednotlivych fazich.</p>
          </div>
          <div class="form-grid form-grid--3">
            <div class="form-field">
              <label class="form-label">{{ $t("pairs.hatched") }}</label>
              <InputNumber v-model="recordForm.hatchedChicks" :min="0" class="w-full" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t("pairs.survived") }}</label>
              <InputNumber v-model="recordForm.survivedChicks" :min="0" class="w-full" />
            </div>
            <div class="form-field">
              <label class="form-label">Uhynulí</label>
              <InputNumber v-model="recordForm.deadChicks" :min="0" class="w-full" />
            </div>
          </div>
        </section>
        <section class="form-section">
          <div class="form-section-header">
            <h3 class="form-section-title">Poznamky</h3>
            <p class="form-section-description">Prostor pro komplikace, pozorovani nebo dalsi detail.</p>
          </div>
          <div class="form-field">
            <label class="form-label">{{ $t("common.notes") }}</label>
            <Textarea v-model="recordForm.notes" rows="3" class="w-full" />
          </div>
        </section>
        <div class="form-actions">
          <Button type="button" :label="$t('common.cancel')" severity="secondary" text @click="showAddDialog = false" />
          <Button type="submit" :label="editingRecord ? $t('common.save') : $t('common.add')" :loading="saving" />
        </div>
      </form>
    </Dialog>

    <DeleteConfirmDialog v-model="showDeleteDialog" title="Smazat chovný záznam?"
      :message="$t('messages.confirmDelete')" :loading="deleting" @confirm="doDeleteRecord" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useToast } from "primevue/usetoast"
import { breedingApi, pairsApi, birdsApi } from "../services/api"
import { formatDate, calcSuccessRate } from "../utils"
import StatCard from "../components/StatCard.vue"
import StatusBadge from "../components/StatusBadge.vue"
import EmptyState from "../components/EmptyState.vue"
import DeleteConfirmDialog from "../components/DeleteConfirmDialog.vue"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import DataTable from "primevue/datatable"
import Column from "primevue/column"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import Select from "primevue/select"
import Textarea from "primevue/textarea"

const toast = useToast()
const { t } = useI18n()

const breedingRecords = ref([])
const pairs = ref([])
const birds = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showAddDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const editingRecord = ref(null)
const selectedRecord = ref(null)
const recordToDelete = ref(null)

const defaultForm = () => ({
  pairId: null, eggsLaid: 0, fertileEggs: 0, hatchedChicks: 0,
  survivedChicks: 0, deadChicks: 0, breedingCycleStart: new Date().toISOString().split("T")[0], breedingCycleEnd: "", notes: "",
})
const recordForm = ref(defaultForm())

// Pairs with human-readable labels (pairs have no name field — bug fix!)
const pairsWithLabel = computed(() =>
  pairs.value.map((p) => {
    const male = birds.value.find((b) => b.id === p.maleBirdId || b.id === +p.maleBirdId)
    const female = birds.value.find((b) => b.id === p.femaleBirdId || b.id === +p.femaleBirdId)
    return { ...p, label: `${male?.name || "?"} × ${female?.name || "?"}` }
  })
)

const getPairLabel = (pairId) => {
  const pl = pairsWithLabel.value.find((p) => p.id === pairId || p.id === +pairId)
  return pl ? pl.label : `Pár ${pairId}`
}

const averageSuccessRate = computed(() => {
  if (!breedingRecords.value.length) return 0
  const total = breedingRecords.value.reduce((s, r) => s + calcSuccessRate(r), 0)
  return Math.round(total / breedingRecords.value.length)
})
const totalChicks = computed(() => breedingRecords.value.reduce((s, r) => s + (r.survivedChicks || 0), 0))
const activeCyclesCount = computed(() => breedingRecords.value.filter((r) => !r.breedingCycleEnd).length)

const loadData = async () => {
  loading.value = true
  try {
    const [brRes, pRes, bRes] = await Promise.all([breedingApi.getAll(), pairsApi.getAll(), birdsApi.getAll()])
    breedingRecords.value = brRes.data
    pairs.value = pRes.data
    birds.value = bRes.data
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.networkError"), life: 4000 })
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => { editingRecord.value = null; recordForm.value = defaultForm(); showAddDialog.value = true }
const viewRecord = (rec) => { selectedRecord.value = rec; showViewDialog.value = true }
const editRecord = (rec) => { editingRecord.value = rec; recordForm.value = { ...rec }; showAddDialog.value = true }
const confirmDeleteRecord = (rec) => { recordToDelete.value = rec; showDeleteDialog.value = true }

const saveRecord = async () => {
  saving.value = true
  try {
    if (editingRecord.value) {
      await breedingApi.update(editingRecord.value.id, recordForm.value)
      toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.updated"), life: 3000 })
    } else {
      await breedingApi.create(recordForm.value)
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

const doDeleteRecord = async () => {
  if (!recordToDelete.value) return
  deleting.value = true
  try {
    await breedingApi.delete(recordToDelete.value.id)
    toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.deleted"), life: 3000 })
    showDeleteDialog.value = false
    await loadData()
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.error"), life: 4000 })
  } finally {
    deleting.value = false; recordToDelete.value = null
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