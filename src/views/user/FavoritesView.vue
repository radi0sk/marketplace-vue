<template>
  <div class="favorites-view">
    <!-- Header de la página -->
    <header class="page-header">
      <div class="container">
        <h1><i class="fas fa-heart"></i> Mis Productos Favoritos</h1>
        <p class="subtitle">Todos tus productos guardados en un solo lugar</p>
      </div>
    </header>

    <!-- Contenedor principal -->
    <main class="main-content">
      <div class="container">
        <!-- Componente de favoritos -->
        <Favorites />
        
        <!-- Sección de recomendaciones -->
        <section class="recommendations" v-if="!loading && favorites.length > 0">
          <h2>Productos que podrían interesarte</h2>
         
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import Favorites from '@/components/user/Favorites.vue';

import { db } from '@/services/firebase';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';

export default {
  name: 'FavoritesView',
  components: {
    Favorites,
   
  },
  data() {
    return {
      loading: false,
      recommendedProducts: []
    };
  },
  computed: {
    favorites() {
      return this.$store.state.favorites || [];
    }
  },
  async created() {
    await this.loadRecommendedProducts();
  },
  methods: {
    async loadRecommendedProducts() {
      this.loading = true;
      try {
        // Obtener 6 productos aleatorios como recomendaciones
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('availability', '==', 'in_stock'), limit(6));
        const querySnapshot = await getDocs(q);
        
        this.recommendedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error loading recommended products:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.favorites-view {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  background-color: #42b983;
  color: white;
  padding: 3rem 0;
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.page-header .subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.main-content {
  padding-bottom: 3rem;
}

.recommendations {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #eaeaea;
}

.recommendations h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* Responsive design */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-header .subtitle {
    font-size: 1rem;
  }
  
  .container {
    padding: 0 1rem;
  }
}
</style>