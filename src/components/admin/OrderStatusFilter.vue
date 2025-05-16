<template>
    <div class="order-status-filter">
      <label for="status-filter">Filtrar por estado:</label>
      <select 
        id="status-filter" 
        v-model="selectedStatus" 
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option 
          v-for="option in statusOptions" 
          :key="option.value" 
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      modelValue: {
        type: String,
        default: 'all'
      },
      statusOptions: {
        type: Array,
        default: () => [
          { value: 'all', label: 'Todos los pedidos' },
          { value: 'new', label: 'Nuevos' },
          { value: 'processing', label: 'En proceso' },
          { value: 'shipped', label: 'Enviados' },
          { value: 'delivered', label: 'Entregados' },
          { value: 'cancelled', label: 'Cancelados' }
        ]
      }
    },
    emits: ['update:modelValue'],
    data() {
      return {
        selectedStatus: this.modelValue
      };
    },
    watch: {
      modelValue(newVal) {
        this.selectedStatus = newVal;
      }
    }
  };
  </script>
  
  <style scoped>
  .order-status-filter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .order-status-filter label {
    font-weight: bold;
  }
  
  .order-status-filter select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    cursor: pointer;
  }
  </style>