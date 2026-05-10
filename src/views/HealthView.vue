<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t("health.healthRecords") }}</h1>
        <p class="text-base text-slate-600 mt-0.5">{{ healthRecords.length }} {{ $t('common.records') }}</p>
      </div>
      <Button icon="pi pi-plus" :label="$t('health.addHealthRecord')" @click="openAddDialog" />
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard :label="$t('health.criticalIssues')" :value="criticalCount" icon="pi pi-exclamation-triangle"
        color="red" />
      <StatCard :label="$t('health.ongoingTreatments')" :value="ongoingCount" icon="pi pi-clock" color="amber" />
      <StatCard :label="$t('health.resolved')" :value="resolvedCount" icon="pi pi-check-circle" color="green" />
      <StatCard :label="$t('health.vetVisits')" :value="vetVisitsCount" icon="pi pi-calendar" color="blue" />
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <DataTable :value="healthRecords" :loading="loading" paginator :rows="15" dataKey="id" stripedRows
        class="p-datatable-sm">
        <template #empty>
          <EmptyState icon="pi pi-heart-fill" :title="$t('health.noRecords')"
            :description="$t('health.noRecordsDescription')" />
        </template>
        <Column :header="$t('health.bird')">
          <template #body="{ data }">
            <span class="font-medium text-gray-900">{{ getBirdName(data.birdId) }}</span>
          </template>
        </Column>
        <Column field="type" :header="$t('common.type')" sortable>
          <template #body="{ data }">
            <StatusBadge :variant="severityVariant(data.type)" :label="data.type" />
          </template>
        </Column>
        <Column field="date" :header="$t('common.date')" sortable>
          <template #body="{ data }">
            <span class="text-base text-slate-700">{{ formatDate(data.date) }}</span>
          </template>
        </Column>
        <Column field="description" :header="$t('health.description')">
          <template #body="{ data }">
            <span class="text-base text-slate-600 line-clamp-1">{{ data.description }}</span>
          </template>
        </Column>
        <Column :header="$t('health.status')" style="width:120px">
          <template #body="{ data }">
            <StatusBadge :variant="statusVariant(data)" :label="statusLabel(data)" />
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
    <Dialog v-model:visible="showViewDialog" :header="$t('health.healthRecordDetails')" modal :draggable="false"
      class="w-full max-w-lg">
      <div v-if="selectedRecord" class="space-y-4">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-slate-500 text-sm uppercase tracking-wide mb-1">{{ $t('health.bird') }}</p>
            <p class="font-medium text-gray-900">{{ getBirdName(selectedRecord.birdId) }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs uppercase tracking-wide mb-1">{{ $t('common.type') }}</p>
            <StatusBadge :variant="severityVariant(selectedRecord.type)" :label="selectedRecord.type" />
          </div>
          <div>
            <p class="text-slate-500 text-sm uppercase tracking-wide mb-1">{{ $t('common.date') }}</p>
            <p class="font-medium text-gray-900">{{ formatDate(selectedRecord.date) }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs uppercase tracking-wide mb-1">{{ $t('health.status') }}</p>
            <StatusBadge :variant="statusVariant(selectedRecord)" :label="statusLabel(selectedRecord)" />
          </div>
        </div>
        <div v-if="selectedRecord.description">
          <p class="text-slate-500 text-sm uppercase tracking-wide mb-1">{{ $t('health.description') }} </p>
          <p class="text-base text-slate-700">{{ selectedRecord.description }}</p>
        </div>
        <div v-if="selectedRecord.medications" class="bg-amber-50 rounded-lg p-3">
          <p class="text-sm text-amber-700 font-medium mb-1">{{ $t('health.medications') }}</p>
          <p class="text-base text-slate-700">{{ selectedRecord.medications }}</p>
        </div>
        <div v-if="selectedRecord.vetName">
          <p class="text-slate-500 text-sm uppercase tracking-wide mb-1">{{ $t('health.vetName') }}</p>
          <p class="text-base text-slate-700">{{ selectedRecord.vetName }}</p>
        </div>
        <div v-if="selectedRecord.notes" class="bg-slate-50 rounded-lg p-3">
          <p class="text-sm text-slate-500 uppercase tracking-wide mb-1">{{ $t('health.notes') }}</p>
          <p class="text-base text-slate-700">{{ selectedRecord.notes }}</p>
        </div>
      </div>
    </Dialog>

    <!-- Add/Edit Dialog -->
    <Dialog v-model:visible="showAddDialog"
      :header="editingRecord ? $t('health.editHealthRecord') : $t('health.addHealthRecord')" modal :draggable="false"
      class="w-full max-w-lg">
      <form @submit.prevent="saveRecord" class="form-shell">
        <section class="form-section">
          <div class="form-section-header">
            <h3 class="form-section-title">{{ $t("health.recordDetails") }}</h3>
            <p class="form-section-description">{{ $t("health.recordDescription") }}</p>
          </div>
          <div class="form-fields">
            <div class="form-field">
              <label class="form-label">{{ $t("health.bird") }} *</label>
              <Select v-model="recordForm.birdId" :options="birds" option-label="name" option-value="id"
                :placeholder="$t('health.selectBird')" class="w-full" filter required />
            </div>
            <div class="form-grid form-grid--2">
              <div class="form-field">
                <label class="form-label">{{ $t("common.type") }}</label>
                <Select v-model="recordForm.type" :options="recordTypeOptions" option-label="label" option-value="value"
                  :placeholder="$t('health.selectType')" class="w-full" />
              </div>
              <div class="form-field">
                <label class="form-label">{{ $t("common.date") }}</label>
                <InputText v-model="recordForm.date" type="date" class="w-full" />
              </div>
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t("health.description") }} *</label>
              <Textarea v-model="recordForm.description" rows="3" class="w-full" required />
            </div>
          </div>
        </section>
        <section class="form-section">
          <div class="form-section-header">
            <h3 class="form-section-title">{{ $t("health.treatment") }}</h3>
            <p class="form-section-description">{{ $t("health.treatmentDescription") }}</p>
          </div>
          <div class="form-grid form-grid--2">
            <div class="form-field">
              <label class="form-label">{{ $t("health.medications") }}</label>
              <InputText v-model="recordForm.medications" class="w-full" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t("health.vetName") }}</label>
              <InputText v-model="recordForm.vetName" class="w-full" />
            </div>
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

    <DeleteConfirmDialog v-model="showDeleteDialog" :title="$t('health.confirmDelete')"
      :message="$t('messages.confirmDelete')" :loading="deleting" @confirm="doDeleteRecord" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useToast } from "primevue/usetoast"
import { healthApi, birdsApi } from "../services/api"
import { HEALTH_TYPE_LIST } from "../constants"
import { formatDate } from "../utils"
import StatCard from "../components/StatCard.vue"
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

const healthRecords = ref([])
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

const recordTypeOptions = HEALTH_TYPE_LIST.map((v) => ({ label: v, value: v }))

const defaultForm = () => ({
  birdId: null, type: "", date: new Date().toISOString().split("T")[0],
  description: "", medications: "", vetName: "", notes: "",
})
const recordForm = ref(defaultForm())

const criticalCount = computed(() =>
  healthRecords.value.filter((r) => ["Zranění", "Nemoc", "Operace"].includes(r.type)).length
)
const ongoingCount = computed(() =>
  healthRecords.value.filter((r) => r.medications && !r.notes?.includes("vyřešeno")).length
)
const resolvedCount = computed(() =>
  healthRecords.value.filter((r) => r.notes?.includes("vyřešeno") || r.notes?.includes("recovered")).length
)
const vetVisitsCount = computed(() => healthRecords.value.filter((r) => r.vetName).length)

const getBirdName = (birdId) => {
  const b = birds.value.find(
    (b) => b.id === birdId || b.id === +birdId
  )

  return b
    ? `${b.name} (${b.ringNumber || "—"})`
    : t("health.birdFallback", { id: birdId })
}

const severityVariant = (type) => ({
  "Prohlídka": "green", "Zranění": "red", "Nemoc": "red",
  "Léky": "amber", "Operace": "red", "Karanténa": "orange", "Jiné": "gray",
}[type] ?? "gray")

const statusVariant = (record) => {
  if (record.notes?.includes("vyřešeno")) return "green"
  if (record.medications) return "amber"
  return "gray"
}
const statusLabel = (record) => {
  if (record.notes?.includes("vyřešeno")) return "Vyřešeno"
  if (record.medications) return "Probíhá"
  return "Dokončeno"
}

const loadData = async () => {
  loading.value = true
  try {
    const [recRes, bRes] = await Promise.all([healthApi.getAll(), birdsApi.getAll()])
    healthRecords.value = recRes.data
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
      await healthApi.update(editingRecord.value.id, recordForm.value)
      toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.updated"), life: 3000 })
    } else {
      await healthApi.create(recordForm.value)
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
    await healthApi.delete(recordToDelete.value.id)
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