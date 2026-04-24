<template>
  <div class="product-management-view p-6 lg:p-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
          <span class="bg-primary-100 text-primary-600 p-2 rounded-xl">
            <i class="fas fa-boxes"></i>
          </span>
          Gestión de Inventario
        </h1>
        <p class="text-slate-500 mt-2">Administra tus productos, precios y disponibilidad en tiempo real.</p>
      </div>
      
      <button 
        @click="goToAddProduct" 
        class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2 group"
      >
        <i class="fas fa-plus group-hover:rotate-90 transition-transform"></i>
        Agregar Nuevo Producto
      </button>
    </div>

    <!-- Dashboard Quick Stats (Premium Addition) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in quickStats" :key="stat.label" class="premium-card p-6 flex items-center gap-4">
        <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center text-xl', stat.bgClass, stat.textClass]">
          <i :class="stat.icon"></i>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-slate-800">{{ stat.value }}</p>
        </div>
      </div>
    </div>
    
    <!-- Main Content Area -->
    <div class="bg-white/40 backdrop-blur-sm rounded-3xl border border-white/20 p-1">
      <ProductList />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuthStore } from '@/stores/useAuthStore';
import ProductList from '@/components/admin/ProductList.vue';

const authStore = useAuthStore();

const router = useRouter();
const db = getFirestore();

const totalProducts = ref(0);
const outOfStockCount = ref(0);
const availableCount = ref(0);

const quickStats = computed(() => [
  { 
    label: 'Total Productos', 
    value: totalProducts.value, 
    icon: 'fas fa-box', 
    bgClass: 'bg-blue-50', 
    textClass: 'text-blue-600' 
  },
  { 
    label: 'Disponibles', 
    value: availableCount.value, 
    icon: 'fas fa-check-circle', 
    bgClass: 'bg-emerald-50', 
    textClass: 'text-emerald-600' 
  },
  { 
    label: 'Agotados', 
    value: outOfStockCount.value, 
    icon: 'fas fa-exclamation-triangle', 
    bgClass: 'bg-rose-50', 
    textClass: 'text-rose-600' 
  },
  { 
    label: 'Categorías', 
    value: '8', // Mocked for now
    icon: 'fas fa-tags', 
    bgClass: 'bg-amber-50', 
    textClass: 'text-amber-600' 
  }
]);

const updateStats = async () => {
  try {
    const productsRef = collection(db, "products");
    let q;
    
    if (authStore.isAdmin) {
      q = query(productsRef);
    } else {
      q = query(productsRef, where("vendorId", "==", authStore.user?.uid));
    }

    const querySnapshot = await getDocs(q);
    totalProducts.value = querySnapshot.size;
    
    const docs = querySnapshot.docs.map(d => d.data());
    availableCount.value = docs.filter(d => d.stock > 0).length;
    outOfStockCount.value = docs.filter(d => d.stock <= 0).length;
  } catch (error) {
    console.error("Error updating stats:", error);
  }
};

onMounted(() => {
  updateStats();
});

const goToAddProduct = () => {
  router.push({ name: 'AddProduct' });
};
</script>

<style scoped>
.premium-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  transition: all 0.3s ease;
}

.premium-card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  transform: translateY(-2px);
}
</style>