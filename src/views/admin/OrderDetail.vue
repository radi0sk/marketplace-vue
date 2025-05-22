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

      <!-- Sección de historial de estados -->
      <div class="status-history" v-if="order.historialEstados && order.historialEstados.length > 0">
        <h3><i class="fas fa-history"></i> Historial de Estados</h3>
        <div class="history-list">
          <div v-for="(change, index) in order.historialEstados" :key="index" class="history-item">
            <div class="history-header">
              <span class="history-date">{{ formatDate(change.fecha) }}</span>
              <span class="history-user">{{ change.usuario.nombre }} ({{ change.usuario.email }})</span>
            </div>
            <div class="history-change">
              <span class="old-status">{{ getStatusLabel(change.estadoAnterior) }}</span>
              <i class="fas fa-arrow-right"></i>
              <span class="new-status">{{ getStatusLabel(change.estadoNuevo) }}</span>
            </div>
          </div>
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
import { useToast } from "vue-toastification";

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      order: null,
      loading: true,
      error: null,
      newStatus: ''
    };
  },
  computed: {
    user() {
      console.log('[OrderDetail] Accediendo al usuario desde Vuex:', this.$store.state.user);
      return this.$store.state.user;
    }
  },
  async created() {
    console.log('[OrderDetail] Componente creado - Iniciando carga de datos');
    try {
      await this.$store.dispatch('fetchUser');
      console.log('[OrderDetail] Usuario cargado:', this.user);
      await this.loadOrder();
    } catch (error) {
      console.error('[OrderDetail] Error en created:', error);
      this.error = 'Error al cargar los datos del pedido';
    }
  },
  methods: {
    async loadOrder() {
      console.log('[OrderDetail] Cargando orden con ID:', this.id);
      try {
        this.loading = true;
        this.order = await getOrderById(this.id);
        
        console.log('[OrderDetail] Orden cargada:', this.order);
        
        // Asegurar que la dirección exista
        if (!this.order.direccion) {
          console.log('[OrderDetail] Dirección no encontrada, asignando valores por defecto');
          this.order.direccion = {
            direccion: 'No proporcionada',
            ciudad: 'No proporcionada',
            departamento: 'No proporcionado',
            codigoPostal: 'No proporcionado'
          };
        }

        // Verificar historial de estados
        if (!this.order.historialEstados) {
          console.log('[OrderDetail] No se encontró historial de estados, inicializando array vacío');
          this.order.historialEstados = [];
        } else {
          console.log('[OrderDetail] Historial de estados encontrado:', this.order.historialEstados.length, 'registros');
        }
        
        this.newStatus = this.order.estado;
        console.log('[OrderDetail] Estado actual:', this.newStatus);
      } catch (error) {
        console.error('[OrderDetail] Error al cargar el pedido:', error);
        this.error = 'Error al cargar el pedido: ' + error.message;
      } finally {
        this.loading = false;
        console.log('[OrderDetail] Carga de orden completada');
      }
    },
    async updateStatus() {
      console.log('[OrderDetail] Intentando actualizar estado a:', this.newStatus);
      try {
        if (!this.user) {
          const errorMsg = 'No se pudo identificar al usuario';
          console.error('[OrderDetail] ' + errorMsg);
          throw new Error(errorMsg);
        }

        const cambioEstado = {
          estadoAnterior: this.order.estado,
          estadoNuevo: this.newStatus,
          usuario: {
            id: this.user.uid,
            nombre: this.user.displayName,
            email: this.user.email
          },
          fecha: new Date().toISOString()
        };

        console.log('[OrderDetail] Registrando cambio de estado:', cambioEstado);
        
        await updateOrderStatus(this.id, {
          newStatus: this.newStatus,
          cambioEstado
        });

        // Actualizar el estado localmente
        this.order.estado = this.newStatus;
        this.order.historialEstados.push(cambioEstado);
        
        console.log('[OrderDetail] Estado actualizado exitosamente');
        this.toast.success(`Estado cambiado a ${this.getStatusLabel(this.newStatus)}`);
      } catch (error) {
        console.error('[OrderDetail] Error al actualizar estado:', error);
        this.toast.error('Error al actualizar estado: ' + error.message);
        // Revertir el cambio en el select
        this.newStatus = this.order.estado;
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
      console.log('[OrderDetail] Imprimiendo orden');
      window.print();
    },
    formatDate(date) {
      const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      };
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

/* Estilos para las 3 fichas originales (manteniendo tu estilo) */
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

/* Estilos para el historial (nuevo estilo) */
.status-history {
  margin: 2rem 0;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
}

.status-history h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.history-list {
  border: 1px solid #eee;
  border-radius: 4px;
  background: white;
}

.history-item {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.history-item:last-child {
  border-bottom: none;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.history-change {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.old-status {
  padding: 0.25rem 0.5rem;
  background: #f0f0f0;
  border-radius: 4px;
}

.new-status {
  padding: 0.25rem 0.5rem;
  background: #e0f7fa;
  border-radius: 4px;
  font-weight: bold;
}

.fa-arrow-right {
  color: #42b983;
  margin: 0 0.5rem;
}

/* Resto de tus estilos originales... */
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

/* Colores de estados (manteniendo tus originales) */
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
</style>