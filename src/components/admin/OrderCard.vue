<template>
  <div class="order-card" :class="'status-' + order.estado">
    <div class="card-header">
      <div>
        <div class="order-id">Orden #{{ order.id.slice(0, 8).toUpperCase() }}</div>
        <div class="order-date">{{ formatDate(order.fecha) }}</div>
      </div>
      <div class="flex gap-2">
        <button @click="$emit('view-detail', order.id)" class="p-2 text-slate-400 hover:text-primary-600 transition-colors" title="Editar / Ver Detalle">
          <i class="fas fa-edit"></i>
        </button>
        <button @click="$emit('delete-order', order.id)" class="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Eliminar Pedido">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
    
    <div class="customer-info">
      <div class="customer-name font-bold text-slate-800">
        <i class="fas fa-user-circle text-primary-500 mr-2"></i> {{ order.cliente.name }}
      </div>
      <div class="customer-contact mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <span class="flex items-center gap-1.5"><i class="fas fa-phone text-slate-400"></i> {{ order.cliente.telefono || 'Sin tel' }}</span>
        <span class="flex items-center gap-1.5"><i class="fas fa-envelope text-slate-400 text-[10px]"></i> {{ order.cliente.email }}</span>
      </div>
    </div>
    
    <div class="order-summary bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
      <div class="summary-item">
        <span class="text-slate-500">Productos:</span>
        <span class="font-bold">{{ order.items.length }} ítem(s)</span>
      </div>
      <div class="summary-item total mt-2 pt-2 border-t border-slate-200">
        <span class="text-slate-800 font-bold">Total a Cobrar:</span>
        <span class="text-lg font-black text-primary-600">Q{{ order.total.toLocaleString() }}</span>
      </div>
    </div>
    
    <div class="order-status mt-2">
      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Estado del Pedido</label>
      <div class="relative group">
        <select v-model="localStatus" @change="updateStatus" class="status-select appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold w-full focus:ring-4 focus:ring-primary-500/10 outline-none cursor-pointer">
          <option value="pendiente">🟠 Pendiente</option>
          <option value="procesando">🔵 Procesando</option>
          <option value="verificado">🟢 Verificado</option>
          <option value="empacado">🟣 Empacado</option>
          <option value="enviado">🚢 Enviado</option>
          <option value="entregado">✅ Entregado</option>
          <option value="completado">🏆 Completado</option>
          <option value="cancelado">🔴 Cancelado</option>
        </select>
        <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[10px]"></i>
      </div>
    </div>
    
    <div class="order-actions mt-4 flex gap-3">
      <button @click="$emit('view-detail', order.id)" class="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
        Gestionar Pedido
      </button>
      <button @click="printCompact" class="w-12 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all">
        <i class="fas fa-print"></i>
      </button>
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
      if (!date) return 'Sin fecha';
      const d = date.toDate ? date.toDate() : new Date(date);
      return new Intl.DateTimeFormat('es-GT', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    },
    updateStatus() {
      this.$emit('status-updated', {
        orderId: this.order.id,
        newStatus: this.localStatus
      });
    },
    printCompact() {
      window.print();
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