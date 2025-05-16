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
      // Aquí podrías emitir el evento al ProductForm para edición
    },
    goToAddProduct() {
      this.$router.push('/admin/products/add');
    },
    handleProductDeleted(productName) {
      this.$toast.success(`Producto "${productName}" eliminado`, {
        position: "top-center"
      });
    }
  }
};
</script>

<style scoped>
.add-product-button {
  background-color: #42b983;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

.add-product-button:hover {
  background-color: #369f6e;
}
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

.add-product-btn {
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.add-product-btn:hover {
  background-color: #3aa876;
}

i {
  margin-right: 0.5rem;
}
</style>