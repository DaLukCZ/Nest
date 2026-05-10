<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t("feeding.feedingLogs") }}</h1>
        <p class="text-base text-slate-600 mt-0.5">{{ feedingLogs.length }} {{ $t('common.records') }}</p>
      </div>
      <Button icon="pi pi-plus" :label="$t('feeding.addFeedingLog')" @click="openAddDialog" />
    </div>

    <!-- Recent feedings summary -->
    <div class="card p-5">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("feeding.recentFeedings") }}</h3>
      <div v-if="!recentFeedings.length" class="text-center py-6 text-slate-500 text-base">{{ $t('feeding.noFeedings')
        }}</div>
      <div v-else class="space-y-3">
        <div v-for="log in recentFeedings" :key="log.id"
          class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-emerald-100 rounded-full">
              <i class="pi pi-shopping-cart text-emerald-600 text-sm"></i>
            </div>
            <div>
              <p class="font-medium text-gray-900 text-base">{{ log.foodType }}</p>
              <p class="text-sm text-slate-600">{{ getAviaryName(log.aviaryId) }} · {{ log.quantity }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-base font-medium text-gray-900">{{ formatDate(log.feedingDate) }}</p>
            <p class="text-sm text-slate-600">{{ log.supplements || "—" }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Feeding Table -->
    <div class="card overflow-hidden">
      <DataTable :value="feedingLogs" :loading="loading" paginator :rows="15" dataKey="id" stripedRows
        class="p-datatable-sm">
        <template #empty>
          <EmptyState icon="pi pi-shopping-cart" :title="$t('feeding.noFeedings')"
            :description="$t('feeding.noFeedingsDescription')" />
        </template>
        <Column :header="$t('aviaries.aviaries')" sortable>
          <template #body="{ data }">
            <span class="font-medium text-gray-900">{{ getAviaryName(data.aviaryId) }}</span>
          </template>
        </Column>
        <Column field="foodType" :header="$t('feeding.foodType')" sortable />
        <Column field="quantity" :header="$t('feeding.quantity')" />
        <Column field="supplements" :header="$t('feeding.supplements')">
          <template #body="{ data }">{{ data.supplements || "—" }}</template>
        </Column>
        <Column field="feedingDate" :header="$t('feeding.date')" sortable>
          <template #body="{ data }">{{ formatDate(data.feedingDate) }}</template>
        </Column>
        <Column :header="$t('common.actions')" style="width:90px">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Button icon="pi pi-pencil" text rounded size="small" @click="editLog(data)" />
              <Button icon="pi pi-trash" text rounded size="small" severity="danger" @click="confirmDeleteLog(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Add/Edit Dialog -->
    <Dialog v-model:visible="showAddDialog"
      :header="editingLog ? $t('feeding.editFeedingLog') : $t('feeding.addFeedingLog')" modal :draggable="false"
      class="w-full max-w-md">
      <form @submit.prevent="saveLog" class="form-shell">
        <section class="form-section">
          <div class="form-section-header">
            <h3 class="form-section-title">{{ $t("feeding.logDetails") }}</h3>
            <p class="form-section-description">{{ $t("feeding.logDescription") }}</p>
          </div>
          <div class="form-fields">
            <div class="form-field">
              <label class="form-label">{{ $t("feeding.aviary") }}*</label>
              <Select v-model="logForm.aviaryId" :options="aviaries" option-label="name" option-value="id"
                :placeholder="$t('feeding.selectAviary')" class="w-full" required />
            </div>
            <div class="form-grid form-grid--2">
              <div class="form-field">
                <label class="form-label">{{ $t("feeding.foodType") }}</label>
                <Select v-model="logForm.foodType" :options="foodTypeList" :placeholder="$t('feeding.selectFoodType')"
                  class="w-full" editable />
              </div>
              <div class="form-field">
                <label class="form-label">{{ $t("feeding.quantity") }}</label>
                <InputText v-model="logForm.quantity" :placeholder="$t('feeding.quantityPlaceholder')" class="w-full" />
              </div>
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t("feeding.feedingDate") }}</label>
              <InputText v-model="logForm.feedingDate" type="date" class="w-full" />
            </div>
          </div>
        </section>
        <section class="form-section">
          <div class="form-section-header">
            <h3 class="form-section-title">{{ $t("feeding.supplementsAndNotes") }}</h3>
            <p class="form-section-description">{{ $t("feeding.supplementsDescription") }}</p>
          </div>
          <div class="form-fields">
            <div class="form-field">
              <label class="form-label">{{ $t("feeding.supplements") }}</label>
              <InputText v-model="logForm.supplements" :placeholder="$t('feeding.supplementsPlaceholder')"
                class="w-full" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t("common.notes") }}</label>
              <Textarea v-model="logForm.notes" rows="3" class="w-full" />
            </div>
          </div>
        </section>
        <div class="form-actions">
          <Button type="button" :label="$t('common.cancel')" severity="secondary" text @click="showAddDialog = false" />
          <Button type="submit" :label="editingLog ? $t('common.save') : $t('common.add')" :loading="saving" />
        </div>
      </form>
    </Dialog>

    <DeleteConfirmDialog v-model="showDeleteDialog" :title="$t('feeding.confirmDelete')"
      :message="$t('messages.confirmDelete')" :loading="deleting" @confirm="doDeleteLog" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useToast } from "primevue/usetoast"
import { feedingApi, aviariesApi } from "../services/api"
import { FOOD_TYPE_LIST } from "../constants"
import { formatDate } from "../utils"
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

const feedingLogs = ref([])
const aviaries = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const editingLog = ref(null)
const logToDelete = ref(null)

// Use constant list — NOT $t() in computed (bug fix!)
const foodTypeList = FOOD_TYPE_LIST

const defaultForm = () => ({
  aviaryId: null, foodType: "", quantity: "", supplements: "",
  feedingDate: new Date().toISOString().split("T")[0], notes: "",
})
const logForm = ref(defaultForm())

const recentFeedings = computed(() =>
  [...feedingLogs.value].sort((a, b) => new Date(b.feedingDate) - new Date(a.feedingDate)).slice(0, 5)
)

const getAviaryName = (id) => {
  const av = aviaries.value.find((a) => a.id == id || a.id == +id)
  return av ? av.name : `Voliéra ${id}`
}

const loadData = async () => {
  loading.value = true
  try {
    const [logRes, avRes] = await Promise.all([feedingApi.getAll(), aviariesApi.getAll()])
    feedingLogs.value = logRes.data
    aviaries.value = avRes.data
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.networkError"), life: 4000 })
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => { editingLog.value = null; logForm.value = defaultForm(); showAddDialog.value = true }
const editLog = (log) => { editingLog.value = log; logForm.value = { ...log }; showAddDialog.value = true }
const confirmDeleteLog = (log) => { logToDelete.value = log; showDeleteDialog.value = true }

const saveLog = async () => {
  saving.value = true
  try {
    if (editingLog.value) {
      await feedingApi.update(editingLog.value.id, logForm.value)
      toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.updated"), life: 3000 })
    } else {
      await feedingApi.create(logForm.value)
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

const doDeleteLog = async () => {
  if (!logToDelete.value) return
  deleting.value = true
  try {
    await feedingApi.delete(logToDelete.value.id)
    toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.deleted"), life: 3000 })
    showDeleteDialog.value = false
    await loadData()
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.error"), life: 4000 })
  } finally {
    deleting.value = false; logToDelete.value = null
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