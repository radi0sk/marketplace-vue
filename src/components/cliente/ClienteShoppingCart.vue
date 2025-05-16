<template>
  <div class="shopping-cart-container">
    <h2>Tu Carrito de Compras</h2>
    
    <div v-if="cartItems.length === 0" class="empty-cart">
      <p>Tu carrito está vacío</p>
      <router-link to="/products" class="continue-shopping">
        <i class="fas fa-arrow-left"></i> Continuar Comprando
      </router-link>
    </div>
    
    <div v-else>
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <img :src="item.image" :alt="item.name" class="item-image" />
          
          <div class="item-details">
            <h3 class="item-name">{{ item.name }}</h3>
            <div class="item-price">${{ item.price.toFixed(2) }}</div>
            
            <div class="quantity-controls">
              <button 
                @click="updateQuantity(item, -1)" 
                :disabled="item.quantity <= 1"
                class="quantity-button"
              >
                -
              </button>
              <span class="quantity">{{ item.quantity }}</span>
              <button 
                @click="updateQuantity(item, 1)" 
                class="quantity-button"
              >
                +
              </button>
            </div>
          </div>
          
          <button @click="removeItem(item.id)" class="remove-button">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-row">
          <span>Envío:</span>
          <span>${{ shippingCost.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>
        
        <router-link to="/checkout" class="checkout-button">
          Proceder al Pago
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClienteShoppingCart",
  computed: {
    cartItems() {
      return this.$store.state.cart;
    },
    subtotal() {
      return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    shippingCost() {
      // Lógica para calcular envío podría ser más compleja
      return this.subtotal > 100 ? 0 : 10;
    },
    total() {
      return this.subtotal + this.shippingCost;
    }
  },
  methods: {
    updateQuantity(item, change) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        this.$store.dispatch('updateCartItem', {
          id: item.id,
          quantity: newQuantity
        });
        
        this.$root.$emit('show-notification', {
          message: `Cantidad de ${item.name} actualizada`,
          type: 'success'
        });
      }
    },
    removeItem(productId) {
      this.$store.dispatch('removeFromCart', productId);
      this.$root.$emit('show-notification', {
        message: 'Producto eliminado del carrito',
        type: 'success'
      });
    }
  }
};
</script>

<style scoped>
.shopping-cart-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.empty-cart p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.continue-shopping {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.continue-shopping:hover {
  background-color: #3aa876;
}

.cart-items {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
  overflow: hidden;
}

.cart-item {
  display: flex;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  align-items: center;
  gap: 1.5rem;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
}

.item-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.item-price {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-button {
  width: 30px;
  height: 30px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-button:hover:not(:disabled) {
  background-color: #eee;
}

.quantity {
  min-width: 30px;
  text-align: center;
}

.remove-button {
  background: none;
  border: none;
  color: #ff4d4d;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
}

.remove-button:hover {
  color: #cc0000;
}

.cart-summary {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.summary-row.total {
  font-weight: bold;
  font-size: 1.1rem;
  border-bottom: none;
  padding-top: 1rem;
}

.checkout-button {
  display: block;
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  background-color: #42b983;
  color: white;
  text-align: center;
  text-decoration: none;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.checkout-button:hover {
  background-color: #3aa876;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .item-image {
    width: 100%;
    height: auto;
    max-height: 200px;
  }
}
</style>