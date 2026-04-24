<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const navItems = computed(() => [
  { name: 'Inicio', icon: 'home', path: '/' },
  { name: 'Catálogo', icon: 'search', path: '/products' },
  { name: 'Carrito', icon: 'shopping-cart', path: '/cart', badge: cartStore.itemCount },
  { 
    name: authStore.isAdmin ? 'Admin' : 'Perfil', 
    icon: authStore.isAdmin ? 'th-large' : 'user', 
    path: authStore.isAdmin ? '/admin' : (authStore.isAuthenticated ? '/profile' : '/login') 
  }
]);

const isActive = (path: string) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};
</script>

<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 pt-3 pb-6 flex items-center justify-between safe-bottom shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
    <button 
      v-for="item in navItems" 
      :key="item.path"
      @click="router.push(item.path)"
      :class="[
        'flex flex-col items-center gap-1 transition-all duration-300 relative',
        isActive(item.path) ? 'text-primary-600 scale-110' : 'text-slate-400 font-medium'
      ]"
    >
      <div 
        :class="[
          'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300',
          isActive(item.path) ? 'bg-primary-50' : 'bg-transparent'
        ]"
      >
        <font-awesome-icon :icon="item.icon" class="text-lg" />
      </div>
      <span class="text-[10px] font-bold uppercase tracking-widest">{{ item.name }}</span>
      
      <!-- Badge for Cart -->
      <span 
        v-if="item.badge && item.badge > 0" 
        class="absolute top-0 right-0 bg-primary-600 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white"
      >
        {{ item.badge }}
      </span>
    </button>
  </nav>
</template>

<style scoped>
@reference "@/assets/main.css";
</style>
