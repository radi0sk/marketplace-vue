<script setup lang="ts">
import { computed } from 'vue';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { db } from '@/services/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { Product } from '@/types';
import { useToast } from 'vue-toastification';

const props = defineProps<{
  product: Product;
  isFavorite: boolean;
}>();

const emit = defineEmits(['toggle-favorite']);

const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast();

const addToCart = () => {
  cartStore.addItem(props.product);
  toast.success(`"${props.product.name}" agregado al carrito`);
};

const toggleFavorite = async () => {
  if (!authStore.isAuthenticated) {
    toast.error("Inicia sesión para guardar favoritos");
    return;
  }

  try {
    const userRef = doc(db, "users", authStore.user!.uid);
    if (props.isFavorite) {
      await updateDoc(userRef, { favorites: arrayRemove(props.product.id) });
      toast.success("Eliminado de favoritos");
    } else {
      await updateDoc(userRef, { favorites: arrayUnion(props.product.id) });
      toast.success("Agregado a favoritos");
    }
    emit('toggle-favorite', props.product.id);
  } catch (error) {
    console.error("Error toggling favorite:", error);
  }
};
</script>

<template>
  <div class="premium-card group h-full flex flex-col">
    <!-- Image -->
    <div class="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
      <img 
        :src="product.images?.[0] || '/placeholder.png'" 
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <!-- Badges -->
      <div v-if="product.stock && product.stock < 5" class="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
        Últimas unidades
      </div>
      
      <!-- Hover Actions -->
      <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
        <button 
          @click.prevent="addToCart"
          class="w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all transform active:scale-90"
        >
          <font-awesome-icon icon="cart-plus" />
        </button>
        <button 
          @click.prevent="toggleFavorite"
          :class="[
            'w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center transition-all transform active:scale-90',
            isFavorite ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
          ]"
        >
          <font-awesome-icon :icon="isFavorite ? ['fas', 'heart'] : ['far', 'heart']" />
        </button>
      </div>
    </div>

    <!-- Info -->
    <router-link :to="`/product/${product.id}`" class="p-4 flex-1 flex flex-col cursor-pointer">
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{{ product.categoria }}</p>
      <h3 class="text-sm font-bold text-slate-800 line-clamp-1 mb-2">{{ product.name }}</h3>
      
      <div class="mt-auto flex items-end justify-between">
        <div>
          <span class="text-lg font-bold text-slate-900 font-outfit">${{ product.price }}</span>
          <span class="block text-[10px] text-slate-400 italic">Vendido por {{ product.vendorName || 'Agro Guate' }}</span>
        </div>
        <div class="flex items-center gap-1 text-amber-400 text-xs">
          <font-awesome-icon icon="star" v-for="i in 5" :key="i" :class="i <= (product.rating || 4) ? 'text-amber-400' : 'text-slate-200'" />
        </div>
      </div>
    </router-link>
  </div>
</template>
