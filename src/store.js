import { reactive } from 'vue'

/**
 * Soglie e parametri operativi di SolarWatch.
 */
export const OFFLINE_AFTER_MIN = 30
export const REFRESH_MS = 10 * 60 * 1000
export const ALERT_AFTER_MIN = 45
export const WARNING_RATIO = 0.8
export const ALARM_RATIO = 0.5

export const TODAY = '2026-06-24'

/**
 * Generatore pseudo-casuale deterministico (LCG) per avere dati storici stabili.
 */
function seeded(seed) {
  let s = seed % 2147483647
  if (s <= 0) {
    s += 2147483646
  }
  return function () {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

/**
 * Genera lo storico giornaliero (ultimi 150 giorni) per un impianto.
 *
 * @returns {Array<{date: string, kwh: number, expectedKwh: number}>}
 */
function buildHistory(plantId, peakKw) {
  const rand = seeded(plantId * 7919 + 13)
  const series = []
  const end = new Date(TODAY + 'T00:00:00Z')
  for (let i = 149; i >= 0; i--) {
    const day = new Date(end)
    day.setUTCDate(end.getUTCDate() - i)
    const month = day.getUTCMonth()
    const seasonal = 0.55 + 0.45 * Math.sin(((month - 2) / 12) * 2 * Math.PI)
    const expectedKwh = Math.round(peakKw * 5.2 * seasonal)
    const performance = 0.7 + rand() * 0.35
    const kwh = Math.round(expectedKwh * performance)
    series.push({ date: isoDate(day), kwh, expectedKwh })
  }
  return series
}

/**
 * Eventi di allarme registrati nello storico di un impianto.
 *
 * @returns {Array<{date: string, description: string}>}
 */
function buildEvents(plantId) {
  const rand = seeded(plantId * 104729 + 5)
  const events = []
  const end = new Date(TODAY + 'T00:00:00Z')
  for (let i = 0; i < 6; i++) {
    const back = Math.floor(rand() * 150)
    const day = new Date(end)
    day.setUTCDate(end.getUTCDate() - back)
    events.push({
      date: isoDate(day),
      description: 'Produzione sotto soglia',
    })
  }
  return events.sort((a, b) => a.date.localeCompare(b.date))
}

const clients = [
  { id: 1, name: 'Supermercati Rossi' },
  { id: 2, name: 'Logistica Verdi' },
  { id: 3, name: 'Hotel Mare' },
]

/**
 * Impianti con stato "live" simulato.
 * minutesAgo = minuti trascorsi dall'ultima telemetria ricevuta.
 * belowForMin = da quanti minuti la produzione è sotto soglia (null = sopra soglia).
 */
const plants = [
  { id: 1, name: 'Tetto Capannone A', clientId: 1, peakKw: 50, expectedKw: 50, currentKw: 45, minutesAgo: 2, belowForMin: null },
  { id: 2, name: 'Pensilina Parcheggio', clientId: 1, peakKw: 22, expectedKw: 20, currentKw: 12, minutesAgo: 1, belowForMin: 40 },
  { id: 3, name: 'Magazzino Nord', clientId: 2, peakKw: 30, expectedKw: 20, currentKw: 11, minutesAgo: 3, belowForMin: 50 },
  { id: 4, name: 'Deposito Sud', clientId: 2, peakKw: 35, expectedKw: 30, currentKw: 28, minutesAgo: 18, belowForMin: null },
  { id: 5, name: 'Copertura Hotel', clientId: 3, peakKw: 40, expectedKw: 40, currentKw: 38, minutesAgo: 4, belowForMin: null },
  { id: 6, name: 'Pergola Piscina', clientId: 3, peakKw: 20, expectedKw: 20, currentKw: 14, minutesAgo: 2, belowForMin: 10 },
]

plants.forEach((p) => {
  p.history = buildHistory(p.id, p.peakKw)
  p.events = buildEvents(p.id)
})

const users = [
  { username: 'tecnico', role: 'tecnico', label: 'Tecnico di monitoraggio', clientId: null },
  { username: 'assistenza', role: 'responsabile', label: 'Responsabile assistenza', clientId: null },
  { username: 'rossi', role: 'cliente', label: 'Supermercati Rossi', clientId: 1 },
  { username: 'verdi', role: 'cliente', label: 'Logistica Verdi', clientId: 2 },
]

export const state = reactive({
  currentUser: null,
  clients,
  plants,
  users,
})

export function login(username) {
  const user = users.find((u) => u.username === username)
  if (user) {
    state.currentUser = user
    return true
  }
  return false
}

export function logout() {
  state.currentUser = null
}

export function clientName(clientId) {
  const c = clients.find((c) => c.id === clientId)
  return c ? c.name : '—'
}

/**
 * Stato corrente di un impianto in base a telemetria e produzione.
 *
 * @returns {'OK'|'Attenzione'|'Allarme'|'Offline'}
 */
export function plantStatus(plant) {
  if (plant.minutesAgo > OFFLINE_AFTER_MIN) {
    return 'Offline'
  }
  const ratio = plant.currentKw / plant.expectedKw
  if (ratio < ALARM_RATIO) {
    return 'Allarme'
  }
  if (ratio < WARNING_RATIO) {
    return 'Attenzione'
  }
  return 'OK'
}

/**
 * Impianti visibili all'utente corrente (isolamento per cliente).
 */
export function visiblePlants() {
  if (!state.currentUser) {
    return []
  }
  if (state.currentUser.role === 'cliente') {
    return state.plants.filter((p) => p.clientId === state.currentUser.clientId)
  }
  return state.plants
}

/**
 * Alert attivi: produzione sotto l'80% dell'atteso da oltre la durata prevista.
 *
 * @returns {Array<{plant: object, expectedKw: number, currentKw: number, durationMin: number}>}
 */
export function activeAlerts() {
  return visiblePlants()
    .filter((p) => {
      if (plantStatus(p) === 'Offline') {
        return false
      }
      const ratio = p.currentKw / p.expectedKw
      if (ratio >= WARNING_RATIO) {
        return false
      }
      return p.belowForMin !== null && p.belowForMin > ALERT_AFTER_MIN
    })
    .map((p) => ({
      plant: p,
      expectedKw: p.expectedKw,
      currentKw: p.currentKw,
      durationMin: p.belowForMin,
    }))
}

let nextPlantId = plants.length + 1

/**
 * Aggiunge un nuovo impianto e lo rende subito disponibile in dashboard.
 */
export function addPlant({ name, clientId, peakKw }) {
  const peak = Number(peakKw)
  const plant = {
    id: nextPlantId++,
    name,
    clientId: clientId ? Number(clientId) : null,
    peakKw: peak,
    expectedKw: peak,
    currentKw: Math.round(peak * 0.9),
    minutesAgo: 1,
    belowForMin: null,
    history: [],
    events: [],
  }
  state.plants.push(plant)
  return plant
}

/**
 * Simula l'arrivo di nuova telemetria aggiornando la potenza istantanea.
 */
export function refreshTelemetry() {
  state.plants.forEach((p) => {
    if (p.minutesAgo > OFFLINE_AFTER_MIN) {
      return
    }
    const jitter = 1 + (Math.random() - 0.5) * 0.04
    const base = p.belowForMin !== null ? p.expectedKw * 0.6 : p.expectedKw * 0.92
    p.currentKw = Math.max(0, Math.round(base * jitter))
  })
}
