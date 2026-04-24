<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import AppNavbar from "./components/Navbar.vue";
import AppFooter from "./components/Footer.vue";
import BottomNav from "./components/BottomNav.vue";

const authStore = useAuthStore();

onMounted(() => {
  authStore.initialize();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans selection:bg-primary-100 selection:text-primary-900 overflow-x-hidden">
    <!-- Navbar con efecto de cristal (Glassmorphism) -->
    <AppNavbar />

    <!-- Área de contenido principal con transiciones suaves -->
    <main class="container mx-auto px-4 pt-20 md:pt-28 pb-24 md:pb-12 min-h-screen">
      <router-view v-slot="{ Component }">
        <transition 
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <BottomNav />
    <div class="hidden md:block">
      <AppFooter />
    </div>
  </div>
</template>

<style>
@reference "@/assets/main.css";

/* Estilos globales para tipografía y transiciones */
body {
  @apply antialiased overflow-x-hidden;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>