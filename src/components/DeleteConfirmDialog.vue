<template>
  <Dialog v-model:visible="visible" :header="$t('common.confirm')" modal :draggable="false" class="w-full max-w-md">
    <div class="flex gap-4 items-start">
      <div class="p-2 bg-red-100 rounded-full flex-shrink-0">
        <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
      </div>
      <div>
        <p class="text-lg font-semibold text-slate-900 mb-1">{{ title }}</p>
        <p class="text-base text-slate-600 leading-relaxed">{{ message }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button :label="$t('common.cancel')" severity="secondary" text @click="visible = false" />
        <Button :label="$t('common.delete')" severity="danger" icon="pi pi-trash" :loading="loading"
          @click="$emit('confirm')" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

defineProps({
  title: { type: String, default: 'Smazat položku?' },
  message: { type: String, default: 'Tato akce je nevratná.' },
  loading: { type: Boolean, default: false },
})

const visible = defineModel({ type: Boolean, default: false })
defineEmits(['confirm'])
</script>
