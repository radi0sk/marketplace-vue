<template>
    <div class="order-detail">
      <h1>Detalle de Orden #{{ $route.params.id }}</h1>
      
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Cargando orden...
      </div>
      
      <div v-else-if="orden" class="order-content">
        <!-- Aquí puedes mostrar los detalles completos de la orden -->
        <div class="order-info">
          <h2>Información de la orden</h2>
          <p><strong>Fecha:</strong> {{ formatFecha(orden.fecha) }}</p>
          <p><strong>Estado:</strong> {{ orden.estado }}</p>
          <p><strong>Total:</strong> Q{{ orden.total.toFixed(2) }}</p>
        </div>
        
        <!-- Mostrar productos de la orden -->
        <div class="order-products">
          <h2>Productos</h2>
          <div v-for="item in orden.items" :key="item.id" class="product-item">
            <img :src="item.images ? item.images[0] : 'imagen-por-defecto.jpg'" :alt="item.name" />
            <div class="product-info">
              <h3>{{ item.name }}</h3>
              <p>{{ item.quantity }} x Q{{ item.price.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-order">
        <p>No se encontró la orden solicitada</p>
      </div>
    </div>
  </template>
  
  <script>
  import { db } from '@/services/firebase';
  import { doc, getDoc } from 'firebase/firestore';
  import { useToast } from "vue-toastification";
  
  export default {
    name: 'OrderDetail',
    setup() {
      const toast = useToast();
      return { toast };
    },
    data() {
      return {
        orden: null,
        loading: false
      };
    },
    async created() {
      await this.cargarOrden();
    },
    methods: {
      async cargarOrden() {
        try {
          this.loading = true;
          const docRef = doc(db, 'ordenes', this.$route.params.id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            this.orden = {
              id: docSnap.id,
              ...docSnap.data()
            };
          } else {
            this.toast.error('La orden no existe');
          }
        } catch (error) {
          this.toast.error(`Error al cargar la orden: ${error.message}`);
        } finally {
          this.loading = false;
        }
      },
      formatFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-GT', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .order-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
  
  .order-info, .order-products {
    background: white;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  
  .product-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .product-item img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .no-order {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  </style>