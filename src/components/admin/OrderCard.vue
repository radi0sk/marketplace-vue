<template>
  <div class="order-card" :class="'status-' + order.estado">
    <div class="card-header">
      <div class="order-id">Orden #{{ order.id.slice(0, 8).toUpperCase() }}</div>
      <div class="order-date">{{ formatDate(order.fecha) }}</div>
    </div>
    
    <div class="customer-info">
      <div class="customer-name">
        <i class="fas fa-user"></i> {{ order.cliente.name }}
      </div>
      <div class="customer-contact">
        <i class="fas fa-phone"></i> {{ order.cliente.telefono || 'Sin teléfono' }}
        <i class="fas fa-envelope"></i> {{ order.cliente.email }}
      </div>
    </div>
    
    <div class="order-summary">
      <div class="summary-item">
        <span>Productos:</span>
        <span>{{ order.items.length }}</span>
      </div>
      <div class="summary-item">
        <span>Subtotal:</span>
        <span>Q{{ order.subtotal.toFixed(2) }}</span>
      </div>
      <div class="summary-item">
        <span>Envío:</span>
        <span>Q{{ order.envio.toFixed(2) }}</span>
      </div>
      <div class="summary-item total">
        <span>Total:</span>
        <span>Q{{ order.total.toFixed(2) }}</span>
      </div>
    </div>
    
    <div class="order-status">
      <select v-model="localStatus" @change="updateStatus" class="status-select">
        <option value="pendiente">Pendiente</option>
        <option value="procesando">Procesando</option>
        <option value="verificado">Verificado</option>
        <option value="empacado">Empacado</option>
        <option value="enviado">Enviado</option>
        <option value="entregado">Entregado</option>
        <option value="completado">Completado</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>
    
    <div class="order-actions">
      <button @click="$emit('view-detail', order.id)" class="action-btn detail-btn">
        <i class="fas fa-eye"></i> Ver Detalle
      </button>
      <a :href="'mailto:' + order.cliente.email" class="action-btn email-btn">
        <i class="fas fa-envelope"></i> actualizar 
      </a>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    order: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localStatus: this.order.estado
    };
  },
  methods: {
    formatDate(date) {
      const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString('es-GT', options);
    },
    updateStatus() {
      this.$emit('status-updated', {
        orderId: this.order.id,
        newStatus: this.localStatus
      });
    }
  }
};
</script>

<style scoped>
.order-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.order-id {
  font-weight: bold;
  color: #333;
}

.order-date {
  color: #666;
  font-size: 0.9rem;
}

.customer-info {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.customer-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.customer-contact {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
}

.customer-contact i {
  margin-right: 0.25rem;
}

.order-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.summary-item {
  display: flex;
  justify-content: space-between;
}

.summary-item.total {
  font-weight: bold;
  margin-top: 0.25rem;
  padding-top: 0.5rem;
  border-top: 1px solid #ddd;
}

.order-status {
  margin-top: 0.5rem;
}

.status-select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.detail-btn {
  background-color: #2196f3;
  color: white;
}

.detail-btn:hover {
  background-color: #0d8bf2;
}

.email-btn {
  background-color: #f0f0f0;
  color: #333;
  text-decoration: none;
}

.email-btn:hover {
  background-color: #e0e0e0;
}

/* Status colors */
.status-pendiente {
  border-left: 4px solid #ff9800;
}

.status-procesando {
  border-left: 4px solid #2196f3;
}

.status-verificado {
  border-left: 4px solid #4caf50;
}

.status-empacado {
  border-left: 4px solid #673ab7;
}

.status-enviado {
  border-left: 4px solid #3f51b5;
}

.status-entregado {
  border-left: 4px solid #009688;
}

.status-completado {
  border-left: 4px solid #795548;
}

.status-cancelado {
  border-left: 4px solid #f44336;
}
</style>