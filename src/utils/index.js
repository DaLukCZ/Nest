import { OCCUPANCY_THRESHOLDS } from '../constants'

export function formatDate(dateString, locale = 'cs-CZ') {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString(locale)
  } catch {
    return dateString
  }
}

export function calculateAge(hatchDate) {
  if (!hatchDate) {
    return {
      months: 0,
      years: 0,
      label: "—",
      parts: {
        years: 0,
        months: 0,
      },
    }
  }

  const now = new Date()
  const birth = new Date(hatchDate)

  const diffMs = now - birth

  if (diffMs < 0) {
    return {
      months: 0,
      years: 0,
      label: "—",
      parts: {
        years: 0,
        months: 0,
      },
    }
  }

  const totalMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44))

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  return {
    months: totalMonths,
    years,
    label: "",
    parts: {
      years,
      months,
    },
  }
}

export function formatTimeAgo(dateString) {
  if (!dateString) return ''
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  if (diffHours < 1) return 'Právě teď'
  if (diffHours < 24) return `před ${diffHours}h`
  if (diffDays < 30) return `před ${diffDays}d`
  return formatDate(dateString)
}

export function calcOccupancyPercent(current, capacity) {
  if (!capacity || capacity === 0) return 0
  return Math.min(100, Math.round((current / capacity) * 100))
}

export function getOccupancySeverity(current, capacity) {
  if (!capacity || capacity === 0) return 'safe'
  const ratio = current / capacity
  if (ratio >= OCCUPANCY_THRESHOLDS.DANGER) return 'danger'
  if (ratio >= OCCUPANCY_THRESHOLDS.WARNING) return 'warning'
  return 'safe'
}

export function getOccupancyBarClass(current, capacity) {
  const severity = getOccupancySeverity(current, capacity)
  return {
    safe: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  }[severity]
}

export function calcSuccessRate(record) {
  if (!record || record.eggsLaid === 0) return 0
  return Math.round((record.survivedChicks / record.eggsLaid) * 100)
}

export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function getGenderBadgeClass(gender) {
  const map = {
    samec: 'badge-blue',
    samice: 'badge-pink',
    neznámé: 'badge-gray',
  }
  return map[gender] ?? 'badge-gray'
}

export function getStatusBadgeClass(status) {
  const map = {
    aktivní: 'badge-green',
    neaktivní: 'badge-gray',
    karanténa: 'badge-orange',
    prodáno: 'badge-blue',
    zemřelý: 'badge-red',
  }
  return map[status] ?? 'badge-gray'
}

export function getHealthSeverityClass(type) {
  const map = {
    Prohlídka: 'badge-green',
    Zranění: 'badge-red',
    Nemoc: 'badge-red',
    Léky: 'badge-orange',
    Operace: 'badge-red',
    Karanténa: 'badge-orange',
    Jiné: 'badge-gray',
  }
  return map[type] ?? 'badge-gray'
}
