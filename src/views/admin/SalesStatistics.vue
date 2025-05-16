<template>
  <div class="sales-statistics">
    <div class="stats-header">
      <h2><i class="fas fa-chart-line"></i> Estadísticas de Ventas</h2>
      <div class="period-selector">
        <select v-model="selectedPeriod" @change="loadSalesData">
          <option value="7days">Últimos 7 días</option>
          <option value="30days">Últimos 30 días</option>
          <option value="90days">Últimos 90 días</option>
          <option value="year">Este año</option>
        </select>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando estadísticas...
    </div>
    
    <div v-else class="stats-content">
      <div class="summary-cards">
        <div class="summary-card total-sales">
          <h3>Ventas Totales</h3>
          <p class="amount">Q{{ totalSales.toFixed(2) }}</p>
          <p class="change" :class="salesChange >= 0 ? 'positive' : 'negative'">
            <i :class="salesChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{ Math.abs(salesChange) }}%
          </p>
        </div>
        
        <div class="summary-card total-orders">
          <h3>Pedidos</h3>
          <p class="amount">{{ totalOrders }}</p>
          <p class="change" :class="ordersChange >= 0 ? 'positive' : 'negative'">
            <i :class="ordersChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{ Math.abs(ordersChange) }}%
          </p>
        </div>
        
        <div class="summary-card avg-order">
          <h3>Ticket Promedio</h3>
          <p class="amount">Q{{ avgOrderValue.toFixed(2) }}</p>
        </div>
      </div>
      
      <SalesChart 
        :chart-data="chartData"
        :period="selectedPeriod"
      />
    </div>
  </div>
</template>

<script>


export default {
  components: {
    SalesChart
  },
  data() {
    return {
      selectedPeriod: '30days',
      loading: false,
      totalSales: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      salesChange: 0,
      ordersChange: 0,
      chartData: {}
    };
  },
  async created() {
    await this.loadSalesData();
  },
  methods: {
    async loadSalesData() {
      try {
        this.loading = true;
        // Simulación de datos - en una app real harías una llamada a Firebase
        this.totalSales = this.getRandomAmount(5000, 20000);
        this.totalOrders = this.getRandomAmount(20, 100);
        this.avgOrderValue = this.totalSales / this.totalOrders;
        this.salesChange = this.getRandomAmount(-15, 15);
        this.ordersChange = this.getRandomAmount(-10, 10);
        
        this.chartData = {
          labels: this.generateLabels(),
          datasets: [{
            label: 'Ventas diarias',
            data: this.generateRandomData(),
            backgroundColor: '#42b98380',
            borderColor: '#42b983',
            borderWidth: 2
          }]
        };
        
      } catch (error) {
        this.$toast.error(`Error al cargar estadísticas: ${error.message}`, {
          position: "top-center"
        });
      } finally {
        this.loading = false;
      }
    },
    
    generateLabels() {
      const days = this.selectedPeriod === '7days' ? 7 : 
                  this.selectedPeriod === '30days' ? 30 :
                  this.selectedPeriod === '90days' ? 90 : 12;
      
      return Array.from({ length: days }, (_, i) => {
        if (this.selectedPeriod === 'year') {
          return new Date(2023, i, 1).toLocaleString('es-ES', { month: 'short' });
        }
        return `Día ${i + 1}`;
      });
    },
    
    generateRandomData() {
      const count = this.selectedPeriod === '7days' ? 7 : 
                   this.selectedPeriod === '30days' ? 30 :
                   this.selectedPeriod === '90days' ? 90 : 12;
      
      return Array.from({ length: count }, () => this.getRandomAmount(100, 1000));
    },
    
    getRandomAmount(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
};
</script>

<style scoped>
.sales-statistics {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.period-selector select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-card h3 {
  margin-top: 0;
  color: #666;
  font-size: 1rem;
}

.summary-card .amount {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.summary-card .change {
  margin: 0;
  font-size: 0.9rem;
}

.change.positive {
  color: #42b983;
}

.change.negative {
  color: #f44336;
}

.total-sales {
  border-top: 4px solid #42b983;
}

.total-orders {
  border-top: 4px solid #2196f3;
}

.avg-order {
  border-top: 4px solid #ffc107;
}

i {
  margin-right: 0.5rem;
}
</style>