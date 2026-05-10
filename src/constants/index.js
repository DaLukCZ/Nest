// Druhy ptáků 
export const SPECIES = {
  BUDGERIGAR: 'Andulka',
  COCKATIEL: 'Korela',
  ROSELLA: 'Rosela',
  CANARY: 'Kanár',
}

export const SPECIES_LIST = Object.values(SPECIES)

// Odrůdy specifické pro každý druh
export const SPECIES_VARIETIES = {
  [SPECIES.BUDGERIGAR]: ['Anglická', 'Australská'],
  [SPECIES.COCKATIEL]: ['Přírodní', 'Lutino', 'Perlová', 'Skořicová', 'Bílolící'],
  [SPECIES.ROSELLA]: ['Pestrá', 'Pennantova', 'Žlutolící'],
  [SPECIES.CANARY]: ['Zpěvný', 'Barevný'],
}

// Barevné mutace
export const SPECIES_MUTATIONS = {
  [SPECIES.BUDGERIGAR]: ['Zelená', 'Modrá', 'Lutino', 'Albino', 'Šedokřídlá'],
  [SPECIES.COCKATIEL]: ['Šedá', 'Lutino', 'Perlová', 'Bílolící', 'Skořicová'],
  [SPECIES.ROSELLA]: ['Přírodní', 'Červená', 'Modrá', 'Žlutá'],
  [SPECIES.CANARY]: ['Žlutá', 'Oranžová', 'Červená', 'Bílá'],
}

// Ikony a barvy pro vizualizaci druhů
export const SPECIES_ICONS = {
  [SPECIES.BUDGERIGAR]: 'pi pi-send',
  [SPECIES.COCKATIEL]: 'pi pi-star',
  [SPECIES.ROSELLA]: 'pi pi-palette',
  [SPECIES.CANARY]: 'pi pi-volume-up',
}

export const SPECIES_COLORS = {
  [SPECIES.BUDGERIGAR]: '#3B82F6',
  [SPECIES.COCKATIEL]: '#10B981',
  [SPECIES.ROSELLA]: '#F59E0B',
  [SPECIES.CANARY]: '#EF4444',
}

// Pohlaví
export const GENDER = {
  MALE: 'samec',
  FEMALE: 'samice',
  UNKNOWN: 'neznámé',
}

export const GENDER_LIST = Object.values(GENDER)

// Stav ptáka
export const BIRD_STATUS = {
  ACTIVE: 'aktivní',
  INACTIVE: 'neaktivní',
  QUARANTINE: 'karanténa',
  SOLD: 'prodáno',
  DECEASED: 'zemřelý',
}

export const BIRD_STATUS_LIST = Object.values(BIRD_STATUS)

// Typy zdravotních záznamů
export const HEALTH_TYPE = {
  CHECKUP: 'Prohlídka',
  INJURY: 'Zranění',
  ILLNESS: 'Nemoc',
  MEDICATION: 'Léky',
  SURGERY: 'Operace',
  QUARANTINE: 'Karanténa',
  OTHER: 'Jiné',
}

export const HEALTH_TYPE_LIST = Object.values(HEALTH_TYPE)

// Stav zdravotního záznamu
export const HEALTH_STATUS = {
  OPEN: 'otevřeno',
  ONGOING: 'probíhá',
  RESOLVED: 'vyřešeno',
}

// Typy krmiva
export const FOOD_TYPE = {
  SEED_MIX: 'Směs semen',
  PELLETS: 'Peletky',
  FRUITS: 'Ovoce',
  VEGETABLES: 'Zelenina',
  INSECTS: 'Hmyz',
  EGG_FOOD: 'Vaječná směs',
  OTHER: 'Jiné',
}

export const FOOD_TYPE_LIST = Object.values(FOOD_TYPE)

// Typy voliér
export const AVIARY_TYPE = {
  INDOOR: 'Vnitřní',
  OUTDOOR: 'Venkovní',
  BASEMENT: 'Sklep',
}

export const AVIARY_TYPE_LIST = Object.values(AVIARY_TYPE)

// Původ ptáka
export const ORIGIN_LIST = [
  'Vlastní odchov',
  'Zakoupený',
  'Darovaný',
  'Zachráněný',
]

// Prahy obsazenosti
// Podle těchto hodnot se rozhoduje, zda se voliéra zobrazí jako zelená / žlutá / červená
export const OCCUPANCY_THRESHOLDS = {
  SAFE: 0.7,
  WARNING: 0.85,
  DANGER: 1.0,
}
