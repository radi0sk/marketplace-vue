<template>
  <div class="product-list">
    <div v-if="loading" class="loading">Cargando productos...</div>
    <div v-else>
      <div v-if="products.length === 0" class="empty-message">
        No hay productos disponibles
      </div>
      <div v-else class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <!-- Imagen del producto usando images[0] -->
          <div class="product-image" v-if="product.images && product.images.length > 0">
            <img 
              :src="product.images[0]" 
              :alt="product.name"
              class="product-img"
            >
          </div>
          <div class="product-image" v-else>
            <img 
              src="https://res.cloudinary.com/drpa7s0kq/image/upload/v1746550804/yrlq5mnxwhjn4lpx0ma3.png" 
              :alt="product.name"
              class="product-img"
            >
          </div>
          
          <h3 class="product-title">{{ product.name }}</h3>
          
          <div class="price">Q{{ product.price.toLocaleString() }}</div>
          
          <div class="status-container">
            <span class="status" :class="{ 'in-stock': product.stock > 0, 'out-of-stock': product.stock <= 0 }">
              {{ product.stock > 0 ? 'Disponible' : 'Agotado' }}
            </span>
            <span>·</span>
            <span class="publish-date">Publicado el {{ formatDate(product.createdAt) }}</span>
          </div>
          
          <div class="product-actions">
            <button 
             
              class="out-of-stock-btn" 
             
            >
              Agotado
            </button>
            <button @click="editProduct(product.id)" class="edit-btn">Editar</button>
            <button @click="confirmDelete(product.id)" class="delete-btn">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default {
  data() {
    return {
      products: [],
      loading: true,
    };
  },
  async created() {
    await this.loadProducts();
  },
  methods: {
    async loadProducts() {
      try {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "products"));
        this.products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Asegurar que images sea un array
          images: doc.data().images || []
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
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const options = { day: 'numeric', month: 'short' };
      return date.toLocaleDateString('es-GT', options);
    },
    editProduct(productId) {
      this.$router.push({
        name: 'EditProduct',
        params: { id: productId }
      });
    },
    confirmDelete(productId) {
      if (confirm('¿Estás seguro de eliminar este producto?')) {
        this.deleteProduct(productId);
      }
    },
    async deleteProduct(productId) {
      try {
        const db = getFirestore();
        await deleteDoc(doc(db, "products", productId));
        this.products = this.products.filter(p => p.id !== productId);
        this.$root.$emit('show-notification', {
          message: 'Producto eliminado correctamente',
          type: 'success'
        });
      } catch (error) {
        this.$root.$emit('show-notification', {
          message: 'Error al eliminar el producto',
          type: 'error'
        });
        console.error("Error deleting product:", error);
      }
    }
  }
};
</script>

<style scoped>
.product-list {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading, .empty-message {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.2rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.product-image {
  width: 100%;
  margin-bottom: 1rem;
  overflow: hidden;
  border-radius: 4px;
  height: 100px; /* Altura fija para consistencia */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Mantiene la proporción sin recortar */
  max-width: 100px;
}

.product-title {
  margin: 0.5rem 0;
  font-size: 1.2rem;
  font-weight: normal;
  line-height: 1.4;
  color: #333;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: #333;
}

.status-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.in-stock {
  background-color: transparent;
  color: #369f6e;
  font-weight: bold;
}

.out-of-stock {
  background-color: transparent;
  color: #f44336;
  font-weight: bold;
}

.out-of-stock-btn {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: not-allowed;
  margin-right: 0.5rem;
}

.publish-date {
  color: #666;
  font-size: 0.9rem;
}

.product-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.edit-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.edit-btn {
  background-color: #2196f3;
  color: white;
}

.edit-btn:hover {
  background-color: #0d8bf2;
}

.delete-btn {
  background-color: #f8f9fa;
  color: #f44336;
  border: 1px solid #ddd;
}

.delete-btn:hover {
  background-color: #f1f1f1;
}
</style>