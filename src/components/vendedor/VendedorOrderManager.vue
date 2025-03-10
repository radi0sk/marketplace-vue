<template>
    <div class="order-manager">
      <h2>Gestión de Pedidos</h2>
      <table>
        <thead>
          <tr>
            <th>ID del Pedido</th>
            <th>Cliente</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.customer }}</td>
            <td>${{ order.total }}</td>
            <td>{{ order.status }}</td>
            <td>
              <button @click="updateOrderStatus(order)">Actualizar Estado</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    name: "VendedorOrderManager",
    data() {
      return {
        orders: [], // Aquí se cargarán los pedidos desde Firestore
      };
    },
    async created() {
      // Cargar pedidos desde Firestore
      // Ejemplo:
      // this.orders = await obtenerPedidosDesdeFirestore();
    },
    methods: {
      async updateOrderStatus(order) {
        // Aquí puedes agregar la lógica para actualizar el estado del pedido en Firestore
        // Ejemplo:
        // await actualizarEstadoDelPedidoEnFirestore(order);
        alert(`Estado del pedido ${order.id} actualizado exitosamente`);
      },
    },
  };
  </script>
  
  <style scoped>
  .order-manager {
    padding: 1rem;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th,
  td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
  }
  
  th {
    background-color: #f9f9f9;
  }
  
  button {
    padding: 0.25rem 0.5rem;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #3aa876;
  }
  </style>