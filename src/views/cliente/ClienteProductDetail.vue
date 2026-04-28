<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { db, auth } from "@/services/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment, collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { useAuthStore } from '@/stores/useAuthStore';
import { useSEO } from '@/composables/useSEO';
import { useCartStore } from '@/stores/useCartStore';
import { useToast } from "vue-toastification";
import type { Product } from '@/types';

const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();
const cartStore = useCartStore();
const { updateSEO } = useSEO('Cargando producto...');

const product = ref<Product | null>(null);
const loadingFavorite = ref(false);
const questions = ref<any[]>([]);
const newQuestion = ref("");
const sendingQuestion = ref(false);

const fetchQuestions = async () => {
  try {
    const q = query(
      collection(db, "questions"), 
      where("productId", "==", productId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    questions.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Error fetching questions:", e);
  }
};

const askQuestion = async () => {
  if (!newQuestion.value.trim() || !authStore.isAuthenticated) return;
  
  try {
    sendingQuestion.value = true;
    await addDoc(collection(db, "questions"), {
      productId,
      vendorId: product.value?.vendorId || 'admin',
      userId: authStore.user?.uid,
      userName: authStore.user?.displayName || authStore.user?.email?.split('@')[0],
      question: newQuestion.value,
      answer: null,
      createdAt: new Date().toISOString()
    });
    newQuestion.value = "";
    toast.success("Tu pregunta ha sido enviada al vendedor");
    fetchQuestions();
  } catch (e) {
    toast.error("Error al enviar pregunta");
  } finally {
    sendingQuestion.value = false;
  }
};

const shareOnWhatsApp = () => {
  if (!product.value) return;
  const url = window.location.href;
  const text = `🚜 *${product.value.name}*\n\n💰 Precio Efectivo: *Q${product.value.cashPrice || product.value.price}*\n💳 Precio Tarjeta: Q${product.value.price}\n\nVer detalles aquí: ${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

const productId = route.params.id as string;

// Initialization
onMounted(async () => {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      product.value = { id: docSnap.id, ...docSnap.data() } as Product;
      mainImage.value = product.value.mainImage || product.value.images?.[0] || "";
      
      // Update SEO
      updateSEO(
        product.value.name, 
        product.value.description?.substring(0, 160) || `Compra ${product.value.name} al mejor precio en Agro Guate.`
      );
      
      // Increment views tracking
      updateDoc(docRef, {
        views: increment(1)
      }).catch(err => console.error("Error tracking view:", err));

      fetchQuestions();
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
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-4">
            <button 
              @click="shareOnWhatsApp"
              class="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
            >
              <i class="fab fa-whatsapp text-xl"></i>
              Compartir por WhatsApp
            </button>
            
            <button 
              @click="handleAddToCart"
              class="flex-1 w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-3"
            >
              <font-awesome-icon icon="cart-plus" />
              Agregar al Carrito
            </button>
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
      <div class="mt-20 border-t border-slate-100 pt-10">
        <h2 class="text-3xl font-black text-slate-800 font-outfit mb-8">Preguntas y Respuestas</h2>
        
        <!-- Ask Form -->
        <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8">
          <div v-if="!authStore.isAuthenticated" class="text-center py-4">
            <p class="text-slate-500 font-medium mb-4">Inicia sesión para hacer una pregunta al vendedor</p>
            <router-link to="/login" class="btn-primary !px-8">Iniciar Sesión</router-link>
          </div>
          <div v-else class="space-y-4">
            <textarea 
              v-model="newQuestion" 
              placeholder="Escribe tu duda sobre este producto aquí..." 
              class="w-full px-5 py-4 bg-slate-50 rounded-2xl font-medium text-slate-800 border-none focus:ring-2 focus:ring-primary-500/20 outline-none transition-all resize-none h-32"
            ></textarea>
            <div class="flex justify-end">
              <button 
                @click="askQuestion" 
                :disabled="sendingQuestion || !newQuestion.trim()"
                class="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 disabled:opacity-50 transition-all"
              >
                {{ sendingQuestion ? 'Enviando...' : 'Preguntar al Vendedor' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Questions List -->
        <div class="space-y-6">
          <div v-for="q in questions" :key="q.id" class="space-y-4">
            <div class="flex gap-4">
              <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black">
                {{ q.userName?.[0]?.toUpperCase() || '?' }}
              </div>
              <div class="flex-1">
                <p class="text-sm font-bold text-slate-800">{{ q.question }}</p>
                <p class="text-[10px] text-slate-400 uppercase font-black mt-1">{{ q.userName }} • {{ new Date(q.createdAt).toLocaleDateString() }}</p>
                
                <div v-if="q.answer" class="mt-4 flex gap-4 bg-primary-50/50 p-4 rounded-2xl border border-primary-100">
                   <div class="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-[10px] flex-shrink-0">
                     <i class="fas fa-check"></i>
                   </div>
                   <div>
                     <p class="text-sm font-medium text-slate-700"><span class="font-black text-primary-700 mr-1">Respuesta del vendedor:</span> {{ q.answer }}</p>
                   </div>
                </div>
                <div v-else class="mt-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest italic">
                  Esperando respuesta del vendedor...
                </div>
              </div>
            </div>
            <div class="h-px bg-slate-50 w-full"></div>
          </div>
          
          <div v-if="questions.length === 0" class="text-center py-10 text-slate-400 italic">
            Nadie ha preguntado sobre este producto todavía. ¡Sé el primero!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>