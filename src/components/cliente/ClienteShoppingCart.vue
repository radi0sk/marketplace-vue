<template>
    <div class="shopping-cart">
      <h2>Carrito de Compras</h2>
      <ul>
        <li v-for="item in cartItems" :key="item.id">
          {{ item.name }} - ${{ item.price }} (Cantidad: {{ item.quantity }})
        </li>
      </ul>
      <p>Total: ${{ total }}</p>
      <router-link to="/checkout" class="checkout-button">Ir a Pagar</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: "ClienteShoppingCart",
    computed: {
      cartItems() {
        return this.$store.state.cart;
      },
      total() {
        return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    },
  };
  </script>
  
  <style scoped>
  .shopping-cart {
    padding: 1rem;
  }
  
  .checkout-button {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: #42b983;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
  
  .checkout-button:hover {
    background-color: #3aa876;
  }
  </style>