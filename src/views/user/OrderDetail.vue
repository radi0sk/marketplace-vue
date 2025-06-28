<template>
  <div class="order-detail">
      <router-link to="/purchase-history" class="back-button">
        <i class="fas fa-arrow-left"></i> Volver al historial
      </router-link>
    <h1 v-if="orden">Detalle de Pedido #{{ orden.id }}</h1>
    <h1 v-else>Detalle de Pedido</h1>
    
    <div v-if="orden" class="order-status" :class="orden.estado">
      {{ formatEstado(orden.estado) }}
    </div>
    
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i> Cargando orden...
    </div>
    
    <div v-else-if="orden" class="order-content">
      <div class="quick-summary">
        <div class="summary-item">
          <span class="label">Fecha:</span>
          <span class="value">{{ formatFecha(orden.fecha) }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Número de pedido:</span>
          <span class="value">{{ orden.id }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Método de pago:</span>
          <span class="value">{{ formatMetodoPago(orden.metodoPago) }}</span>
        </div>
      </div>

      <div class="status-timeline">
        <h2>Progreso del Pedido</h2>
        <div class="timeline">
          <div 
            v-for="(status, index) in orden.historialEstados" 
            :key="index" 
            class="timeline-item"
            :class="{active: index === orden.historialEstados.length - 1}"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="status">{{ formatEstado(status.estadoNuevo) }}</span>
              <span class="date">{{ formatFecha(status.fecha) }}</span>
              
            </div>
          </div>
        </div>
      </div>

      <div class="shipping-info">
        <h2>Información de Envío</h2>
        <div class="info-grid">
          <div>
            <h3>Datos del Cliente</h3>
            <p><strong>Nombre:</strong> {{ orden.cliente.name }}</p>
            <p><strong>Teléfono:</strong> {{ orden.cliente.telefono }}</p>
            <p><strong>Email:</strong> {{ orden.cliente.email }}</p>
          </div>
          <div>
            <h3>Dirección de Entrega</h3>
            <p>{{ orden.direccion.direccion }}</p>
            <p>{{ orden.direccion.ciudad }}, {{ orden.direccion.departamento }}</p>
            <p>Código postal: {{ orden.direccion.codigoPostal }}</p>
            <p v-if="orden.tiempoEntrega">
              <strong>Tiempo estimado de entrega:</strong> 
              {{ orden.tiempoEntrega }} días hábiles
            </p>
          </div>
        </div>
      </div>

      <div class="tracking-info" v-if="orden.numeroGuia || orden.imagenGuiaURL">
        <h2>Información de Rastreo</h2>
        <p v-if="orden.courier"><strong>Empresa de Courier:</strong> {{ formatCourierName(orden.courier) }}</p>
        <p v-if="orden.numeroGuia"><strong>Número de Guía:</strong> {{ orden.numeroGuia }}</p>
        <p v-if="orden.trackingURL">
          <strong>Link de Rastreo:</strong> 
          <a :href="orden.trackingURL" target="_blank" class="tracking-link">Rastrear mi pedido</a>
        </p>
        <div v-if="orden.imagenGuiaURL" class="guide-image-container">
          <strong>Imagen de Guía:</strong>
          <a :href="orden.imagenGuiaURL" target="_blank">
            <img :src="orden.imagenGuiaURL" alt="Imagen de guía de envío" class="guide-image" />
          </a>
        </div>
        <p v-else-if="orden.numeroGuia && !orden.trackingURL">
          * Para Guatex, por favor ingrese el número de guía directamente en su sitio web.
        </p>
      </div>
      <div class="order-products">
        <h2>Resumen de Compra</h2>
        <div v-for="item in orden.items" :key="item.id" class="product-item">
          <img :src="getProductImage(item)" :alt="item.name" class="product-img" />
          <div class="product-info">
            <h3>{{ item.name }}</h3>
            <p class="category" v-if="item.categoria">Categoría: {{ getCategoryName(item.categoria) }}</p>
            <p class="quantity-price">{{ item.quantity }} x Q{{ item.price.toFixed(2) }}</p>
          </div>
          <div class="product-subtotal">
            <p>Q{{ (item.price * item.quantity).toFixed(2) }}</p>
            <p v-if="item.recargo > 0" class="discount">
              (Incluye recargo: Q{{ item.recargo.toFixed(2) }})
            </p>
          </div>
        </div>
      </div>

      <div class="payment-summary">
        <h2>Resumen de Pago</h2>
        <div class="summary-grid">
          <div>
            <p><strong>Subtotal:</strong></p>
            <p><strong>Envío:</strong></p>
            <p v-if="hasDiscount"><strong>Descuentos:</strong></p>
            <p v-if="hasRecargo"><strong>Recargos:</strong></p>
            <p class="total"><strong>Total:</strong></p>
          </div>
          <div class="text-right">
            <p>Q{{ orden.subtotal.toFixed(2) }}</p>
            <p>Q{{ orden.envio.toFixed(2) }}</p>
            <p v-if="hasDiscount">-Q{{ calculateDiscount().toFixed(2) }}</p>
            <p v-if="hasRecargo">+Q{{ calculateRecargo().toFixed(2) }}</p>
            <p class="total">Q{{ orden.total.toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <div v-if="orden.comprobanteURL" class="payment-proof">
        <h2>Comprobante de Pago</h2>
        <a 
          :href="orden.comprobanteURL" 
          target="_blank" 
          class="proof-link"
        >
          <i class="fas fa-file-invoice"></i> Ver comprobante
        </a>
      </div>
    </div>
    
    <div v-else class="no-order">
      <p>No se encontró la orden solicitada</p>
    </div>
  </div>
</template>

<script>
import { db, storage } from '@/services/firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
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
      loading: false,
      categories: {},
      products: {}
    };
  },
  computed: {
    hasDiscount() {
      // Ajuste para calcular el descuento basado en la diferencia entre el precio total y el subtotal individual si aplica
      return this.orden?.items.some(item => (item.price * item.quantity) > item.subtotal);
    },
    hasRecargo() {
      return this.orden?.items.some(item => item.recargo > 0);
    }
  },
  async created() {
    await this.cargarOrden();
    await this.loadCategories();
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
          console.log('Order loaded for client:', this.orden);

          // Asegurar historialEstados existe y es un array
          if (!this.orden.historialEstados) {
            this.orden.historialEstados = [];
          }

          // Asegurar direccion existe
          if (!this.orden.direccion) {
            this.orden.direccion = {}; // O un objeto con valores por defecto
          }
          
        } else {
          this.toast.error('La orden no existe');
        }
      } catch (error) {
        console.error('Error loading order for client:', error);
        this.toast.error(`Error al cargar la orden: ${error.message}`);
      } finally {
        this.loading = false;
      }
    },
    
    async loadCategories() {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        querySnapshot.forEach(doc => {
          this.categories[doc.id] = doc.data().name;
        });
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    },
    
    getCategoryName(categoryId) {
      return this.categories[categoryId] || 'Sin categoría';
    },
    
    getProductImage(item) {
      if (item.images && item.images.length > 0) {
        return item.images[0];
      }
      return 'https://res.cloudinary.com/dsfnladar/image/upload/v1744650151/al57mqnrifrtjfsbt8tw.webp'; // Imagen por defecto
    },
    
    // Este método ya no es estrictamente necesario si comprobanteURL viene directo de Firestore
    // Pero lo mantengo si necesitas alguna lógica adicional.
    async getComprobanteUrl(filename) {
      // Asumo que 'comprobante' en orden.cliente.comprobante es el nombre del archivo en storage
      try {
        const ref = storageRef(storage, `comprobantes/${filename}`);
        return await getDownloadURL(ref);
      } catch (error) {
        console.error("Error al obtener comprobante:", error);
        return '#';
      }
    },
    
    calculateDiscount() {
      // Suma la diferencia entre el precio total del item y su subtotal (si subtotal es menor)
      return this.orden.items.reduce((total, item) => {
        // Asegúrate de que item.subtotal sea el subtotal después de aplicar descuentos por item, si los hay
        return total + ((item.price * item.quantity) - (item.subtotal || item.price * item.quantity));
      }, 0);
    },
    
    calculateRecargo() {
      return this.orden.items.reduce((total, item) => {
        return total + (item.recargo || 0);
      }, 0);
    },
    
    formatEstado(estado) {
      const estados = {
        pendiente: 'Pendiente',
        procesando: 'Procesando',
        verificado: 'Verificado',
        empacado: 'Empacado',
        enviado: 'Enviado',
        entregado: 'Entregado',
        completado: 'Completado',
        cancelado: 'Cancelado'
      };
      return estados[estado] || estado;
    },
    
    formatMetodoPago(metodo) {
      const metodos = {
        deposito: 'Depósito bancario',
        efectivo: 'Pago contra entrega', // Cambiado para ser más claro para el cliente
        tarjeta: 'Tarjeta de crédito/débito'
      };
      return metodos[metodo] || metodo;
    },

    formatCourierName(courier) {
      const couriers = {
        forza: 'Forza Delivery',
        cargoexpreso: 'Cargo Expreso',
        guatex: 'Guatex'
      };
      return couriers[courier] || courier;
    },
    
    formatFecha(fecha) { // El parámetro ahora es el objeto Date directo
      // Si la fecha es un objeto de tipo Timestamp de Firestore, conviértela
      let dateObj;
      if (fecha?.toDate) {
        dateObj = fecha.toDate();
      } else if (typeof fecha === 'string') {
        dateObj = new Date(fecha);
      } else if (fecha instanceof Date) {
        dateObj = fecha;
      } else {
        dateObj = new Date(); // Fallback
      }

      return dateObj.toLocaleDateString('es-GT', {
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

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.order-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  text-transform: capitalize;
}

/* Colores de estados */
.order-status.pendiente {
  background-color: #fff3cd;
  color: #856404;
}
.order-status.procesando {
  background-color: #d1ecf1; /* Light blue-green */
  color: #0c5460;
}
.order-status.verificado {
  background-color: #d4edda;
  color: #155724;
}
.order-status.empacado {
  background-color: #cce5ff;
  color: #004085;
}
.order-status.enviado {
  background-color: #e2e3e5;
  color: #383d41;
}
.order-status.entregado {
  background-color: #d4edda;
  color: #155724;
}
.order-status.completado {
  background-color: #d1e7dd;
  color: #0f5132;
}
.order-status.cancelado {
  background-color: #f8d7da;
  color: #721c24;
}

.quick-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
}

.summary-item .label {
  font-weight: bold;
  color: #555;
}

.status-timeline {
  margin-bottom: 2rem;
}

.timeline {
  position: relative;
  padding-left: 2rem;
  margin-top: 1rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ddd;
}

.timeline-item {
  position: relative;
  padding-bottom: 1.5rem;
}

.timeline-item.active .timeline-dot {
  background: #42b983;
  border-color: #42b983;
}

.timeline-item.active .status {
  font-weight: bold;
  color: #42b983;
}

.timeline-dot {
  position: absolute;
  left: -2rem;
  top: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid #ddd;
}

.timeline-content {
  margin-left: 1rem;
}

.timeline-content .status {
  display: block;
  margin-bottom: 0.25rem;
}

.timeline-content .date {
  font-size: 0.9rem;
  color: #666;
}

.timeline-content .updated-by {
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
}

.shipping-info {
  margin-bottom: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}

/* Tracking Info Section */
.tracking-info {
  background: #e9f7ef; /* Un fondo ligeramente verde para esta sección */
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #d4edda;
}

.tracking-info h2 {
  color: #155724;
  margin-top: 0;
  margin-bottom: 1rem;
}

.tracking-info p {
  margin-bottom: 0.5rem;
}

.tracking-link {
  color: #007bff;
  text-decoration: underline;
  font-weight: bold;
}

.tracking-link:hover {
  color: #0056b3;
}

.guide-image-container {
  margin-top: 1rem;
  text-align: center;
}

.guide-image {
  max-width: 100%;
  height: auto;
  max-height: 250px; /* Limita la altura para que no ocupe demasiado espacio */
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-top: 0.5rem;
}

.order-products {
  margin-bottom: 2rem;
}

.product-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #eee;
}

.product-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

.product-info .category {
  font-size: 0.9rem;
  color: #666;
  margin: 0.25rem 0;
}

.product-info .quantity-price {
  font-size: 0.9rem;
  color: #888;
}

.product-subtotal {
  text-align: right;
  min-width: 100px;
}

.product-subtotal .discount {
  font-size: 0.8rem;
  color: #dc3545;
}

.payment-summary {
  margin: 2rem 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: auto auto;
  justify-content: end;
  gap: 1rem;
  margin-top: 1rem;
  max-width: 400px;
  margin-left: auto;
}

.summary-grid .total {
  font-size: 1.2rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

.text-right {
  text-align: right;
}

.payment-proof {
  margin-top: 2rem;
}

.proof-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
}

.proof-link:hover {
  text-decoration: underline;
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

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .product-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .product-subtotal {
    text-align: left;
  }
}
</style>