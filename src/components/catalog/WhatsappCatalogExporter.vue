<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { db } from '@/services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Product, Category } from '@/types';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/useAuthStore';

const toast = useToast();
const authStore = useAuthStore();

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(true);

const catalogSource = ref<'partner' | 'global'>('partner');
const exportMode = ref<'all' | 'category' | 'custom'>('category');
const selectedCategory = ref<string>('');
const selectedProductIds = ref<Set<string>>(new Set());

const recipientPhone = ref<string>('');
const customIntro = ref<string>('🌱 *CATÁLOGO DE PRODUCTOS - AGRO GUATE* 🚀\nAquí tienes nuestra selección de insumos agrícolas y soluciones de alta calidad:');
const customFooter = ref<string>('📱 *Pedidos y Consultas:* Contáctanos directamente por WhatsApp o respuesta a este mensaje.\n📍 Realizamos envíos a toda Guatemala.');

onMounted(async () => {
  try {
    // Fetch products
    const pSnap = await getDocs(collection(db, 'products'));
    products.value = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

    // Fetch categories
    const cSnap = await getDocs(collection(db, 'categories'));
    categories.value = cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));

    if (categories.value.length > 0) {
      selectedCategory.value = categories.value[0].id;
    }
  } catch (error) {
    console.error('Error fetching catalog data:', error);
    toast.error('Error cargando catálogo');
  } finally {
    loading.value = false;
  }
});

// Calculate products based on catalogSource (My Products vs Global Marketplace +10% Commission)
const availableProducts = computed(() => {
  const uid = authStore.user?.uid;
  
  if (catalogSource.value === 'partner') {
    if (!uid) return products.value;
    const myProducts = products.value.filter(p => p.vendorId === uid);
    return myProducts.length > 0 ? myProducts : products.value;
  } else {
    // Global Catalog: add 10% commission to external products
    return products.value.map(p => {
      const isExternal = p.vendorId && p.vendorId !== uid;
      if (isExternal) {
        const commPrice = Math.ceil(p.price * 1.10);
        const commCashPrice = p.cashPrice ? Math.ceil(p.cashPrice * 1.10) : undefined;
        return {
          ...p,
          price: commPrice,
          cashPrice: commCashPrice,
          isCommissioned: true
        };
      }
      return p;
    });
  }
});

// Products selected for export based on exportMode
const exportProducts = computed(() => {
  const baseList = availableProducts.value;
  if (exportMode.value === 'all') {
    return baseList;
  } else if (exportMode.value === 'category') {
    if (!selectedCategory.value) return baseList;
    return baseList.filter(p => p.categoria === selectedCategory.value);
  } else {
    return baseList.filter(p => selectedProductIds.value.has(p.id));
  }
});

const toggleSelectProduct = (id: string) => {
  if (selectedProductIds.value.has(id)) {
    selectedProductIds.value.delete(id);
  } else {
    selectedProductIds.value.add(id);
  }
};

const selectAllCustom = () => {
  availableProducts.value.forEach(p => selectedProductIds.value.add(p.id));
};

const clearSelectionCustom = () => {
  selectedProductIds.value.clear();
};

// Formatted WhatsApp message generator
const formattedMessage = computed(() => {
  if (exportProducts.value.length === 0) {
    return `${customIntro.value}\n\n⚠️ No hay productos seleccionados.`;
  }

  let text = `${customIntro.value}\n\n`;

  exportProducts.value.forEach((p: any, index) => {
    const isAvailable = p.stock > 0 || p.availability === 'in_stock';
    const statusTag = isAvailable ? '✅ Disponible' : '❌ Agotado';
    const priceStr = p.cashPrice ? `Q${p.cashPrice} (Efectivo) / Q${p.price} (Normal)` : `Q${p.price}`;

    text += `${index + 1}. *${p.name.toUpperCase()}*\n`;
    if (p.brand) text += `   • Marca: ${p.brand}\n`;
    if (p.ingredienteActivo) text += `   • Ingrediente Activo: ${p.ingredienteActivo}\n`;
    text += `   • Precio: ${priceStr}\n`;
    text += `   • Estado: ${statusTag}\n`;
    if (p.dosis) text += `   • Dosis recomendada: ${p.dosis}\n`;
    text += `\n`;
  });

  text += `${customFooter.value}`;
  return text;
});

const copyToClipboard = () => {
  navigator.clipboard.writeText(formattedMessage.value);
  toast.success('¡Catálogo formateado copiado al portapapeles!');
};

const openWhatsApp = () => {
  let targetUrl = `https://wa.me/`;
  if (recipientPhone.value.trim()) {
    const cleanPhone = recipientPhone.value.replace(/[^0-9]/g, '');
    targetUrl += `${cleanPhone}`;
  }
  targetUrl += `?text=${encodeURIComponent(formattedMessage.value)}`;
  window.open(targetUrl, '_blank');
};

const getCategoryName = (catId: string) => {
  const cat = categories.value.find(c => c.id === catId);
  return cat ? cat.name : catId;
};
</script>

<template>
  <div class="space-y-6 font-outfit">
    <!-- Header -->
    <div class="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
      <div class="relative z-10 max-w-3xl">
        <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <font-awesome-icon :icon="['fab', 'whatsapp']" class="text-emerald-300 text-sm" /> Catálogo Interactivo WhatsApp
        </div>
        <h2 class="text-2xl md:text-3xl font-black tracking-tight leading-tight">Exportador y Compartidor de Catálogo</h2>
        <p class="text-emerald-100 text-sm mt-2 font-medium">Genera mensajes estructurados de WhatsApp con fotos, precios y disponibilidad en 1 clic para tus clientes agricultores.</p>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <font-awesome-icon icon="spinner" spin class="text-4xl text-emerald-600 mb-3" />
      <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando catálogo de insumos...</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left Config Column -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Catalog Source Card -->
        <div class="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
          <h3 class="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <font-awesome-icon icon="store" class="text-emerald-600" /> Origen del Catálogo
          </h3>

          <div class="grid grid-cols-2 gap-3">
            <button 
              @click="catalogSource = 'partner'" 
              :class="[
                'p-4 rounded-2xl text-xs font-bold transition-all border text-left flex flex-col gap-1',
                catalogSource === 'partner' 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              ]"
            >
              <div class="flex items-center gap-2">
                <i class="fas fa-box-open text-base"></i>
                <span class="font-black">Mi Negocio (Mis Productos)</span>
              </div>
              <span class="text-[10px] opacity-80">Catálogo directo de tus propios insumos y productos</span>
            </button>

            <button 
              @click="catalogSource = 'global'" 
              :class="[
                'p-4 rounded-2xl text-xs font-bold transition-all border text-left flex flex-col gap-1',
                catalogSource === 'global' 
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md' 
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              ]"
            >
              <div class="flex items-center gap-2">
                <i class="fas fa-globe text-base text-amber-600"></i>
                <span class="font-black">Catálogo Global (+10% Comisión)</span>
              </div>
              <span class="text-[10px] opacity-80">Ganas un 10% adicional por venta sobre insumos globales</span>
            </button>
          </div>

          <div v-if="catalogSource === 'global'" class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
            <i class="fas fa-info-circle text-amber-600 text-sm"></i>
            <span><strong>Catálogo Global activo:</strong> A los productos de otros vendedores se les suma automáticamente un 10% de comisión para ti.</span>
          </div>
        </div>

        <!-- Mode Selection Card -->
        <div class="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
          <h3 class="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <font-awesome-icon icon="filter" class="text-emerald-600" /> Modo de Envío
          </h3>

          <div class="grid grid-cols-3 gap-3">
            <button 
              @click="exportMode = 'category'" 
              :class="[
                'p-3 rounded-2xl text-xs font-bold transition-all border text-center flex flex-col items-center gap-2',
                exportMode === 'category' 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              ]"
            >
              <font-awesome-icon icon="tags" class="text-lg" />
              <span>Por Categoría</span>
            </button>

            <button 
              @click="exportMode = 'custom'" 
              :class="[
                'p-3 rounded-2xl text-xs font-bold transition-all border text-center flex flex-col items-center gap-2',
                exportMode === 'custom' 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              ]"
            >
              <font-awesome-icon icon="check-square" class="text-lg" />
              <span>Selección Libres</span>
            </button>

            <button 
              @click="exportMode = 'all'" 
              :class="[
                'p-3 rounded-2xl text-xs font-bold transition-all border text-center flex flex-col items-center gap-2',
                exportMode === 'all' 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              ]"
            >
              <font-awesome-icon icon="boxes" class="text-lg" />
              <span>Todo el Catálogo</span>
            </button>
          </div>

          <!-- Category Selector -->
          <div v-if="exportMode === 'category'" class="pt-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Selecciona Categoría</label>
            <select 
              v-model="selectedCategory" 
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }} ({{ products.filter(p => p.categoria === cat.id).length }} productos)
              </option>
            </select>
          </div>

          <!-- Custom Checkboxes -->
          <div v-if="exportMode === 'custom'" class="pt-2 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Seleccionados: {{ selectedProductIds.size }} de {{ products.length }}
              </span>
              <div class="flex gap-2">
                <button @click="selectAllCustom" class="text-[11px] font-bold text-emerald-600 hover:underline">Seleccionar Todos</button>
                <span class="text-slate-300">|</span>
                <button @click="clearSelectionCustom" class="text-[11px] font-bold text-rose-500 hover:underline">Limpiar</button>
              </div>
            </div>

            <div class="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl p-3 space-y-2 divide-y divide-slate-100">
              <label 
                v-for="p in products" 
                :key="p.id" 
                class="flex items-center gap-3 pt-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition-colors"
              >
                <input 
                  type="checkbox" 
                  :checked="selectedProductIds.has(p.id)" 
                  @change="toggleSelectProduct(p.id)" 
                  class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <img :src="p.mainImage || p.images?.[0] || '/placeholder.png'" class="w-8 h-8 rounded-lg object-cover" />
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-slate-800 truncate">{{ p.name }}</p>
                  <p class="text-[10px] text-slate-400">Q{{ p.cashPrice || p.price }} • {{ getCategoryName(p.categoria) }}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Optional Phone & Text Customizer -->
        <div class="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-4">
          <h3 class="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <font-awesome-icon icon="user-edit" class="text-emerald-600" /> Personalización del Mensaje
          </h3>

          <div>
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Teléfono Cliente (Opcional)</label>
            <input 
              v-model="recipientPhone" 
              type="text" 
              placeholder="Ej. 50254317333" 
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Encabezado</label>
            <textarea 
              v-model="customIntro" 
              rows="2" 
              class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Right WhatsApp Live Preview Column -->
      <div class="lg:col-span-5">
        <div class="bg-slate-900 rounded-3xl p-6 shadow-2xl text-white sticky top-24 space-y-4 border border-slate-800">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
              <span class="text-xs font-black uppercase tracking-widest text-emerald-400">Vista Previa WhatsApp</span>
            </div>
            <span class="text-[10px] font-bold text-slate-500">{{ exportProducts.length }} productos</span>
          </div>

          <!-- Chat bubble preview -->
          <div class="bg-emerald-950/80 border border-emerald-800/60 rounded-2xl p-4 font-mono text-xs text-emerald-100 whitespace-pre-wrap max-h-[420px] overflow-y-auto leading-relaxed shadow-inner">
            {{ formattedMessage }}
          </div>

          <!-- Actions -->
          <div class="space-y-2 pt-2">
            <button 
              @click="openWhatsApp" 
              class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
            >
              <font-awesome-icon :icon="['fab', 'whatsapp']" class="text-xl" /> Enviar por WhatsApp
            </button>

            <button 
              @click="copyToClipboard" 
              class="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <font-awesome-icon icon="copy" /> Copiar Formato de Texto
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
