<template>
    <div class="checkout-form">
      <h2>Confirmar Compra</h2>
      <form @submit.prevent="submitOrder">
        <label for="address">Dirección:</label>
        <input type="text" id="address" v-model="address" required />
  
        <label for="paymentMethod">Método de Pago:</label>
        <select id="paymentMethod" v-model="paymentMethod" required>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
        </select>
  
        <button type="submit" class="submit-button">Confirmar Pedido</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: "ClienteCheckoutForm",
    data() {
      return {
        address: "",
        paymentMethod: "efectivo",
      };
    },
    methods: {
      submitOrder() {
        const order = {
          address: this.address,
          paymentMethod: this.paymentMethod,
          items: this.$store.state.cart,
        };
        // Lógica para enviar el pedido
        this.$store.dispatch("submitOrder", order);
        this.$router.push("/order-summary");
      },
    },
  };
  </script>
  
  <style scoped>
  .checkout-form {
    padding: 1rem;
  }
  
  label {
    display: block;
    margin: 0.5rem 0;
  }
  
  input,
  select {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .submit-button {
    padding: 0.5rem 1rem;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .submit-button:hover {
    background-color: #3aa876;
  }
  </style>