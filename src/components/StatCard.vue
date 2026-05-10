<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
    <div class="flex items-center gap-4">
      <div :class="['p-3 rounded-full', iconBgClass]">
        <i :class="[icon, 'text-xl', iconColorClass]"></i>
      </div>
      <div class="min-w-0">
        <p class="text-base font-semibold text-slate-600 truncate">{{ label }}</p>
        <p class="text-3xl font-bold text-slate-900 leading-tight">
          {{ value }}
        </p>
        <p v-if="subtitle" class="text-sm text-slate-500 mt-1">{{ subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'pi pi-info-circle' },
  color: {
    type: String,
    default: 'blue',
    validator: (v) => ['blue', 'green', 'purple', 'orange', 'red', 'amber'].includes(v),
  },
})

const colorMap = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
}

const iconBgClass = computed(() => colorMap[props.color]?.bg ?? colorMap.blue.bg)
const iconColorClass = computed(() => colorMap[props.color]?.text ?? colorMap.blue.text)
</script>
