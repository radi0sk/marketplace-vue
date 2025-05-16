<template>
    <div class="search-page">
      <h2>Buscar Productos</h2>
      <div class="filters">
        <label for="category">Categoría:</label>
        <select v-model="selectedCategory" id="category">
          <option value="">Todas las categorías</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      <div class="product-list">
        <!-- Mostrar un mensaje si no hay productos -->
        <div v-if="filteredProducts.length === 0" class="no-products">
          No se encontraron productos en esta categoría.
        </div>
        <div class="product-card" v-for="product in filteredProducts" :key="product.id">
          <img :src="product.images && product.images.length > 0 ? product.images[0] : 'ruta/a/imagen/predeterminada.jpg'" :alt="product.name" />
          <h3>{{ product.name }}</h3>
          <p>${{ product.price }}</p>
          <router-link :to="`/product/${product.id}`" class="view-details">Ver Detalles</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { db } from "@/services/firebase";
  import { collection, getDocs } from "firebase/firestore";
  
  export default {
    name: "SearchPage",
    data() {
      return {
        selectedCategory: this.$route.query.category || "", // Filtro de categoría desde la URL
        categories: [], // Lista de categorías
        products: [], // Lista de productos
      };
    },
    async created() {
      // Cargar categorías desde Firestore
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      this.categories = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Cargar productos desde Firestore
      const productsSnapshot = await getDocs(collection(db, "products"));
      this.products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Si hay una categoría en la URL, aplicamos el filtro automáticamente
      if (this.$route.query.category) {
        this.selectedCategory = this.$route.query.category;
      }
    },
    computed: {
      filteredProducts() {
        // Filtrar productos por categoría seleccionada
        if (this.selectedCategory) {
          return this.products.filter((product) => product.categoria === this.selectedCategory);
        }
        return this.products; // Mostrar todos los productos si no hay filtro
      },
    },
  };
  </script>
  
  <style scoped>
  .search-page {
    padding: 1rem;
  }
  
  .filters {
    margin-bottom: 1rem;
  }
  
  .filters label {
    margin-right: 0.5rem;
  }
  
  .product-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .product-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    background-color: #f9f9f9;
  }
  
  .product-card img {
    max-width: 100%;
    border-radius: 8px;
  }
  
  .product-card h3 {
    margin: 0.5rem 0;
  }
  
  .product-card p {
    font-size: 1.25rem;
    font-weight: bold;
    color: #2c3e50;
  }
  
  .view-details {
    display: inline-block;
    margin-top: 0.5rem;
    color: #42b983;
    text-decoration: none;
  }
  
  .view-details:hover {
    text-decoration: underline;
  }
  
  .no-products {
    text-align: center;
    font-size: 1.2rem;
    color: #666;
    grid-column: 1 / -1; /* Ocupa todo el ancho del grid */
  }
  </style>