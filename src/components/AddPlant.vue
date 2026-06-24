<script setup>
import { ref } from 'vue'
import { state, addPlant } from '../store.js'

const name = ref('')
const clientId = ref('')
const peakKw = ref('')
const error = ref('')
const success = ref('')

function submit() {
  error.value = ''
  success.value = ''

  if (!name.value.trim()) {
    error.value = 'Il nome dell\'impianto è obbligatorio.'
    return
  }
  if (!peakKw.value || Number(peakKw.value) <= 0) {
    error.value = 'La potenza di picco deve essere maggiore di zero.'
    return
  }

  const plant = addPlant({
    name: name.value.trim(),
    clientId: clientId.value,
    peakKw: peakKw.value,
  })

  success.value = `Impianto "${plant.name}" aggiunto e disponibile in dashboard.`
  name.value = ''
  clientId.value = ''
  peakKw.value = ''
}
</script>

<template>
  <div data-cy="add-plant">
    <h1>Aggiungi impianto</h1>
    <p class="subtitle">Registra un nuovo impianto e associalo a un cliente.</p>

    <div class="card" style="max-width: 480px">
      <div class="field">
        <label>Nome impianto</label>
        <input v-model="name" type="text" data-cy="addplant-name" placeholder="Es. Tetto Capannone B" />
      </div>
      <div class="field">
        <label>Cliente</label>
        <select v-model="clientId" data-cy="addplant-client">
          <option value="">— seleziona —</option>
          <option v-for="c in state.clients" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div class="field">
        <label>Potenza di picco (kW)</label>
        <input v-model="peakKw" type="number" min="1" data-cy="addplant-peak" placeholder="Es. 30" />
      </div>

      <p v-if="error" class="error" data-cy="addplant-error">{{ error }}</p>
      <p v-if="success" style="color: var(--ok)" data-cy="addplant-success">{{ success }}</p>

      <button class="btn" data-cy="addplant-submit" @click="submit">Salva impianto</button>
    </div>
  </div>
</template>
