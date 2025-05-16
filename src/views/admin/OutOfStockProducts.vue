<template>
  <div class="out-of-stock">
    <div class="header">
      <h2><i class="fas fa-exclamation-triangle"></i> Productos Agotados</h2>
      <button @click="refreshStock" class="refresh-btn">
        <i class="fas fa-sync-alt"></i> Actualizar
      </button>
    </div>
    
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando...
    </div>
    
    <div v-else>
      <div v-if="outOfStockProducts.length === 0" class="no-products">
        <i class="fas fa-check-circle"></i> No hay productos agotados
      </div>
      
      <table v-else class="products-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Stock</th>
            <th>Última Actualización</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in outOfStockProducts" :key="product.id">
            <td>{{ product.name }}</td>
            <td class="stock-cell">
              <span class="badge danger">0</span>
            </td>
            <td>{{ formatDate(product.updatedAt) }}</td>
            <td>
              <button 
                @click="navigateToEdit(product.id)"
                class="action-btn edit"
              >
                <i class="fas fa-edit"></i> Editar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { db } from "@/services/firebase";
import { collection, getDocs } from "firebase/firestore";

export default {
  data() {
    return {
      outOfStockProducts: [],
      loading: false
    };
  },
  async created() {
    await this.loadOutOfStockProducts();
  },
  methods: {
    async loadOutOfStockProducts() {
      try {
        this.loading = true;
        const productsSnapshot = await getDocs(collection(db, "products"));
        
        this.outOfStockProducts = productsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(product => product.stock <= 0)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          
      } catch (error) {
        this.$toast.error(`Error al cargar productos: ${error.message}`, {
          position: "top-center"
        });
      } finally {
        this.loading = false;
      }
    },
    
    async refreshStock() {
      await this.loadOutOfStockProducts();
      this.$toast.success('Lista de productos agotados actualizada', {
        position: "top-center"
      });
    },
    
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('es-ES');
    },
    
    navigateToEdit(productId) {
      this.$router.push(`/admin/products/edit/${productId}`);
    }
  }
};
</script>

<style scoped>
.out-of-stock {
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

.refresh-btn {
  padding: 0.5rem 1rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.refresh-btn:hover {
  background: #3aa876;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-products {
  text-align: center;
  padding: 2rem;
  color: #42b983;
  font-size: 1.1rem;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th, 
.products-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.products-table th {
  background-color: #f8f9fa;
}

.stock-cell {
  font-weight: bold;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.badge.danger {
  background-color: #ffebee;
  color: #f44336;
}

.action-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.action-btn.edit {
  background-color: #e3f2fd;
  color: #1976d2;
}

.action-btn.edit:hover {
  background-color: #bbdefb;
}

i {
  margin-right: 0.3rem;
}
</style>