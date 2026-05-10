<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="p-5 bg-slate-100 rounded-full mb-4">
      <i :class="[icon, 'text-4xl text-slate-500']"></i>
    </div>
    <h3 class="text-xl font-semibold text-slate-800 mb-2">{{ title }}</h3>
    <p v-if="description" class="text-base text-slate-600 max-w-sm leading-relaxed">
      {{ description }}
    </p>
    <slot name="action" />
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'pi pi-inbox' },
  title: { type: String, default: 'Žádná data' },
  description: { type: String, default: '' },
})
</script>
