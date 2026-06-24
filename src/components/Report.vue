<script setup>
import { computed, ref } from 'vue'
import { state, clientName } from '../store.js'

const selectedClientId = ref('')
const selectedMonth = ref('2026-05')

const report = computed(() => {
  if (!selectedClientId.value || !selectedMonth.value) {
    return null
  }
  const cid = Number(selectedClientId.value)
  const month = selectedMonth.value
  const plants = state.plants.filter((p) => p.clientId === cid)

  let produced = 0
  let expected = 0
  const events = []

  plants.forEach((p) => {
    p.history
      .filter((h) => h.date.startsWith(month))
      .forEach((h) => {
        produced += h.kwh
        expected += h.expectedKwh
      })
    p.events
      .filter((e) => e.date.startsWith(month))
      .forEach((e) => {
        events.push({ plant: p.name, date: e.date, description: e.description })
      })
  })

  const scostamento = expected > 0 ? ((produced - expected) / expected) * 100 : 0

  return {
    clientName: clientName(cid),
    month,
    produced,
    expected,
    scostamento,
    events: events.sort((a, b) => a.date.localeCompare(b.date)),
  }
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

function exportCsv() {
  const r = report.value
  if (!r) {
    return
  }
  const lines = []
  lines.push('Report mensile;' + r.clientName + ';' + r.month)
  lines.push('')
  lines.push('Energia prodotta (kWh);' + r.produced)
  lines.push('Energia attesa (kWh);' + r.expected)
  lines.push('Scostamento (%);' + r.scostamento.toFixed(1))
  lines.push('')
  lines.push('Eventi di allarme')
  lines.push('Impianto;Data;Descrizione')
  r.events.forEach((e) => {
    lines.push(`${e.plant};${e.date};${e.description}`)
  })
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  download(blob, `report-${r.clientName}-${r.month}.csv`)
}

function exportPdf() {
  const r = report.value
  if (!r) {
    return
  }
  const blob = new Blob([], { type: 'application/pdf' })
  download(blob, `report-${r.clientName}-${r.month}.pdf`)
}
</script>

<template>
  <div data-cy="report">
    <h1>Report mensile cliente</h1>
    <p class="subtitle">Seleziona cliente e mese per generare il report.</p>

    <div class="card">
      <div class="row">
        <div class="field" style="margin: 0">
          <label>Cliente</label>
          <select v-model="selectedClientId" data-cy="report-client">
            <option value="">— seleziona —</option>
            <option v-for="c in state.clients" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="field" style="margin: 0">
          <label>Mese</label>
          <input type="month" v-model="selectedMonth" data-cy="report-month" />
        </div>
        <button class="btn secondary" data-cy="report-export-csv" :disabled="!report" @click="exportCsv">
          Esporta CSV
        </button>
        <button class="btn secondary" data-cy="report-export-pdf" :disabled="!report" @click="exportPdf">
          Esporta PDF
        </button>
      </div>
    </div>

    <div v-if="report" class="card" data-cy="report-result">
      <h1 style="font-size: 18px">{{ report.clientName }} — {{ report.month }}</h1>
      <div class="kpi-grid">
        <div class="kpi">
          <div class="value" data-cy="report-produced">{{ report.produced }} kWh</div>
          <div class="label">Energia prodotta</div>
        </div>
        <div class="kpi">
          <div class="value">{{ report.expected }} kWh</div>
          <div class="label">Energia attesa</div>
        </div>
        <div class="kpi">
          <div class="value" data-cy="report-scostamento">{{ report.scostamento.toFixed(1) }}%</div>
          <div class="label">Scostamento</div>
        </div>
        <div class="kpi">
          <div class="value" data-cy="report-events-count">{{ report.events.length }}</div>
          <div class="label">Eventi di allarme</div>
        </div>
      </div>

      <table v-if="report.events.length">
        <thead>
          <tr>
            <th>Impianto</th>
            <th>Data</th>
            <th>Descrizione</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(e, i) in report.events" :key="i" :data-cy="'report-event-' + i">
            <td>{{ e.plant }}</td>
            <td>{{ e.date }}</td>
            <td>{{ e.description }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">Nessun evento di allarme nel periodo.</p>
    </div>
  </div>
</template>
