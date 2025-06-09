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
          <p class="change" :class="avgOrderChange >= 0 ? 'positive' : 'negative'">
            <i :class="avgOrderChange >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{ Math.abs(avgOrderChange) }}%
          </p>
        </div>
      </div>
      
      <div class="chart-container">
        <canvas ref="salesChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrders } from '@/api/orders'; // Importa la func ión de tu archivo orders.js
import Chart from 'chart.js/auto';

export default {
  data() {
    return {
      selectedPeriod: '30days',
      loading: false,
      totalSales: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      salesChange: 0,
      ordersChange: 0,
      avgOrderChange: 0,
      chart: null,
      chartData: {
        labels: [],
        datasets: []
      }
    };
  },
  
  async created() {
    await this.loadSalesData();
  },
  
  methods: {
    async loadSalesData() {
      try {
        this.loading = true;
        
        // Obtener órdenes del período actual (solo completadas)
        const currentOrders = await this.fetchOrders('completado');
        
        // Obtener órdenes del período anterior para comparación
        const previousOrders = await this.fetchOrders('completado', true);
        
        // Calcular métricas
        this.calculateMetrics(currentOrders, previousOrders);
        
        // Generar gráfica
        this.generateChart(currentOrders);
        
      } catch (error) {
        console.error("Error loading sales data:", error);
        this.$toast.error(`Error al cargar estadísticas: ${error.message}`, {
          position: "top-center"
        });
      } finally {
        this.loading = false;
      }
    },
    
    async fetchOrders(status, isPreviousPeriod = false) {
      try {
        // Primero obtenemos todas las órdenes completadas
        const allOrders = await getOrders(status);
        
        // Filtramos por período
        const startDate = this.getStartDate(
          isPreviousPeriod ? this.getComparisonPeriod() : this.selectedPeriod
        );
        
        const endDate = isPreviousPeriod ? 
          this.getStartDate(this.selectedPeriod) : 
          new Date();
        
        return allOrders.filter(order => {
          const orderDate = new Date(order.fecha);
          return orderDate >= startDate && orderDate <= endDate;
        });
        
      } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
    },
    
    getStartDate(period) {
      const now = new Date();
      const date = new Date(now);
      
      switch (period) {
        case '7days': date.setDate(now.getDate() - 7); break;
        case '30days': date.setDate(now.getDate() - 30); break;
        case '90days': date.setDate(now.getDate() - 90); break;
        case 'year': date.setFullYear(now.getFullYear() - 1); break;
        case '7days-prev': date.setDate(now.getDate() - 14); break;
        case '30days-prev': date.setDate(now.getDate() - 60); break;
        case '90days-prev': date.setDate(now.getDate() - 180); break;
        case 'year-prev': date.setFullYear(now.getFullYear() - 2); break;
        default: date.setDate(now.getDate() - 30);
      }
      
      return date;
    },
    
    getComparisonPeriod() {
      return `${this.selectedPeriod}-prev`;
    },
    
    calculateMetrics(currentOrders, previousOrders) {
      // Métricas actuales
      this.totalSales = currentOrders.reduce((sum, order) => sum + order.total, 0);
      this.totalOrders = currentOrders.length;
      this.avgOrderValue = this.totalOrders > 0 ? this.totalSales / this.totalOrders : 0;
      
      // Métricas del período anterior
      const prevTotalSales = previousOrders.reduce((sum, order) => sum + order.total, 0);
      const prevTotalOrders = previousOrders.length;
      const prevAvgOrder = prevTotalOrders > 0 ? prevTotalSales / prevTotalOrders : 0;
      
      // Calcular cambios porcentuales
      this.salesChange = prevTotalSales > 0 ? 
        ((this.totalSales - prevTotalSales) / prevTotalSales) * 100 : 0;
      
      this.ordersChange = prevTotalOrders > 0 ? 
        ((this.totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0;
      
      this.avgOrderChange = prevAvgOrder > 0 ?
        ((this.avgOrderValue - prevAvgOrder) / prevAvgOrder) * 100 : 0;
    },
    
    generateChart(orders) {
      // Agrupar órdenes por día
      const dailySales = {};
      orders.forEach(order => {
        const date = order.fecha.toLocaleDateString('es-GT');
        dailySales[date] = (dailySales[date] || 0) + order.total;
      });
      
      // Preparar datos para Chart.js
      this.chartData = {
        labels: Object.keys(dailySales),
        datasets: [{
          label: 'Ventas diarias (Q)',
          data: Object.values(dailySales),
          backgroundColor: '#42b98380',
          borderColor: '#42b983',
          borderWidth: 2,
          tension: 0.1
        }]
      };
      
      // Destruir gráfica anterior si existe
      if (this.chart) {
        this.chart.destroy();
      }
      
      // Crear nueva gráfica
      const ctx = this.$refs.salesChart?.getContext('2d');
      if (ctx) {
        this.chart = new Chart(ctx, {
          type: 'line',
          data: this.chartData,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return 'Q' + context.raw.toFixed(2);
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return 'Q' + value;
                  }
                }
              }
            }
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.sales-statistics {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  background-color: white;
  cursor: pointer;
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
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
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

.chart-container {
  margin-top: 2rem;
  height: 300px;
}
</style>