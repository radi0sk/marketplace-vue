<template>
    <div class="dashboard">
      <h2>Panel de Control del Vendedor</h2>
      <div class="dashboard-cards">
        <div class="card">
          <h3>Ventas Totales</h3>
          <p>${{ totalSales }}</p>
        </div>
        <div class="card">
          <h3>Productos Publicados</h3>
          <p>{{ totalProducts }}</p>
        </div>
        <div class="card">
          <h3>Pedidos Pendientes</h3>
          <p>{{ pendingOrders }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "VendedorDashboard",
    data() {
      return {
        totalSales: 0,
        totalProducts: 0,
        pendingOrders: 0,
      };
    },
    async created() {
      // Aquí puedes cargar datos desde Firestore
      // Ejemplo:
      // this.totalSales = await obtenerVentasTotales();
      // this.totalProducts = await obtenerTotalProductos();
      // this.pendingOrders = await obtenerPedidosPendientes();
    },
  };
  </script>
  
  <style scoped>
  .dashboard {
    padding: 1rem;
  }
  
  .dashboard-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    background-color: #f9f9f9;
  }
  
  .card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
  }
  
  .card p {
    font-size: 1.5rem;
    font-weight: bold;
    color: #42b983;
  }
  </style>