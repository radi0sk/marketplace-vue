<template>
    <div class="order-list">
      <div v-if="orders.length === 0" class="empty-message">
        No hay pedidos disponibles
      </div>
      
      <ul v-else class="order-items">
        <li v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-info">
            <span class="order-id">Pedido #{{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            <span class="order-customer">{{ order.customer.name }}</span>
            <span class="order-total">Q{{ order.total.toFixed(2) }}</span>
            <span class="order-status" :class="getStatusClass(order.status)">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
          <div class="order-actions">
            <button @click="$emit('view-order', order.id)" class="action-button view">
              <i class="fas fa-eye"></i> Ver
            </button>
            <select 
              v-model="order.status" 
              @change="$emit('update-status', { orderId: order.id, newStatus: order.status })"
              class="status-select"
            >
              <option value="new">Nuevo</option>
              <option value="processing">En proceso</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      orders: {
        type: Array,
        required: true
      }
    },
    methods: {
      formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
      },
      getStatusLabel(status) {
        const labels = {
          new: 'Nuevo',
          processing: 'En proceso',
          shipped: 'Enviado',
          delivered: 'Entregado',
          cancelled: 'Cancelado'
        };
        return labels[status] || status;
      },
      getStatusClass(status) {
        return `status-${status}`;
      }
    }
  };
  </script>
  
  <style scoped>
  .order-list {
    max-width: 100%;
    margin: 0 auto;
  }
  
  .empty-message {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
  
  .order-items {
    list-style: none;
    padding: 0;
  }
  
  .order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;
  }
  
  .order-item:hover {
    background-color: #f9f9f9;
  }
  
  .order-info {
    flex: 1;
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .order-id {
    font-weight: bold;
    min-width: 80px;
  }
  
  .order-date {
    color: #666;
    font-size: 0.9rem;
    min-width: 100px;
  }
  
  .order-customer {
    min-width: 150px;
  }
  
  .order-total {
    font-weight: bold;
    color: #42b983;
    min-width: 80px;
  }
  
  .order-status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  .status-new {
    background-color: #ffeb3b;
    color: #000;
  }
  
  .status-processing {
    background-color: #2196f3;
    color: white;
  }
  
  .status-shipped {
    background-color: #673ab7;
    color: white;
  }
  
  .status-delivered {
    background-color: #4caf50;
    color: white;
  }
  
  .status-cancelled {
    background-color: #f44336;
    color: white;
  }
  
  .order-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  
  .action-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .action-button.view {
    background-color: #42b983;
    color: white;
  }
  
  .action-button.view:hover {
    background-color: #369f6e;
  }
  
  .status-select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    cursor: pointer;
  }
  </style>