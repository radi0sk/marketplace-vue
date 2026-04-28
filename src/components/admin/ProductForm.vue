<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  getCategories, 
  addCategory as createCategory 
} from '@/api/products';
import { db } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { uploadImageToCloudinary } from '@/services/cloudinary';
import { compressImage } from '@/utils/imageUtils';
import type { Product, Category, Feature } from '@/types/product';
import { 
  LINEAS_PRODUCCION, 
  ESPECIES_CULTIVOS, 
  ETAPAS_VIDA 
} from '@/constants/productConstants';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from "vue-toastification";

const props = defineProps<{
  id?: string;
  isEdit?: boolean;
}>();

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const fileInput = ref<HTMLInputElement | null>(null);
const categoryImageInput = ref<HTMLInputElement | null>(null);

const marcasAliadas = ref<{name: string, logo: string}[]>([]);

// State
const loading = ref(false);
const categories = ref<Category[]>([]);
const uploadedImages = ref<{ file?: File; preview: string; url?: string }[]>([]);
const showCategoryModal = ref(false);
const categoryLoading = ref(false);
const cardCommission = ref(5.5); // Default

const product = ref<Partial<Product>>({
  name: '',
  description: '',
  price: 0,
  cashPrice: 0,
  stock: 0,
  categoria: '',
  brand: '',
  model: '',
  sku: '',
  status: 'active',
  images: [],
  features: [],
  wholesaleMin: 0,
  wholesalePrice: 0,
  cost: 0,
  lineaProduccion: '',
  especieCultivo: [],
  etapaVida: '',
  ingredienteActivo: '',
  dosis: '',
  periodoCarencia: '',
  marcaFabricante: '',
  tags: []
});

const newCategory = ref({
  name: '',
  image: null as File | null,
  imagePreview: ''
});

const newFeature = ref<Feature>({
  name: '',
  value: ''
});

// Computed
const isFormValid = computed(() => {
  return product.value.name && 
         product.value.description && 
         product.value.cashPrice! > 0 && 
         product.value.categoria &&
         product.value.lineaProduccion;
});

// Watch cashPrice to calculate cardPrice
const calculateCardPrice = (val: number) => {
  if (val) {
    product.value.price = Number((val * (1 + cardCommission.value / 100)).toFixed(2));
  }
};

// Initial Load
onMounted(async () => {
  loading.value = true;
  try {
    const fetchedCategories = await getCategories();
    categories.value = fetchedCategories;

    const settingsSnap = await getDoc(doc(db, 'settings', 'app'));
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      marcasAliadas.value = data.marcasAliadas || [];
      cardCommission.value = data.cardCommission || 5.5;
    }

    if (props.isEdit && props.id) {
      const fetchedProduct = await getProductById(props.id);
      if (fetchedProduct) {
        product.value = { ...fetchedProduct };
        if (product.value.images) {
          uploadedImages.value = product.value.images.map(url => ({
            preview: url,
            url: url
          }));
        }
      }
    }
  } catch (error) {
    console.error('Error loading form data:', error);
    toast.error('Error al cargar datos del formulario');
  } finally {
    loading.value = false;
  }
});

// Methods - Images
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    addFiles(files);
  }
};

const addFiles = (files: File[]) => {
  if (uploadedImages.value.length + files.length > 10) {
    toast.warning('Máximo 10 imágenes permitidas');
    return;
  }

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImages.value.push({
        file: file,
        preview: e.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  });
};

const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files) {
    const files = Array.from(event.dataTransfer.files);
    addFiles(files);
  }
};

const removeImage = (index: number) => {
  uploadedImages.value.splice(index, 1);
};

const setMainImage = (index: number) => {
  if (index === 0) return;
  const item = uploadedImages.value.splice(index, 1)[0];
  uploadedImages.value.unshift(item);
};

// Methods - Features
const addFeature = () => {
  if (newFeature.value.name && newFeature.value.value) {
    if (!product.value.features) product.value.features = [];
    product.value.features.push({ ...newFeature.value });
    newFeature.value.name = '';
    newFeature.value.value = '';
  }
};

const removeFeature = (index: number) => {
  product.value.features?.splice(index, 1);
};

// Methods - Categories
const openCategoryModal = () => {
  showCategoryModal.value = true;
};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
  newCategory.value = { name: '', image: null, imagePreview: '' };
};

const triggerCategoryImageInput = () => {
  categoryImageInput.value?.click();
};

const handleCategoryImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files?.[0]) {
    const file = target.files[0];
    newCategory.value.image = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      newCategory.value.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const saveCategory = async () => {
  if (!newCategory.value.name) return;
  
  categoryLoading.value = true;
  try {
    let imageUrl = '';
    if (newCategory.value.image) {
      const compressed = await compressImage(newCategory.value.image, 800);
      imageUrl = await uploadImageToCloudinary(compressed);
    }
    
    const categoryResult = await createCategory({
      name: newCategory.value.name,
      image: imageUrl
    });
    
    const updatedCategories = await getCategories();
    categories.value = updatedCategories;
    product.value.categoria = categoryResult.id;
    
    toast.success('Categoría creada exitosamente');
    closeCategoryModal();
  } catch (error) {
    console.error('Error creating category:', error);
    toast.error('Error al crear la categoría');
  } finally {
    categoryLoading.value = false;
  }
};

// Submit
const submitProduct = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  try {
    const imageUrls: string[] = [];
    
    for (const img of uploadedImages.value) {
      if (img.url) {
        imageUrls.push(img.url);
      } else if (img.file) {
        toast.info(`Optimizando imagen ${imageUrls.length + 1}...`, { timeout: 1000 });
        const compressed = await compressImage(img.file, 1200);
        const url = await uploadImageToCloudinary(compressed);
        imageUrls.push(url);
      }
    }

    product.value.images = imageUrls;
    
    // Asignar vendedor si es nuevo
    if (!props.isEdit) {
      product.value.vendorId = authStore.user?.uid;
      product.value.vendorName = authStore.user?.role === 'admin' ? 'Tienda Principal' : authStore.user?.displayName;
      product.value.createdBy = authStore.user?.uid;
    }

    if (props.isEdit && props.id) {
      await updateProduct(props.id, product.value as Product);
      toast.success('Producto actualizado con éxito');
    } else {
      await createProduct(product.value as Product);
      toast.success('Producto creado con éxito');
    }

    router.push('/admin/products');
  } catch (error) {
    console.error('Error saving product:', error);
    toast.error('Error al guardar el producto');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="product-form-view space-y-8 animate-fade-in pb-20">
    <form @submit.prevent="submitProduct">
      <!-- Top Action Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
        <div>
          <nav class="flex mb-2" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2 text-xs font-medium text-slate-400">
              <li><router-link to="/admin/products" class="hover:text-primary-600 transition-colors">Productos</router-link></li>
              <li><i class="fas fa-chevron-right text-[8px]"></i></li>
              <li class="text-slate-600">{{ isEdit ? 'Editar' : 'Nuevo' }}</li>
            </ol>
          </nav>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">
            {{ isEdit ? 'Editar Producto' : 'Crear Nuevo Producto' }}
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <button 
            type="button" 
            @click="router.push('/admin/products')"
            class="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-all rounded-xl"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            :disabled="!isFormValid || loading"
            class="premium-btn px-8 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-primary-600/20 hover:bg-primary-700 disabled:opacity-50 disabled:grayscale transition-all flex items-center gap-2"
          >
            <i v-if="loading" class="fas fa-spinner fa-spin"></i>
            {{ isEdit ? 'Guardar Cambios' : 'Publicar Producto' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Form Column -->
        <div class="lg:col-span-2 space-y-8">
          <!-- General Info Card -->
          <div class="premium-card p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                <i class="fas fa-info-circle text-lg"></i>
              </div>
              <h2 class="text-xl font-bold text-slate-800 tracking-tight">Detalles del Producto</h2>
            </div>

            <div class="space-y-6">
              <div class="group">
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nombre</label>
                <input 
                  v-model="product.name" 
                  type="text" 
                  required 
                  placeholder="Ej. iPhone 15 Pro Max"
                  class="premium-input w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>

              <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Descripción</label>
                <textarea 
                  v-model="product.description" 
                  rows="6" 
                  required 
                  placeholder="Detalla las características y beneficios del producto..."
                  class="premium-input w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Multimedia Card -->
          <div class="premium-card p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <i class="fas fa-images text-lg"></i>
                </div>
                <h2 class="text-xl font-bold text-slate-800 tracking-tight">Multimedia</h2>
              </div>
              <span class="text-xs font-bold py-1 px-3 bg-slate-100 text-slate-500 rounded-full">
                {{ uploadedImages.length }}/10 imágenes
              </span>
            </div>

            <div 
              @click="triggerFileInput"
              @drop.prevent="handleDrop"
              @dragover.prevent
              class="relative group cursor-pointer"
            >
              <div class="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center group-hover:border-primary-400 group-hover:bg-primary-50/30 transition-all duration-300">
                <input ref="fileInput" type="file" multiple accept="image/*" class="sr-only" @change="handleImageUpload" />
                <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-white transition-all shadow-sm">
                  <i class="fas fa-cloud-upload-alt text-2xl text-slate-300 group-hover:text-primary-500"></i>
                </div>
                <p class="text-sm font-bold text-slate-700">Haz clic o arrastra imágenes</p>
                <p class="text-xs text-slate-400 mt-1 uppercase tracking-tight font-medium">Recomendado: 1080x1080px (MAX 5MB)</p>
              </div>
            </div>

            <!-- Preview Grid -->
            <TransitionGroup 
              name="list" 
              tag="div" 
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8"
              v-if="uploadedImages.length > 0"
            >
              <div 
                v-for="(img, index) in uploadedImages" 
                :key="index" 
                class="relative aspect-square rounded-2xl overflow-hidden group shadow-sm bg-slate-50"
              >
                <img :src="img.preview" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <button type="button" @click.stop="removeImage(index)" class="p-2 bg-rose-500 text-white rounded-lg hover:scale-110 transition-transform shadow-lg shadow-rose-500/20">
                    <i class="fas fa-trash-alt text-xs"></i>
                  </button>
                  <button v-if="index !== 0" type="button" @click.stop="setMainImage(index)" class="p-2 bg-white text-primary-600 rounded-lg hover:scale-110 transition-transform shadow-lg">
                    <i class="fas fa-star text-xs"></i>
                  </button>
                </div>

                <div v-if="index === 0" class="absolute top-2 left-2 px-2 py-0.5 bg-primary-600 text-[8px] font-black text-white uppercase tracking-widest rounded-md">Principal</div>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Sidebar Actions -->
        <div class="space-y-8">
          <!-- Pricing & Stock -->
          <div class="premium-card p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-l-4 border-emerald-500 pl-4">Valores</h3>
            
            <div class="space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-primary-600 mb-2">Precio Efectivo (Base)</label>
                  <div class="relative group">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary-400 group-focus-within:text-primary-600">Q</span>
                    <input 
                      v-model.number="product.cashPrice" 
                      @input="calculateCardPrice(($event.target as HTMLInputElement).valueAsNumber)"
                      type="number" 
                      step="0.01" 
                      required
                      class="w-full pl-9 pr-5 py-3 bg-primary-50 border-2 border-primary-100 rounded-xl font-bold text-primary-800 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none" 
                    />
                  </div>
                  <p class="text-[9px] text-primary-400 font-bold mt-1 uppercase italic">* Este es tu precio base libre de comisiones</p>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-2">Precio Tarjeta (Con +{{ cardCommission }}%)</label>
                  <div class="relative group">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-primary-600">Q</span>
                    <input v-model.number="product.price" type="number" step="0.01" class="w-full pl-9 pr-5 py-3 bg-slate-100 border-none rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-primary-500/20 transition-all" />
                  </div>
                  <p class="text-[9px] text-slate-400 font-bold mt-1 uppercase italic">Calculado según pasarela de pago</p>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Stock Disponible</label>
                <input v-model.number="product.stock" type="number" required class="w-full px-5 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-primary-500/20 transition-all" />
              </div>
            </div>
          </div>

          <!-- Agricultural Lifecycle -->
          <div class="premium-card p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-l-4 border-indigo-500 pl-4">Clasificación Agro</h3>
            
            <div class="space-y-6">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-xs font-bold text-slate-500">Categoría Interna</label>
                  <button @click="openCategoryModal" type="button" class="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-tighter cursor-pointer">+ Nueva</button>
                </div>
                <select v-model="product.categoria" required class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 outline-none">
                  <option value="" disabled>Seleccionar...</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Línea de Producción (Macro)</label>
                <select v-model="product.lineaProduccion" required class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 outline-none">
                  <option value="" disabled>Seleccionar línea...</option>
                  <option v-for="linea in LINEAS_PRODUCCION" :key="linea.id" :value="linea.id">{{ linea.name }}</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 mb-3">Especies / Cultivos Aptos</label>
                <div class="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl">
                  <label v-for="esp in ESPECIES_CULTIVOS" :key="esp.id" class="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      :value="esp.id" 
                      v-model="product.especieCultivo"
                      class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span class="text-xs font-medium text-slate-600 group-hover:text-slate-900">{{ esp.name }}</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Etapa de Vida / Crecimiento</label>
                <select v-model="product.etapaVida" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 outline-none">
                  <option value="">No aplica</option>
                  <optgroup label="Animales">
                    <option v-for="e in ETAPAS_VIDA.animal" :key="e" :value="e">{{ e }}</option>
                  </optgroup>
                  <optgroup label="Plantas">
                    <option v-for="e in ETAPAS_VIDA.planta" :key="e" :value="e">{{ e }}</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Estado de Publicación</label>
                <select v-model="product.status" class="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 outline-none">
                  <option value="active">Activo (Visible)</option>
                  <option value="draft">Borrador</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Technical Sheet -->
          <div class="premium-card p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-l-4 border-rose-500 pl-4">Ficha Técnica</h3>
            
            <div class="space-y-6">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Ingrediente Activo</label>
                <input v-model="product.ingredienteActivo" type="text" placeholder="Ej: Glifosato" class="w-full px-5 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Dosis / Presentación</label>
                <input v-model="product.dosis" type="text" placeholder="Ej: 1 L o Saco 100 lbs" class="w-full px-5 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Periodo de Carencia</label>
                <input v-model="product.periodoCarencia" type="text" placeholder="Ej: 15 días" class="w-full px-5 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 mb-2">Marca / Fabricante</label>
                <input 
                  v-model="product.marcaFabricante" 
                  type="text" 
                  list="marcas-list"
                  placeholder="Ej: Bayer" 
                  class="w-full px-5 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-primary-500/10 transition-all" 
                />
                <datalist id="marcas-list">
                  <option v-for="marca in marcasAliadas" :key="marca.name" :value="marca.name" />
                </datalist>
                <p v-if="marcasAliadas.some(m => m.name === product.marcaFabricante)" class="text-[9px] text-indigo-500 font-bold uppercase mt-1 flex items-center gap-1">
                  <i class="fas fa-check-circle"></i> Marca Aliada Verificada
                </p>
              </div>
            </div>
          </div>

          <!-- Specifications -->
          <div class="premium-card p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
            <h3 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-l-4 border-amber-500 pl-4">Ficha Técnica</h3>
            
            <div class="space-y-4">
              <TransitionGroup name="list" tag="div" class="space-y-2">
                <div v-for="(spec, index) in product.features" :key="index" class="flex gap-2 p-3 bg-slate-50 rounded-xl group relative">
                  <div class="flex-1">
                    <p class="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{{ spec.name }}</p>
                    <p class="text-xs font-bold text-slate-700 leading-none">{{ spec.value }}</p>
                  </div>
                  <button @click="removeFeature(index)" type="button" class="text-slate-300 hover:text-rose-500 transition-colors">
                    <i class="fas fa-times-circle"></i>
                  </button>
                </div>
              </TransitionGroup>
              
              <div class="pt-4 space-y-3">
                <div class="flex gap-2">
                  <input v-model="newFeature.name" placeholder="RAM" class="w-1/2 px-3 py-2 bg-slate-50 border-none rounded-lg text-xs font-bold" />
                  <input v-model="newFeature.value" placeholder="8GB" class="w-1/2 px-3 py-2 bg-slate-50 border-none rounded-lg text-xs font-bold" />
                </div>
                <button @click="addFeature" type="button" class="w-full py-2 border-2 border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-amber-400 hover:text-amber-600 transition-all">
                  + Agregar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <!-- Modal Categoría Moderno -->
    <Transition name="fade">
      <div v-if="showCategoryModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeCategoryModal"></div>
        <div class="relative bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
          <div class="p-8">
            <h3 class="text-2xl font-black text-slate-900 mb-6">Crear Categoría</h3>
            <div class="space-y-6">
              <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nombre</label>
                <input v-model="newCategory.name" type="text" class="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-slate-800" />
              </div>
              
              <div>
                <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Imagen de Referencia</label>
                <div class="flex items-center gap-4">
                  <div class="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img v-if="newCategory.imagePreview" :src="newCategory.imagePreview" class="w-full h-full object-cover" />
                    <i v-else class="fas fa-image text-slate-300"></i>
                  </div>
                  <button @click="triggerCategoryImageInput" type="button" class="text-xs font-bold text-primary-600 px-4 py-2 bg-primary-50 rounded-lg hover:bg-primary-100 transition-all">
                    Seleccionar Logo
                  </button>
                  <input ref="categoryImageInput" type="file" class="hidden" @change="handleCategoryImageUpload" accept="image/*" />
                </div>
              </div>
            </div>

            <div class="mt-10 flex gap-3">
              <button @click="closeCategoryModal" class="flex-1 py-3 text-sm font-bold text-slate-500">Cancelar</button>
              <button 
                @click="saveCategory" 
                :disabled="categoryLoading || !newCategory.name"
                class="flex-2 py-3 px-8 bg-primary-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary-600/20 disabled:opacity-50"
              >
                {{ categoryLoading ? 'Creando...' : 'Crear Categoría' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@reference "@/assets/main.css";

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scale-up {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-scale-up {
  animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}

.premium-input:focus {
  background: white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.premium-btn {
  transform: translateY(0);
}

.premium-btn:active {
  transform: translateY(2px);
}
</style>