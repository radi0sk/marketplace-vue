<template>
  <div class="product-list-container space-y-8 animate-fade-in">
    <!-- Header with actions and stats -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Inventario de Productos</h2>
        <p class="text-slate-500 text-sm mt-1">Gestiona y monitorea el stock de tu marketplace</p>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="relative group">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            class="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none min-w-[280px] shadow-sm"
          >
        </div>

        <button @click="loadProducts" class="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-200 rounded-xl transition-all shadow-sm group">
          <i class="fas fa-sync-alt group-hover:rotate-180 transition-transform duration-500 text-sm" :class="{ 'fa-spin': loading }"></i>
        </button>
      </div>
    </div>

    <!-- Filters and Tabs -->
    <div class="flex items-center gap-2 bg-slate-100/50 p-1 rounded-2xl w-fit shadow-inner border border-slate-200/50">
      <button 
        v-for="status in ['all', 'available', 'outOfStock']" 
        :key="status"
        @click="filterStatus = status"
        :class="[
          'px-6 py-2 text-sm font-semibold rounded-xl transition-all duration-300',
          filterStatus === status 
            ? 'bg-white text-primary-600 shadow-md ring-1 ring-slate-200' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        ]"
      >
        {{ status === 'all' ? 'Todos' : (status === 'available' ? 'Disponibles' : 'Agotados') }}
      </button>
    </div>

    <!-- Loading State (Skeletons) -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="bg-white rounded-3xl border border-slate-100 p-4 space-y-4 shadow-sm animate-pulse">
        <div class="aspect-video bg-slate-100 rounded-2xl"></div>
        <div class="space-y-3">
          <div class="h-4 bg-slate-100 rounded w-3/4"></div>
          <div class="h-4 bg-slate-100 rounded w-1/2"></div>
          <div class="pt-4 flex justify-between">
            <div class="h-8 bg-slate-100 rounded w-20"></div>
            <div class="h-8 bg-slate-100 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
      <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300 transform transition-transform hover:scale-110">
        <i class="fas fa-box-open text-4xl"></i>
      </div>
      <h3 class="text-xl font-bold text-slate-800">No se encontraron productos</h3>
      <p class="text-slate-500 mt-2 max-w-xs text-center">No hay productos que coincidan con tus criterios de búsqueda actuales.</p>
      <button @click="resetFilters" class="mt-6 text-primary-600 font-semibold hover:underline">Limpiar todos los filtros</button>
    </div>

    <!-- Product Grid -->
    <TransitionGroup 
      v-else 
      tag="div" 
      name="list"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div 
        v-for="product in filteredProducts" 
        :key="product.id" 
        class="premium-card group bg-white rounded-3xl border border-slate-100 p-4 flex flex-col h-full hover:shadow-2xl hover:shadow-primary-600/5 transition-all duration-300"
      >
        <!-- Product Image Section -->
        <div class="relative aspect-video rounded-2xl overflow-hidden bg-slate-50 mb-4">
          <img 
            :src="product.images?.[0] || 'https://res.cloudinary.com/drpa7s0kq/image/upload/v1746550804/yrlq5mnxwhjn4lpx0ma3.png'" 
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          >
          
          <!-- Quick Status Overlay -->
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
            <button @click="editProduct(product.id)" class="p-3 bg-white text-slate-700 rounded-full hover:bg-primary-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="confirmDelete(product.id)" class="p-3 bg-white text-rose-600 rounded-full hover:bg-rose-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-150">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          
          <!-- Badge -->
          <div class="absolute top-3 left-3">
            <span 
              :class="[
                'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm',
                product.stock > 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              ]"
            >
              {{ product.stock > 0 ? 'Disponible' : 'Agotado' }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 flex flex-col px-1">
          <div class="mb-3">
            <div class="flex justify-between items-start mb-1">
              <h3 class="font-bold text-slate-800 line-clamp-1 flex-1 group-hover:text-primary-600 transition-colors">{{ product.name }}</h3>
              <span class="text-primary-600 font-black ml-2">Q{{ product.price.toLocaleString() }}</span>
            </div>
            <p v-if="product.brand" class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ product.brand }}</p>
          </div>
          
          <p class="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">
            {{ product.description || 'Sin descripción disponible para este producto.' }}
          </p>

          <div class="flex items-center text-[11px] text-slate-400 mb-5 gap-4 mt-auto">
            <span class="flex items-center gap-1.5"><i class="far fa-calendar-alt"></i> {{ formatDate(product.createdAt) }}</span>
            <span class="flex items-center gap-1.5" :class="product.stock < 5 ? 'text-amber-600 font-semibold' : ''">
              <i class="fas fa-warehouse text-[9px]"></i> Stock: {{ product.stock }}
            </span>
          </div>

          <!-- Bottom Action -->
          <button 
            @click="toggleAvailability(product)"
            :class="[
              'w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 group/btn',
              product.stock > 0 
                ? 'bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-600' 
                : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
            ]"
          >
            <i :class="product.stock > 0 ? 'fas fa-times-circle' : 'fas fa-check-circle'" class="text-[14px]"></i>
            Marcar como {{ product.stock > 0 ? 'Agotado' : 'Disponible' }}
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFirestore, collection, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy, where } from "firebase/firestore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "vue-toastification";

const authStore = useAuthStore();

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  brand?: string;
  images: string[];
  createdAt: any;
}

const router = useRouter();
const toast = useToast();
const db = getFirestore();

const products = ref<Product[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const filterStatus = ref('all');

// Computed list with search and filters
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = filterStatus.value === 'all' || 
                         (filterStatus.value === 'available' && product.stock > 0) || 
                         (filterStatus.value === 'outOfStock' && product.stock <= 0);
    return matchesSearch && matchesStatus;
  });
});

const resetFilters = () => {
  searchQuery.value = '';
  filterStatus.value = 'all';
};

const loadProducts = () => {
  loading.value = true;
  const productsRef = collection(db, "products");
  let q;

  if (authStore.isAdmin) {
    q = query(productsRef, orderBy("createdAt", "desc"));
  } else {
    q = query(productsRef, where("vendorId", "==", authStore.user?.uid), orderBy("createdAt", "desc"));
  }
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    products.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    loading.value = false;
  }, (error) => {
    console.error("Error loading products:", error);
    toast.error("Error al cargar productos");
    loading.value = false;
  });

  return unsubscribe;
};

let unsubscribeListener: (() => void) | null = null;

onMounted(() => {
  unsubscribeListener = loadProducts();
});

const formatDate = (timestamp: any) => {
  if (!timestamp) return 'Reciente';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'short' }).format(date);
  } catch (e) {
    return 'Fecha n/a';
  }
};

const editProduct = (id: string) => {
  router.push({ name: 'EditProduct', params: { id } });
};

const confirmDelete = async (id: string) => {
  if (confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Producto eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error al eliminar el producto");
    }
  }
};

const toggleAvailability = async (product: Product) => {
  try {
    const newStock = product.stock > 0 ? 0 : 1; 
    await updateDoc(doc(db, "products", product.id), {
      stock: newStock
    });
    toast.info(`Producto marcado como ${newStock > 0 ? 'Disponible' : 'Agotado'}`, {
      timeout: 2000,
      position: "bottom-center" as any
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    toast.error("Error al actualizar disponibilidad");
  }
};
</script>

<style scoped>
@reference "@/assets/main.css";

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Glassmorphism utility if needed */
.glass-effect {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}
</style>
style>