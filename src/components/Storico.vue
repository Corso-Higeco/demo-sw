<script setup>
import { computed, ref } from 'vue'
import { state } from '../store.js'

const selectedPlantId = ref('')
const startDate = ref('2026-05-01')
const endDate = ref('2026-05-31')

const selectedPlant = computed(() =>
  state.plants.find((p) => p.id === Number(selectedPlantId.value)),
)

const filtered = computed(() => {
  const p = selectedPlant.value
  if (!p) {
    return []
  }
  return p.history.filter((h) => h.date >= startDate.value && h.date < endDate.value)
})

const totalKwh = computed(() => filtered.value.reduce((s, h) => s + h.kwh, 0))

const chart = computed(() => {
  const data = filtered.value
  if (data.length === 0) {
    return null
  }
  const width = 720
  const height = 220
  const pad = 30
  const max = Math.max(...data.map((d) => d.kwh)) || 1
  const stepX = data.length > 1 ? (width - pad * 2) / (data.length - 1) : 0
  const points = data.map((d, i) => {
    const x = pad + i * stepX
    const y = height - pad - (d.kwh / max) * (height - pad * 2)
    return { x, y, d }
  })
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  return { width, height, points, path, max }
})

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function downloadRaw() {
  const p = selectedPlant.value
  if (!p) {
    return
  }
  const lines = ['data;kwh;atteso_kwh']
  filtered.value.forEach((h) => {
    lines.push(`${h.date};${h.kwh};${h.expectedKwh}`)
  })
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  download(blob, `storico-${p.name}-${startDate.value}_${endDate.value}.csv`)
}
</script>

<template>
  <div data-cy="storico">
    <h1>Storico impianto</h1>
    <p class="subtitle">Seleziona impianto e intervallo di date.</p>

    <div class="card">
      <div class="row">
        <div class="field" style="margin: 0">
          <label>Impianto</label>
          <select v-model="selectedPlantId" data-cy="storico-plant">
            <option value="">— seleziona —</option>
            <option v-for="p in state.plants" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div class="field" style="margin: 0">
          <label>Da</label>
          <input type="date" v-model="startDate" data-cy="storico-start" />
        </div>
        <div class="field" style="margin: 0">
          <label>A</label>
          <input type="date" v-model="endDate" data-cy="storico-end" />
        </div>
        <button
          class="btn secondary"
          data-cy="storico-download"
          :disabled="filtered.length === 0"
          @click="downloadRaw"
        >
          Scarica dati grezzi
        </button>
      </div>
    </div>

    <div v-if="selectedPlant" class="card" data-cy="storico-result">
      <p>
        Totale periodo: <strong data-cy="storico-total">{{ totalKwh }} kWh</strong>
        <span class="muted"> · {{ filtered.length }} giorni</span>
      </p>

      <svg
        v-if="chart"
        :viewBox="`0 0 ${chart.width} ${chart.height}`"
        width="100%"
        data-cy="storico-chart"
        style="background: #0f172a; border-radius: 8px"
      >
        <polyline
          :points="chart.points.map((p) => `${p.x},${p.y}`).join(' ')"
          fill="none"
          stroke="#f59e0b"
          stroke-width="2"
        />
        <circle v-for="(p, i) in chart.points" :key="i" :cx="p.x" :cy="p.y" r="2.5" fill="#f59e0b" />
      </svg>
      <p v-else class="muted" data-cy="storico-empty">Nessun dato nell'intervallo selezionato.</p>
    </div>
  </div>
</template>
