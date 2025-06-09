<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>Agregar Nuevo Producto</h1>
      <router-link to="/admin/products" class="back-link">← Volver a Productos</router-link>
    </div>
    
    <div class="admin-content">
      <ProductForm 
        @product-submitted="handleProductSubmit" 
        @error="showError" 
      />
      
      <div v-if="isSubmitting" class="loading-overlay">
        <div class="loading-content">
          <div class="spinner"></div>
          <p>Guardando producto...</p>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProductForm from '@/components/admin/ProductForm.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  components: {
    ProductForm
  },
  setup() {
    const router = useRouter();
    const isSubmitting = ref(false);
    const currentUser = ref(null);

    // Escuchar cambios en el estado de autenticación
    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        currentUser.value = user;
      });
    });

    const handleProductSubmit = async (productData) => {
      // Verificar que hay un usuario autenticado
      if (!currentUser.value) {
        showError('Debes estar autenticado para crear un producto');
        return;
      }

      isSubmitting.value = true;

      try {
        // Agregar el ID del usuario que crea el producto
        const productWithUser = {
          ...productData,
          createdBy: currentUser.value.uid,
          createdAt: new Date().toISOString()
        };

        // Guardar en Firestore (usar productWithUser en lugar de productData)
        const docRef = await addDoc(collection(db, 'products'), productWithUser);
        console.log('Producto guardado con ID:', docRef.id);
        
        // Mostrar notificación de éxito
        showNotification('Producto guardado exitosamente', 'success');
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
          router.push('/admin/products');
        }, 1500);
      } catch (error) {
        console.error('Error al guardar el producto:', error);
        showError('Error al guardar el producto: ' + error.message);
      } finally {
        isSubmitting.value = false;
      }
    };

    const showError = (message) => {
      showNotification(message, 'error');
    };

    const showNotification = (message, type) => {
      // Implementar tu sistema de notificaciones aquí
      console.log(`${type}: ${message}`);
      // Ejemplo: this.$root.$emit('show-notification', { message, type });
    };

    return {
      handleProductSubmit,
      isSubmitting,
      showError
    };
  }
};
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.admin-header h1 {
  margin: 0;
  color: #333;
}

.back-link {
  color: #42b983;
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.admin-content {
  position: relative;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #42b983;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>