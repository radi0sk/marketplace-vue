<template>
  <div class="products-page">
    <!-- Barra lateral -->
    <aside class="sidebar">
      <!-- Buscador -->
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar productos..."
          @keyup.enter="applySearch"
        />
        <button @click="applySearch">
          <font-awesome-icon :icon="['fas', 'search']" />
        </button>
      </div>

      <!-- Categorías -->
      <div class="categories-section">
        <h3>Categorías</h3>
        <ul>
          <li 
            v-for="category in categories" 
            :key="category.id"
            :class="{ active: activeCategory === category.id }"
            @click="filterByCategory(category.id)"
          >
            {{ category.name }}
          </li>
        </ul>
      </div>

      <!-- Notificaciones -->
      <div class="notifications-section">
        <h3>Notificaciones</h3>
        <div v-if="notifications.length > 0">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
          >
            <p>{{ notification.message }}</p>
            <small>{{ formatDate(notification.date) }}</small>
          </div>
        </div>
        <div v-else class="empty-notifications">
          No hay notificaciones nuevas
        </div>
      </div>
    </aside>

    <!-- Cuerpo principal -->
    <main class="products-main">
      <!-- Filtros -->
      <div class="filters-bar">
        <div class="sort-options">
          <label>Ordenar por:</label>
          <select v-model="sortOption" @change="applySorting">
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="date-desc">Más recientes</option>
            <option value="date-asc">Más antiguos</option>
            <option value="popular">Más populares</option>
          </select>
        </div>

        <div class="price-filter">
          <label>Rango de precio:</label>
          <div class="price-range">
            <input type="number" v-model="minPrice" placeholder="Mínimo" />
            <span>-</span>
            <input type="number" v-model="maxPrice" placeholder="Máximo" />
            <button @click="applyPriceFilter">Aplicar</button>
          </div>
        </div>
      </div>

      <!-- Lista de productos -->
      <div class="product-grid">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id" 
          class="product-card"
        >
          <router-link :to="`/product/${product.id}`">
            <img 
              :src="product.images && product.images.length > 0 ? product.images[0] : 'ruta/a/imagen/predeterminada.jpg'" 
              :alt="product.name" 
            />
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p class="price">${{ product.price }}</p>
              <p class="category">{{ getCategoryName(product.category) }}</p>
              <div class="product-meta">
                <span><font-awesome-icon :icon="['fas', 'eye']" /> {{ product.views || 0 }}</span>
                <span><font-awesome-icon :icon="['fas', 'calendar-alt']" /> {{ formatDate(product.createdAt) }}</span>
              </div>
            </div>
          </router-link>
          <div class="product-actions">
            <button 
              class="add-to-cart-button" 
              @click.stop="addToCartWithNotification(product)"
            >
              <font-awesome-icon :icon="['fas', 'cart-plus']" />
            </button>
            <button 
              class="favorite-button"
              @click.stop="toggleFavorite(product)"
              :class="{ 'is-favorite': favoriteStatus[product.id] }"
            >
              <font-awesome-icon 
                :icon="favoriteStatus[product.id] ? ['fas', 'heart'] : ['far', 'heart']" 
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
        >
          &laquo; Anterior
        </button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
        >
          Siguiente &raquo;
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import { db, auth } from "@/services/firebase";
import { 
  collection, 
  getDocs, 
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { mapActions } from 'vuex';
import { useToast } from "vue-toastification";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import AddedToCartToast from '@/components/toasts/AddedToCartToast.vue';

export default {
  name: 'ProductsPage',
  components: {
    FontAwesomeIcon
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      products: [],
      categories: [],
      notifications: [],
      searchQuery: '',
      activeCategory: null,
      sortOption: 'date-desc',
      minPrice: null,
      maxPrice: null,
      currentPage: 1,
      itemsPerPage: 12,
      loading: false,
      favoriteStatus: {}
    };
  },
  async created() {
    await this.loadCategories();
    await this.loadProducts();
    this.loadNotifications();
    await this.checkFavorites();
  },
  computed: {
    filteredProducts() {
      let filtered = [...this.products];
      
      // Filtrar por búsqueda
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query)
        );
      }
      
      // Filtrar por categoría
      if (this.activeCategory) {
        filtered = filtered.filter(p => p.category === this.activeCategory);
      }
      
      // Filtrar por precio
      if (this.minPrice) {
        filtered = filtered.filter(p => p.price >= Number(this.minPrice));
      }
      if (this.maxPrice) {
        filtered = filtered.filter(p => p.price <= Number(this.maxPrice));
      }
      
      // Ordenar
      switch (this.sortOption) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'date-asc':
          filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'date-desc':
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'popular':
          filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
      }
      
      // Paginación
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.products.length / this.itemsPerPage);
    }
  },
  methods: {
    ...mapActions(['addToCart']),
    async addToCartWithNotification(product) {
      try {
        await this.addToCart(product);
      this.toast.success({
        component: AddedToCartToast,
        props: {
          message: `"${product.name}" agregado al carrito!`
        }
      });
      } catch (error) {
        this.toast.error('Error al agregar producto al carrito', {
          position: "top-center"
        });
      }
    },
    
    async toggleFavorite(product) {
  const user = auth.currentUser;
  if (!user) {
    this.toast.error("Debes iniciar sesión para agregar a favoritos");
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const productId = product.id;
    const isFavorite = this.favoriteStatus[productId];

    if (isFavorite) {
      await updateDoc(userRef, {
        favorites: arrayRemove(productId)
      });
      this.toast.success("Producto eliminado de favoritos");
    } else {
      await updateDoc(userRef, {
        favorites: arrayUnion(productId)
      });
      this.toast.success("Producto agregado a favoritos");
    }

    // En Vue 3, simplemente actualiza la propiedad reactiva directamente
    this.favoriteStatus = {
      ...this.favoriteStatus,
      [productId]: !isFavorite
    };

  } catch (error) {
    console.error("Error updating favorites:", error);
    this.toast.error("Error al actualizar favoritos");
  }
},

    async checkFavorites() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const favorites = userDoc.data().favorites || [];
      // Crear un nuevo objeto reactivo
      this.favoriteStatus = Object.fromEntries(
        this.products.map(product => [
          product.id, 
          favorites.includes(product.id)
        ])
      );
    }
  } catch (error) {
    console.error("Error checking favorites:", error);
  }
},
    
    async loadProducts() {
      this.loading = true;
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        this.products = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        this.loading = false;
      }
    },
    
    async loadCategories() {
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      this.categories = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    },
    
    loadNotifications() {
      // Esto sería reemplazado por llamada a Firebase en producción
      this.notifications = [
        { id: 1, message: "Nuevo producto en tu categoría favorita", date: new Date() },
        { id: 2, message: "Oferta especial en productos de ganadería", date: new Date(Date.now() - 86400000) }
      ];
    },
    
    filterByCategory(categoryId) {
      this.activeCategory = this.activeCategory === categoryId ? null : categoryId;
      this.currentPage = 1;
    },
    
    applySearch() {
      this.currentPage = 1;
    },
    
    applySorting() {
      this.currentPage = 1;
    },
    
    applyPriceFilter() {
      this.currentPage = 1;
    },
    
    getCategoryName(categoryId) {
      const category = this.categories.find(c => c.id === categoryId);
      return category ? category.name : 'Sin categoría';
    },
    
    formatDate(date) {
      if (!date) return '';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(date).toLocaleDateString('es-ES', options);
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
};
</script>

<style scoped>
/* Tus estilos existentes pueden permanecer igual */
.products-page {
  display: flex;
  min-height: 100vh;
  padding: 1rem;
  gap: 1.5rem;
}

.sidebar {
  width: 280px;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.search-box {
  display: flex;
  margin-bottom: 1.5rem;
}

.search-box input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
}

.search-box button {
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.categories-section h3, 
.notifications-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.1rem;
}

.categories-section ul {
  list-style: none;
  padding: 0;
}

.categories-section li {
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 0.3rem;
}

.categories-section li:hover,
.categories-section li.active {
  background: #e9ecef;
}

.categories-section li.active {
  font-weight: bold;
  color: #42b983;
}

.notifications-section {
  margin-top: 2rem;
}

.notification-item {
  padding: 0.8rem;
  margin-bottom: 0.8rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.notification-item small {
  color: #6c757d;
  font-size: 0.8rem;
}

.empty-notifications {
  color: #6c757d;
  text-align: center;
  padding: 1rem;
}

.products-main {
  flex: 1;
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.sort-options, .price-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-options select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-range input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.price-range button {
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  position: relative;
}

.product-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 0.5rem;
}

.add-to-cart-button, 
.favorite-button {
  padding: 0.5rem;
  background-color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.add-to-cart-button {
  background-color: #42b983;
  color: white;
}

.favorite-button {
  background-color: white;
  color: #666;
}

.favorite-button.is-favorite {
  color: #c62828;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
}

.product-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #2c3e50;
}

.price {
  font-weight: bold;
  color: #42b983;
  margin: 0.5rem 0;
}

.category {
  color: #6c757d;
  font-size: 0.8rem;
  margin: 0.3rem 0;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

@media (max-width: 992px) {
  .products-page {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    margin-bottom: 1.5rem;
  }
  
  .filters-bar {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
  
  .price-range {
    flex-wrap: wrap;
  }
  
  .price-range input {
    width: 100%;
  }
}
</style>