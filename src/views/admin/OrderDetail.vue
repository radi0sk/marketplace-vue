<template>
  <div class="order-detail">
    <button @click="$router.go(-1)" class="back-button">
      <i class="fas fa-arrow-left"></i> Volver
    </button>
    
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando detalles del pedido...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="order-content">
      <div class="order-header">
        <h2>Pedido #{{ order.id }}</h2>
        <span class="order-status" :class="'status-' + order.estado">
          {{ getStatusLabel(order.estado) }}
        </span>
      </div>
      
      <div class="order-meta">
        <div class="meta-section">
          <h3><i class="fas fa-user"></i> Información del Cliente</h3>
          <p><strong>Nombre:</strong> {{ order.cliente.name }}</p>
          <p><strong>Email:</strong> {{ order.cliente.email }}</p>
          <p><strong>Teléfono:</strong> {{ order.cliente.telefono || 'No proporcionado' }}</p>
        </div>
        
       <div class="meta-section">
  <h3><i class="fas fa-truck"></i> Información de Envío</h3>
  <p><strong>Dirección:</strong> {{ order.direccion?.direccion || 'No proporcionada' }}</p>
  <p><strong>Ciudad:</strong> {{ order.direccion?.ciudad || 'No proporcionada' }}</p>
  <p><strong>Departamento:</strong> {{ order.direccion?.departamento || 'No proporcionado' }}</p>
  <p><strong>Código Postal:</strong> {{ order.direccion?.codigoPostal || 'No proporcionado' }}</p>
  <p><strong>Tiempo de entrega:</strong> {{ order.tiempoEntrega }} días</p>
</div>
        
        <div class="meta-section">
          <h3><i class="fas fa-money-bill-wave"></i> Información de Pago</h3>
          <p><strong>Método:</strong> {{ getPaymentMethodLabel(order.metodoPago) }}</p>
          <p><strong>Comprobante:</strong> 
            <a v-if="order.cliente.comprobante" :href="order.cliente.comprobante" target="_blank">
              Ver comprobante
            </a>
            <span v-else>No disponible</span>
          </p>
        </div>
      </div>
      
      <div class="order-items">
        <h3><i class="fas fa-boxes"></i> Productos</h3>
        <div class="items-list">
          <div v-for="(item, index) in order.items" :key="index" class="item">
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-price">Q{{ item.price.toFixed(2) }}</div>
            </div>
            <div class="item-quantity">Cantidad: {{ item.quantity }}</div>
            <div class="item-total">Total: Q{{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
      </div>
      
      <div class="order-totals">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>Q{{ order.subtotal.toFixed(2) }}</span>
        </div>
        <div class="total-row">
          <span>Costo de envío:</span>
          <span>Q{{ order.envio.toFixed(2) }}</span>
        </div>
        <div class="total-row">
          <span>Recargo:</span>
          <span>Q{{ order.recargo.toFixed(2) }}</span>
        </div>
        <div class="total-row grand-total">
          <span>Total:</span>
          <span>Q{{ order.total.toFixed(2) }}</span>
        </div>
      </div>
      
      <div class="order-actions">
        <select v-model="newStatus" @change="updateStatus" class="status-select">
          <option value="pendiente">Pendiente</option>
          <option value="procesando">Procesando</option>
          <option value="verificado">Verificado</option>
          <option value="empacado">Empacado</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button @click="printOrder" class="print-btn">
          <i class="fas fa-print"></i> Imprimir
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrderById, updateOrderStatus } from '@/api/orders';

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      order: null,
      loading: true,
      error: null,
      newStatus: ''
    };
  },
  async created() {
    await this.loadOrder();
  },
  methods: {
  async loadOrder() {
  try {
    this.loading = true;
    this.order = await getOrderById(this.id);
    
    // Asegurar que la dirección exista
    if (!this.order.direccion) {
      this.order.direccion = {
        direccion: 'No proporcionada',
        ciudad: 'No proporcionada',
        departamento: 'No proporcionado',
        codigoPostal: 'No proporcionado'
      };
    }
    
    this.newStatus = this.order.estado;
  } catch (error) {
    this.error = 'Error al cargar el pedido: ' + error.message;
  } finally {
    this.loading = false;
  }
},
    async updateStatus() {
      try {
        await updateOrderStatus(this.id, this.newStatus);
        this.order.estado = this.newStatus;
        this.$toast.success('Estado del pedido actualizado');
      } catch (error) {
        this.$toast.error('Error al actualizar estado: ' + error.message);
      }
    },
    getStatusLabel(status) {
      const labels = {
        pendiente: 'Pendiente',
        procesando: 'Procesando',
        verificado: 'Verificado',
        empacado: 'Empacado',
        enviado: 'Enviado',
        entregado: 'Entregado',
        completado: 'Completado',
        cancelado: 'Cancelado'
      };
      return labels[status] || status;
    },
    getPaymentMethodLabel(method) {
      const methods = {
        deposito: 'Depósito bancario',
        efectivo: 'Efectivo',
        tarjeta: 'Tarjeta de crédito/débito'
      };
      return methods[method] || method;
    },
    printOrder() {
      window.print();
    },
    formatDate(date) {
      const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(date).toLocaleDateString('es-GT', options);
    }
  }
};
</script>

<style scoped>
.order-detail {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.back-button {
  background: none;
  border: none;
  color: #42b983;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-size: 1rem;
}

.back-button:hover {
  text-decoration: underline;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #f44336;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.order-status {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
}

.status-pendiente {
  background-color: #fff3cd;
  color: #856404;
}

.status-procesando {
  background-color: #bee5eb;
  color: #0c5460;
}

.status-verificado {
  background-color: #d4edda;
  color: #155724;
}

.status-empacado {
  background-color: #cce5ff;
  color: #004085;
}

.status-enviado {
  background-color: #e2e3e5;
  color: #383d41;
}

.status-entregado {
  background-color: #d4edda;
  color: #155724;
}

.status-completado {
  background-color: #d1e7dd;
  color: #0f5132;
}

.status-cancelado {
  background-color: #f8d7da;
  color: #721c24;
}

.order-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.meta-section {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
}

.meta-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.meta-section p {
  margin: 0.5rem 0;
}

.order-items {
  margin-bottom: 1.5rem;
}

.order-items h3 {
  margin-bottom: 1rem;
}

.items-list {
  border: 1px solid #eee;
  border-radius: 4px;
}

.item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.item-name {
  font-weight: 500;
}

.item-price {
  color: #666;
}

.item-quantity {
  font-size: 0.9rem;
  color: #666;
}

.item-total {
  font-weight: bold;
  text-align: right;
  margin-top: 0.5rem;
}

.order-totals {
  width: 300px;
  margin-left: auto;
  margin-bottom: 1.5rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.grand-total {
  font-weight: bold;
  font-size: 1.1rem;
  border-top: 2px solid #42b983;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
}

.order-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.status-select {
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
  min-width: 200px;
}

.print-btn {
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.print-btn:hover {
  background-color: #369f6e;
}

@media print {
  .back-button, .order-actions {
    display: none;
  }
  
  body {
    font-size: 12pt;
  }
}
</style>