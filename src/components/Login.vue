<script setup>
import { state, login } from '../store.js'

function choose(username) {
  login(username)
}
</script>

<template>
  <div class="login-wrap">
    <div class="card login-card" data-cy="login-card">
      <div class="logo">☀️</div>
      <h1>SolarWatch</h1>
      <p class="subtitle">Monitoraggio impianti fotovoltaici</p>
      <button
        v-for="u in state.users"
        :key="u.username"
        class="user-option"
        :data-cy="'login-' + u.username"
        @click="choose(u.username)"
      >
        <div>{{ u.label }}</div>
        <div class="role">{{ u.role }}</div>
      </button>
    </div>
  </div>
</template>
