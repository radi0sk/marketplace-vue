<template>
    <div class="sales-statistics">
      <h2>Estadísticas de Ventas</h2>
      <div class="charts">
        <!-- Aquí puedes integrar una librería de gráficos como Chart.js -->
        <canvas ref="salesChart"></canvas>
      </div>
    </div>
  </template>
  
  <script>
  import { Chart, registerables } from "chart.js";
  Chart.register(...registerables);
  
  export default {
    name: "VendedorSalesStatistics",
    mounted() {
      this.renderChart();
    },
    methods: {
      renderChart() {
        const ctx = this.$refs.salesChart.getContext("2d");
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
            datasets: [
              {
                label: "Ventas",
                data: [65, 59, 80, 81, 56, 55],
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .sales-statistics {
    padding: 1rem;
  }
  
  .charts {
    margin-top: 1rem;
  }
  </style>