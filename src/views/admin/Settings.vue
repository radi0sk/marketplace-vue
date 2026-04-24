<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { uploadFile } from '@/services/storage';
import { useToast } from 'vue-toastification';

const toast = useToast();
const loading = ref(true);
const saving = ref(false);
const activeTab = ref('general');
const heroInput = ref<HTMLInputElement | null>(null);
const brandLogoInputs = ref<Record<string, HTMLInputElement>>({});

const settings = ref({
  storeName: 'Agro Guate',
  contactEmail: 'ventas@agroguate.com',
  contactPhone: '+502 0000-0000',
  associateCommission: 10,
  currency: 'Q',
  shippingRates: [
    { category: 'General', cost: 50 },
    { category: 'Pesado (Concentrados)', cost: 40 },
    { category: 'Especial (Ganadería)', cost: 0 }
  ],
  marcasAliadas: [
    { name: 'Bayer', logo: 'https://res.cloudinary.com/drpa7s0kq/image/upload/v1746550804/yrlq5mnxwhjn4lpx0ma3.png' },
    { name: 'Syngenta', logo: '' },
    { name: 'Yara', logo: '' }
  ],
  banners: [
    {
      badge: 'Lo mejor del campo a tu hogar',
      title: 'Descubre la esencia de lo natural',
      subtitle: 'Encuentra los mejores productos agrícolas y tecnología especializada al mejor precio del mercado.',
      buttonText: 'Explorar Catálogo',
      image: 'https://res.cloudinary.com/dsfnladar/image/upload/v1744246734/onqmux4dzpoqmmkdblhk.png',
      link: '/products'
    }
  ]
});

const loadSettings = async () => {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'app'));
    if (docSnap.exists()) {
      settings.value = { ...settings.value, ...docSnap.data() };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  saving.value = true;
  try {
    await setDoc(doc(db, 'settings', 'app'), settings.value);
    toast.success('Configuración guardada correctamente');
  } catch (error) {
    toast.error('Error al guardar la configuración');
  } finally {
    saving.value = false;
  }
};

onMounted(loadSettings);

const addShippingRate = () => {
  settings.value.shippingRates.push({ category: '', cost: 0 });
};

const handleLogoUpload = async (event: any, index: number) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const path = `brands/${settings.value.marcasAliadas[index].name || 'brand'}-${Date.now()}`;
    const url = await uploadFile(file, path);
    settings.value.marcasAliadas[index].logo = url;
    toast.success('Logo subido');
  } catch (error) {
    toast.error('Error al subir logo');
  }
};

const handleHeroUpload = async (event: any, index: number) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    saving.value = true;
    const extension = file.name.split('.').pop();
    const path = `home/banner-${Date.now()}.${extension}`;
    const url = await uploadFile(file, path);
    settings.value.banners[index].image = url;
    toast.success('Imagen del banner actualizada');
  } catch (error) {
    console.error('Error uploading banner:', error);
    toast.error('Error al subir imagen. Verifica tu conexión.');
  } finally {
    saving.value = false;
  }
};

const addBanner = () => {
  settings.value.banners.push({
    badge: 'Nueva Oferta',
    title: 'Edita este título',
    subtitle: 'Añade una descripción impactante aquí.',
    buttonText: 'Ver más',
    image: '',
    link: '/products'
  });
};

const removeBanner = (index: number) => {
  if (settings.value.banners.length > 1) {
    settings.value.banners.splice(index, 1);
  } else {
    toast.warning('Debes tener al menos un banner');
  }
};

const addBrand = () => {
  settings.value.marcasAliadas.push({ name: '', logo: '' });
};

const triggerBrandLogo = (index: number) => {
  const el = document.getElementById(`brand_logo_${index}`);
  if (el) el.click();
};

const removeShippingRate = (index: number) => {
  settings.value.shippingRates.splice(index, 1);
};
</script>

<template>
  <div class="p-8 space-y-8 animate-fade-in max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Configuración del Sistema</h1>
        <p class="text-slate-500 font-medium text-sm">Gestiona los parámetros globales de tu marketplace agropecuario.</p>
      </div>
      <button 
        @click="saveSettings" 
        :disabled="saving"
        class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary-200 transition-all flex items-center gap-2 disabled:opacity-50"
      >
        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
        <i v-else class="fas fa-save"></i>
        {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
      </button>
    </div>

    <!-- Tabs Nav -->
    <div class="flex gap-2 p-1 bg-slate-100 rounded-3xl w-fit">
      <button 
        v-for="tab in ['general', 'ventas', 'envios', 'marcas', 'banners']" 
        :key="tab"
        @click="activeTab = tab"
        :class="[
          'px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all',
          activeTab === tab ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
        ]"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Tab Content -->
    <div v-if="loading" class="py-20 text-center">
      <i class="fas fa-spinner fa-spin text-3xl text-primary-200"></i>
    </div>

    <div v-else class="space-y-8">
      <!-- General Tab -->
      <section v-if="activeTab === 'general'" class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-3">
          <span class="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center"><i class="fas fa-info-circle"></i></span>
          Información General
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre de la Tienda</label>
            <input v-model="settings.storeName" type="text" class="input-modern" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Email de Contacto</label>
            <input v-model="settings.contactEmail" type="email" class="input-modern" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Teléfono Oficial</label>
            <input v-model="settings.contactPhone" type="text" class="input-modern" />
          </div>
          <div class="space-y-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Símbolo de Moneda</label>
            <input v-model="settings.currency" type="text" class="input-modern" maxlength="3" />
          </div>
        </div>
      </section>

      <!-- Ventas Tab -->
      <section v-if="activeTab === 'ventas'" class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-3">
          <span class="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><i class="fas fa-hand-holding-usd"></i></span>
          Parámetros de Venta y Asociados
        </h3>
        
        <div class="max-w-md space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Comisión de Asociados (%)</label>
            <div class="relative">
              <input v-model.number="settings.associateCommission" type="number" class="input-modern pr-12" />
              <span class="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
            </div>
            <p class="text-[10px] text-slate-400 italic mt-1 text-balance">Esta comisión se calcula automáticamente sobre cada venta que realice un asociado en tu plataforma.</p>
          </div>
        </div>
      </section>

      <!-- Envios Tab -->
      <section v-if="activeTab === 'envios'" class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-800 flex items-center gap-3">
            <span class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><i class="fas fa-truck"></i></span>
            Costos de Envío por Categoría
          </h3>
          <button @click="addShippingRate" class="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">+ Añadir Tarifa</button>
        </div>
        
        <div class="space-y-4">
          <div v-for="(rate, index) in settings.shippingRates" :key="index" class="flex items-end gap-4 p-4 bg-slate-50 rounded-2xl group relative overflow-hidden">
             <div class="flex-1 space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase">Categoría / Condición</label>
                <input v-model="rate.category" type="text" placeholder="Ej: Pesado" class="text-sm font-bold bg-white border-none rounded-xl px-4 py-2 w-full outline-none" />
             </div>
             <div class="w-32 space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase">Costo ({{ settings.currency }})</label>
                <input v-model.number="rate.cost" type="number" class="text-sm font-bold bg-white border-none rounded-xl px-4 py-2 w-full outline-none" />
             </div>
             <button @click="removeShippingRate(index)" class="p-2.5 text-rose-400 hover:text-rose-600 transition-colors">
               <i class="fas fa-trash-alt"></i>
             </button>
          </div>
        </div>
      </section>

      <!-- Marcas Tab -->
      <section v-if="activeTab === 'marcas'" class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-800 flex items-center gap-3">
            <span class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><i class="fas fa-handshake"></i></span>
            Marcas Aliadas / Fabricantes
          </h3>
          <button @click="addBrand" class="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">+ Añadir Marca</button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(marca, index) in settings.marcasAliadas" :key="index" class="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4 group relative transition-all hover:bg-white hover:shadow-xl">
            <!-- Brand Logo Area -->
            <div class="flex flex-col items-center gap-4">
              <div @click="triggerBrandLogo(index)" class="w-24 h-24 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary-300 transition-all group/logo">
                 <img v-if="marca.logo" :src="marca.logo" class="w-full h-full object-contain p-2" />
                 <i v-else class="fas fa-image text-slate-200 text-3xl group-hover/logo:text-primary-200"></i>
                 <div class="absolute inset-0 bg-primary-600/10 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
                    <i class="fas fa-camera text-primary-600"></i>
                 </div>
              </div>
              <input 
                type="file" 
                :id="`brand_logo_${index}`"
                class="hidden" 
                @change="handleLogoUpload($event, index)" 
                accept="image/*"
              />
              
              <div class="w-full relative">
                <input 
                  v-model="marca.name" 
                  type="text" 
                  placeholder="Nombre de la marca"
                  class="w-full bg-white border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none" 
                />
              </div>
            </div>

            <button @click="settings.marcasAliadas.splice(index, 1)" class="absolute -top-2 -right-2 w-8 h-8 bg-white text-rose-400 rounded-full shadow-lg border border-slate-100 flex items-center justify-center hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Estas marcas aparecerán como opciones sugeridas y tendrán un distintivo especial en la tienda.</p>
      </section>

      <!-- Banners Tab -->
      <section v-if="activeTab === 'banners'" class="space-y-12 animate-fade-in">
        <div class="flex items-center justify-between">
           <h3 class="text-xl font-bold text-slate-800">Gestionar Carrusel de Banners</h3>
           <button @click="addBanner" class="btn-primary !py-2 !px-6 text-xs uppercase tracking-widest">+ Añadir Banner</button>
        </div>

        <div v-for="(banner, index) in settings.banners" :key="index" class="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm space-y-8 relative group">
           <!-- Remove Button -->
           <button @click="removeBanner(index)" class="absolute top-6 right-6 w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white">
              <i class="fas fa-trash"></i>
           </button>

           <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <!-- Form -->
              <div class="space-y-6">
                <div class="flex items-center gap-3 mb-2">
                   <div class="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">{{ index + 1 }}</div>
                   <h4 class="font-bold text-slate-800">Contenido del Banner</h4>
                </div>

                <div class="space-y-4">
                  <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Badge</label>
                    <input v-model="banner.badge" type="text" class="input-modern !py-3" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título</label>
                    <input v-model="banner.title" type="text" class="input-modern !py-3 font-bold" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtítulo</label>
                    <textarea v-model="banner.subtitle" rows="2" class="input-modern !py-3 !rounded-2xl resize-none"></textarea>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Botón</label>
                      <input v-model="banner.buttonText" type="text" class="input-modern !py-3" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enlace</label>
                      <input v-model="banner.link" type="text" class="input-modern !py-3" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Image & Preview -->
              <div class="space-y-6">
                <div class="space-y-2">
                   <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Imagen de Fondo</label>
                   <div @click="document.getElementById(`banner_input_${index}`).click()" class="aspect-video bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group/img relative transition-all hover:border-primary-400">
                      <img v-if="banner.image" :src="banner.image" class="w-full h-full object-cover" />
                      <div v-else class="text-center">
                         <i class="fas fa-cloud-upload-alt text-3xl text-slate-300 mb-2"></i>
                         <p class="text-[10px] font-bold text-slate-400 uppercase">Click para subir</p>
                      </div>
                      <div class="absolute inset-0 bg-primary-600/20 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                         <span class="bg-white text-primary-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Cambiar Imagen</span>
                      </div>
                   </div>
                   <input 
                      type="file" 
                      :id="`banner_input_${index}`" 
                      class="hidden" 
                      @change="handleHeroUpload($event, index)" 
                      accept="image/*" 
                   />
                </div>

                <!-- Small Live Preview -->
                <div class="relative h-32 rounded-3xl overflow-hidden shadow-lg border border-slate-50">
                   <img :src="banner.image" class="absolute inset-0 w-full h-full object-cover" />
                   <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-6">
                      <div class="scale-50 origin-left">
                         <p class="text-xs text-primary-400 font-bold uppercase">{{ banner.badge }}</p>
                         <h4 class="text-white font-bold text-xl leading-tight max-w-[200px]">{{ banner.title }}</h4>
                      </div>
                   </div>
                   <div class="absolute top-2 right-2 px-2 py-1 bg-white/20 backdrop-blur-md rounded text-[8px] text-white font-bold uppercase">Previsualización</div>
                </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.input-modern {
  @apply w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 transition-all;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}
</style>
