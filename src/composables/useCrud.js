import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'


export function useCrud(apiService, { defaultForm = () => ({}) } = {}) {
  const toast = useToast()
  const { t } = useI18n()

  const items = ref([])          // načtená data ze serveru
  const loading = ref(false)     // probíhá načítání seznamu
  const saving = ref(false)      // probíhá ukládání / mazání
  const showDialog = ref(false)       // je otevřený formulářový dialog
  const showViewDialog = ref(false)   // je otevřený detail položky
  const editingItem = ref(null)  // právě editovaná položka (null = vytváříme novou)
  const selectedItem = ref(null) // položka zobrazená v detail dialogu
  const form = ref(defaultForm()) // aktuální hodnoty formuláře

  // Načte všechny položky ze serveru. Zobrazí chybovou hlášku, pokud se to nepodaří.
  const loadAll = async () => {
    loading.value = true
    try {
      const res = await apiService.getAll()
      items.value = res.data
    } catch {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('messages.networkError'),
        life: 4000,
      })
    } finally {
      loading.value = false
    }
  }

  // Otevře prázdný dialog pro vytvoření nové položky
  const openCreate = () => {
    editingItem.value = null
    form.value = defaultForm()
    showDialog.value = true
  }

  // Otevře dialog s předem vyplněnými hodnotami pro úpravu existující položky
  const openEdit = (item) => {
    editingItem.value = item
    form.value = { ...item } // kopírujeme objekt, aby úpravy nešly přímo do tabulky
    showDialog.value = true
  }

  // Otevře detail dialogu (pouze pro čtení)
  const openView = (item) => {
    selectedItem.value = item
    showViewDialog.value = true
  }

  // Uloží formulář — buďť aktualizuje existující položku, nebo vytvoří novou
  const save = async () => {
    saving.value = true
    try {
      if (editingItem.value) {
        // Máme editingItem — jde o úpravu existující položky
        await apiService.update(editingItem.value.id, form.value)
        toast.add({
          severity: 'success',
          summary: t('common.success'),
          detail: t('messages.updated'),
          life: 3000,
        })
      } else {
        // Žádné editingItem — vytváříme novou položku
        await apiService.create(form.value)
        toast.add({
          severity: 'success',
          summary: t('common.success'),
          detail: t('messages.created'),
          life: 3000,
        })
      }
      showDialog.value = false
      await loadAll()
    } catch {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('messages.error'),
        life: 4000,
      })
    } finally {
      saving.value = false
    }
  }

  // Smaže položku ze serveru a znovu načte seznam
  const remove = async (item) => {
    try {
      await apiService.delete(item.id)
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('messages.deleted'),
        life: 3000,
      })
      await loadAll()
    } catch {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: t('messages.error'),
        life: 4000,
      })
    }
  }

  return {
    items,
    loading,
    saving,
    showDialog,
    showViewDialog,
    editingItem,
    selectedItem,
    form,
    loadAll,
    openCreate,
    openEdit,
    openView,
    save,
    remove,
  }
}
