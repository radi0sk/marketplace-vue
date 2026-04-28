<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProducts } from '@/composables/useProducts';
import { useCategories } from '@/composables/useCategories';
import { useTestimonials } from '@/composables/useTestimonials';
import ProductCard from '@/components/ProductCard.vue';
import { db } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useSEO } from '@/composables/useSEO';

const router = useRouter();
const authStore = useAuthStore();
const { products, loading: productsLoading } = useProducts();
const { categories, loading: categoriesLoading } = useCategories();
const { testimonials, loading: testimonialsLoading } = useTestimonials();

useSEO('Inicio', 'Tu aliado experto en el campo. Compra maquinaria especial, nutrición y protección para tus cultivos en un solo lugar.');

// State
const userFavorites = ref<string[]>([]);
const marcasAliadas = ref<{name: string, logo: string}[]>([]);
const banners = ref<any[]>([{
  badge: 'Lo mejor del campo a tu hogar',
  title: 'Descubre la esencia de lo natural',
  subtitle: 'Encuentra los mejores productos agrícolas y tecnología especializada al mejor precio del mercado.',
  buttonText: 'Explorar Catálogo',
  image: 'https://res.cloudinary.com/dsfnladar/image/upload/v1744246734/onqmux4dzpoqmmkdblhk.png',
  link: '/products'
}]);
const currentBannerIdx = ref(0);

const featuredProducts = computed(() => {
  // Sort by popularity (views) first, then rating
  return [...products.value]
    .sort((a, b) => {
      const scoreA = (a.views || 0) + (a.rating || 0) * 10;
      const scoreB = (b.views || 0) + (b.rating || 0) * 10;
      return scoreB - scoreA;
    })
    .slice(0, 8);
});

const heroSettings = computed(() => banners.value[currentBannerIdx.value] || {
  badge: 'Lo mejor del campo a tu hogar',
  title: 'Descubre la esencia de lo natural',
  subtitle: 'Encuentra los mejores productos agrícolas y tecnología especializada al mejor precio del mercado.',
  buttonText: 'Explorar Catálogo',
  image: 'https://res.cloudinary.com/dsfnladar/image/upload/v1744246734/onqmux4dzpoqmmkdblhk.png',
  link: '/products'
});

// Fetch favorites whenever auth state changes
const fetchAllData = async () => {
  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'app'));
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      marcasAliadas.value = data.marcasAliadas || [];
      if (data.banners && data.banners.length > 0) {
        banners.value = data.banners;
      } else if (data.hero) {
        banners.value = [data.hero];
      }
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
  }

  if (authStore.isAuthenticated && authStore.user) {
    const userDoc = await getDoc(doc(db, "users", authStore.user.uid));
    if (userDoc.exists()) {
      userFavorites.value = userDoc.data().favorites || [];
    }
  } else {
    userFavorites.value = [];
  }
};

onMounted(() => {
  fetchAllData();
  
  // Auto-play carousel
  const timer = setInterval(() => {
    if (banners.value.length > 1) {
      currentBannerIdx.value = (currentBannerIdx.value + 1) % banners.value.length;
    }
  }, 8000);

  return () => clearInterval(timer);
});

const isFavorite = (productId: string) => userFavorites.value.includes(productId);

const handleToggleFavorite = (productId: string) => {
  const index = userFavorites.value.indexOf(productId);
  if (index > -1) {
    userFavorites.value.splice(index, 1);
  } else {
    userFavorites.value.push(productId);
  }
};

const goToSearch = (categoryId: string) => {
  router.push({ path: '/products', query: { category: categoryId } });
};

const goToBrandSearch = (brandName: string) => {
  router.push({ path: '/products', query: { brand: brandName } });
};
</script>

<template>
  <div class="space-y-20 pb-20">
    <!-- Hero Section with Carousel -->
    <section class="relative h-[650px] flex items-center justify-center overflow-hidden rounded-[40px] shadow-2xl mx-4">
      <TransitionGroup name="fade-hero">
        <div v-for="(banner, index) in banners" 
             :key="'banner-' + index"
             v-show="currentBannerIdx === index"
             class="absolute inset-0 w-full h-full">
          <img :src="banner.image" 
               class="absolute inset-0 w-full h-full object-cover transform scale-105" />
          <div class="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent"></div>
          
          <div class="relative z-10 container mx-auto px-10 h-full flex flex-col justify-center text-left">
            <div class="max-w-2xl space-y-6">
              <span class="inline-block px-4 py-1.5 bg-primary-500/20 backdrop-blur-md border border-primary-500/30 rounded-full text-primary-300 text-xs font-bold uppercase tracking-widest animate-fade-in-down">
                {{ banner.badge }}
              </span>
              <h1 class="text-6xl md:text-7xl font-bold text-white font-outfit leading-tight whitespace-pre-line animate-fade-in-up" v-html="banner.title">
              </h1>
              <p class="text-lg text-slate-200 font-medium max-w-lg leading-relaxed animate-fade-in-up delay-100">
                {{ banner.subtitle }}
              </p>
              <div class="flex items-center gap-4 pt-4 animate-fade-in-up delay-200">
                <button @click="router.push(banner.link || '/products')" class="btn-primary !py-4 !px-10 text-lg shadow-2xl shadow-primary-500/40 transform hover:scale-105 transition-all">
                  {{ banner.buttonText }}
                </button>
                <button @click="router.push('/products')" class="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-bold hover:bg-white/20 transition-all">
                  Saber más
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- Carousel Navigation Dots -->
      <div v-if="banners.length > 1" class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        <button 
          v-for="(_, index) in banners" 
          :key="'dot-' + index"
          @click="currentBannerIdx = index"
          :class="[
            'w-3 h-3 rounded-full transition-all duration-300',
            currentBannerIdx === index ? 'bg-primary-500 w-8' : 'bg-white/30 hover:bg-white/50'
          ]"
        ></button>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="container mx-auto px-4">
      <div class="flex items-end justify-between mb-10">
        <div>
          <h2 class="text-3xl font-bold text-slate-800 mb-2">Comprar por Categoría</h2>
          <div class="w-20 h-1.5 bg-primary-500 rounded-full"></div>
        </div>
        <router-link to="/products" class="text-primary-600 font-bold hover:underline">Ver todas</router-link>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <div v-for="category in categories" :key="category.id" 
             @click="goToSearch(category.id)"
             class="group cursor-pointer">
          <div class="aspect-square rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
            <img :src="category.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <h3 class="text-center font-bold text-slate-700 group-hover:text-primary-600 transition-colors uppercase text-xs tracking-widest">
            {{ category.name }}
          </h3>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="container mx-auto px-4 bg-white py-20 rounded-[60px] shadow-sm border border-slate-100">
      <div class="text-center mb-16 space-y-4">
        <h2 class="text-4xl font-bold text-slate-800">Productos Destacados</h2>
        <p class="text-slate-500 max-w-xl mx-auto">Seleccionamos lo mejor de nuestra cosecha tecnológica y natural para ti. Productos frescos e innovadores cada semana.</p>
      </div>

      <div v-if="productsLoading" class="flex justify-center">
        <font-awesome-icon icon="spinner" spin class="text-4xl text-primary-500" />
      </div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <ProductCard 
          v-for="product in featuredProducts" 
          :key="product.id"
          :product="product"
          :isFavorite="isFavorite(product.id)"
          @toggle-favorite="handleToggleFavorite"
        />
      </div>
    </section>

    <!-- Value Propositions -->
    <section class="container mx-auto px-4">
       <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
         <div class="p-8 bg-primary-50 rounded-3xl border border-primary-100 space-y-4 group hover:bg-primary-600 transition-colors duration-500">
           <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm group-hover:bg-primary-500 group-hover:text-white transition-colors">
             <font-awesome-icon icon="check-circle" class="text-2xl" />
           </div>
           <h3 class="text-xl font-bold text-slate-800 group-hover:text-white">Calidad Certificada</h3>
           <p class="text-slate-600 group-hover:text-primary-100 leading-relaxed">Todos nuestros productos pasan por un riguroso control de calidad antes de llegar a tus manos.</p>
         </div>

         <div class="p-8 bg-slate-900 rounded-3xl space-y-4 group">
           <div class="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/40">
             <font-awesome-icon icon="shopping-cart" class="text-2xl" />
           </div>
           <h3 class="text-xl font-bold text-white">Fácil y Seguro</h3>
           <p class="text-slate-400 leading-relaxed">Plataforma intuitiva con los más altos estándares de seguridad para tus pagos y datos personales.</p>
         </div>

         <div class="p-8 bg-indigo-50 rounded-3xl border border-indigo-100 space-y-4 group hover:bg-indigo-600 transition-colors duration-500">
           <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:bg-indigo-500 group-hover:text-white transition-colors">
             <font-awesome-icon icon="calendar-alt" class="text-2xl" />
           </div>
           <h3 class="text-xl font-bold text-slate-800 group-hover:text-white">Atención 24/7</h3>
           <p class="text-slate-600 group-hover:text-indigo-100 leading-relaxed">Nuestro equipo de soporte está siempre listo para ayudarte en lo que necesites.</p>
         </div>
       </div>
    </section>

    <!-- Allied Brands Logos -->
    <section v-if="marcasAliadas.length > 0" class="bg-slate-50 py-16 -mx-4 px-4 overflow-hidden">
      <div class="container mx-auto">
        <div class="text-center mb-10 space-y-2">
          <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest">Nuestras Alianzas Estratégicas</p>
          <h2 class="text-2xl font-bold text-slate-800">Marcas que Confían en Nosotros</h2>
        </div>
        
        <div class="flex flex-wrap items-center justify-center gap-12 md:gap-20 opacity-60 hover:opacity-100 transition-opacity duration-700">
           <div v-for="marca in marcasAliadas" :key="marca.name" 
                @click="goToBrandSearch(marca.name)"
                class="h-12 md:h-16 grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110 cursor-pointer">
              <img v-if="marca.logo" :src="marca.logo" :alt="marca.name" class="h-full w-auto object-contain" />
              <span v-else class="text-lg font-black text-slate-300 italic uppercase">{{ marca.name }}</span>
           </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="container mx-auto px-4 overflow-hidden py-10">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-slate-800">Lo que dicen de nosotros</h2>
      </div>

      <div class="flex flex-wrap justify-center gap-8">
        <div v-for="testimonial in testimonials" :key="testimonial.id" 
             class="max-w-md p-8 glass-effect rounded-[32px] border border-slate-100 relative shadow-sm hover:shadow-xl transition-shadow">
          <font-awesome-icon icon="quote-left" class="absolute top-6 right-8 text-primary-200 text-4xl opacity-50" />
          <p class="text-slate-700 italic leading-relaxed relative z-10 mb-6">"{{ testimonial.message }}"</p>
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 bg-slate-200 rounded-full"></div>
             <p class="font-bold text-slate-900 text-sm">- {{ testimonial.author }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Transiciones para el Carousel Hero */
.fade-hero-enter-active,
.fade-hero-leave-active {
  transition: opacity 1s ease-in-out;
}

.fade-hero-enter-from,
.fade-hero-leave-to {
  opacity: 0;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

.animate-fade-in-down {
  animation: fadeInDown 0.8s ease-out forwards;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>