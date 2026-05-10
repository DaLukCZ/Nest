<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">{{ $t("settings.title") }}</h1>
    </div>

    <!-- Language -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("settings.language") }}</h3>
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium text-gray-900 text-base">{{ $t("language.select") }}</p>
        </div>
        <div class="flex gap-2">
          <Button v-for="lang in availableLanguages" :key="lang.code" :label="`${lang.flag} ${lang.name}`"
            :outlined="currentLanguageCode !== lang.code" @click="changeLanguage(lang.code)" />
        </div>
      </div>
    </div>

    <!-- Data Management -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("settings.data") }}</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 text-base">{{ $t("settings.export") }}</p>
            <p class="text-base text-slate-600">{{ $t("settings.exportDescription") }}</p>
          </div>
          <Button :label="$t('settings.export')" icon="pi pi-download" outlined @click="exportData" />
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-gray-900 text-base">{{ $t("settings.import") }}</p>
            <p class="text-base text-slate-600">{{ $t("settings.importDescription") }}</p>
          </div>
          <div>
            <input ref="fileInput" type="file" accept=".json" @change="handleFileSelect" class="hidden" />
            <Button :label="$t('settings.import')" icon="pi pi-upload" outlined @click="fileInput.click()" />
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-red-600 text-base">{{ $t("settings.reset") }}</p>
            <p class="text-base text-slate-600">{{ $t("settings.resetDescription") }}</p>
          </div>
          <Button :label="$t('settings.reset')" icon="pi pi-trash" severity="danger" outlined @click="confirmReset" />
        </div>
      </div>
    </div>

    <!-- System Info -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t("settings.systemInfo") }}</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p class="text-slate-500 text-sm uppercase tracking-wide mb-1">{{ $t("settings.version") }}</p>
          <p class="font-semibold text-gray-900">0.5.12</p>
        </div>
        <div>
          <p class="text-slate-500 text-sm uppercase tracking-wide mb-1">{{ $t("settings.date") }}</p>
          <p class="font-semibold text-gray-900">{{ new Date().toLocaleDateString("cs-CZ") }}</p>
        </div>
        <div>
          <p class="text-slate-500 text-sm uppercase tracking-wide mb-1">{{ $t("settings.totalRecords") }}</p>
          <p class="font-semibold text-gray-900">{{ totalRecords }}</p>
        </div>
        <div>
          <p class="text-slate-500 text-sm uppercase tracking-wide mb-1">{{ $t("settings.storage") }}</p>
          <p class="font-semibold text-gray-900">~{{ storageSize }} KB</p>
        </div>
      </div>
    </div>

    <!-- Reset Confirmation -->
    <Dialog v-model:visible="showResetDialog" :header="$t('settings.reset')" modal :draggable="false"
      class="w-full max-w-md">
      <div class="space-y-4">
        <div class="p-4 bg-red-50 rounded-lg flex gap-3">
          <i class="pi pi-exclamation-triangle text-red-500 mt-0.5"></i>
          <div>
            <p class="font-medium text-red-700 text-base">{{ $t("messages.warning") }}</p>
            <p class="text-base text-red-600 mt-1">{{ $t("messages.confirmDelete") }}</p>
          </div>
        </div>
        <div>
          <label class="block text-base font-medium text-gray-700 mb-2">{{ $t("settings.confirmReset") }}</label>
          <InputText v-model="resetConfirmation" class="w-full" placeholder="RESET" />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button :label="$t('common.cancel')" text @click="showResetDialog = false" />
          <Button :label="$t('settings.reset')" severity="danger" :disabled="resetConfirmation !== 'RESET'"
            @click="resetDatabase" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useI18n } from "vue-i18n"
import { birdsApi, pairsApi, breedingApi, healthApi, aviariesApi, feedingApi } from "../services/api"
import { setLanguage, getCurrentLanguage, getAvailableLanguages } from "../i18n"
import { useToast } from "primevue/usetoast"
import Button from "primevue/button"
import InputText from "primevue/inputtext"
import Dialog from "primevue/dialog"

const toast = useToast()
const { t } = useI18n()

const fileInput = ref(null)
const showResetDialog = ref(false)
const resetConfirmation = ref("")
const currentLanguageCode = ref(getCurrentLanguage())
const availableLanguages = getAvailableLanguages()

const birds = ref([])
const pairs = ref([])
const breedingRecords = ref([])
const healthRecords = ref([])
const aviaries = ref([])
const feedingLogs = ref([])

const totalRecords = computed(() =>
  birds.value.length + pairs.value.length + breedingRecords.value.length +
  healthRecords.value.length + aviaries.value.length + feedingLogs.value.length
)
const storageSize = computed(() =>
  Math.round(JSON.stringify({ birds: birds.value, pairs: pairs.value, breedingRecords: breedingRecords.value, healthRecords: healthRecords.value, aviaries: aviaries.value, feedingLogs: feedingLogs.value }).length / 1024)
)

const loadData = async () => {
  try {
    const [bRes, pRes, brRes, hRes, avRes, fRes] = await Promise.all([
      birdsApi.getAll(), pairsApi.getAll(), breedingApi.getAll(), healthApi.getAll(), aviariesApi.getAll(), feedingApi.getAll(),
    ])
    birds.value = bRes.data; pairs.value = pRes.data; breedingRecords.value = brRes.data
    healthRecords.value = hRes.data; aviaries.value = avRes.data; feedingLogs.value = fRes.data
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.networkError"), life: 4000 })
  }
}

const exportData = () => {
  const data = { birds: birds.value, pairs: pairs.value, aviaries: aviaries.value, breedingRecords: breedingRecords.value, feedingLogs: feedingLogs.value, healthRecords: healthRecords.value, exportDate: new Date().toISOString(), version: "0.5.12" }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = `nest-backup-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.saved"), life: 3000 })
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try { importData(JSON.parse(e.target.result)) }
    catch { toast.add({ severity: "error", summary: t("common.error"), detail: "Neplatný soubor JSON", life: 4000 }) }
  }
  reader.readAsText(file)
}

const importData = async (data) => {
  try {
    await Promise.all([
      ...(data.birds?.map((b) => birdsApi.create(b)) || []),
      ...(data.pairs?.map((p) => pairsApi.create(p)) || []),
      ...(data.aviaries?.map((a) => aviariesApi.create(a)) || []),
      ...(data.breedingRecords?.map((r) => breedingApi.create(r)) || []),
      ...(data.feedingLogs?.map((l) => feedingApi.create(l)) || []),
      ...(data.healthRecords?.map((r) => healthApi.create(r)) || []),
    ])
    toast.add({ severity: "success", summary: t("common.success"), detail: t("messages.created"), life: 3000 })
    await loadData()
  } catch {
    toast.add({ severity: "error", summary: t("common.error"), detail: t("messages.error"), life: 4000 })
  }
}

const confirmReset = () => { showResetDialog.value = true; resetConfirmation.value = "" }
const resetDatabase = async () => {
  if (resetConfirmation.value !== "RESET") return
  // Reset requires backend support — inform user
  toast.add({ severity: "info", summary: "Info", detail: "Reset vyžaduje ruční úpravu db.json", life: 5000 })
  showResetDialog.value = false
}

const changeLanguage = (locale) => {
  setLanguage(locale)
  currentLanguageCode.value = locale
  toast.add({ severity: "success", summary: t("common.success"), detail: t("language.select"), life: 2000 })
}

onMounted(loadData)
</script>