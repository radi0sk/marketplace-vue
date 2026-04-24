<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { db, auth } from "@/services/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { useToast } from "vue-toastification";
import type { Product } from '@/types';

const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();
const cartStore = useCartStore();

const product = ref<Product | null>(null);
const loading = ref(true);
const quantity = ref(1);
const mainImage = ref("");
const isFavorite = ref(false);
const loadingFavorite = ref(false);

const productId = route.params.id as string;

// Initialization
onMounted(async () => {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      product.value = { id: docSnap.id, ...docSnap.data() } as Product;
      if (product.value.images?.length) {
        mainImage.value = product.value.images[0];
      }
      await checkIfFavorite();
    } else {
      toast.error("Producto no encontrado");
    }
  } catch (error) {
    toast.error("Error al cargar producto");
  } finally {
    loading.value = false;
  }
});

const checkIfFavorite = async () => {
  if (!authStore.isAuthenticated || !authStore.user) return;
  try {
    const userDoc = await getDoc(doc(db, "users", authStore.user.uid));
    if (userDoc.exists()) {
      const favorites = userDoc.data().favorites || [];
      isFavorite.value = favorites.includes(productId);
    }
  } catch (error) {
    console.error("Error checking favorites:", error);
  }
};

const toggleFavorite = async () => {
  if (!authStore.isAuthenticated) {
    toast.error("Inicia sesión para guardar favoritos");
    return;
  }
  
  loadingFavorite.value = true;
  try {
    const userRef = doc(db, "users", authStore.user!.uid);
    if (isFavorite.value) {
      await updateDoc(userRef, { favorites: arrayRemove(productId) });
      toast.success("Eliminado de favoritos");
    } else {
      await updateDoc(userRef, { favorites: arrayUnion(productId) });
      toast.success("Agregado a favoritos");
    }
    isFavorite.value = !isFavorite.value;
  } catch (error) {
    toast.error("Error al actualizar favoritos");
  } finally {
    loadingFavorite.value = false;
  }
};

const handleAddToCart = () => {
  if (product.value) {
    for (let i = 0; i < quantity.value; i++) {
      cartStore.addItem(product.value);
    }
    toast.success(`${product.value.name} (${quantity.value}) agregado al carrito`);
  }
};
</script>

<template>
  <div v-if="loading" class="flex flex-col items-center justify-center py-40 space-y-4">
    <font-awesome-icon icon="spinner" spin class="text-4xl text-primary-500" />
    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando detalles...</p>
  </div>

  <div v-else-if="product" class="max-w-7xl mx-auto px-4 py-10 animate-fade-in">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
      
      <!-- Left: Gallery -->
      <div class="space-y-6">
        <div class="bg-white rounded-[40px] overflow-hidden shadow-xl border border-slate-100 aspect-square group">
          <img :src="mainImage || '/placeholder.png'" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        </div>
        
        <div v-if="product.images?.length" class="flex gap-4 overflow-x-auto pb-4">
          <button 
            v-for="(img, i) in product.images" 
            :key="i"
            @click="mainImage = img"
            :class="[
              'w-24 h-24 rounded-3xl overflow-hidden border-2 transition-all flex-shrink-0',
              mainImage === img ? 'border-primary-500 shadow-lg' : 'border-slate-100 opacity-60 hover:opacity-100'
            ]"
          >
            <img :src="img" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Right: Content -->
      <div class="space-y-10">
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class="px-3 py-1 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-primary-500/20">
              {{ product.lineaProduccion?.replace('-', ' ') || 'General' }}
            </span>
            <span v-for="esp in product.especieCultivo" :key="esp" class="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
              {{ esp }}
            </span>
            <span v-if="product.etapaVida" class="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
              {{ product.etapaVida }}
            </span>
            <span v-if="product.stock && product.stock > 0" class="text-[10px] font-bold text-teal-600 uppercase tracking-widest ml-auto">
               En Stock ({{ product.stock }})
            </span>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold text-slate-800 font-outfit">{{ product.name }}</h1>
          <div class="flex items-center gap-2 text-amber-400">
             <font-awesome-icon icon="star" v-for="i in 5" :key="i" :class="i <= 4 ? 'text-amber-400' : 'text-slate-200'" />
             <span class="text-xs text-slate-400 ml-2">(12 reseñas)</span>
          </div>
        </div>

        <div class="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-8">
          <div class="flex items-end gap-3">
             <span class="text-4xl font-bold text-slate-900 font-outfit">${{ product.price }}</span>
             <span class="text-xs text-slate-400 pb-1">IVA Incluido</span>
          </div>

          <div class="space-y-4">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Cantidad</p>
            <div class="flex items-center gap-4">
              <div class="flex items-center bg-white border border-slate-200 rounded-2xl p-1">
                <button 
                  @click="quantity > 1 ? quantity-- : null"
                  class="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >-</button>
                <input v-model.number="quantity" type="number" class="w-12 text-center border-none focus:ring-0 text-sm font-bold" />
                <button 
                  @click="quantity++"
                  class="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >+</button>
              </div>
              
              <button 
                @click="handleAddToCart"
                class="flex-1 btn-primary !py-4 flex items-center justify-center gap-3 shadow-primary-500/30"
              >
                <font-awesome-icon icon="cart-plus" />
                Agregar al Carrito
              </button>
            </div>
          </div>

          <div class="flex gap-4">
            <button 
              @click="toggleFavorite"
              :class="[
                'flex-1 py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all border',
                isFavorite ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              ]"
            >
              <font-awesome-icon :icon="isFavorite ? ['fas', 'heart'] : ['far', 'heart']" />
              {{ isFavorite ? 'En Favoritos' : 'Guardar' }}
            </button>
            <a 
              href="https://wa.me/something" 
              target="_blank"
              class="flex-1 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <span>Hablar con un asesor</span>
            </a>
          </div>
        </div>

        <!-- Details Tabs/Accordion Style -->
        <div class="space-y-8">
          <div class="border-b border-slate-100 pb-2">
             <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-2 border-primary-500 inline-block pb-2">Detalles del Producto</h3>
          </div>
          <div v-html="product.description" class="text-slate-600 leading-relaxed prose prose-slate max-w-none"></div>
          
          <!-- Agricultural Technical Sheet -->
          <div v-if="product.ingredienteActivo || product.dosis || product.periodoCarencia" class="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100/50">
             <div class="flex items-center gap-3 mb-6">
                <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                   <font-awesome-icon icon="flask" size="sm" />
                </div>
                <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest">Ficha de Insumo</h3>
             </div>
             
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div v-if="product.ingredienteActivo" class="space-y-1">
                   <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Ingrediente Activo</p>
                   <p class="text-sm font-bold text-slate-800">{{ product.ingredienteActivo }}</p>
                </div>
                <div v-if="product.dosis" class="space-y-1">
                   <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Dosis / Presentación</p>
                   <p class="text-sm font-bold text-slate-800">{{ product.dosis }}</p>
                </div>
                <div v-if="product.periodoCarencia" class="space-y-1">
                   <p class="text-[10px] font-black text-rose-400 uppercase tracking-widest">Periodo de Carencia</p>
                   <p class="text-sm font-bold text-rose-600">{{ product.periodoCarencia }}</p>
                </div>
                <div v-if="product.marcaFabricante" class="space-y-1">
                   <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Fabricante</p>
                   <p class="text-sm font-bold text-slate-800">{{ product.marcaFabricante }}</p>
                </div>
             </div>
          </div>
          
          <div v-if="product.features?.length" class="bg-white p-6 rounded-3xl border border-slate-100">
             <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Especificaciones Técnicas</h4>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="(spec, i) in product.features" :key="i" class="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                   <span class="text-xs font-bold text-slate-500 uppercase tracking-tight">{{ spec.name }}</span>
                   <span class="text-xs font-medium text-slate-800">{{ spec.value }}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>