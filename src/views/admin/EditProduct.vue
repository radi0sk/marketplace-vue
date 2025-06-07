<template>
    <div class="edit-product-container">
      <h1>Editar Producto {{ productId }}</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="isLoading">
        Cargando datos del producto...
      </div>
      
      <ProductForm 
        v-else
        :initial-product="product" 
        :is-editing="true"
        @product-submitted="handleProductUpdate"
      />
      
      <div v-if="isSubmitting" class="loading-message">
        Guardando cambios...
      </div>
    </div>
  </template>
  
  <script>
  import ProductForm from '@/components/admin/ProductForm.vue';
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { getProductById, updateProduct } from '@/api/products'; // Asegúrate de crear este archivo
  
  export default {
    components: {
      ProductForm
    },
    setup() {
      const route = useRoute();
      const router = useRouter();
      const productId = ref(route.params.id);
      const product = ref({});
      const isLoading = ref(true);
      const isSubmitting = ref(false);
      const error = ref(null);
  
      const fetchProduct = async () => {
        try {
          isLoading.value = true;
          error.value = null;
          
          // Llamada real a la API
          const response = await getProductById(productId.value);
          
          if (!response) throw new Error('Producto no encontrado');
          
          product.value = {
            ...response,
            category: response.categoria?.id || ''
          };
          
        } catch (err) {
          console.error('Error al cargar producto:', err);
          error.value = 'No se pudo cargar el producto';
          router.push('/admin/products');
        } finally {
          isLoading.value = false;
        }
      };
  
      const handleProductUpdate = async (productData) => {
        isSubmitting.value = true;
        try {
          await updateProduct(productId.value, productData);
          router.push('/admin/products?updated=true');
        } catch (err) {
          error.value = 'Error al actualizar el producto';
          console.error(err);
        } finally {
          isSubmitting.value = false;
        }
      };
  
      onMounted(fetchProduct);
  
      return {
        productId,
        product,
        isLoading,
        isSubmitting,
        error,
        handleProductUpdate
      };
    }
  };
  </script>
  



<style scoped>
  .error-message {
    color: red;
    margin-bottom: 1rem;
  }
  .loading-message {
    color: #666;
    font-style: italic;
  }
 
.error-message {
  color: red;
  margin-bottom: 1rem;
}
.loading-message {
  color: #666;
  font-style: italic;
}
/* Resto de tus estilos. .. */
</style>