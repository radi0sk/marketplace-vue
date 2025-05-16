<template>
  <div class="order-summary-container">
    <div class="order-confirmation">
      <h2>¡Pedido Confirmado!</h2>
      <p class="order-id">ID del Pedido: #{{ order.id }}</p>
      
      <div class="order-details">
        <h3>Detalles del Pedido</h3>
        <div v-for="item in order.items" :key="item.id" class="order-item">
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-quantity">x{{ item.quantity }}</span>
          </div>
          <span class="item-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
        
        <div class="order-total">
          <span>Total:</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>
      </div>
      
      <div class="shipping-info">
        <h3>Información de Envío</h3>
        <p><strong>Dirección:</strong> {{ order.address }}</p>
        <p><strong>Método de Pago:</strong> {{ paymentMethodText }}</p>
        <p><strong>Estado:</strong> <span class="status-pending">En Proceso</span></p>
      </div>
      
      <div class="action-buttons">
        <button @click="sendWhatsAppMessage" class="whatsapp-button">
          <i class="fab fa-whatsapp"></i> Contactar por WhatsApp
        </button>
        <router-link to="/" class="continue-button">Seguir Comprando</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClienteOrderSummary",
  computed: {
    order() {
      return this.$store.state.lastOrder || {
        id: 'N/A',
        items: [],
        address: 'No disponible',
        paymentMethod: 'efectivo'
      };
    },
    total() {
      return this.order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    paymentMethodText() {
      const methods = {
        efectivo: 'Efectivo',
        tarjeta: 'Tarjeta',
        transferencia: 'Transferencia Bancaria'
      };
      return methods[this.order.paymentMethod] || this.order.paymentMethod;
    }
  },
  methods: {
    sendWhatsAppMessage() {
      const phoneNumber = '5211234567890'; // Reemplazar con número real
      const message = `Hola, tengo una consulta sobre mi pedido #${this.order.id}`;
      const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, "_blank");
    }
  }
};
</script>

<style scoped>
.order-summary-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.order-confirmation {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
}

.order-id {
  color: #666;
  margin-bottom: 2rem;
}

.order-details, .shipping-info {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid #eee;
  border-radius: 8px;
}

h3 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f5f5f5;
}

.item-info {
  display: flex;
  gap: 1rem;
}

.item-name {
  font-weight: 500;
}

.item-quantity {
  color: #666;
}

.order-total {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  font-weight: bold;
  font-size: 1.1rem;
}

.status-pending {
  color: #FFA500;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.whatsapp-button {
  flex: 1;
  padding: 1rem;
  background-color: #25D366;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.whatsapp-button:hover {
  background-color: #128C7E;
}

.continue-button {
  flex: 1;
  padding: 1rem;
  background-color: #42b983;
  color: white;
  text-align: center;
  border-radius: 4px;
  text-decoration: none;
  font-size: 1rem;
}

.continue-button:hover {
  background-color: #3aa876;
}

@media (max-width: 600px) {
  .action-buttons {
    flex-direction: column;
  }
}
</style>