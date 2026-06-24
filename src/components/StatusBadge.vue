<script setup>
defineProps({
  status: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <span class="badge" :class="status" :data-cy="'status-' + status">{{ status }}</span>
</template>
