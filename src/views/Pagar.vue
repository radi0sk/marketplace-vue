<template>
  <div class="pagar-container">
    <h1>Finalizar Compra</h1>

    <div v-if="!isAuthenticated" class="not-authenticated">
      <h2>Debes iniciar sesión para continuar</h2>
      <p>Para realizar una compra, necesitas tener una cuenta e iniciar sesión.</p>
      <div class="auth-actions">
        <router-link to="/login" class="auth-button login">Iniciar Sesión</router-link>
      </div>
    </div>

    <template v-else>
      <section class="identificacion">
        <h2>Identificación</h2>
        <div>
          <p>{{ cliente.email }}</p>
          <div class="form-group">
            <label>Nombre completo:</label>
            <input v-model="cliente.name" required @change="guardarDatosCliente" />
          </div>
          <div class="form-group">
            <label>Teléfono / Móvil:</label>
            <input v-model="cliente.telefono" required @change="guardarDatosCliente" />
          </div>
        </div>
      </section>

      <section class="envio">
        <h2>Envío</h2>

        <div v-if="direccionesEnvio.length > 0" class="direcciones-existente">
          <h3>Tus direcciones guardadas</h3>

          <div class="direcciones-list">
            <div
              v-for="direccion in direccionesEnvio"
              :key="direccion.id"
              class="direccion-item"
              :class="{selected: direccionSeleccionada === direccion.id}"
              @click="seleccionarDireccion(direccion.id)"
            >
              <div class="direccion-info">
                <h4>{{ direccion.nombre }}</h4>
                <p>{{ direccion.direccion }}, {{ direccion.ciudad }}</p>
                <p>{{ direccion.departamento }}, Código Postal: {{ direccion.codigoPostal }}</p>
              </div>
              <div class="direccion-actions">
                <button @click.stop="editarDireccion(direccion.id)" class="btn-edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click.stop="eliminarDireccion(direccion.id)"
                  class="btn-delete"
                  :disabled="direccionesEnvio.length === 1"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <button @click="mostrarFormularioNuevaDireccion" class="btn-add">
            <i class="fas fa-plus"></i> Agregar nueva dirección
          </button>
        </div>
         <div v-else class="no-direcciones">
          <p>No tienes direcciones guardadas. ¡Agrega una para continuar!</p>
          <button @click="mostrarFormularioNuevaDireccion" class="btn-add">
            <i class="fas fa-plus"></i> Agregar nueva dirección
          </button>
        </div>

        <div v-if="mostrarFormDireccion" class="form-direccion">
          <h3>{{ direccionEditando ? 'Editar Dirección' : 'Nueva Dirección' }}</h3>

          <form @submit.prevent="guardarDireccion">
            <div class="form-group">
              <label>Nombre para esta dirección (ej. Casa, Oficina):</label>
              <input v-model="nuevaDireccion.nombre" required />
            </div>

            <div class="form-group">
              <label>Dirección exacta:</label>
              <input v-model="nuevaDireccion.direccion" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Ciudad:</label>
                <input v-model="nuevaDireccion.ciudad" required />
              </div>
              <div class="form-group">
                <label>Departamento:</label>
                <select v-model="nuevaDireccion.departamento" required>
                  <option value="">Seleccionar...</option>
                  <option v-for="depto in departamentosGT" :value="depto" :key="depto">{{ depto }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Código Postal:</label>
              <input v-model="nuevaDireccion.codigoPostal" required />
            </div>

            <div class="form-actions">
              <button
                type="button"
                @click="cancelarEdicion"
                class="btn-cancel"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn-save"
                :disabled="loading"
              >
                {{ loading ? 'Guardando...' : 'Guardar Dirección' }}
              </button>
            </div>
          </form>
        </div>
      </section>

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
            <p v-if="comprobanteURL" class="nombre-archivo">
              Archivo seleccionado: <a :href="comprobanteURL" target="_blank">{{ comprobanteURL.substring(comprobanteURL.lastIndexOf('/') + 1) }}</a>
            </p>
            <p v-else-if="comprobanteFile" class="nombre-archivo">
              Archivo seleccionado: {{ comprobanteFile.name }}
            </p>
          </div>
        </div>

        <div v-if="metodoPago === 'contra-entrega'" class="info-contra-entrega">
          <p>El pago contra entrega tiene un recargo del 3% sobre el total.</p>
          <p>Total con recargo: Q {{ totalConRecargo.toFixed(2) }}</p>
        </div>
      </section>

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
            <span>Q {{ subtotal.toFixed(2) }}</span>
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
          :disabled="!validarFormulario || loading"
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
import { uploadImageToCloudinary } from '@/services/cloudinary'; // Import the Cloudinary service

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
      direccionesEnvio: [],
      direccionSeleccionada: null, // Stores the ID of the selected address
      mostrarFormDireccion: false,
      direccionEditando: null, // Stores the ID of the address being edited
      nuevaDireccion: {
        id: null, // Add id for new addresses
        nombre: '',
        direccion: '',
        ciudad: '',
        departamento: '',
        codigoPostal: '',
        tiempoEntrega: 3, // Default delivery time in days
        principal: false // To mark a primary address
      },
      departamentosGT: [
        'Alta Verapaz', 'Baja Verapaz', 'Chimaltenango',
        'Chiquimula', 'El Progreso', 'Escuintla',
        'Guatemala', 'Huehuetenango', 'Izabal',
        'Jalapa', 'Jutiapa', 'Petén',
        'Quetzaltenango', 'Quiché', 'Retalhuleu',
        'Sacatepéquez', 'San Marcos', 'Santa Rosa',
        'Sololá', 'Suchitepéquez', 'Totonicapán',
        'Zacapa'
      ],
      metodoPago: 'deposito',
      comprobanteFile: null, // Holds the File object
      comprobanteURL: '', // Holds the URL after Cloudinary upload
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

      return 50; // Default shipping cost
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

    // Returns the currently selected address object
    direccionEnvio() {
      return this.direccionesEnvio.find(d => d.id === this.direccionSeleccionada) || null;
    },

    validarFormulario() {
      // Form is valid if authenticated, client data is present,
      // an address is selected, payment method is chosen,
      // and if deposit, a comprobante is uploaded.
      return (
        this.isAuthenticated &&
        this.cliente.name &&
        this.cliente.telefono &&
        this.direccionSeleccionada !== null && // Ensure an address is selected
        this.metodoPago &&
        (this.metodoPago !== 'deposito' || this.comprobanteURL) && // Check for URL if deposit
        !this.loading
      );
    }
  },
  async mounted() { // Changed from created to mounted for async operations
    auth.onAuthStateChanged(async (user) => {
      this.isAuthenticated = !!user;
      if (user) {
        await this.cargarDatosCliente();
        await this.cargarDirecciones(); // Ensure addresses are loaded after user data
        // Select the primary address or the first one if no primary
        const principal = this.direccionesEnvio.find(d => d.principal);
        if (principal) {
          this.direccionSeleccionada = principal.id;
        } else if (this.direccionesEnvio.length > 0) {
          this.direccionSeleccionada = this.direccionesEnvio[0].id;
        }
      }
    });
  },
  methods: {
    ...mapActions(['clearCart']),

    async cargarDatosCliente() {
      try {
        const user = auth.currentUser;
        if (!user) return;

        this.cliente.email = user.email;

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          this.cliente.name = userData.name || '';
          this.cliente.telefono = userData.telefono || '';
        }
      } catch (error) {
        this.toast.error(`Error cargando datos del cliente: ${error.message}`);
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
        this.toast.error(`Error guardando datos del cliente: ${error.message}`);
      }
    },

    async cargarDirecciones() {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          this.direccionesEnvio = userSnap.data().direccionesEnvio || [];
        }
      } catch (error) {
        this.toast.error(`Error cargando direcciones: ${error.message}`);
      }
    },

    mostrarFormularioNuevaDireccion() {
      this.resetNuevaDireccion();
      this.direccionEditando = null;
      this.mostrarFormDireccion = true;
      this.direccionSeleccionada = null; // Deselect any existing address when adding new
    },

    seleccionarDireccion(id) {
      this.direccionSeleccionada = id;
      this.mostrarFormDireccion = false; // Hide form when an address is selected
      this.resetNuevaDireccion(); // Clear form fields
    },

    editarDireccion(id) {
      const direccion = this.direccionesEnvio.find(d => d.id === id);
      if (direccion) {
        this.nuevaDireccion = { ...direccion };
        this.direccionEditando = id;
        this.mostrarFormDireccion = true;
        this.direccionSeleccionada = null; // Deselect when editing
      }
    },

    async eliminarDireccion(id) {
      if (this.direccionesEnvio.length <= 1) {
        this.toast.warning('Debes tener al menos una dirección.');
        return;
      }

      if (!confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
        return;
      }

      try {
        this.loading = true;
        const user = auth.currentUser;
        const userRef = doc(db, 'users', user.uid);

        const nuevasDirecciones = this.direccionesEnvio.filter(d => d.id !== id);

        // If the selected address is deleted, select the first available or null
        if (this.direccionSeleccionada === id) {
          this.direccionSeleccionada = nuevasDirecciones.length > 0 ? nuevasDirecciones[0].id : null;
        }

        await setDoc(userRef, { direccionesEnvio: nuevasDirecciones }, { merge: true });
        this.direccionesEnvio = nuevasDirecciones;
        this.toast.success('Dirección eliminada correctamente.');
      } catch (error) {
        this.toast.error(`Error eliminando dirección: ${error.message}`);
      } finally {
        this.loading = false;
      }
    },

    async guardarDireccion() {
      try {
        this.loading = true;
        const user = auth.currentUser;
        const userRef = doc(db, 'users', user.uid);

        if (!this.validarDireccion()) {
          this.loading = false;
          return;
        }

        let direccionActualizada = { ...this.nuevaDireccion };

        if (this.direccionEditando) {
          // Editing existing address
          const index = this.direccionesEnvio.findIndex(d => d.id === this.direccionEditando);
          if (index !== -1) {
            this.direccionesEnvio.splice(index, 1, direccionActualizada);
          }
        } else {
          // Adding new address
          direccionActualizada.id = Date.now().toString(); // Simple unique ID
          direccionActualizada.fechaCreacion = new Date().toISOString();
          direccionActualizada.principal = this.direccionesEnvio.length === 0; // First address is primary by default
          this.direccionesEnvio.push(direccionActualizada);
        }

        // Set the principal flag if this is the only address or explicitly marked
        this.direccionesEnvio = this.direccionesEnvio.map(d => ({
            ...d,
            principal: d.id === direccionActualizada.id ? true : false // If this address is new/edited, set it as principal, otherwise false. This might need more refined logic for primary address management.
        }));
        
        await setDoc(userRef, { direccionesEnvio: this.direccionesEnvio }, { merge: true });

        this.toast.success('Dirección guardada correctamente.');
        this.mostrarFormDireccion = false;
        this.resetNuevaDireccion();
        this.direccionSeleccionada = direccionActualizada.id; // Select the newly saved/edited address
      } catch (error) {
        this.toast.error(`Error guardando dirección: ${error.message}`);
      } finally {
        this.loading = false;
      }
    },

    validarDireccion() {
      if (!this.nuevaDireccion.nombre.trim()) {
        this.toast.error('Asigna un nombre a esta dirección (ej. Casa, Oficina).');
        return false;
      }
      if (!this.nuevaDireccion.direccion.trim()) {
        this.toast.error('La dirección exacta es requerida.');
        return false;
      }
      if (!this.nuevaDireccion.ciudad.trim()) {
        this.toast.error('La ciudad es requerida.');
        return false;
      }
      if (!this.nuevaDireccion.departamento.trim()) {
        this.toast.error('El departamento es requerido.');
        return false;
      }
      if (!this.nuevaDireccion.codigoPostal.trim()) {
        this.toast.error('El código postal es requerido.');
        return false;
      }
      return true;
    },

    resetNuevaDireccion() {
      this.nuevaDireccion = {
        id: null,
        nombre: '',
        direccion: '',
        ciudad: '',
        departamento: '',
        codigoPostal: '',
        tiempoEntrega: 3,
        principal: false
      };
      this.direccionEditando = null;
    },

    cancelarEdicion() {
      this.mostrarFormDireccion = false;
      this.resetNuevaDireccion();
      // If there are existing addresses, re-select the first one if nothing was selected
      if (this.direccionesEnvio.length > 0 && this.direccionSeleccionada === null) {
        this.direccionSeleccionada = this.direccionesEnvio[0].id;
      }
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.comprobanteFile = file;
        this.toast.info(`Subiendo archivo: ${file.name}...`);
        try {
          this.loading = true;
          const url = await uploadImageToCloudinary(file); // Use the imported function
          this.comprobanteURL = url;
          this.toast.success('Comprobante subido correctamente.');
        } catch (error) {
          this.toast.error('Error al subir el comprobante.');
          console.error('Cloudinary upload error:', error);
          this.comprobanteURL = ''; // Clear URL on error
          this.comprobanteFile = null; // Clear file on error
        } finally {
          this.loading = false;
        }
      } else {
        this.comprobanteFile = null;
        this.comprobanteURL = '';
      }
    },

    async finalizarCompra() {
      if (!this.isAuthenticated) {
        this.toast.warning('Debes iniciar sesión para continuar.');
        return;
      }

      if (!this.validarFormulario) {
        this.toast.error('Por favor completa todos los campos requeridos o selecciona una dirección.');
        return;
      }

      this.loading = true;
      try {
        await this.guardarDatosCliente();

        const orden = {
          fecha: new Date().toISOString(),
          cliente: {
            name: this.cliente.name,
            telefono: this.cliente.telefono,
            email: this.cliente.email
          },
          // Ensure direccion is the selected one, not the temporary nuevaDireccion
          direccion: this.direccionEnvio || {},
          metodoPago: this.metodoPago,
          items: this.cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            categoria: item.categoria || '',
            images: item.images || []
          })),
          subtotal: this.subtotal,
          envio: this.gastosEnvio,
          recargo: this.recargo,
          total: this.totalFinal,
          estado: 'pendiente',
          comprobanteURL: this.comprobanteURL || '' // Store the Cloudinary URL
        };

        const orderRef = doc(db, 'ordenes', Date.now().toString()); // Use a more robust ID if needed
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
        this.toast.error(`Error al procesar la compra: ${error.message}`);
        console.error('Error details:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Your existing styles remain here */
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

.form-group input, .form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
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

/* New/Modified styles for address management */
.direcciones-existente {
  margin-top: 1rem;
}

.direcciones-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
  max-height: 200px; /* Adjust as needed */
  overflow-y: auto;
  padding-right: 5px; /* For scrollbar */
}

.direccion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.direccion-item:hover {
  border-color: #42b983;
  box-shadow: 0 2px 8px rgba(66, 185, 131, 0.1);
}

.direccion-item.selected {
  border-color: #42b983;
  box-shadow: 0 0 0 2px #42b983; /* Highlight selected */
  background-color: #e6ffed; /* Light green background for selected */
}

.direccion-info h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.direccion-info p {
  margin: 0.2rem 0;
  color: #555;
  font-size: 0.95rem;
}

.direccion-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-edit {
  color: #42b983;
}

.btn-edit:hover {
  background-color: #e6ffed;
}

.btn-delete {
  color: #e74c3c;
}

.btn-delete:hover:not(:disabled) {
  background-color: #ffe6e6;
}

.btn-delete:disabled {
  color: #cccccc;
  cursor: not-allowed;
}

.btn-add {
  background-color: #5cb85c;
  color: white;
  padding: 0.75rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.btn-add:hover {
  background-color: #4cae4c;
}

.form-direccion {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-direccion h3 {
  margin-top: 0;
  margin-bottom: 1.2rem;
  color: #2c3e50;
  font-size: 1.3rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel, .btn-save {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-cancel {
  background-color: #f0ad4e;
  color: white;
  border: none;
}

.btn-cancel:hover {
  background-color: #ec971f;
}

.btn-save {
  background-color: #42b983;
  color: white;
  border: none;
}

.btn-save:hover:not(:disabled) {
  background-color: #3aa876;
}

.btn-save:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.no-direcciones {
  text-align: center;
  padding: 1.5rem;
  background-color: #fff3cd; /* Light yellow background */
  border: 1px solid #ffc107; /* Yellow border */
  border-radius: 8px;
  margin-top: 1rem;
}

.no-direcciones p {
  color: #856404; /* Dark yellow text */
  margin-bottom: 1rem;
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

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>