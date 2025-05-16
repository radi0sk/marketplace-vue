<template>
  <div class="checkout-container">
    <h2>Confirmar Compra</h2>
    <form @submit.prevent="submitOrder" class="checkout-form">
      <div class="form-group">
        <label for="address">Dirección de Envío</label>
        <input type="text" id="address" v-model="address" required class="form-input" />
      </div>

      <div class="form-group">
        <label for="paymentMethod">Método de Pago</label>
        <select id="paymentMethod" v-model="paymentMethod" required class="form-input">
          <option value="" disabled>Seleccione un método</option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia Bancaria</option>
        </select>
      </div>

      <div class="order-summary">
        <h3>Resumen del Pedido</h3>
        <div v-for="item in cartItems" :key="item.id" class="order-item">
          <span>{{ item.name }} x{{ item.quantity }}</span>
          <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
        <div class="order-total">
          <strong>Total:</strong>
          <strong>${{ total.toFixed(2) }}</strong>
        </div>
      </div>

      <button type="submit" :disabled="isSubmitting" class="submit-button">
        {{ isSubmitting ? 'Procesando...' : 'Confirmar Pedido' }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: "ClienteCheckoutForm",
  data() {
    return {
      address: "",
      paymentMethod: "",
      isSubmitting: false
    };
  },
  computed: {
    cartItems() {
      return this.$store.state.cart;
    },
    total() {
      return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  },
  methods: {
    async submitOrder() {
      this.isSubmitting = true;
      try {
        const order = {
          address: this.address,
          paymentMethod: this.paymentMethod,
          items: this.cartItems,
          total: this.total,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        await this.$store.dispatch("submitOrder", order);
        
        this.$root.$emit('show-notification', {
          message: 'Pedido realizado con éxito',
          type: 'success'
        });
        
        this.$router.push("/order-summary");
      } catch (error) {
        this.$root.$emit('show-notification', {
          message: 'Error al procesar el pedido: ' + error.message,
          type: 'error'
        });
        console.error("Order error:", error);
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.checkout-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.checkout-form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.order-summary {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 4px;
}

.order-summary h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f5f5f5;
}

.order-total {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  font-size: 1.1rem;
  border-top: 2px solid #eee;
  margin-top: 0.5rem;
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #3aa876;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>