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
      <div v-if="filteredOrders.length === 0" class="empty-message">
        No hay pedidos con el filtro seleccionado
      </div>
      
      <OrderCard
        v-for="order in filteredOrders"
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

export default {
  components: {
    OrderCard
  },
  data() {
    return {
      orders: [],
      loading: true,
      selectedStatus: 'todos',
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
    filteredOrders() {
      if (this.selectedStatus === 'todos') return this.orders;
      return this.orders.filter(order => order.estado === this.selectedStatus);
    }
  },
  async created() {
    await this.loadOrders();
  },
  methods: {
    async loadOrders() {
      try {
        this.loading = true;
        this.orders = await getOrders(this.selectedStatus === 'todos' ? null : this.selectedStatus);
      } catch (error) {
        console.error('Error loading orders:', error);
        let errorMessage = 'Error al cargar pedidos';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        this.$toast.error(errorMessage);
      } finally {
        this.loading = false;
      }
    },
    async handleStatusUpdate({ orderId, newStatus }) {
      try {
        await updateOrderStatus(orderId, newStatus);
        await this.loadOrders();
        
        // Notificación de éxito
        this.$toast.success(`Estado cambiado a ${this.getStatusLabel(newStatus)}`, {
          icon: 'fas fa-check-circle'
        });
        
      } catch (error) {
        console.error('Error updating status:', error);
        
        // Notificación de error
        this.$toast.error(`Error al actualizar estado: ${error.message}`, {
          icon: 'fas fa-exclamation-triangle'
        });
        
        // Revertir el cambio en el estado local si falla
        this.loadOrders();
      }
    },
    viewOrderDetail(orderId) {
      this.$router.push({ name: 'OrderDetail', params: { id: orderId } });
    },
    getStatusLabel(status) {
      const statusMap = {
        pendiente: 'Pendiente',
        procesando: 'Procesando',
        verificado: 'Verificado',
        empacado: 'Empacado',
        enviado: 'Enviado',
        entregado: 'Entregado',
        completado: 'Completado',
        cancelado: 'Cancelado'
      };
      return statusMap[status] || status;
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