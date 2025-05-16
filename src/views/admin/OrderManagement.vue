<template>
    <div class="order-management">
      <div class="management-header">
        <h2><i class="fas fa-clipboard-list"></i> Gestión de Pedidos</h2>
        <OrderStatusFilter v-model="selectedStatus" />
      </div>
      
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Cargando pedidos...
      </div>
      
      <OrderList 
        v-else
        :orders="filteredOrders"
        @view-order="viewOrderDetail"
        @update-status="updateOrderStatus"
      />
    </div>
  </template>
  
  <script>
  import OrderList from '@/components/admin/OrderList.vue';
  import OrderStatusFilter from '@/components/admin/OrderStatusFilter.vue';
  import { getOrders, updateOrder } from '@/api/orders';
  
  export default {
    components: {
      OrderList,
      OrderStatusFilter
    },
    data() {
      return {
        orders: [],
        loading: true,
        selectedStatus: 'all',
        statusOptions: [
          { value: 'all', label: 'Todos los pedidos' },
          { value: 'new', label: 'Nuevos' },
          { value: 'processing', label: 'En proceso' },
          { value: 'shipped', label: 'Enviados' },
          { value: 'delivered', label: 'Entregados' },
          { value: 'cancelled', label: 'Cancelados' }
        ]
      };
    },
    computed: {
      filteredOrders() {
        if (this.selectedStatus === 'all') return this.orders;
        return this.orders.filter(order => order.status === this.selectedStatus);
      }
    },
    async created() {
      await this.loadOrders();
    },
    methods: {
      async loadOrders() {
        try {
          this.loading = true;
          this.orders = await getOrders();
        } catch (error) {
          this.$toast.error(`Error al cargar pedidos: ${error.message}`);
        } finally {
          this.loading = false;
        }
      },
      viewOrderDetail(orderId) {
        this.$router.push({ name: 'OrderDetail', params: { id: orderId } });
      },
      async updateOrderStatus({ orderId, newStatus }) {
        try {
          await updateOrder(orderId, { status: newStatus });
          await this.loadOrders();
          this.$toast.success('Estado del pedido actualizado');
        } catch (error) {
          this.$toast.error(`Error al actualizar: ${error.message}`);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .order-management {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
  }
  
  .management-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
  </style>