<template>
  <div class="pagar-container">
    <h1>Finalizar Compra</h1>

    <!-- Mostrar mensaje si no está autenticado -->
    <div v-if="!isAuthenticated" class="not-authenticated">
      <h2>Debes iniciar sesión para continuar</h2>
      <p>Para realizar una compra, necesitas tener una cuenta e iniciar sesión.</p>
      <div class="auth-actions">
        <router-link to="/login" class="auth-button login">Iniciar Sesión</router-link>
        
      </div>
    </div>

    <!-- Mostrar contenido solo si está autenticado -->
    <template v-else>
      <!-- Sección 1: Identificación del cliente -->
      <section class="identificacion">
        <h2>Identificación</h2>
        <div>
          <p>{{ cliente.email }}</p>
          <div class="form-group">
            <label>Nombre completo:</label>
            <input v-model="cliente.name" required />
          </div>
          <div class="form-group">
            <label>Teléfono / Móvil:</label>
            <input v-model="cliente.telefono" required />
          </div>
        </div>
      </section>

     
     <!-- Sección 2: Información de envío -->
<section class="envio">
  <h2>Envío</h2>
  
  <!-- Mostrar dirección existente -->
  <div v-if="direccionEnvio" class="direccion-existente">
    <div class="direccion-info">
      <p><strong>Nombre:</strong> {{ direccionEnvio.nombre }}</p>
      <p><strong>Dirección:</strong> {{ direccionEnvio.direccion }}</p>
      <p><strong>Ciudad:</strong> {{ direccionEnvio.ciudad }}</p>
      <p><strong>Departamento:</strong> {{ direccionEnvio.departamento }}</p>
      <p><strong>Código Postal:</strong> {{ direccionEnvio.codigoPostal }}</p>
      <p><strong>Tiempo de entrega estimado:</strong> {{ direccionEnvio.tiempoEntrega }} días hábiles</p>
    </div>
    <button @click="editarDireccion" class="btn-editar">
      <i class="fas fa-edit"></i> Editar dirección
    </button>
  </div>
  
  <!-- Formulario para nueva dirección -->
  <div v-else class="form-direccion">
    <form @submit.prevent="guardarDireccion">
      <div class="form-group">
        <label>Nombre completo:</label>
        <input v-model="nuevaDireccion.nombre" required />
      </div>
      <div class="form-group">
        <label>Dirección exacta:</label>
        <input v-model="nuevaDireccion.direccion" required />
      </div>
      <div class="form-group">
        <label>Ciudad:</label>
        <input v-model="nuevaDireccion.ciudad" required />
      </div>
      <div class="form-group">
        <label>Departamento:</label>
        <input v-model="nuevaDireccion.departamento" required />
      </div>
      <div class="form-group">
        <label>Código Postal:</label>
        <input v-model="nuevaDireccion.codigoPostal" required />
      </div>
      <button type="submit" class="btn-guardar" :disabled="loading">
        <span v-if="!loading">Guardar dirección</span>
        <span v-else><i class="fas fa-spinner fa-spin"></i> Guardando...</span>
      </button>
    </form>
  </div>
</section>

      <!-- Sección 3: Método de pago -->
      <section class="metodo-pago">
        <h2>Método de Pago</h2>
        <div class="opciones-pago">
          <label class="opcion-pago">
            <input 
              type="radio" 
              v-model="metodoPago" 
              value="deposito" 
            />
            <span>Depósito previo</span>
          </label>
          <label class="opcion-pago">
            <input 
              type="radio" 
              v-model="metodoPago" 
              value="contra-entrega" 
            />
            <span>Pago contra entrega (+3%)</span>
          </label>
        </div>

        <!-- Información de depósito -->
        <div v-if="metodoPago === 'deposito'" class="info-deposito">
          <h3>Cuentas bancarias disponibles</h3>
          <div class="cuenta-bancaria">
            <p><strong>Banco Industrial</strong></p>
            <p>Tipo: Cuenta Monetaria</p>
            <p>Número: 123-456789-0</p>
            <p>A nombre de: Mi Empresa S.A.</p>
          </div>
          <div class="cuenta-bancaria">
            <p><strong>Banco G&T Continental</strong></p>
            <p>Tipo: Cuenta Monetaria</p>
            <p>Número: 987-654321-0</p>
            <p>A nombre de: Mi Empresa S.A.</p>
          </div>
          
          <div class="comprobante-deposito">
            <label>Subir comprobante de depósito:</label>
            <input 
              type="file" 
              @change="handleFileUpload" 
              accept="image/*,.pdf"
            />
            <p v-if="comprobante" class="nombre-archivo">
              Archivo seleccionado: {{ comprobante.name }}
            </p>
          </div>
        </div>

        <!-- Información de pago contra entrega -->
        <div v-if="metodoPago === 'contra-entrega'" class="info-contra-entrega">
          <p>El pago contra entrega tiene un recargo del 3% sobre el total.</p>
          <p>Total con recargo: Q {{ totalConRecargo.toFixed(2) }}</p>
        </div>
      </section>

      <!-- Sección 4: Resumen de la compra -->
      <section class="resumen-compra">
        <h2>Resumen de la Compra</h2>
        <div class="lista-productos">
          <div v-for="item in cart" :key="item.id" class="producto-resumen">
            <img :src="item.images[0]" :alt="item.name" class="producto-imagen" />
            <div class="producto-info">
              <h3>{{ item.name }}</h3>
              <p>{{ item.quantity }} x Q {{ item.price.toFixed(2) }}</p>
            </div>
            <p class="producto-total">
              Q {{ (item.price * item.quantity).toFixed(2) }}
            </p>
          </div>
        </div>
        
        <div class="totales">
          <div class="total-linea">
            <span>Subtotal:</span>
            <span>Q {{ subtotal }}</span>
          </div>
          <div class="total-linea">
            <span>Gastos de envío:</span>
            <span>Q {{ gastosEnvio.toFixed(2) }}</span>
          </div>
          <div v-if="metodoPago === 'contra-entrega'" class="total-linea">
            <span>Recargo (3%):</span>
            <span>Q {{ recargo.toFixed(2) }}</span>
          </div>
          <div class="total-linea total-final">
            <span>Total:</span>
            <span>Q {{ totalFinal.toFixed(2) }}</span>
          </div>
        </div>
        
        <button 
          @click="finalizarCompra" 
          class="finalizar-compra"
          :disabled="!validarFormulario"
        >
          {{ loading ? 'Procesando...' : 'Finalizar Compra' }}
        </button>
      </section>
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { db, auth } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from "vue-toastification";

export default {
  name: 'PagarFinal',
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      cliente: {
        name: '',
        telefono: '',
        email: ''
      },
      direccionEnvio: null,
      nuevaDireccion: {
        nombre: '',
        direccion: '',
        ciudad: '',
        departamento: '',
        codigoPostal: '',
        tiempoEntrega: 3
      },
      metodoPago: 'deposito',
      comprobante: null,
      loading: false,
      isAuthenticated: false
    };
  },
  computed: {
    ...mapState(['cart']),
    ...mapGetters(['cartTotal']),
    
    subtotal() {
      return parseFloat(this.cartTotal || 0);
    },
    
    gastosEnvio() {
      if (!this.cart || this.cart.length === 0) return 0;
      
      const categoriasEspeciales = [
        { nombre: 'ganaderia', costo: 0 },
        { nombre: 'concentrado', costo: 40 },
        { nombre: 'tilapia', costo: 40 },
        { nombre: 'carniceria', costo: 35 }
      ];
      
      for (const item of this.cart) {
        if (!item.categoria) continue;
        
        const categoriaItem = item.categoria.toLowerCase();
        const categoriaEspecial = categoriasEspeciales.find(cat => 
          categoriaItem.includes(cat.nombre)
        );
        
        if (categoriaEspecial) {
          return categoriaEspecial.costo;
        }
      }
      
      return 50;
    },
    
    recargo() {
      return this.metodoPago === 'contra-entrega' ? 
        (this.subtotal + this.gastosEnvio) * 0.03 : 0;
    },
    
    totalConRecargo() {
      return this.subtotal + this.gastosEnvio + this.recargo;
    },
    
    totalFinal() {
      return this.metodoPago === 'contra-entrega' ? 
        this.totalConRecargo : 
        this.subtotal + this.gastosEnvio;
    },
    
    validarFormulario() {
      return (
        this.isAuthenticated &&
        this.cliente.name && 
        this.cliente.telefono && 
        this.direccionEnvio && 
        this.metodoPago && 
        (this.metodoPago !== 'deposito' || this.comprobante) &&
        !this.loading
      );
    }
  },
  created() {
    auth.onAuthStateChanged((user) => {
      this.isAuthenticated = !!user;
      if (user) {
        this.cargarDatosCliente();
      }
    });
  },
  methods: {
    ...mapActions(['clearCart']),
    
    async cargarDatosCliente() {
      try {
        const user = auth.currentUser;
        
        if (user) {
          this.isAuthenticated = true;
          this.cliente.email = user.email;
          
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            
            this.cliente = {
              email: user.email,
              name: userData.name || '',
              telefono: userData.telefono || ''
            };
            
            if (userData.direccionEnvio) {
              this.direccionEnvio = userData.direccionEnvio;
              this.toast.success("Dirección cargada automáticamente");
            }
          }
        }
      } catch (error) {
        this.toast.error(`Error cargando datos: ${error.message}`);
      }
    },

    async guardarDireccion() {
      try {
        const user = auth.currentUser;
        if (!user) {
          this.toast.warning("Debes iniciar sesión para guardar una dirección");
          return;
        }

        this.loading = true;

        if (!this.nuevaDireccion.nombre || 
            !this.nuevaDireccion.direccion || 
            !this.nuevaDireccion.ciudad || 
            !this.nuevaDireccion.departamento || 
            !this.nuevaDireccion.codigoPostal) {
          this.toast.warning("Por favor completa todos los campos");
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          direccionEnvio: {
            nombre: this.nuevaDireccion.nombre,
            direccion: this.nuevaDireccion.direccion,
            ciudad: this.nuevaDireccion.ciudad,
            departamento: this.nuevaDireccion.departamento,
            codigoPostal: this.nuevaDireccion.codigoPostal,
            tiempoEntrega: 3
          }
        }, { merge: true });

        this.direccionEnvio = { ...this.nuevaDireccion };
        this.nuevaDireccion = {
          nombre: '',
          direccion: '',
          ciudad: '',
          departamento: '',
          codigoPostal: '',
          tiempoEntrega: 3
        };

        this.toast.success("Dirección guardada correctamente");
      } catch (error) {
        this.toast.error(`Error al guardar: ${error.message}`);
      } finally {
        this.loading = false;
      }
    },

    async guardarDatosCliente() {
      try {
        const user = auth.currentUser;
        if (!user) return;
        
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          name: this.cliente.name,
          telefono: this.cliente.telefono
        }, { merge: true });
        
        this.toast.info("Datos personales actualizados");
      } catch (error) {
        this.toast.error(`Error guardando datos: ${error.message}`);
      }
    },

    editarDireccion() {
      this.nuevaDireccion = { ...this.direccionEnvio };
      this.direccionEnvio = null;
      this.toast.info("Ahora puedes editar tu dirección");
    },
    
    handleFileUpload(event) {
      this.comprobante = event.target.files[0];
      if (this.comprobante) {
        this.toast.success(`Archivo ${this.comprobante.name} seleccionado`);
      }
    },
    
    async finalizarCompra() {
      if (!this.isAuthenticated) {
        this.toast.warning('Debes iniciar sesión para continuar');
        return;
      }
      
      if (!this.validarFormulario) {
        this.toast.error('Por favor completa todos los campos requeridos');
        return;
      }
      
      this.loading = true;
      try {
        await this.guardarDatosCliente();
        
        const orden = {
          fecha: new Date().toISOString(),
          cliente: { ...this.cliente },
          direccion: { ...this.direccionEnvio },
          metodoPago: this.metodoPago,
          items: this.cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            categoria: item.categoria,
            images: item.images
          })),
          subtotal: this.subtotal,
          envio: this.gastosEnvio,
          recargo: this.recargo,
          total: this.totalFinal,
          estado: 'pendiente',
          comprobante: this.comprobante ? this.comprobante.name : null
        };
        
        const orderRef = doc(db, 'ordenes', Date.now().toString());
        await setDoc(orderRef, orden);
        
        await this.clearCart();
        this.toast.success('¡Compra realizada con éxito!', {
          timeout: 5000
        });
        
        this.$router.push({ 
          name: 'Confirmacion', 
          query: { orderId: orderRef.id }
        });
        
      } catch (error) {
        this.toast.error(`Error al procesar: ${error.message}`);
      } finally {
        this.loading = false;
      }
    }    
  }
};
</script>

<style scoped>
.pagar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

section {
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

h1 {
  grid-column: 1 / -1;
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #42b983;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-guardar {
  background-color: #42b983;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.opciones-pago {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.opcion-pago {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.opcion-pago:hover {
  border-color: #42b983;
}

.info-deposito, .info-contra-entrega {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.cuenta-bancaria {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
}

.comprobante-deposito {
  margin-top: 1.5rem;
}

.nombre-archivo {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
}

.lista-productos {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}

.producto-resumen {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.producto-imagen {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.producto-info {
  flex: 1;
}

.producto-info h3 {
  margin: 0;
  font-size: 1rem;
}

.producto-total {
  font-weight: bold;
}

.totales {
  margin: 1.5rem 0;
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

.finalizar-compra {
  width: 100%;
  padding: 1rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.finalizar-compra:hover {
  background-color: #3aa876;
}

.finalizar-compra:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.not-authenticated {
  grid-column: 1 / -1;
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

.not-authenticated p {
  color: #666;
  margin-bottom: 2rem;
}

.auth-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.auth-button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.auth-button.login {
  background-color: #42b983;
  color: white;
}

.auth-button.register {
  background-color: white;
  color: #42b983;
  border: 1px solid #42b983;
}

.auth-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .pagar-container {
    grid-template-columns: 1fr;
  }
  
  section {
    grid-column: auto;
    grid-row: auto;
  }
  
  .auth-actions {
    flex-direction: column;
  }
  
  .auth-button {
    width: 100%;
    text-align: center;
  }
}
</style>