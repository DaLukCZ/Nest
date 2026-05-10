<template>
  <span :class="badgeClass">
    <i v-if="icon" :class="[icon, 'mr-1 text-sm']"></i>
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'gray',
    validator: (v) =>
      ['green', 'blue', 'pink', 'red', 'orange', 'amber', 'gray', 'purple'].includes(v),
  },
  label: { type: String, default: '' },
  icon: { type: String, default: '' },
  size: { type: String, default: 'sm', validator: (v) => ['xs', 'sm', 'md'].includes(v) },
})

const sizeClass = computed(() => ({
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2.5 py-1 text-sm',
  md: 'px-3 py-1.5 text-sm',
})[props.size])

const variantClass = computed(() => ({
  green: 'bg-emerald-100 text-emerald-800',
  blue: 'bg-blue-100 text-blue-800',
  pink: 'bg-pink-100 text-pink-800',
  red: 'bg-red-100 text-red-800',
  orange: 'bg-orange-100 text-orange-800',
  amber: 'bg-amber-100 text-amber-800',
  gray: 'bg-gray-100 text-gray-700',
  purple: 'bg-purple-100 text-purple-800',
})[props.variant])

const badgeClass = computed(
  () => `inline-flex items-center font-medium rounded-full ${sizeClass.value} ${variantClass.value}`
)
</script>
