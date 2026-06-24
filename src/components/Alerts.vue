<script setup>
import { activeAlerts, clientName } from '../store.js'

function fmtDuration(min) {
  if (min >= 60) {
    const h = Math.floor(min / 60)
    const m = min % 60
    return `${h}h ${m}min`
  }
  return `${min} min`
}
</script>

<template>
  <div data-cy="alerts">
    <h1>Alert produzione</h1>
    <p class="subtitle">Impianti con produzione sotto soglia oltre la durata consentita.</p>

    <div v-if="activeAlerts().length === 0" class="card" data-cy="alerts-empty">
      <p class="muted">Nessun alert attivo.</p>
    </div>

    <div v-else class="card">
      <table>
        <thead>
          <tr>
            <th>Impianto</th>
            <th>Cliente</th>
            <th>Atteso</th>
            <th>Reale</th>
            <th>Durata</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in activeAlerts()" :key="a.plant.id" :data-cy="'alert-row-' + a.plant.id">
            <td>{{ a.plant.name }}</td>
            <td>{{ clientName(a.plant.clientId) }}</td>
            <td>{{ a.expectedKw }} kW</td>
            <td :data-cy="'alert-real-' + a.plant.id">{{ a.currentKw }} kW</td>
            <td :data-cy="'alert-duration-' + a.plant.id">{{ fmtDuration(a.durationMin) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
