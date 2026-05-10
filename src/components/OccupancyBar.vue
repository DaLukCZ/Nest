<template>
  <div class="w-full">
    <div class="flex justify-between text-sm text-slate-600 mb-1.5 font-medium">
      <span>{{ current }} / {{ capacity }}</span>
      <span :class="percentageClass">{{ percent }}%</span>
    </div>

    <div class="w-full bg-slate-200 rounded-full" :class="heightClass">
      <div class="rounded-full transition-all duration-500" :class="[barClass, heightClass]"
        :style="{ width: `${percent}%` }" />
    </div>

    <p v-if="showWarning && severity === 'danger'" class="text-sm text-red-600 mt-1.5 flex items-center gap-1">
      <i class="pi pi-exclamation-triangle text-sm" />
      {{ $t("occupancy.overcrowded") }}
    </p>

    <p v-else-if="showWarning && severity === 'warning'" class="text-sm text-amber-600 mt-1.5 flex items-center gap-1">
      <i class="pi pi-exclamation-circle text-sm" />
      {{ $t("occupancy.almostFull") }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { calcOccupancyPercent, getOccupancySeverity, getOccupancyBarClass } from '../utils'

const props = defineProps({
  current: { type: Number, required: true },
  capacity: { type: Number, required: true },
  showWarning: { type: Boolean, default: false },
  size: { type: String, default: 'sm', validator: (v) => ['xs', 'sm', 'md'].includes(v) },
})

const percent = computed(() => calcOccupancyPercent(props.current, props.capacity))
const severity = computed(() => getOccupancySeverity(props.current, props.capacity))
const barClass = computed(() => getOccupancyBarClass(props.current, props.capacity))

const heightClass = computed(
  () => ({ xs: 'h-1', sm: 'h-2', md: 'h-3' })[props.size]
)

const percentageClass = computed(() => ({
  safe: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
})[severity.value])
</script>
