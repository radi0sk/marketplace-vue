<template>
  <div class="product-management">
    <div class="management-header">
      <h2><i class="fas fa-boxes"></i> Gestión de Productos</h2>
      <button @click="goToAddProduct" class="add-product-button">
        Agregar Nuevo Producto
      </button>
    </div>
    
    <ProductForm 
      v-if="showProductForm" 
      @product-saved="handleProductSaved"
      @cancel="showProductForm = false"
    />
    
    <ProductList 
      @edit-product="handleEditProduct"
      @product-deleted="handleProductDeleted"
      @toggle-availability="toggleProductAvailability"
    />
  </div>
</template>

<script>

import ProductForm from '@/components/admin/ProductForm.vue';
import ProductList from '@/components/admin/ProductList.vue';

export default {
  components: {
    ProductForm,
    ProductList
  },
  data() {
    return {
      showProductForm: false
    };
  },
  methods: {
    handleProductSaved(product) {
      this.showProductForm = false;
      this.$toast.success(`Producto "${product.name}" guardado correctamente`, {
        position: "top-center"
      });
    },
    handleEditProduct() {
      this.showProductForm = true;
    },
    goToAddProduct() {
      this.$router.push('/admin/products/add');
    },
    handleProductDeleted(productName) {
      this.$toast.success(`Producto "${productName}" eliminado`, {
        position: "top-center"
      });
    },
    toggleProductAvailability(product) {
      // Lógica para cambiar disponibilidad del producto
      const newStatus = product.available ? 'agotado' : 'disponible';
      this.$toast.success(`Producto marcado como ${newStatus}`, {
        position: "top-center"
      });
    }
  }
};
</script>

<style scoped>
.product-management {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-product-button {
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.add-product-button:hover {
  background-color: #3aa876;
}

i {
  margin-right: 0.5rem;
}
</style>