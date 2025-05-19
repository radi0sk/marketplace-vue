<template>
  <select v-model="selectedStatus" class="status-filter">
    <option v-for="option in statusOptions" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: 'all'
    },
    statusOptions: {
      type: Array,
      required: true
    }
  },
  computed: {
    selectedStatus: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    }
  }
};
</script>

<style scoped>
.status-filter {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  min-width: 200px;
}
</style>