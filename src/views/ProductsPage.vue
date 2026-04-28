<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProducts } from '@/composables/useProducts';
import { useCategories } from '@/composables/useCategories';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSEO } from '@/composables/useSEO';
import ProductCard from '@/components/ProductCard.vue';
import { db } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Product } from '@/types';
import { 
  LINEAS_PRODUCCION, 
  ESPECIES_CULTIVOS, 
  ETAPAS_VIDA 
} from '@/constants/productConstants';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { products, loading: productsLoading } = useProducts();
const { categories, loading: categoriesLoading } = useCategories();
const brandInfo = ref<any>(null);

const { updateSEO } = useSEO('Catálogo', 'Explora nuestra amplia gama de productos agrícolas, maquinaria e insumos de las mejores marcas.');

const isFilterDrawerOpen = ref(false);

// State
const searchQuery = ref((route.query.search as string) || '');
const activeCategory = ref<string | null>((route.query.category as string) || null);
const activeLinea = ref<string | null>(null);
const activeEspecie = ref<string | null>(null);
const activeEtapa = ref<string | null>(null);
const activeBrand = ref<string | null>((route.query.brand as string) || null);
const sortOption = ref('date-desc');
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const currentPage = ref(1);
const itemsPerPage = 12;

const userFavorites = ref<string[]>([]);
const notifications = ref([
  { id: 1, message: "Nuevos equipos agrícolas disponibles", date: new Date() },
  { id: 2, message: "Descuento del 20% en agroquímicos", date: new Date(Date.now() - 86400000) }
]);

// Fetch favorites
const fetchFavorites = async () => {
  if (authStore.isAuthenticated && authStore.user) {
    const userDoc = await getDoc(doc(db, "users", authStore.user.uid));
    if (userDoc.exists()) {
      userFavorites.value = userDoc.data().favorites || [];
    }
  }
};

const fetchStoreData = async () => {
  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'app'));
    if (settingsSnap.exists()) {
      const marcas = settingsSnap.data().marcasAliadas || [];
      if (activeBrand.value) {
        brandInfo.value = marcas.find((m: any) => m.name.toLowerCase() === activeBrand.value?.toLowerCase());
      }
    }
  } catch (error) {
    console.error('Error fetching brand data:', error);
  }
};

onMounted(() => {
  fetchFavorites();
  fetchStoreData();
});

watch(activeBrand, (newBrand) => {
  if (newBrand) fetchStoreData();
  else brandInfo.value = null;
});

// Filtering Logic
const filteredProducts = computed(() => {
  let result = [...products.value];

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }

  if (activeCategory.value) {
    result = result.filter(p => p.categoria === activeCategory.value);
  }

  if (activeLinea.value) {
    result = result.filter(p => p.lineaProduccion === activeLinea.value);
  }

  if (activeEspecie.value) {
    const especie = activeEspecie.value;
    result = result.filter(p => p.especieCultivo?.includes(especie));
  }

  if (activeEtapa.value) {
    result = result.filter(p => p.etapaVida === activeEtapa.value);
  }

  if (activeBrand.value) {
    result = result.filter(p => p.marcaFabricante?.toLowerCase() === activeBrand.value?.toLowerCase());
  }

  if (minPrice.value !== null) {
    result = result.filter(p => p.price >= (minPrice.value as number));
  }
  if (maxPrice.value !== null) {
    result = result.filter(p => p.price <= (maxPrice.value as number));
  }

  // Sorting
  switch (sortOption.value) {
    case 'price-asc': result.sort((a, b) => a.price - b.price); break;
    case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    case 'date-desc': result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break;
    case 'popular': result.sort((a, b) => (b.views || 0) - (a.views || 0)); break;
  }

  return result;
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredProducts.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage));

// Actions
const filterByCategory = (id: string | null) => {
  activeCategory.value = id;
  currentPage.value = 1;
};

const handleToggleFavorite = (productId: string) => {
  const index = userFavorites.value.indexOf(productId);
  if (index > -1) userFavorites.value.splice(index, 1);
  else userFavorites.value.push(productId);
};

const clearFilters = () => {
  searchQuery.value = '';
  activeCategory.value = null;
  activeLinea.value = null;
  activeEspecie.value = null;
  activeEtapa.value = null;
  activeBrand.value = null;
  minPrice.value = null;
  maxPrice.value = null;
  router.push('/products');
};

const shareFilteredView = () => {
  const baseUrl = 'https://celularesatitlan.web.app/products';
  const params = new URLSearchParams();
  if (searchQuery.value) params.append('search', searchQuery.value);
  if (activeCategory.value) params.append('category', activeCategory.value);
  if (activeBrand.value) params.append('brand', activeBrand.value);
  
  const fullUrl = `${baseUrl}?${params.toString()}`;
  let filterName = searchQuery.value || (activeCategory.value ? 'esta categoría' : 'estos productos');
  if (activeBrand.value) filterName = `productos de ${activeBrand.value}`;

  const text = `🚜 *Catálogo Seleccionado de Agro Guate*\n\nHe preparado esta selección de *${filterName}* especialmente para ti.\n\n🔗 Ver productos: ${fullUrl}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

const getCategoryName = (id: string) => categories.value.find(c => c.id === id)?.name || 'Todos';

const formatDate = (date: any) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

// Reset page on filter change
watch([searchQuery, activeCategory, activeLinea, activeBrand, minPrice, maxPrice, sortOption], () => {
  currentPage.value = 1;
});

// Watch route query to update brand filter if user navigates again
watch(() => route.query.brand, (newBrand) => {
  if (newBrand) {
    activeBrand.value = newBrand as string;
    updateSEO(`Productos ${newBrand}`, `Mira nuestro catálogo completo de ${newBrand} en Agro Guate.`);
  } else {
    updateSEO('Catálogo');
  }
});

watch(activeCategory, (newCat) => {
  if (newCat) {
    const catName = categories.value.find(c => c.id === newCat)?.name || 'Categoría';
    updateSEO(catName, `Encuentra lo mejor en ${catName} para tu finca en Agro Guate.`);
  }
});

// Helper to get categories present in a specific line
const getCategoriesByLinea = (lineaId: string) => {
  const categoriesInLinea = new Set(
    products.value
      .filter(p => p.lineaProduccion === lineaId)
      .map(p => p.categoria)
  );
  return categories.value.filter(c => categoriesInLinea.has(c.id));
};

const getProductCountByLineAndCat = (lineaId: string | null, catId: string | null) => {
  return products.value.filter(p => {
    const matchLine = !lineaId || p.lineaProduccion === lineaId;
    const matchCat = !catId || p.categoria === catId;
    return matchLine && matchCat;
  }).length;
};
</script>

<template>
  <div class="flex flex-col md:flex-row gap-8 pb-20 md:pb-0">
    <!-- Mobile Filter Toggle -->
    <div class="md:hidden sticky top-[72px] z-30 bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-slate-100 -mx-4 px-8">
       <div class="text-sm font-bold text-slate-800">
          Resultados ({{ filteredProducts.length }})
       </div>
       <button @click="isFilterDrawerOpen = true" class="flex items-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary-500/20">
          <i class="fas fa-filter"></i>
          Filtros
       </button>
    </div>

    <!-- Sidebar / Filter Drawer -->
    <aside 
      :class="[
        'w-full md:w-72 space-y-8 animate-fade-in transition-all duration-300',
        'fixed inset-y-0 left-0 z-[100] bg-white p-8 md:p-0 md:bg-transparent md:relative md:z-auto overflow-y-auto md:overflow-visible',
        isFilterDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Close button mobile -->
      <div class="flex items-center justify-between md:hidden mb-10">
         <h2 class="text-2xl font-bold text-slate-900">Filtros</h2>
         <button @click="isFilterDrawerOpen = false" class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
            <i class="fas fa-times text-slate-500"></i>
         </button>
      </div>

      <!-- Search -->
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Búsqueda</h3>
        <div class="relative">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="¿Qué buscas?" 
            class="w-full bg-slate-50 border-none rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary-500/20"
          />
          <font-awesome-icon icon="search" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <!-- Explorador de Categorías (Árbol) -->
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Explorador de Productos</h3>
        
        <div class="space-y-1">
          <!-- All Products Option -->
          <button 
            @click="clearFilters"
            :class="[
              'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all',
              (!activeLinea && !activeCategory) ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
            ]"
          >
            <i class="fas fa-th-large text-xs"></i>
            <span>Ver Todo</span>
            <span class="ml-auto text-[10px] opacity-60">{{ products.length }}</span>
          </button>

          <!-- Production Lines -->
          <div v-for="linea in LINEAS_PRODUCCION" :key="linea.id" class="space-y-1">
            <button 
              @click="activeLinea = activeLinea === linea.id ? (activeCategory ? activeLinea : null) : linea.id; activeCategory = activeLinea === linea.id ? activeCategory : null"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all',
                activeLinea === linea.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
              ]"
            >
              <i :class="['fas fa-' + linea.icon, 'text-xs', activeLinea === linea.id ? 'text-primary-400' : 'text-slate-400']"></i>
              <span class="truncate">{{ linea.name }}</span>
              <i v-if="activeLinea === linea.id" class="fas fa-chevron-down text-[10px] ml-auto"></i>
              <i v-else class="fas fa-chevron-right text-[10px] ml-auto opacity-30"></i>
            </button>

            <!-- Nested Categories (Tree Branches) -->
            <Transition name="expand">
              <div v-if="activeLinea === linea.id" class="pl-8 space-y-1 py-1 border-l-2 border-slate-100 ml-5 mt-1">
                <button 
                  @click="activeCategory = null"
                  :class="[
                    'w-full text-left px-4 py-2 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between',
                    activeCategory === null ? 'text-primary-600 font-bold bg-primary-50' : 'text-slate-500 hover:text-slate-800'
                  ]"
                >
                  <span>Todos en {{ linea.name.split(' ')[0] }}</span>
                  <span class="text-[10px] opacity-50">{{ getProductCountByLineAndCat(linea.id, null) }}</span>
                </button>
                
                <button 
                  v-for="cat in getCategoriesByLinea(linea.id)" 
                  :key="cat.id"
                  @click="activeCategory = cat.id"
                  :class="[
                    'w-full text-left px-4 py-2 rounded-xl text-[13px] font-medium transition-all flex items-center justify-between',
                    activeCategory === cat.id ? 'text-primary-600 font-bold bg-primary-50' : 'text-slate-500 hover:text-slate-800'
                  ]"
                >
                  <span class="truncate">{{ cat.name }}</span>
                  <span class="text-[10px] opacity-50">{{ getProductCountByLineAndCat(linea.id, cat.id) }}</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Especies / Cultivos (Iconos) -->
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Especie o Cultivo</h3>
        <div class="grid grid-cols-2 gap-2">
          <button 
            v-for="esp in ESPECIES_CULTIVOS" 
            :key="esp.id"
            @click="activeEspecie = activeEspecie === esp.id ? null : esp.id"
            :class="[
              'flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center gap-2',
              activeEspecie === esp.id ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
            ]"
          >
            <font-awesome-icon :icon="esp.icon" class="text-lg" />
            <span class="text-[10px] font-bold leading-none">{{ esp.name.split(' ')[0] }}</span>
          </button>
        </div>
      </div>



      <!-- Price Range -->
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Precio</h3>
        <div class="flex items-center gap-2">
          <input v-model="minPrice" type="number" placeholder="Min" class="w-full bg-slate-50 border-none rounded-lg p-2 text-xs" />
          <span class="text-slate-300">-</span>
          <input v-model="maxPrice" type="number" placeholder="Max" class="w-full bg-slate-50 border-none rounded-lg p-2 text-xs" />
        </div>
      </div>

      <!-- Notifications -->
      <div class="bg-slate-900 p-6 rounded-3xl text-white overflow-hidden relative">
        <div class="absolute -top-4 -right-4 w-20 h-20 bg-primary-600/20 blur-3xl rounded-full"></div>
        <h3 class="text-xs font-bold text-primary-400 uppercase tracking-widest mb-4">Información</h3>
        <div class="space-y-4">
          <div v-for="note in notifications" :key="note.id" class="space-y-1">
            <p class="text-[13px] font-medium leading-tight text-slate-200">{{ note.message }}</p>
            <p class="text-[10px] text-slate-500 uppercase">{{ formatDate(note.date) }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Drawer Overlay -->
    <div 
      v-if="isFilterDrawerOpen" 
      @click="isFilterDrawerOpen = false"
      class="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-sm md:hidden"
    ></div>

    <!-- Main Content -->
    <main class="flex-1 space-y-6">
      <!-- Special Brand Header -->
      <Transition name="fade">
        <div v-if="activeBrand && brandInfo" class="premium-card bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative group">
           <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 group-hover:bg-primary-100 transition-colors"></div>
           
           <div class="relative flex flex-col md:flex-row items-center gap-8">
              <div class="w-32 h-32 bg-slate-50 rounded-3xl p-4 flex items-center justify-center border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                 <img v-if="brandInfo.logo" :src="brandInfo.logo" :alt="activeBrand" class="max-w-full max-h-full object-contain" />
                 <i v-else class="fas fa-certificate text-4xl text-primary-200"></i>
              </div>
              
              <div class="flex-1 text-center md:text-left">
                 <div class="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h2 class="text-4xl font-black text-slate-900 tracking-tight">{{ activeBrand }}</h2>
                    <span class="px-3 py-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary-500/20">Oficial</span>
                 </div>
                 <p class="text-slate-500 font-medium max-w-xl text-balance">
                    Explora todo el catálogo de productos de <strong>{{ activeBrand }}</strong>. 
                    Soluciones tecnológicas y agrícolas de alta calidad seleccionadas especialmente para aumentar tu productividad.
                 </p>
                 <div class="flex items-center justify-center md:justify-start gap-6 mt-6">
                    <div class="bg-slate-50 px-4 py-2 rounded-2xl">
                       <p class="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Productos</p>
                       <p class="text-xl font-black text-slate-800 leading-none">{{ filteredProducts.length }}</p>
                    </div>
                    <button @click="clearFilters" class="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                       <i class="fas fa-arrow-left"></i> Ver Todos Los Fabricantes
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </Transition>
      <!-- Filter Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filtros:</span>
          <div v-if="activeCategory" class="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full flex items-center gap-2">
            {{ getCategoryName(activeCategory) }}
            <button @click="filterByCategory(null)" class="hover:text-primary-900">×</button>
          </div>
          <div v-if="searchQuery" class="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full flex items-center gap-2">
            "{{ searchQuery }}"
            <button @click="searchQuery = ''" class="hover:text-slate-900">×</button>
          </div>
          <div v-if="activeBrand" class="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full flex items-center gap-2">
            Marca: {{ activeBrand }}
            <button @click="activeBrand = null; router.replace({ query: { ...route.query, brand: undefined } })" class="hover:text-amber-900">×</button>
          </div>
          <button v-if="activeCategory || searchQuery || minPrice || maxPrice || activeBrand" 
                  @click="clearFilters" 
                  class="text-[10px] font-bold text-rose-500 hover:underline uppercase">
            Limpiar todo
          </button>
          
          <button v-if="activeCategory || searchQuery || activeBrand" 
                  @click="shareFilteredView"
                  class="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-full hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
            <font-awesome-icon :icon="['fab', 'whatsapp']" /> Compartir esta selección
          </button>
        </div>

        <div class="flex items-center gap-4">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordenar:</span>
          <select v-model="sortOption" class="bg-slate-50 border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-primary-500/20">
            <option value="date-desc">Recientes</option>
            <option value="price-asc">Precio Bajo</option>
            <option value="price-desc">Precio Alto</option>
            <option value="popular">Más vistos</option>
          </select>
        </div>
      </div>

      <!-- Results Grid -->
      <div v-if="productsLoading" class="flex flex-col items-center justify-center py-40 space-y-4">
         <font-awesome-icon icon="spinner" spin class="text-4xl text-primary-500" />
         <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando productos...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center py-40 space-y-4 text-center">
         <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
           <font-awesome-icon icon="search" class="text-3xl" />
         </div>
         <h3 class="text-xl font-bold text-slate-800">No hay resultados</h3>
         <p class="text-slate-500 text-sm max-w-xs">Intenta ajustar los filtros de búsqueda o cambia la categoría.</p>
         <button @click="clearFilters" class="btn-primary">Limpiar Filtros</button>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProductCard 
          v-for="product in paginatedProducts" 
          :key="product.id"
          :product="product"
          :isFavorite="userFavorites.includes(product.id)"
          @toggle-favorite="handleToggleFavorite"
        />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between pt-10 border-t border-slate-100">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Página {{ currentPage }} de {{ totalPages }}</p>
        <div class="flex gap-2">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            ←
          </button>
          <div class="flex gap-1">
            <button v-for="page in totalPages" :key="page" 
                    @click="currentPage = page"
                    :class="[
                      'w-10 h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all',
                      currentPage === page ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'hover:bg-slate-50 text-slate-500'
                    ]">
              {{ page }}
            </button>
          </div>
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            →
          </button>
        </div>
      </div>
    </main>
  </div>
</template>