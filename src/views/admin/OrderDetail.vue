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
          <span class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusLabel(order.status) }}
          </span>
        </div>
        
        <div class="order-meta">
          <div>
            <strong>Fecha:</strong> {{ formatDate(order.createdAt) }}
          </div>
          <div>
            <strong>Cliente:</strong> {{ order.customer.name }} ({{ order.customer.email }})
          </div>
          <div>
            <strong>Teléfono:</strong> {{ order.customer.phone || 'No proporcionado' }}
          </div>
        </div>
        
        <div class="order-items">
          <h3>Productos</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.quantity }}</td>
                <td>Q{{ item.price.toFixed(2) }}</td>
                <td>Q{{ (item.price * item.quantity).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="order-summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>Q{{ order.subtotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Envío:</span>
            <span>Q{{ order.shippingCost.toFixed(2) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>Q{{ order.total.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="shipping-info">
          <h3>Información de envío</h3>
          <p><strong>Dirección:</strong> {{ order.shipping.address }}</p>
          <p><strong>Ciudad:</strong> {{ order.shipping.city }}</p>
          <p><strong>Departamento:</strong> {{ order.shipping.state }}</p>
          <p><strong>Código Postal:</strong> {{ order.shipping.zipCode }}</p>
          <p><strong>Notas:</strong> {{ order.shipping.notes || 'Ninguna' }}</p>
        </div>
        
        <div class="order-actions">
          <select v-model="newStatus" @change="updateStatus" class="status-select">
            <option value="new">Nuevo</option>
            <option value="processing">En proceso</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <button @click="printOrder" class="print-button">
            <i class="fas fa-print"></i> Imprimir
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { getOrderById, updateOrder } from '@/api/orders';
  
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
          this.newStatus = this.order.status;
        } catch (error) {
          this.error = 'Error al cargar el pedido';
          console.error(error);
        } finally {
          this.loading = false;
        }
      },
      async updateStatus() {
        try {
          await updateOrder(this.id, { status: this.newStatus });
          this.order.status = this.newStatus;
          this.$toast.success('Estado del pedido actualizado');
        } catch (error) {
          this.$toast.error('Error al actualizar el estado');
          console.error(error);
        }
      },
      formatDate(date) {
        return new Date(date).toLocaleString();
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
      },
      printOrder() {
        window.print();
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
  
  .order-meta {
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
  
  .order-meta div {
    margin-bottom: 0.5rem;
  }
  
  .order-items {
    margin-bottom: 1.5rem;
  }
  
  .order-items h3 {
    margin-bottom: 1rem;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #f2f2f2;
  }
  
  .order-summary {
    width: 300px;
    margin-left: auto;
    margin-bottom: 1.5rem;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .summary-row.total {
    font-weight: bold;
    font-size: 1.1rem;
    border-top: 2px solid #42b983;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
  }
  
  .shipping-info {
    background: #f9f9f9;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
  
  .shipping-info h3 {
    margin-top: 0;
  }
  
  .order-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .status-select {
    padding: 0.75rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    cursor: pointer;
    min-width: 200px;
  }
  
  .print-button {
    padding: 0.75rem 1.5rem;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .print-button:hover {
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