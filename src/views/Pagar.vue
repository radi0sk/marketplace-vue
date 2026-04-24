<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const cartStore = useCartStore();

// State
const isLoading = ref(false);
const step = ref(1); // 1: Info, 2: Pago, 3: Resumen

const cliente = ref({
  name: '',
  telefono: '',
  email: ''
});

const direccionEnvio = ref<any>(null);
const nuevaDireccion = ref({
  nombre: '',
  direccion: '',
  ciudad: '',
  departamento: '',
  codigoPostal: '',
  tiempoEntrega: 3
});

const metodoPago = ref('deposito');
const comprobante = ref<File | null>(null);

// Pricing Calculations
const subtotal = computed(() => cartStore.total);

const gastosEnvio = computed(() => {
  if (cartStore.items.length === 0) return 0;
  
  const especialidades = [
    { key: 'ganaderia', costo: 0 },
    { key: 'concentrado', costo: 40 },
    { key: 'tilapia', costo: 40 },
    { key: 'carniceria', costo: 35 }
  ];
  
  for (const item of cartStore.items) {
    const cat = item.categoria?.toLowerCase() || '';
    const esp = especialidades.find(e => cat.includes(e.key));
    if (esp) return esp.costo;
  }
  return 50;
});

const recargo = computed(() => 
  metodoPago.value === 'contra-entrega' ? (subtotal.value + gastosEnvio.value) * 0.03 : 0
);

const totalFinal = computed(() => subtotal.value + gastosEnvio.value + recargo.value);

// Initialization
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    toast.warning("Inicia sesión para finalizar tu compra");
    router.push('/login');
    return;
  }

  if (authStore.user) {
    cliente.value.email = authStore.user.email || '';
    cliente.value.name = authStore.user.displayName || '';
    
    const userSnap = await getDoc(doc(db, 'users', authStore.user.uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      cliente.value.telefono = data.telefono || '';
      if (data.direccionEnvio) {
        direccionEnvio.value = data.direccionEnvio;
      }
    }
  }
});

// Actions
const setDireccion = async () => {
  if (!nuevaDireccion.value.direccion || !nuevaDireccion.value.ciudad) {
    toast.error("Completa los datos de envío");
    return;
  }
  
  isLoading.value = true;
  try {
    const userRef = doc(db, 'users', authStore.user!.uid);
    await setDoc(userRef, { direccionEnvio: nuevaDireccion.value }, { merge: true });
    direccionEnvio.value = { ...nuevaDireccion.value };
    toast.success("Dirección guardada");
  } catch (error) {
    toast.error("Error al guardar dirección");
  } finally {
    isLoading.value = false;
  }
};

const handleFileUpload = (e: any) => {
  comprobante.value = e.target.files[0];
};

const finalizarCompra = async () => {
  if (!direccionEnvio.value || !cliente.value.telefono) {
    toast.error("Completa tus datos de envío y contacto");
    return;
  }

  if (metodoPago.value === 'deposito' && !comprobante.value) {
    toast.error("Sube tu comprobante de depósito");
    return;
  }

  isLoading.value = true;
  try {
    // Basic order creation
    const orderId = Date.now().toString();
    const orden = {
      id: orderId,
      fecha: new Date().toISOString(),
      cliente: cliente.value,
      direccion: direccionEnvio.value,
      metodoPago: metodoPago.value,
      items: cartStore.items,
      vendorIds: [...new Set(cartStore.items.map(item => item.vendorId).filter(id => !!id))],
      subtotal: subtotal.value,
      envio: gastosEnvio.value,
      recargo: recargo.value,
      total: totalFinal.value,
      estado: 'pendiente'
    };

    await setDoc(doc(db, 'ordenes', orderId), orden);
    cartStore.clearCart();
    toast.success("¡Compra enviada con éxito!");
    router.push({ name: 'Confirmacion', query: { orderId } });
  } catch (error) {
    toast.error("Error al procesar compra");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-10 animate-fade-in relative">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      
      <!-- Checkout Flow -->
      <div class="lg:col-span-2 space-y-12">
        <div>
          <h1 class="text-4xl font-bold text-slate-800 font-outfit">Finalizar Compra</h1>
          <div class="flex items-center gap-4 mt-6">
            <div :class="['w-10 h-1 h-1 bg-primary-600 rounded-full', step >= 1 ? 'opacity-100' : 'opacity-20']"></div>
            <div :class="['w-10 h-1 bg-primary-600 rounded-full', step >= 2 ? 'opacity-100' : 'opacity-20']"></div>
            <div :class="['w-10 h-1 bg-primary-600 rounded-full', step >= 3 ? 'opacity-100' : 'opacity-20']"></div>
          </div>
        </div>

        <!-- Section 1: Identification & Shipping -->
        <section class="space-y-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div class="flex items-center gap-4">
             <div class="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center font-bold">1</div>
             <h2 class="text-xl font-bold text-slate-800">Datos de Entrega</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre Completo</label>
              <input v-model="cliente.name" type="text" class="input-modern" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Teléfono de Contacto</label>
              <input v-model="cliente.telefono" type="tel" class="input-modern" placeholder="Ej: 5555-5555" />
            </div>
          </div>

          <div v-if="direccionEnvio" class="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group">
             <div class="space-y-1">
                <p class="text-sm font-bold text-slate-800">{{ direccionEnvio.nombre }}</p>
                <p class="text-xs text-slate-500">{{ direccionEnvio.direccion }}, {{ direccionEnvio.ciudad }}</p>
                <p class="text-xs text-slate-400 uppercase font-medium">{{ direccionEnvio.departamento }}</p>
             </div>
             <button @click="direccionEnvio = null" class="text-xs font-bold text-primary-600 hover:underline">Cambiar</button>
          </div>

          <div v-else class="space-y-6">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Nombre del Receptor</label>
                  <input v-model="nuevaDireccion.nombre" type="text" class="input-modern" />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Dirección Exacta</label>
                  <input v-model="nuevaDireccion.direccion" type="text" class="input-modern" />
                </div>
             </div>
             <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Ciudad</label>
                  <input v-model="nuevaDireccion.ciudad" type="text" class="input-modern" />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Departamento</label>
                  <input v-model="nuevaDireccion.departamento" type="text" class="input-modern" />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">CP</label>
                  <input v-model="nuevaDireccion.codigoPostal" type="text" class="input-modern" />
                </div>
             </div>
             <button @click="setDireccion" class="btn-primary !py-3 !px-8 text-sm">Guardar Datos de Envío</button>
          </div>
        </section>

        <!-- Section 2: Payment -->
        <section class="space-y-8 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div class="flex items-center gap-4">
             <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">2</div>
             <h2 class="text-xl font-bold text-slate-800">Método de Pago</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <label :class="['p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4', metodoPago === 'deposito' ? 'border-primary-500 bg-primary-50/30' : 'border-slate-100 bg-slate-50 hover:border-slate-200']">
                <input type="radio" v-model="metodoPago" value="deposito" class="hidden" />
                <div class="flex items-center justify-between">
                   <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600">
                      <font-awesome-icon icon="university" />
                   </div>
                   <div v-if="metodoPago === 'deposito'" class="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                      <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                   </div>
                </div>
                <div>
                   <p class="font-bold text-slate-800">Depósito/Transferencia</p>
                   <p class="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Confirmación Manual</p>
                </div>
             </label>

             <label :class="['p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4', metodoPago === 'contra-entrega' ? 'border-primary-500 bg-primary-50/30' : 'border-slate-100 bg-slate-50 hover:border-slate-200']">
                <input type="radio" v-model="metodoPago" value="contra-entrega" class="hidden" />
                <div class="flex items-center justify-between">
                   <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                      <font-awesome-icon icon="hand-holding-usd" />
                   </div>
                   <div v-if="metodoPago === 'contra-entrega'" class="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                      <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                   </div>
                </div>
                <div>
                   <p class="font-bold text-slate-800">Pago Contra Entrega</p>
                   <p class="text-[10px] text-primary-600 uppercase font-bold mt-1">+3% Recargo Adicional</p>
                </div>
             </label>
          </div>

          <!-- Deposit Info -->
          <div v-if="metodoPago === 'deposito'" class="animate-fade-in space-y-6">
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 bg-slate-900 rounded-2xl text-white">
                   <p class="text-[10px] font-bold text-primary-400 uppercase mb-2">Banco Industrial</p>
                   <p class="text-sm font-bold">CTA: 123-456789-0</p>
                   <p class="text-[10px] text-slate-400">Mi Empresa S.A. | Monetaria</p>
                </div>
                <div class="p-4 bg-slate-900 rounded-2xl text-white">
                   <p class="text-[10px] font-bold text-primary-400 uppercase mb-2">Banco G&T</p>
                   <p class="text-sm font-bold">CTA: 987-654321-0</p>
                   <p class="text-[10px] text-slate-400">Mi Empresa S.A. | Monetaria</p>
                </div>
             </div>
             
             <div class="space-y-4">
                <p class="text-xs font-bold text-slate-800">Sube tu comprobante:</p>
                <input type="file" @change="handleFileUpload" class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
             </div>
          </div>
        </section>
      </div>

      <!-- Summary Sidebar -->
      <aside class="space-y-8">
        <div class="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl sticky top-24">
          <h3 class="text-lg font-bold font-outfit mb-8 pb-4 border-b border-white/10 uppercase tracking-widest text-xs opacity-50">Resumen del Pedido</h3>
          
          <!-- Virtual List of Items -->
          <div class="space-y-4 max-h-60 overflow-y-auto mb-8 pr-2 custom-scrollbar">
             <div v-for="item in cartStore.items" :key="item.id" class="flex gap-4 items-center">
                <div class="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                   <img :src="item.images?.[0] || '/placeholder.png'" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 overflow-hidden">
                   <p class="text-xs font-bold truncate">{{ item.name }}</p>
                   <p class="text-[10px] text-slate-400">{{ item.quantity }} x ${{ item.price }}</p>
                </div>
                <p class="text-xs font-bold">${{ (item.price * item.quantity).toFixed(2) }}</p>
             </div>
          </div>

          <!-- Price Breakdown -->
          <div class="space-y-4 mb-10">
             <div class="flex justify-between text-sm">
                <span class="text-slate-400">Subtotal</span>
                <span class="font-bold">${{ subtotal.toFixed(2) }}</span>
             </div>
             <div class="flex justify-between text-sm">
                <span class="text-slate-400">Envío 🚚</span>
                <span class="font-bold text-teal-400">${{ gastosEnvio.toFixed(2) }}</span>
             </div>
             <div v-if="recargo > 0" class="flex justify-between text-sm">
                <span class="text-slate-400">Recargo (3%)</span>
                <span class="font-bold text-rose-400">${{ recargo.toFixed(2) }}</span>
             </div>
             <div class="flex justify-between items-end pt-4 border-t border-white/10">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Final</span>
                <span class="text-4xl font-bold font-outfit text-primary-400">${{ totalFinal.toFixed(2) }}</span>
             </div>
          </div>

          <button 
            @click="finalizarCompra"
            :disabled="isLoading"
            class="w-full btn-primary font-bold py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            <font-awesome-icon :icon="isLoading ? 'spinner' : 'check-circle'" :spin="isLoading" />
            {{ isLoading ? 'Procesando...' : 'Realizar Pedido' }}
          </button>
          
          <p class="text-[10px] text-slate-500 text-center mt-6 uppercase tracking-widest font-bold">
            Compra protegida por Agro Guate
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";
.input-modern {
  @apply w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 transition-all;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-800 rounded-full;
}
</style>