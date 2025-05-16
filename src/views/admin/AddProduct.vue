<template>
    <div class="add-product-container">
      <h1>Agregar Nuevo Producto</h1>
      <ProductForm @product-submitted="handleProductSubmit" />
      <div v-if="isSubmitting" class="loading-message">Guardando producto...</div>
    </div>
  </template>
  
  <script>
  import ProductForm from '@/components/admin/ProductForm.vue';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    components: {
      ProductForm
    },
    setup() {
      const router = useRouter();
      const isSubmitting = ref(false);
  
      const handleProductSubmit = async (productData) => {
        isSubmitting.value = true;
        try {
          // Aquí iría la lógica para enviar el producto al backend
          console.log('Producto a guardar:', productData);
          
          // Simulamos un retraso de red
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Mostrar notificación de éxito
          // this.$root.$emit('show-notification', {
          //   message: 'Producto guardado exitosamente',
          //   type: 'success'
          // });
          
          // Redirigir a la lista de productos después de guardar
          router.push('/admin/products');
        } catch (error) {
          console.error('Error al guardar el producto:', error);
          // Mostrar notificación de error
          // this.$root.$emit('show-notification', {
          //   message: 'Error al guardar el producto: ' + error.message,
          //   type: 'error'
          // });
        } finally {
          isSubmitting.value = false;
        }
      };
  
      return {
        handleProductSubmit,
        isSubmitting
      };
    }
  };
  </script>
  
  <style scoped>
  .add-product-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }
  
  .loading-message {
    text-align: center;
    margin-top: 20px;
    font-style: italic;
    color: #666;
  }
  </style>