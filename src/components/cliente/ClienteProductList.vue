<template>
  <div class="product-list-container">
    <div class="product-list-header">
      <h2>Nuestros Productos</h2>
      <div class="sort-options">
        <label for="sort">Ordenar por:</label>
        <select id="sort" v-model="sortOption" @change="sortProducts">
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
          <option value="name-asc">Nombre: A-Z</option>
          <option value="name-desc">Nombre: Z-A</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando productos...</p>
    </div>

    <div v-else>
      <div v-if="filteredProducts.length === 0" class="no-products">
        No se encontraron productos.
      </div>
      <div v-else class="product-grid">
        <ClienteProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/services/firebase";
import ClienteProductCard from "./ClienteProductCard.vue";

export default {
  name: "ClienteProductList",
  components: {
    ClienteProductCard,
  },
  data() {
    return {
      products: [],
      loading: true,
      sortOption: "price-asc",
      searchQuery: ""
    };
  },
  async created() {
    await this.loadProducts();
  },
  computed: {
    filteredProducts() {
      let filtered = [...this.products];
      
      // Aplicar búsqueda si hay query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      }
      
      // Aplicar ordenamiento
      switch (this.sortOption) {
        case "price-asc":
          return filtered.sort((a, b) => a.price - b.price);
        case "price-desc":
          return filtered.sort((a, b) => b.price - a.price);
        case "name-asc":
          return filtered.sort((a, b) => a.name.localeCompare(b.name));
        case "name-desc":
          return filtered.sort((a, b) => b.name.localeCompare(a.name));
        default:
          return filtered;
      }
    }
  },
  methods: {
    async loadProducts() {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        this.products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: doc.data().price || 0,
          discount: doc.data().discount || 0
        }));
      } catch (error) {
        this.$root.$emit('show-notification', {
          message: 'Error al cargar productos',
          type: 'error'
        });
        console.error("Error loading products:", error);
      } finally {
        this.loading = false;
      }
    },
    sortProducts() {
      // El ordenamiento se maneja en la propiedad computed filteredProducts
    }
  }
};
</script>

<style scoped>
.product-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.product-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-options label {
  font-weight: 500;
}

.sort-options select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-products {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .product-list-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .sort-options {
    width: 100%;
  }
  
  .sort-options select {
    flex-grow: 1;
  }
}
</style>