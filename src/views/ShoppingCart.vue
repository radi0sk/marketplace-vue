<template>
  <div class="shopping-cart">
    <h1>Carrito de Compras</h1>
    <div v-if="cart.length === 0" class="empty-cart">
      <p>Tu carrito está vacío.</p>
      <router-link to="/" class="continue-shopping">Continuar comprando</router-link>
    </div>
    <div v-else>
      <div class="cart-items">
        <div v-for="item in cart" :key="item.id" class="cart-item">
          <img :src="item.images[0]" :alt="item.name" class="item-image" />
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p>${{ item.price }} c/u</p>
            <div class="quantity-controls">
              <button @click="decreaseQuantity(item.id)" class="quantity-button">-</button>
              <input type="number" v-model="item.quantity" min="1" class="quantity-input" />
              <button @click="increaseQuantity(item.id)" class="quantity-button">+</button>
            </div>
            <p>Total: ${{ (item.price * item.quantity).toFixed(2) }}</p>
          </div>
          <button @click="removeFromCart(item.id)" class="remove-button">Eliminar</button>
        </div>
      </div>
      <div class="cart-summary">
        <h3>Total del Carrito: ${{ cartTotal.toFixed(2) }}</h3>
        <!-- Botón para redirigir a la vista de Pagar -->
        <button @click="irAPagar" class="checkout-button">Finalizar Compra</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { useToast } from "vue-toastification";

export default {
  name: 'ShoppingCart',
  setup() {
    const toast = useToast();
    return { toast };
  },
  computed: {
    ...mapState({
      cart: state => state.cart
    }),
    ...mapGetters(['cartTotal'])
  },
  methods: {
    ...mapActions(['removeFromCart', 'updateQuantity']),
    
    increaseQuantity(productId) {
      const product = this.cart.find((p) => p.id === productId);
      if (product) {
        this.updateQuantity({ productId, quantity: product.quantity + 1 });
        this.toast.success(`Cantidad aumentada para ${product.name}`);
      }
    },
    
    decreaseQuantity(productId) {
      const product = this.cart.find((p) => p.id === productId);
      if (product) {
        if (product.quantity > 1) {
          this.updateQuantity({ productId, quantity: product.quantity - 1 });
          this.toast.info(`Cantidad reducida para ${product.name}`);
        } else {
          this.toast.warning(`La cantidad mínima es 1`);
        }
      }
    },
    
    removeFromCartWithToast(productId) {
      const product = this.cart.find((p) => p.id === productId);
      if (product) {
        this.removeFromCart(productId);
        this.toast.error(`${product.name} eliminado del carrito`, {
          timeout: 3000,
          draggable: true
        });
      }
    },
    
    irAPagar() {
      if (this.cart.length > 0) {
        this.toast.success('Redirigiendo a la página de pago');
        this.$router.push({ name: 'Pagar' });
      } else {
        this.toast.error('El carrito está vacío', {
          timeout: 3000
        });
      }
    }
  }
};
</script>

<style scoped>
.shopping-cart {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.empty-cart {
  text-align: center;
  font-size: 1.2rem;
}

.continue-shopping {
  color: #42b983;
  text-decoration: none;
}

.cart-items {
  margin-bottom: 2rem;
}

.cart-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding: 1rem 0;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 1rem;
}

.item-details {
  flex-grow: 1;
}

.quantity-controls {
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
}

.quantity-button {
  padding: 0.25rem 0.5rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-input {
  width: 50px;
  text-align: center;
  margin: 0 0.5rem;
}

.remove-button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.cart-summary {
  text-align: right;
}

.checkout-button {
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.checkout-button:hover {
  background-color: #3aa876;
}
</style>