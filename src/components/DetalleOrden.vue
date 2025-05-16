<template>
    <div class="detalle-container">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Cargando orden...
      </div>
      
      <div v-else-if="!orden" class="no-order">
        <p>No se encontró la orden solicitada</p>
        <router-link to="/historial" class="btn-volver">Volver al historial</router-link>
      </div>
      
      <div v-else class="orden-detalle">
        <div class="orden-header">
          <h1>Detalle de Orden #{{ orden.id }}</h1>
          <span class="estado" :class="orden.estado">{{ orden.estado }}</span>
          <span class="fecha">{{ formatFecha(orden.fecha) }}</span>
        </div>
        
        <div class="orden-body">
          <div class="seccion">
            <h2>Información del Cliente</h2>
            <p><strong>Nombre:</strong> {{ orden.cliente.name }}</p>
            <p><strong>Email:</strong> {{ orden.cliente.email }}</p>
            <p><strong>Teléfono:</strong> {{ orden.cliente.telefono }}</p>
          </div>
          
          <div class="seccion">
            <h2>Dirección de Envío</h2>
            <p><strong>Dirección:</strong> {{ orden.direccion.direccion }}</p>
            <p><strong>Ciudad:</strong> {{ orden.direccion.ciudad }}</p>
            <p><strong>Departamento:</strong> {{ orden.direccion.departamento }}</p>
            <p><strong>Código Postal:</strong> {{ orden.direccion.codigoPostal }}</p>
            <p><strong>Tiempo de entrega estimado:</strong> {{ orden.direccion.tiempoEntrega }} días hábiles</p>
          </div>
          
          <div class="seccion">
            <h2>Método de Pago</h2>
            <p>{{ formatMetodoPago(orden.metodoPago) }}</p>
            <p v-if="orden.comprobante"><strong>Comprobante:</strong> {{ orden.comprobante }}</p>
          </div>
          
          <div class="seccion">
            <h2>Productos</h2>
            <div v-for="item in orden.items" :key="item.id" class="producto-item">
              <img :src="item.images ? item.images[0] : '/img-placeholder.png'" :alt="item.name" class="producto-img" />
              <div class="producto-info">
                <p class="nombre">{{ item.name }}</p>
                <p class="cantidad">{{ item.quantity }} x Q{{ item.price.toFixed(2) }}</p>
                <p v-if="item.categoria" class="categoria">{{ item.categoria }}</p>
              </div>
              <p class="subtotal">Q{{ (item.price * item.quantity).toFixed(2) }}</p>
            </div>
          </div>
          
          <div class="totales">
            <div class="total-linea">
              <span>Subtotal:</span>
              <span>Q{{ orden.subtotal.toFixed(2) }}</span>
            </div>
            <div class="total-linea">
              <span>Envío:</span>
              <span>Q{{ orden.envio.toFixed(2) }}</span>
            </div>
            <div v-if="orden.recargo > 0" class="total-linea">
              <span>Recargo (3%):</span>
              <span>Q{{ orden.recargo.toFixed(2) }}</span>
            </div>
            <div class="total-linea total-final">
              <span>Total:</span>
              <span>Q{{ orden.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <div class="orden-footer">
          <router-link to="/historial" class="btn-volver">
            Volver al historial
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { db } from '@/services/firebase';
  import { doc, getDoc } from 'firebase/firestore';
  import { useToast } from "vue-toastification";
  
  export default {
    name: 'DetalleOrden',
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
    created() {
      this.cargarOrden(this.$route.params.id);
    },
    methods: {
      async cargarOrden(ordenId) {
        try {
          this.loading = true;
          const docRef = doc(db, 'ordenes', ordenId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            this.orden = {
              id: docSnap.id,
              ...docSnap.data()
            };
          }
        } catch (error) {
          this.toast.error(`Error al cargar orden: ${error.message}`);
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
      },
      
      formatMetodoPago(metodo) {
        return metodo === 'deposito' ? 'Depósito bancario' : 'Pago contra entrega (+3%)';
      }
    }
  };
  </script>
  
  <style scoped>
  .detalle-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }
  
  .no-order {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  
  .btn-volver {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: #42b983;
    color: white;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
  }
  
  .orden-detalle {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    overflow: hidden;
  }
  
  .orden-header {
    padding: 1.5rem;
    background: #f9f9f9;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .orden-header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #2c3e50;
  }
  
  .estado {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: bold;
  }
  
  .estado.pendiente {
    background-color: #fff3cd;
    color: #856404;
  }
  
  .estado.completado {
    background-color: #d4edda;
    color: #155724;
  }
  
  .estado.cancelado {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .fecha {
    color: #666;
    font-size: 0.875rem;
  }
  
  .orden-body {
    padding: 1.5rem;
  }
  
  .seccion {
    margin-bottom: 2rem;
  }
  
  .seccion h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.25rem;
    color: #42b983;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }
  
  .producto-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .producto-img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .producto-info {
    flex: 1;
  }
  
  .nombre {
    margin: 0;
    font-weight: bold;
  }
  
  .cantidad, .categoria {
    margin: 0.25rem 0 0;
    color: #666;
    font-size: 0.875rem;
  }
  
  .subtotal {
    font-weight: bold;
  }
  
  .totales {
    margin: 2rem 0;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 4px;
  }
  
  .total-linea {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  
  .total-final {
    font-size: 1.2rem;
    font-weight: bold;
    padding-top: 0.5rem;
    border-top: 1px solid #eee;
  }
  
  .orden-footer {
    padding: 1.5rem;
    background: #f9f9f9;
    border-top: 1px solid #eee;
    text-align: center;
  }
  
  @media (max-width: 768px) {
    .orden-header h1 {
      font-size: 1.25rem;
    }
    
    .producto-item {
      flex-wrap: wrap;
    }
  }
  </style>