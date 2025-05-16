<template>
  <div class="historial-container">
    <h1>Mi Historial de Compras</h1>
    
    <div v-if="!isAuthenticated" class="not-authenticated">
      <h2>Debes iniciar sesión para ver tu historial</h2>
      <router-link to="/login" class="auth-button login">Iniciar Sesión</router-link>
    </div>
    
    <div v-else>
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i> Cargando historial...
      </div>
      
      <div v-if="!loading && ordenes.length === 0" class="no-orders">
        <p>Aún no tienes órdenes registradas</p>
        <router-link to="/HomePage" class="btn-comprar">Ir a comprar</router-link>
      </div>
      
      <div v-for="orden in ordenes" :key="orden.id" class="orden-card">
        <div class="orden-header">
          <h2>Orden #{{ orden.id }}</h2>
          <span class="estado" :class="orden.estado">{{ orden.estado }}</span>
          <span class="fecha">{{ formatFecha(orden.fecha) }}</span>
        </div>
        
        <div class="orden-body">
          <div class="orden-info">
            <div>
              <h3>Información de envío</h3>
              <p><strong>Nombre:</strong> {{ orden.direccion.nombre }}</p>
              <p><strong>Dirección:</strong> {{ orden.direccion.direccion }}</p>
              <p><strong>Ciudad:</strong> {{ orden.direccion.ciudad }}</p>
            </div>
            
            <div>
              <h3>Método de pago</h3>
              <p>{{ formatMetodoPago(orden.metodoPago) }}</p>
              <p><strong>Total:</strong> Q{{ orden.total.toFixed(2) }}</p>
            </div>
          </div>
          
          <div class="orden-productos">
            <h3>Productos</h3>
            <div v-for="item in orden.items" :key="item.id" class="producto-item">
              <img :src="item.images ? item.images[0] : 'https://res.cloudinary.com/dsfnladar/image/upload/v1744650151/al57mqnrifrtjfsbt8tw.webp'" :alt="item.name" class="producto-img" />
              <div class="producto-info">
                <p class="nombre">{{ item.name }}</p>
                <p class="cantidad">{{ item.quantity }} x Q{{ item.price.toFixed(2) }}</p>
              </div>
              <p class="subtotal">Q{{ (item.price * item.quantity).toFixed(2) }}</p>
            </div>
          </div>
        </div>
        
        <div class="orden-footer">
          <button @click="verDetalle(orden.id)" class="btn-detalle">
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from '@/services/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
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
      loading: false,
      isAuthenticated: false
    };
  },
  created() {
    auth.onAuthStateChanged((user) => {
      this.isAuthenticated = !!user;
      if (user) {
        this.cargarOrdenes(user.email);
      }
    });
  },
  methods: {
    async cargarOrdenes(email) {
      try {
        this.loading = true;
        this.ordenes = [];
        
        const q = query(
          collection(db, 'ordenes'),
          where('cliente.email', '==', email),
          orderBy('fecha', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          this.ordenes.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
      } catch (error) {
        this.toast.error(`Error al cargar órdenes: ${error.message}`);
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
      return metodo === 'deposito' ? 'Depósito bancario' : 'Pago contra entrega';
    },
    
    verDetalle(ordenId) {
  this.$router.push({ 
    path: `/orden/${ordenId}` 
    // O si prefieres usar el nombre:
    // name: 'DetalleOrden',
    // params: { id: ordenId }
  });
}
  }
};
</script>

<style scoped>
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

.not-authenticated h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.auth-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  display: inline-block;
}

.auth-button.login {
  background-color: #42b983;
  color: white;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-orders {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.btn-comprar {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
}

.orden-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
  overflow: hidden;
}

.orden-header {
  padding: 1rem 1.5rem;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.orden-header h2 {
  margin: 0;
  font-size: 1.25rem;
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

.orden-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.orden-info h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #42b983;
}

.orden-productos {
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.orden-productos h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #42b983;
}

.producto-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.producto-img {
  width: 60px;
  height: 60px;
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

.cantidad {
  margin: 0.25rem 0 0;
  color: #666;
  font-size: 0.875rem;
}

.subtotal {
  font-weight: bold;
}

.orden-footer {
  padding: 1rem 1.5rem;
  background: #f9f9f9;
  border-top: 1px solid #eee;
  text-align: right;
}

.btn-detalle {
  padding: 0.5rem 1rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-detalle:hover {
  background-color: #3aa876;
}

@media (max-width: 768px) {
  .orden-info {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .producto-item {
    flex-wrap: wrap;
  }
}
</style>