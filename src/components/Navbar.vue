<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';
import { db } from '@/services/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { Product } from '@/types';
import { useToast } from 'vue-toastification';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();
const toast = useToast();

const searchQuery = ref('');
const searchResults = ref<Product[]>([]);
const showResults = ref(false);
const showUserDropdown = ref(false);
const isScrolled = ref(false);

const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Tracking scroll for glassmorphism effect
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Search Logic
const searchProducts = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    showResults.value = false;
    return;
  }

  try {
    const productsRef = collection(db, "products");
    const term = searchQuery.value.toLowerCase().trim();
    
    const q = query(
      productsRef,
      where("name", ">=", term),
      where("name", "<=", term + "\uf8ff"),
      limit(5)
    );
    
    const snapshot = await getDocs(q);
    searchResults.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    showResults.value = searchResults.value.length > 0;
  } catch (error) {
    console.error("Error searching:", error);
  }
};

watch(searchQuery, () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(searchProducts, 300);
});

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/products', query: { search: searchQuery.value.trim() } });
    showResults.value = false;
    searchQuery.value = '';
  }
};

const goToProduct = (id: string) => {
  router.push(`/product/${id}`);
  showResults.value = false;
  searchQuery.value = '';
};

const handleLogout = async () => {
  await authStore.logout();
  toast.success('Sesión cerrada');
  showUserDropdown.value = false;
};

// Close dropdowns on route change
watch(() => route.path, () => {
  showUserDropdown.value = false;
  showResults.value = false;
});
</script>

<template>
  <header 
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'py-3 glass-effect shadow-md' : 'py-5 bg-white border-b border-slate-100'
    ]"
  >
    <div class="container mx-auto px-4 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2 group">
        <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:rotate-12 transition-transform duration-300">
          <font-awesome-icon icon="shopping-cart" class="text-white text-lg" />
        </div>
        <span class="text-xl font-bold tracking-tight text-slate-800 font-outfit uppercase">Agro <span class="text-primary-600">Guate</span></span>
      </router-link>

      <!-- Search Bar -->
      <div class="hidden md:flex flex-1 max-w-lg mx-8 relative">
        <div class="relative w-full group">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar productos..." 
            @keyup.enter="performSearch"
            class="w-full bg-slate-100/50 border-none rounded-full py-2.5 pl-5 pr-12 text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
          />
          <button 
            @click="performSearch"
            class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary-600 transition-colors"
          >
            <font-awesome-icon icon="search" />
          </button>
        </div>

        <!-- Search Results Dropdown -->
        <transition 
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="showResults" class="absolute top-full left-0 right-0 mt-3 p-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div 
              v-for="product in searchResults" 
              :key="product.id"
              @click="goToProduct(product.id)"
              class="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
            >
              <img :src="product.images?.[0] || '/placeholder.png'" class="w-12 h-12 rounded-lg object-cover" />
              <div class="flex-1 overflow-hidden">
                <h4 class="text-sm font-medium text-slate-800 truncate">{{ product.name }}</h4>
                <p class="text-xs font-bold text-primary-600">${{ product.price }}</p>
              </div>
            </div>
            <div @click="performSearch" class="mt-2 p-2 text-center text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg cursor-pointer transition-colors">
              Ver todos los resultados
            </div>
          </div>
        </transition>
      </div>

      <!-- Navigation Actions -->
      <div class="flex items-center gap-4">
        <router-link to="/products" class="hidden lg:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">
          Explorar
        </router-link>

        <!-- Cart -->
        <router-link to="/cart" class="relative p-2 group">
          <font-awesome-icon icon="shopping-cart" class="text-xl text-slate-600 group-hover:text-primary-600 transition-colors" />
          <span v-if="cartStore.itemCount > 0" class="absolute -top-1 -right-1 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
            {{ cartStore.itemCount }}
          </span>
        </router-link>

        <!-- User Section -->
        <div class="relative">
          <button 
            v-if="authStore.isAuthenticated"
            @click="showUserDropdown = !showUserDropdown"
            class="flex items-center gap-2 p-1 pl-1 pr-3 rounded-full hover:bg-slate-100 transition-all"
          >
            <div class="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
               <img :src="authStore.user?.photoURL || '/default-user.png'" class="w-full h-full object-cover" />
            </div>
            <font-awesome-icon icon="caret-down" class="text-[10px] text-slate-400" />
          </button>
          
          <router-link 
            v-else 
            to="/login"
            class="btn-primary flex items-center gap-2 !px-5 !py-2 text-sm"
          >
            <span>Entrar</span>
          </router-link>

          <!-- User Dropdown -->
          <transition 
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
          >
            <div v-if="showUserDropdown" class="absolute top-full right-0 mt-3 w-56 p-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
              <div class="p-3 border-b border-slate-50 mb-1">
                <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">Mi Cuenta</p>
                <p class="text-sm font-bold text-slate-800 truncate">{{ authStore.user?.displayName }}</p>
              </div>
              
              <router-link to="/profile" class="dropdown-item">
                <font-awesome-icon icon="user" class="w-4 h-4" /> Perfil
              </router-link>
              <router-link to="/purchase-history" class="dropdown-item">
                <font-awesome-icon icon="calendar-alt" class="w-4 h-4" /> Mis Pedidos
              </router-link>
              
              <template v-if="authStore.isAdmin">
                <div class="my-2 border-t border-slate-50"></div>
                <router-link to="/admin" class="dropdown-item !text-primary-600 !bg-primary-50">
                  <font-awesome-icon icon="th-large" class="w-4 h-4" /> Panel Admin
                </router-link>
              </template>

              <div class="my-2 border-t border-slate-50"></div>
              <button @click="handleLogout" class="dropdown-item !text-rose-600 hover:!bg-rose-50 w-full text-left">
                <font-awesome-icon icon="sign-out-alt" class="w-4 h-4" /> Cerrar Sesión
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
@reference "@/assets/main.css";
.dropdown-item {
  @apply flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all duration-200;
}
</style>