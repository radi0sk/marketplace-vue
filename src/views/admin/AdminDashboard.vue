<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Sidebar for Desktop -->
    <aside 
      class="fixed inset-y-0 left-0 z-[100] w-72 bg-white border-r border-slate-200 transform lg:translate-x-0 transition-transform duration-300 ease-in-out"
      :class="{ '-translate-x-full': !isSidebarOpen }"
    >
      <div class="h-full flex flex-col">
        <!-- Logo Section -->
        <div class="p-8 flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-primary-200">
            <i class="fas fa-rocket"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-800 leading-tight">Admin</h2>
            <p class="text-xs font-semibold text-primary-600 uppercase tracking-widest">Marketplace</p>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-4 space-y-2 mt-4">
          <router-link 
            v-for="link in adminLinks" 
            :key="link.path" 
            :to="link.path"
            class="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 hover:text-primary-600 transition-all group"
            active-class="active-nav-link"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 group-hover:bg-primary-50 transition-colors nav-icon-bg">
              <i :class="[link.icon, 'transition-colors']"></i>
            </div>
            {{ link.text }}
          </router-link>
        </nav>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-slate-100">
          <div class="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Avatar">
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-800 truncate">Administrador</p>
              <p class="text-xs text-slate-500 truncate">admin@celularesatitlan.com</p>
            </div>
            <button class="text-slate-400 hover:text-rose-500 transition-colors">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 lg:ml-72 min-w-0 transition-all duration-300 pb-20 lg:pb-0">
      <!-- Top Header -->
      <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="lg:hidden w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white text-sm shadow-md">
            <i class="fas fa-rocket"></i>
          </div>
          <span class="text-sm font-black text-slate-800 uppercase tracking-widest">{{ $route.meta.title || 'Panel' }}</span>
        </div>

        <div class="flex items-center gap-4 ml-auto">
          <div class="hidden sm:flex items-center bg-slate-100 px-4 py-2 rounded-xl text-slate-500 text-sm gap-2">
            <i class="far fa-calendar"></i>
            <span>{{ currentDate }}</span>
          </div>
          
          <button class="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
            <i class="far fa-bell text-xl"></i>
            <span class="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <!-- View Content -->
      <div class="max-w-[1600px] mx-auto">
        <router-view v-slot="{ Component }">
          <transition 
            name="fade-slide" 
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Overlay for mobile sidebar (Optional if using Bottom Nav) -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false"
      class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
    ></div>

    <!-- Mobile Bottom Navigation (Native App Style) -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center px-2 py-3 pb-8">
      <router-link 
        v-for="link in adminLinks" 
        :key="link.path" 
        :to="link.path"
        class="flex flex-col items-center gap-1 px-3 py-1 group"
        active-class="mobile-active-link"
      >
        <div class="w-10 h-6 flex items-center justify-center rounded-full group-active:scale-90 transition-transform">
           <font-awesome-icon :icon="link.icon" class="text-xl text-slate-400 group-[.mobile-active-link]:text-primary-600" />
        </div>
        <span class="text-[10px] font-black uppercase tracking-tighter text-slate-400 group-[.mobile-active-link]:text-primary-600">{{ link.text }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const isSidebarOpen = ref(false);

const adminLinks = [
  { path: '/admin/products', text: 'Stock', icon: 'boxes' },
  { path: '/admin/orders', text: 'Pedidos', icon: 'shopping-bag' },
  { path: '/admin/users', text: 'Usuarios', icon: 'users-cog' },
  { path: '/admin/sales-statistics', text: 'Stats', icon: 'chart-pie' },
  { path: '/admin/settings', text: 'Ajustes', icon: 'cog' }
];

const currentDate = computed(() => {
  return new Intl.DateTimeFormat('es-GT', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
});
</script>

<style scoped>
.active-nav-link {
  background-color: #f8fafc !important;
  color: #2563eb !important;
}

.active-nav-link .nav-icon-bg {
  background-color: #eff6ff !important;
}

.active-nav-link i {
  color: #2563eb !important;
}

.mobile-active-link div {
  background-color: #eff6ff;
}

.mobile-active-link span {
  color: #2563eb;
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 1023px) {
  .sidebar-hidden {
    transform: translateX(-100%);
  }
}
</style>