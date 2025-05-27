



<template>
  <div class="favorites">
    <h2>Mis Favoritos</h2>
    
    <!-- Estado de carga -->
    <div v-if="loading" class="loading">
      <div v-for="n in 3" :key="n" class="product-skeleton"></div>
    </div>
    
    <!-- Lista de favoritos -->
    <div v-else-if="favorites.length > 0" class="favorites-grid">
      <div v-for="product in favorites" :key="product.id" class="favorite-card">
        <router-link :to="`/product/${product.id}`" class="product-link">
          <img :src="product.mainImage" :alt="product.name" class="product-image">
          <div class="product-details">
            <h3 class="product-title">{{ product.name }}</h3>
            <div class="price-availability">
              <span class="price">Q{{ product.price }}</span>
              <span :class="['availability', product.stock > 0 ? 'in-stock' : 'out-of-stock']">
                {{ product.stock > 0 ? 'Disponible' : 'Agotado' }}
              </span>
            </div>
          </div>
        </router-link>
        <button @click.stop="removeFromFavorites(product.id)" class="remove-btn">
          <i class="fas fa-times"></i> Quitar
        </button>
      </div>
    </div>
    
    <!-- Mensaje cuando no hay favoritos -->
    <div v-else class="empty-favorites">
      <i class="fas fa-heart-broken"></i>
      <p>No tienes productos favoritos</p>
    </div>
    
    <!-- Notificación de eliminación -->
    <transition name="fade">
      <div v-if="showNotification" class="notification">
        Producto eliminado de favoritos
      </div>
    </transition>
  </div>
</template>

<script>
import {  db } from "@/services/firebase";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { useToast } from "vue-toastification";

export default {
  name: "FavoritesProduct",
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      favorites: [],       // Almacena la lista de productos favoritos
      loading: true,      // Controla el estado de carga
      showNotification: false // Controla la visibilidad de la notificación
    };
  },
  computed: {
    user() {
      console.log('[Favorites] Accediendo al usuario desde Vuex:', this.$store.state.user);
      return this.$store.state.user;
    }
  },
  methods: {
    /**
     * Elimina un producto de la lista de favoritos
     * @param {string} productId - ID del producto a eliminar
     */
    async removeFromFavorites(productId) {
      console.log(`[Favorites] Intentando eliminar producto ${productId} de favoritos`);
      
      if (!this.user) {
        const errorMsg = 'Usuario no autenticado, no se puede eliminar favorito';
        console.log('[Favorites] ' + errorMsg);
        this.toast.error(errorMsg);
        return;
      }

      try {
        console.log(`[Favorites] Actualizando documento del usuario ${this.user.uid} en Firestore`);
        await updateDoc(doc(db, "users", this.user.uid), {
          favorites: arrayRemove(productId)
        });
        
        console.log(`[Favorites] Producto ${productId} eliminado de favoritos en Firestore`);
        
        // Actualizar la lista local
        this.favorites = this.favorites.filter(p => p.id !== productId);
        console.log(`[Favorites] Lista local actualizada, quedan ${this.favorites.length} favoritos`);
        
        // Mostrar notificación
        this.showNotification = true;
        setTimeout(() => {
          this.showNotification = false;
          console.log("[Favorites] Notificación ocultada");
        }, 3000);
      } catch (error) {
        console.error("[Favorites] Error al eliminar favorito:", error);
        this.toast.error("Error al eliminar de favoritos");
      }
    },
    
    /**
     * Carga los productos favoritos del usuario
     */
    async loadFavorites() {
      console.log("[Favorites] Iniciando carga de favoritos");
      
      if (!this.user) {
        console.log("[Favorites] Usuario no autenticado, no se pueden cargar favoritos");
        this.loading = false;
        return;
      }

      try {
        // 1. Obtener documento del usuario
        console.log(`[Favorites] Obteniendo documento del usuario ${this.user.uid}`);
        const userDoc = await getDoc(doc(db, "users", this.user.uid));
        
        if (!userDoc.exists()) {
          console.log("[Favorites] Documento de usuario no encontrado");
          this.loading = false;
          return;
        }
        
        // 2. Obtener IDs de productos favoritos
        const favoritesIds = userDoc.data().favorites || [];
        console.log(`[Favorites] Encontrados ${favoritesIds.length} favoritos en el documento del usuario`);
        
        if (favoritesIds.length === 0) {
          console.log("[Favorites] El usuario no tiene productos favoritos");
          this.loading = false;
          return;
        }
        
        // 3. Obtener información completa de cada producto
        console.log("[Favorites] Iniciando carga de información de productos...");
        this.favorites = await Promise.all(
          favoritesIds.map(async (productId) => {
            console.log(`[Favorites] Obteniendo información del producto ${productId}`);
            const productDoc = await getDoc(doc(db, "products", productId));
            
            if (!productDoc.exists()) {
              console.log(`[Favorites] Producto ${productId} no encontrado en la base de datos`);
              return null;
            }
            
            console.log(`[Favorites] Producto ${productId} cargado correctamente`);
            return { id: productId, ...productDoc.data() };
          })
        );
        
        // 4. Filtrar productos nulos (que no existen)
        const initialCount = this.favorites.length;
        this.favorites = this.favorites.filter(product => product !== null);
        console.log(`[Favorites] Filtrados ${initialCount - this.favorites.length} productos que no existen`);
        
        console.log("[Favorites] Carga de favoritos completada:", this.favorites);
      } catch (error) {
        console.error("[Favorites] Error al cargar favoritos:", error);
        this.toast.error("Error al cargar favoritos");
      } finally {
        this.loading = false;
        console.log("[Favorites] Estado de carga completado");
      }
    }
  },
  async created() {
    console.log("[Favorites] Componente creado - Iniciando carga de datos");
    try {
      // Asegurarse de que el usuario esté cargado
      await this.$store.dispatch('fetchUser');
      console.log("[Favorites] Usuario cargado:", this.user);
      await this.loadFavorites();
    } catch (error) {
      console.error("[Favorites] Error en created:", error);
    }
  }
};
</script>

<style scoped>
.favorites {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.favorites h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.favorite-card {
  position: relative;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.favorite-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 1px solid #eaeaea;
}

.product-details {
  padding: 1rem;
}

.product-title {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-availability {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: bold;
  color: #42b983;
  font-size: 1.1rem;
}

.availability {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.in-stock {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.out-of-stock {
  background-color: #ffebee;
  color: #c62828;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ff4444;
  transition: all 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.remove-btn:hover {
  background-color: #ff4444;
  color: white;
}

.remove-btn i {
  font-size: 0.8rem;
}

.loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.product-skeleton {
  height: 250px;
  background-color: #f0f0f0;
  border-radius: 8px;
}

.empty-favorites {
  text-align: center;
  padding: 3rem 0;
  color: #7f8c8d;
}

.empty-favorites i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #e74c3c;
}

.empty-favorites p {
  font-size: 1.2rem;
  margin: 0;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #333;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .product-image {
    height: 120px;
  }
}
</style>