<template>
  <div class="popular-products">
    <div class="header">
      <h2><i class="fas fa-fire"></i> Productos Populares</h2>
      <div class="filter-controls">
        <select v-model="timeRange" @change="loadPopularProducts">
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="all">Todos los tiempos</option>
        </select>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>
    
    <div v-else>
      <div v-if="popularProducts.length === 0" class="no-products">
        No hay datos de productos populares disponibles
      </div>
      
      <div v-else class="products-grid">
        <div v-for="product in popularProducts" :key="product.id" class="product-card">
          <div class="product-rank">{{ product.rank }}</div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <div class="stats">
              <span class="views">
                <i class="fas fa-eye"></i> {{ product.views }} vistas
              </span>
              <span class="orders">
                <i class="fas fa-shopping-cart"></i> {{ product.orders || 0 }} pedidos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/services/firebase";
import { collection, getDocs, query , orderBy, limit } from "firebase/firestore";

export default {
  data() {
    return {
      popularProducts: [],
      loading: false,
      timeRange: 'week'
    };
  },
  async created() {
    await this.loadPopularProducts();
  },
  methods: {
    async loadPopularProducts() {
      try {
        this.loading = true;
        let productsQuery = query(
          collection(db, "products"),
          orderBy("views", "desc"),
          limit(10)
        );
        
        // En una implementación real, agregarías filtros por fecha aquí
        const productsSnapshot = await getDocs(productsQuery);
        
        this.popularProducts = productsSnapshot.docs
          .map((doc, index) => ({
            id: doc.id,
            rank: index + 1,
            ...doc.data()
          }));
          
      } catch (error) {
        this.$toast.error(`Error al cargar productos populares: ${error.message}`, {
          position: "top-center"
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.popular-products {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-controls select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.loading, .no-products {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.product-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.product-rank {
  font-size: 1.5rem;
  font-weight: bold;
  color: #42b983;
  margin-right: 1rem;
  min-width: 30px;
  text-align: center;
}

.product-info {
  flex: 1;
}

.product-info h3 {
  margin: 0 0 0.5rem 0;
}

.stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.stats i {
  margin-right: 0.3rem;
}

i {
  margin-right: 0.5rem;
}
</style>