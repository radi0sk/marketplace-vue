<template>
  <div class="order-management">
    <div class="management-header">
      <h2><i class="fas fa-clipboard-list"></i> Gestión de Pedidos</h2>
      <div class="header-actions">
        <select v-model="selectedStatus" @change="loadOrders" class="status-filter">
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <button @click="loadOrders" class="refresh-btn">
          <i class="fas fa-sync-alt"></i> Actualizar
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando pedidos...
    </div>
    
    <div v-else class="order-container">
      <div v-if="orders.length === 0" class="empty-message">
        No hay pedidos con el filtro seleccionado
      </div>
      
      <OrderCard
        v-for="order in orders"
        :key="order.id"
        :order="order"
        @status-updated="handleStatusUpdate"
        @view-detail="viewOrderDetail"
      />
    </div>
  </div>
</template>

<script>
import { getOrders, updateOrderStatus } from '@/api/orders';
import OrderCard from '@/components/admin/OrderCard.vue';
import { useToast } from "vue-toastification";

export default {
  components: {
    OrderCard
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      orders: [],
      loading: true,
      selectedStatus: 'pendiente',
      statusOptions: [
        { value: 'todos', label: 'Todos los pedidos' },
        { value: 'pendiente', label: 'Pendientes' },
        { value: 'procesando', label: 'En proceso' },
        { value: 'verificado', label: 'Verificados' },
        { value: 'empacado', label: 'Empacados' },
        { value: 'enviado', label: 'Enviados' },
        { value: 'entregado', label: 'Entregados' },
        { value: 'completado', label: 'Completados' },
        { value: 'cancelado', label: 'Cancelados' }
      ]
    };
  },
  computed: {
    user() {
      console.log('[OrderManagement] Accediendo al usuario desde Vuex:', this.$store.state.user);
      return this.$store.state.user;
    }
  },
  async created() {
    console.log('[OrderManagement] Componente creado - Iniciando carga de datos');
    try {
      await this.$store.dispatch('fetchUser');
      console.log('[OrderManagement] Usuario cargado:', this.user);
      await this.loadOrders();
    } catch (error) {
      console.error('[OrderManagement] Error en created:', error);
    }
  },
  methods: {
    async loadOrders() {
      console.log('[OrderManagement] Cargando órdenes con estado:', this.selectedStatus);
      try {
        this.loading = true;
        const status = this.selectedStatus === 'todos' ? null : this.selectedStatus;
        const orders = await getOrders(status) || [];
        console.log('[OrderManagement] Órdenes obtenidas:', orders.length);
        this.orders = orders;
      } catch (error) {
        console.error('[OrderManagement] Error al cargar pedidos:', error);
        this.toast.error(error.message || 'Error al cargar pedidos');
        this.orders = [];
      } finally {
        this.loading = false;
        console.log('[OrderManagement] Carga de órdenes completada');
      }
    },
    async handleStatusUpdate({ orderId, newStatus }) {
      console.log('[OrderManagement] Iniciando actualización de estado:', { orderId, newStatus });
      try {
        console.log('[OrderManagement] Usuario actual:', this.user);
        
        if (!this.user) {
          const errorMsg = 'No se pudo identificar al usuario';
          console.error('[OrderManagement] ' + errorMsg);
          throw new Error(errorMsg);
        }
        
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
          const errorMsg = 'Pedido no encontrado';
          console.error('[OrderManagement] ' + errorMsg);
          throw new Error(errorMsg);
        }
        
        const cambioEstado = {
          estadoAnterior: order.estado,
          estadoNuevo: newStatus,
          usuario: {
            id: this.user.uid,
            nombre: this.user.displayName,
            email: this.user.email
          },
          fecha: new Date().toISOString()
        };
        
        console.log('[OrderManagement] Cambio de estado a registrar:', cambioEstado);
        
        await updateOrderStatus(orderId, {
          newStatus,
          cambioEstado
        });
        
        console.log('[OrderManagement] Estado actualizado, recargando órdenes...');
        await this.loadOrders();
        
        const successMsg = `Estado cambiado a ${this.getStatusLabel(newStatus)}`;
        console.log('[OrderManagement] ' + successMsg);
        this.toast.success(successMsg);
      } catch (error) {
        console.error('[OrderManagement] Error updating status:', error);
        this.toast.error(`Error al actualizar estado: ${error.message}`);
      }
    },
    viewOrderDetail(orderId) {
      console.log('[OrderManagement] Navegando a detalle de orden:', orderId);
      this.$router.push({ name: 'OrderDetail', params: { id: orderId } });
    },
    getStatusLabel(status) {
      const option = this.statusOptions.find(opt => opt.value === status);
      return option ? option.label : status;
    }
  }
};
</script>

<style scoped>
.order-management {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 1200px;
  margin: 0 auto;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.status-filter {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  min-width: 200px;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn:hover {
  background-color: #e0e0e0;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.order-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}
</style>