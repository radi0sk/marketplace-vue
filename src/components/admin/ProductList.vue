<template>
  <div class="product-list">
    <div v-if="loading" class="loading">Cargando productos...</div>
    <div v-else>
      <div v-if="products.length === 0" class="empty-message">
        No hay productos disponibles
      </div>
      <ul v-else class="product-items">
        <li v-for="product in products" :key="product.id" class="product-item">
          <div class="product-info">
            <span class="product-name">{{ product.name }}</span>
            <span class="product-price">${{ product.price }}</span>
          </div>
          <div class="product-actions">
            <button @click="editProduct(product.id)" class="edit-button">Editar</button>
            <button @click="confirmDelete(product.id)" class="action-button delete">
              Eliminar
            </button>
          </div>
        </li>
      </ul>
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
    editProduct(productId) {
    // Usa el nombre de la ruta o la ruta exacta que definiste
    this.$router.push({
      name: 'EditProduct', // Usando el nombre de la ruta
      params: { id: productId }
    });
    
    // Alternativamente puedes usar la ruta completa:
    // this.$router.push(`/admin/products/edit/${productId}`);
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
    },
  },
};
</script>

<style scoped>
.edit-button {
  background-color: #42b983;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}

.edit-button:hover {
  background-color: #369f6e;
}
.product-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.loading, .empty-message {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.product-items {
  list-style: none;
  padding: 0;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: bold;
  margin-right: 1rem;
}

.product-price {
  color: #42b983;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-button.edit {
  background-color: #42b983;
  color: white;
}

.action-button.delete {
  background-color: #ff4d4d;
  color: white;
}

.action-button:hover {
  opacity: 0.9;
}
</style>