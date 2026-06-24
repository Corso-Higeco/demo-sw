<script setup>
import { computed, ref } from 'vue'
import { state, logout } from './store.js'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import Alerts from './components/Alerts.vue'
import Report from './components/Report.vue'
import Storico from './components/Storico.vue'
import AddPlant from './components/AddPlant.vue'

const allTabs = [
  { key: 'dashboard', label: 'Dashboard', roles: ['tecnico', 'responsabile', 'cliente'] },
  { key: 'alerts', label: 'Alert', roles: ['tecnico', 'responsabile'] },
  { key: 'report', label: 'Report', roles: ['responsabile'] },
  { key: 'storico', label: 'Storico', roles: ['tecnico', 'responsabile', 'cliente'] },
  { key: 'addplant', label: 'Aggiungi impianto', roles: ['tecnico'] },
]

const tabs = computed(() => {
  if (!state.currentUser) {
    return []
  }
  return allTabs.filter((t) => t.roles.includes(state.currentUser.role))
})

const current = ref('dashboard')

const views = {
  dashboard: Dashboard,
  alerts: Alerts,
  report: Report,
  storico: Storico,
  addplant: AddPlant,
}

function select(key) {
  current.value = key
}

function doLogout() {
  logout()
  current.value = 'dashboard'
}
</script>

<template>
  <Login v-if="!state.currentUser" />
  <template v-else>
    <header class="app-header">
      <div class="brand">
        <span class="logo">☀️</span>
        <span>SolarWatch</span>
      </div>
      <div class="user-box">
        <span data-cy="current-user">{{ state.currentUser.label }} ({{ state.currentUser.role }})</span>
        <button class="btn secondary" data-cy="logout" @click="doLogout">Esci</button>
      </div>
    </header>

    <nav class="nav">
      <button
        v-for="t in tabs"
        :key="t.key"
        :class="{ active: current === t.key }"
        :data-cy="'nav-' + t.key"
        @click="select(t.key)"
      >
        {{ t.label }}
      </button>
    </nav>

    <main class="content">
      <component :is="views[current]" />
    </main>
  </template>
</template>
