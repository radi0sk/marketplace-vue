<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/useCartStore';
import { useToast } from "vue-toastification";

const router = useRouter();
const cartStore = useCartStore();
const toast = useToast();

const increaseQuantity = (id: string) => {
  const item = cartStore.items.find(i => i.id === id);
  if (item) {
    cartStore.updateQuantity(id, item.quantity + 1);
  }
};

const decreaseQuantity = (id: string) => {
  const item = cartStore.items.find(i => i.id === id);
  if (item && item.quantity > 1) {
    cartStore.updateQuantity(id, item.quantity - 1);
  } else {
    toast.warning("Mínimo 1 unidad");
  }
};

const handleRemove = (id: string) => {
  cartStore.removeItem(id);
  toast.success("Producto eliminado del carrito");
};

const handleCheckout = () => {
  if (cartStore.items.length > 0) {
    router.push('/pagar');
  } else {
    toast.error("El carrito está vacío");
  }
};
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-10 animate-fade-in space-y-10">
    <div class="flex items-end justify-between border-b border-slate-100 pb-6">
      <div>
        <h1 class="text-4xl font-bold text-slate-800 font-outfit">Carrito de Compras</h1>
        <p class="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1">
          {{ cartStore.itemCount }} artículos seleccionados
        </p>
      </div>
      <router-link to="/products" class="text-primary-600 font-bold hover:underline text-sm">
        ← Seguir comprando
      </router-link>
    </div>

    <div v-if="cartStore.items.length === 0" class="flex flex-col items-center justify-center py-32 space-y-6 text-center">
      <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
        <font-awesome-icon icon="shopping-cart" class="text-4xl" />
      </div>
      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-slate-800">Tu carrito está vacío</h2>
        <p class="text-slate-500 max-w-xs">Parece que aún no has agregado nada a tu carrito. ¡Explora nuestros productos!</p>
      </div>
      <router-link to="/products" class="btn-primary !px-10">
        Ver Productos
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <!-- Items List -->
      <div class="lg:col-span-2 space-y-6">
        <transition-group 
          name="list" 
          tag="div" 
          class="space-y-4"
        >
          <div 
            v-for="item in cartStore.items" 
            :key="item.id" 
            class="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
          >
            <div class="w-24 h-24 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
               <img :src="item.images?.[0] || '/placeholder.png'" class="w-full h-full object-cover" />
            </div>
            
            <div class="flex-1 space-y-1">
               <p class="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{{ item.categoria }}</p>
               <h3 class="text-lg font-bold text-slate-800">{{ item.name }}</h3>
               <p class="text-sm font-bold text-slate-400 font-outfit">${{ item.price }} c/u</p>
            </div>

            <div class="flex items-center gap-3 bg-slate-50 p-1 rounded-xl">
               <button @click="decreaseQuantity(item.id)" class="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-600 hover:text-primary-600 shadow-sm transition-all">-</button>
               <span class="w-8 text-center text-sm font-bold text-slate-700">{{ item.quantity }}</span>
               <button @click="increaseQuantity(item.id)" class="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-slate-600 hover:text-primary-600 shadow-sm transition-all">+</button>
            </div>

            <div class="text-right px-4">
               <p class="text-sm text-slate-400 font-medium">Subtotal</p>
               <p class="text-lg font-bold text-slate-900 font-outfit">${{ (item.price * item.quantity).toFixed(2) }}</p>
            </div>

            <button @click="handleRemove(item.id)" class="p-3 text-slate-300 hover:text-rose-500 transition-colors">
               <font-awesome-icon icon="trash" />
            </button>
          </div>
        </transition-group>
      </div>

      <!-- Summary -->
      <aside class="space-y-6">
        <div class="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
          <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-600/20 blur-3xl rounded-full"></div>
          
          <h3 class="text-lg font-bold font-outfit mb-8">Resumen de Compra</h3>
          
          <div class="space-y-4 border-b border-slate-800 pb-6 mb-6">
             <div class="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span class="font-bold text-white">${{ cartStore.total.toFixed(2) }}</span>
             </div>
             <div class="flex justify-between text-sm text-slate-400">
                <span>Envío</span>
                <span class="font-bold text-teal-400">Gratis</span>
             </div>
          </div>

          <div class="flex justify-between items-end mb-8">
             <span class="text-sm font-bold uppercase tracking-widest text-slate-400">Total</span>
             <span class="text-4xl font-bold font-outfit text-primary-400">${{ cartStore.total.toFixed(2) }}</span>
          </div>

          <button 
            @click="handleCheckout"
            class="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 group"
          >
            Pagar Ahora
            <font-awesome-icon icon="arrow-right" class="group-hover:translate-x-1 transition-transform" />
          </button>

          <p class="text-[10px] text-slate-500 text-center mt-6 uppercase tracking-widest leading-relaxed">
            IVA Incluido en todos los productos. Pagos 100% seguros con cifrado SSL.
          </p>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
           <div class="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
              <font-awesome-icon icon="check-circle" />
           </div>
           <div>
              <p class="text-xs font-bold text-slate-800 uppercase tracking-tight">Compra Protegida</p>
              <p class="text-[10px] text-slate-400">Tu dinero está seguro en cada paso.</p>
           </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>