<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { visiblePlants, plantStatus, clientName, refreshTelemetry, REFRESH_MS } from '../store.js'
import StatusBadge from './StatusBadge.vue'

const lastRefresh = ref(new Date())
let timer = null

function doRefresh() {
  refreshTelemetry()
  lastRefresh.value = new Date()
}

onMounted(() => {
  timer = setInterval(doRefresh, REFRESH_MS)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})

function fmtTime(d) {
  return d.toLocaleTimeString('it-IT')
}
</script>

<template>
  <div data-cy="dashboard">
    <h1>Dashboard produzione live</h1>
    <p class="subtitle">
      Ultimo aggiornamento: <span data-cy="last-refresh">{{ fmtTime(lastRefresh) }}</span>
      <button class="btn secondary" style="margin-left: 12px" data-cy="refresh-now" @click="doRefresh">
        Aggiorna ora
      </button>
    </p>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Impianto</th>
            <th>Cliente</th>
            <th>Potenza attuale</th>
            <th>Atteso</th>
            <th>Ultimo dato</th>
            <th>Stato</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in visiblePlants()" :key="p.id" :data-cy="'plant-row-' + p.id">
            <td>{{ p.name }}</td>
            <td>{{ clientName(p.clientId) }}</td>
            <td :data-cy="'plant-power-' + p.id">{{ p.currentKw }} kW</td>
            <td class="muted">{{ p.expectedKw }} kW</td>
            <td class="muted">{{ p.minutesAgo }} min fa</td>
            <td><StatusBadge :status="plantStatus(p)" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
