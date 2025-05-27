<template>
  <div class="historial-container">
    <h1>Mi Historial de Compras</h1>
    
    <div v-if="!isAuthenticated" class="not-authenticated">
      <h2>Debes iniciar sesión para ver tu historial</h2>
      <router-link to="/login" class="auth-button login">Iniciar Sesión</router-link>
    </div>
    
    <div v-else>
      <!-- Filtros y búsqueda -->
      <div class="filters-container">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            placeholder="Buscar órdenes o productos..." 
            @input="handleSearch"
          />
          <i class="fas fa-search"></i>
        </div>
        
        <div class="filter-group">
          <label>Filtrar por estado:</label>
          <select v-model="statusFilter" @change="filterOrders">
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="completado">Completados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Ordenar por:</label>
          <select v-model="sortBy" @change="sortOrders">
            <option value="fecha-desc">Más recientes primero</option>
            <option value="fecha-asc">Más antiguos primero</option>
            <option value="total-desc">Mayor monto primero</option>
            <option value="total-asc">Menor monto primero</option>
          </select>
        </div>
      </div>
      
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Cargando historial...
      </div>
      
      <div v-if="!loading && filteredOrders.length === 0" class="no-orders">
        <p v-if="searchQuery || statusFilter !== 'todos'">No se encontraron órdenes con los filtros aplicados</p>
        <p v-else>Aún no tienes órdenes registradas</p>
        <router-link to="/HomePage" class="btn-comprar">Ir a comprar</router-link>
      </div>
      
      <!-- Lista de órdenes -->
      <!-- Reemplazar las secciones duplicadas con esto: -->
<div v-for="orden in paginatedOrders" :key="orden.id" class="orden-card-simple">
  <div class="orden-imagen">
    <img 
      :src="orden.items[0].images ? orden.items[0].images[0] : placeholderImage" 
      :alt="orden.items[0].name" 
    />
  </div>
  
  <div class="orden-info-simple">
    <div class="orden-header-simple">
      <h3>Orden #{{ orden.id }}</h3>
      <span class="fecha-simple">{{ formatFechaSimple(orden.fecha) }}</span>
    </div>
    
    <div class="orden-estado-simple">
      <span class="estado" :class="orden.estado">{{ formatEstado(orden.estado) }}</span>
    </div>
  </div>
  
  <div class="orden-accion">
    <button @click="verDetalle(orden.id)" class="btn-detalle-simple">
      <i class="fas fa-file-alt"></i> Ver detalles completos
    </button>
  </div>
</div>
      
      <!-- Paginación -->
      <div v-if="filteredOrders.length > itemsPerPage" class="pagination">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1" 
          class="page-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="page-info">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages" 
          class="page-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <!-- Modal de valoración -->
      <div v-if="showReviewModal" class="modal-overlay">
        <div class="review-modal">
          <h3>Valorar producto: {{ currentProduct.name }}</h3>
          <div class="rating-stars">
            <i 
              v-for="star in 5" 
              :key="star" 
              :class="['fas fa-star', star <= currentRating ? 'active' : '']"
              @click="setRating(star)"
            ></i>
          </div>
          <textarea 
            v-model="reviewText" 
            placeholder="Escribe tu opinión sobre este producto..."
            class="review-textarea"
          ></textarea>
          <div class="modal-actions">
            <button @click="submitReview" class="btn-submit">Enviar valoración</button>
            <button @click="closeReviewModal" class="btn-cancel">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
import { auth, db, storage } from '@/services/firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';
import { useToast } from "vue-toastification";

export default {
  name: 'HistorialCompras',
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      ordenes: [],
      filteredOrders: [],
      paginatedOrders: [],
      loading: false,
      isAuthenticated: false,
      searchQuery: '',
      statusFilter: 'todos',
      sortBy: 'fecha-desc',
      currentPage: 1,
      itemsPerPage: 5,
      expandedTimeline: null,
      placeholderImage: 'https://res.cloudinary.com/dsfnladar/image/upload/v1744650151/al57mqnrifrtjfsbt8tw.webp',
      showReviewModal: false,
      currentProduct: {},
      currentRating: 0,
      reviewText: ''
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    }
  },
  watch: {
    currentPage() {
      console.log('Current page changed to:', this.currentPage);
      this.paginateOrders();
    },
    filteredOrders() {
      console.log('Filtered orders updated. Count:', this.filteredOrders.length);
      this.currentPage = 1;
      this.paginateOrders();
    }
  },
  created() {
    console.log('Component created. Setting up auth state listener...');
    auth.onAuthStateChanged((user) => {
      console.log('Auth state changed. User:', user);
      this.isAuthenticated = !!user;
      if (user) {
        console.log('User authenticated. Email:', user.email);
        this.cargarOrdenes(user.email);
      } else {
        console.log('No user authenticated');
      }
    });
  },
  methods: {
    async cargarOrdenes(email) {
      console.log('Loading orders for email:', email);
      try {
        this.loading = true;
        this.ordenes = [];
        
        console.log('Creating Firestore query...');
        const q = query(
          collection(db, 'ordenes'),
          where('cliente.email', '==', email),
          orderBy('fecha', 'desc')
        );
        
        console.log('Executing query...');
        const querySnapshot = await getDocs(q);
        console.log('Query completed. Document count:', querySnapshot.size);
        
        querySnapshot.forEach((doc) => {
          console.log('Processing document ID:', doc.id);
          const orderData = doc.data();
          console.log('Order data:', orderData);
          this.ordenes.push({
            id: doc.id,
            ...orderData
          });
        });
        
        console.log('Total orders loaded:', this.ordenes.length);
        this.filteredOrders = [...this.ordenes];
        console.log('Filtered orders initialized:', this.filteredOrders.length);
        
      } catch (error) {
        console.error('Error loading orders:', error);
        this.toast.error(`Error al cargar órdenes: ${error.message}`);
      } finally {
        this.loading = false;
        console.log('Loading completed');
      }
    },
    
    filterOrders() {
      console.log('Filtering orders by status:', this.statusFilter);
      if (this.statusFilter === 'todos') {
        this.filteredOrders = [...this.ordenes];
      } else {
        this.filteredOrders = this.ordenes.filter(
          orden => orden.estado === this.statusFilter
        );
      }
      console.log('Orders after status filter:', this.filteredOrders.length);
      this.handleSearch();
    },
    
    handleSearch() {
      console.log('Handling search with query:', this.searchQuery);
      if (!this.searchQuery) {
        console.log('No search query, returning full filtered list');
        return;
      }
      
      const query = this.searchQuery.toLowerCase();
      this.filteredOrders = this.filteredOrders.filter(orden => {
        // Buscar en ID de orden
        if (orden.id.toLowerCase().includes(query)) {
          console.log('Match found in order ID:', orden.id);
          return true;
        }
        
        // Buscar en nombres de productos
        const hasProduct = orden.items.some(item => {
          const match = item.name.toLowerCase().includes(query);
          if (match) {
            console.log('Match found in product:', item.name);
          }
          return match;
        });
        
        return hasProduct;
      });
      
      console.log('Orders after search filter:', this.filteredOrders.length);
    },
    
    sortOrders() {
      console.log('Sorting orders by:', this.sortBy);
      const [field, direction] = this.sortBy.split('-');
      
      this.filteredOrders.sort((a, b) => {
        if (field === 'fecha') {
          return direction === 'desc' 
            ? new Date(b.fecha) - new Date(a.fecha)
            : new Date(a.fecha) - new Date(b.fecha);
        } else if (field === 'total') {
          return direction === 'desc' 
            ? b.total - a.total 
            : a.total - b.total;
        }
        return 0;
      });
      
      console.log('Orders after sorting. First order:', this.filteredOrders[0]);
    },
    
    paginateOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.paginatedOrders = this.filteredOrders.slice(start, end);
      console.log('Paginated orders. Showing:', start, 'to', end, 'of', this.filteredOrders.length);
      console.log('Current page items:', this.paginatedOrders);
    },
    
    nextPage() {
      console.log('Next page requested. Current:', this.currentPage, 'Total:', this.totalPages);
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    
    prevPage() {
      console.log('Previous page requested. Current:', this.currentPage);
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    toggleTimeline(orderId) {
      console.log('Toggling timeline for order:', orderId);
      this.expandedTimeline = this.expandedTimeline === orderId ? null : orderId;
    },
    
    formatFecha(fechaISO) {
      console.log('Formatting date:', fechaISO);
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
      console.log('Formatting payment method:', metodo);
      const methods = {
        deposito: 'Depósito bancario',
        contraentrega: 'Pago contra entrega',
        tarjeta: 'Tarjeta de crédito/débito'
      };
      return methods[metodo] || metodo;
    },
    
    formatEstado(estado) {
      console.log('Formatting status:', estado);
      const estados = {
        pendiente: 'Pendiente',
        completado: 'Completado',
        cancelado: 'Cancelado',
        enviado: 'Enviado',
        entregado: 'Entregado'
      };
      return estados[estado] || estado;
    },
    formatFechaSimple(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
},
    async getComprobanteUrl(filename) {
      console.log('Getting comprobante URL for:', filename);
      try {
        const ref = storageRef(storage, `comprobantes/${filename}`);
        const url = await getDownloadURL(ref);
        console.log('Comprobante URL:', url);
        return url;
      } catch (error) {
        console.error("Error al obtener comprobante:", error);
        return '#';
      }
    },
    
    verDetalle(ordenId) {
      console.log('Viewing details for order:', ordenId);
      this.$router.push({ path: `/orden/${ordenId}` });
    },
    
    async cancelOrder(orderId) {
      console.log('Attempting to cancel order:', orderId);
      try {
        const confirm = window.confirm('¿Estás seguro que deseas cancelar esta orden?');
        if (!confirm) {
          console.log('Order cancellation cancelled by user');
          return;
        }
        
        console.log('Updating order status to "cancelado"...');
        await updateDoc(doc(db, 'ordenes', orderId), {
          estado: 'cancelado',
          'historialEstados': [
            {
              estadoAnterior: 'pendiente',
              estadoNuevo: 'cancelado',
              fecha: new Date().toISOString(),
              usuario: {
                id: auth.currentUser.uid,
                email: auth.currentUser.email,
                nombre: auth.currentUser.displayName || 'Usuario'
              }
            }
          ]
        });
        
        console.log('Order successfully cancelled');
        this.toast.success('Orden cancelada exitosamente');
        await this.cargarOrdenes(auth.currentUser.email);
      } catch (error) {
        console.error('Error cancelling order:', error);
        this.toast.error(`Error al cancelar orden: ${error.message}`);
      }
    },
    
    openReviewModal(product) {
      console.log('Opening review modal for product:', product);
      this.currentProduct = product;
      this.currentRating = 0;
      this.reviewText = '';
      this.showReviewModal = true;
    },
    
    closeReviewModal() {
      console.log('Closing review modal');
      this.showReviewModal = false;
    },
    
    setRating(rating) {
      console.log('Setting rating to:', rating);
      this.currentRating = rating;
    },
    
    async submitReview() {
      console.log('Submitting review. Rating:', this.currentRating, 'Text:', this.reviewText);
      if (this.currentRating === 0) {
        console.log('No rating selected, showing warning');
        this.toast.warning('Por favor selecciona una calificación');
        return;
      }
      
      try {
        console.log('Saving review for product:', this.currentProduct.id);
        // Aquí implementar la lógica para guardar la valoración
        
        this.toast.success('¡Gracias por tu valoración!');
        this.closeReviewModal();
      } catch (error) {
        console.error('Error submitting review:', error);
        this.toast.error(`Error al enviar valoración: ${error.message}`);
      }
    }
  }
};
</script>



<style scoped>
/* Estilos para la versión simplificada */
.orden-card-simple {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1rem;
  margin-bottom: 1rem;
  transition: transform 0.2s;
}

.orden-card-simple:hover {
  transform: translateY(-2px);
}

.orden-imagen {
  width: 80px;
  height: 80px;
  margin-right: 1rem;
  flex-shrink: 0;
}

.orden-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.orden-info-simple {
  flex-grow: 1;
}

.orden-header-simple {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.orden-header-simple h3 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.fecha-simple {
  color: #666;
  font-size: 0.9rem;
}

.orden-estado-simple .estado {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
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

.btn-detalle-simple {
  background: none;
  border: none;
  color: #42b983;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
}

.btn-detalle-simple:hover {
  color: #3aa876;
}
.historial-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.not-authenticated {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

/* Estilos para filtros y búsqueda */
.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #555;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

/* Estilos mejorados para las tarjetas de orden */
.orden-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.orden-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.order-status-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-timeline {
  position: relative;
  cursor: pointer;
  color: #666;
}

.status-timeline:hover {
  color: #42b983;
}

.timeline-details {
  position: absolute;
  left: 0;
  top: 100%;
  background: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 10;
  min-width: 250px;
}

.timeline-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-date {
  display: block;
  font-size: 0.75rem;
  color: #666;
}

.timeline-status {
  font-weight: bold;
  color: #2c3e50;
}

.timeline-user {
  font-size: 0.8rem;
  color: #42b983;
}

/* Estilos para productos */
.product-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-review {
  background: #ffc107;
  color: #333;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-review:hover {
  background: #e0a800;
}

.btn-buy-again {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-buy-again:hover {
  background: #3aa876;
}

/* Estilos para el footer de la orden */
.orden-footer {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #f9f9f9;
  border-top: 1px solid #eee;
}

.btn-cancel {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel:hover {
  background: #c82333;
}

.btn-comprobante {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-comprobante:hover {
  background: #138496;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.page-btn {
  background: #42b983;
  color: white;
  border: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
  color: #555;
}

/* Modal de valoración */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.review-modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}

.rating-stars {
  margin: 1rem 0;
  font-size: 2rem;
  color: #ddd;
  cursor: pointer;
}

.rating-stars .fa-star {
  margin: 0 0.25rem;
}

.rating-stars .active {
  color: #ffc107;
}

.review-textarea {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 1rem 0;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-submit {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-submit:hover {
  background: #3aa876;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #5a6268;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .orden-info {
    grid-template-columns: 1fr;
  }
  
  .orden-footer {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .orden-footer button, 
  .orden-footer a {
    width: 100%;
    justify-content: center;
  }
}
</style>