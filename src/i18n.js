import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'
import cs from './locales/cs.json'
import en from './locales/en.json'

const LANGUAGE_KEY = 'nest-language'
const DEFAULT_LANGUAGE = 'cs'

const getSavedLanguage = () => {
  const saved = localStorage.getItem(LANGUAGE_KEY)
  return saved || DEFAULT_LANGUAGE
}

const primevueLocales = {
  en: {
    startsWith: 'Starts with',
    contains: 'Contains',
    notContains: 'Not contains',
    endsWith: 'Ends with',
    equals: 'Equals',
    notEquals: 'Not equals',
    noFilter: 'No Filter',
    filter: 'Filter',
    apply: 'Apply',
    matchAll: 'Match All',
    matchAny: 'Match Any',
    addRule: 'Add Rule',
    removeRule: 'Remove Rule',
    accept: 'Yes',
    reject: 'No',
    choose: 'Choose',
    upload: 'Upload',
    cancel: 'Cancel',
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today',
    clear: 'Clear',
    weekHeader: 'W'
  },
  cs: {
    startsWith: 'Začíná na',
    contains: 'Obsahuje',
    notContains: 'Neobsahuje',
    endsWith: 'Končí na',
    equals: 'Je rovno',
    notEquals: 'Není rovno',
    noFilter: 'Bez filtru',
    filter: 'Filtrovat',
    apply: 'Použít',
    matchAll: 'Odpovídat všem',
    matchAny: 'Odpovídat kterémukoli',
    addRule: 'Přidat pravidlo',
    removeRule: 'Odstranit pravidlo',
    accept: 'Ano',
    reject: 'Ne',
    choose: 'Vybrat',
    upload: 'Nahrát',
    cancel: 'Zrušit',
    dayNames: ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'],
    dayNamesShort: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
    dayNamesMin: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
    monthNames: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'],
    monthNamesShort: ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Črn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'],
    today: 'Dnes',
    clear: 'Vymazat',
    weekHeader: 'T'
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: getSavedLanguage(),
  fallbackLocale: DEFAULT_LANGUAGE,
  messages: {
    cs,
    en
  },
  globalInjection: true
})

export const initializeLocale = () => {
  const locale = getSavedLanguage()
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
}

export const getPrimeVueLocale = (locale) => {
  return primevueLocales[locale] || primevueLocales.en
}

export const setLanguage = (locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem(LANGUAGE_KEY, locale)
  document.documentElement.lang = locale

  if (PrimeVue.config) {
    PrimeVue.config.locale = getPrimeVueLocale(locale)
  }
}

export const getCurrentLanguage = () => {
  return i18n.global.locale.value
}

export const getAvailableLanguages = () => [
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

initializeLocale()
