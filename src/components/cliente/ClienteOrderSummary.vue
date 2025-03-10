<template>
    <div class="order-summary">
      <h2>Resumen de la Compra</h2>
      <ul>
        <li v-for="item in order.items" :key="item.id">
          {{ item.name }} - ${{ item.price }} (Cantidad: {{ item.quantity }})
        </li>
      </ul>
      <p>Total: ${{ total }}</p>
      <p>Dirección: {{ order.address }}</p>
      <p>Método de Pago: {{ order.paymentMethod }}</p>
      <button @click="sendWhatsAppMessage" class="whatsapp-button">Enviar por WhatsApp</button>
    </div>
  </template>
  
  <script>
  export default {
    name: "ClienteOrderSummary",
    computed: {
      order() {
        return this.$store.state.lastOrder;
      },
      total() {
        return this.order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    },
    methods: {
      sendWhatsAppMessage() {
        const message = `Resumen de compra:\nProductos: ${this.order.items
          .map((item) => `${item.name} (${item.quantity})`)
          .join(", ")}\nTotal: $${this.total}\nDirección: ${this.order.address}`;
        const whatsappLink = `https://wa.me/5211234567890?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, "_blank");
      },
    },
  };
  </script>
  
  <style scoped>
  .order-summary {
    padding: 1rem;
  }
  
  .whatsapp-button {
    padding: 0.5rem 1rem;
    background-color: #25d366;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .whatsapp-button:hover {
    background-color: #128c7e;
  }
  </style>