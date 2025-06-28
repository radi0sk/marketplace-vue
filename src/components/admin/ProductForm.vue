<template>
  <form @submit.prevent="submitProduct" class="product-form">
    <div class="progress-indicator">
      <div :class="{'step-item': true, 'active': currentStep === 1, 'completed': currentStep > 1}">1. Básica</div>
      <div :class="{'step-item': true, 'active': currentStep === 2, 'completed': currentStep > 2}">2. Precios y Stock</div>
      <div :class="{'step-item': true, 'active': currentStep === 3, 'completed': currentStep > 3}">3. Imágenes</div>
      <div :class="{'step-item': true, 'active': currentStep === 4, 'completed': currentStep > 4}">4. Características</div>
      <div :class="{'step-item': true, 'active': currentStep === 5, 'completed': currentStep > 5}">5. Categoría y Envío</div>
    </div>

    <div v-if="currentStep === 1" class="form-section fade-in">
      <h2>Información Básica</h2>
      <div class="form-group">
        <label for="name">Nombre del Producto*</label>
        <input v-model="product.name" id="name" required class="form-input" placeholder="Ej: Camiseta de algodón premium" />
      </div>
      
      <div class="form-group">
        <label for="description">Descripción Detallada*</label>
        <textarea v-model="product.description" id="description" required class="form-textarea" placeholder="Describe tu producto, sus beneficios y usos..."></textarea>
      </div>
      
      <div class="form-group">
        <label for="sku">SKU/Código del Producto <small>(opcional - se generará automáticamente si está vacío)</small></label>
        <input v-model="product.sku" id="sku" class="form-input" placeholder="Ej: CAMI-PREM-001" />
      </div>
    </div>

    <div v-if="currentStep === 2" class="form-section fade-in">
      <h2>Precios y Stock</h2>
      <div class="price-grid">
        <div class="form-group">
          <label for="price">Precio*</label>
          <input v-model="product.price" type="number" step="0.01" id="price" required class="form-input" min="0" placeholder="0.00" />
        </div>
        
        <div class="form-group">
          <label for="cost">Costo por Unidad</label>
          <input v-model="product.cost" type="number" step="0.01" id="cost" class="form-input" min="0" placeholder="0.00" />
        </div>

        <div class="form-group">
          <label for="wholesaleMin">Mínimo para compra mayorista</label>
          <input 
            v-model="product.wholesaleMin" 
            type="number" 
            id="wholesaleMin" 
            class="form-input" 
            min="0"
            placeholder="0"
          />
        </div>
        
        <div class="form-group">
          <label for="wholesalePrice">Precio mayorista (opcional)</label>
          <input 
            v-model="product.wholesalePrice" 
            type="number" 
            step="0.01" 
            id="wholesalePrice" 
            class="form-input" 
            min="0"
            placeholder="0.00"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="stock">Stock Disponible*</label>
        <input v-model="product.stock" type="number" id="stock" required class="form-input" min="0" placeholder="0" />
      </div>
    </div>

    <div v-if="currentStep === 3" class="form-section fade-in">
      <h2>Imágenes del Producto</h2>
      <div class="image-uploader">
        <div class="upload-area" @click="triggerFileInput" @dragover.prevent="dragOver" @drop.prevent="handleDrop" :class="{'is-dragging': isDragging}">
          <input type="file" ref="fileInput" @change="handleImageUpload" multiple accept="image/*" class="hidden-input" />
          <div v-if="!uploadedImages.length" class="upload-prompt">
            <i class="upload-icon">📸</i>
            <p>Arrastra y suelta imágenes aquí o haz clic para seleccionar</p>
            <small>JPG, PNG, WEBP - Máx. 5MB por imagen</small>
          </div>
          <div v-else class="image-preview-container">
            <div v-for="(img, index) in uploadedImages" :key="index" class="image-preview-item">
              <img :src="img.preview" :alt="'Preview ' + (index + 1)" class="preview-image" />
              <button type="button" @click.stop="removeImage(index)" class="remove-image-btn">×</button>
              <div class="image-actions">
                <label class="image-checkbox">
                  <input type="radio" :name="'mainImage-' + _uid" :checked="index === 0" @change="setMainImage(index)" />
                  Principal
                </label>
              </div>
            </div>
          </div>
        </div>
        <small class="upload-hint">La primera imagen subida será la principal. Máximo 10 imágenes.</small>
      </div>
    </div>

    <div v-if="currentStep === 4" class="form-section fade-in">
      <h2>Características y Especificaciones</h2>
      <div class="specs-grid">
        <div class="form-group">
          <label for="brand">Marca</label>
          <input v-model="product.brand" id="brand" class="form-input" placeholder="Ej: Nike, Samsung" />
        </div>
        
        <div class="form-group">
          <label for="model">Modelo</label>
          <input v-model="product.model" id="model" class="form-input" placeholder="Ej: Air Max 270, Galaxy S23" />
        </div>
        
        <div class="form-group">
          <label for="weight">Peso (kg)</label>
          <input v-model="product.weight" type="number" step="0.01" id="weight" class="form-input" min="0" placeholder="0.5" />
        </div>
        
        <div class="form-group">
          <label for="dimensions">Dimensiones (LxAxA cm)</label>
          <input v-model="product.dimensions" id="dimensions" class="form-input" placeholder="Ej: 10x5x2 (cm)" />
        </div>
      </div>
      
      <div class="form-group">
        <label>Características Especiales</label>
        <small class="upload-hint">Agrega pares de Nombre-Valor (Ej: Color: Rojo, Material: Algodón)</small>
        <div class="features-list">
          <div v-for="(feature, index) in product.features" :key="index" class="feature-item">
            <input v-model="feature.name" placeholder="Nombre (Ej: Color)" class="form-input" />
            <input v-model="feature.value" placeholder="Valor (Ej: Azul)" class="form-input" />
            <button type="button" @click="removeFeature(index)" class="remove-btn" title="Eliminar característica">−</button>
          </div>
          <button type="button" @click="addFeature" class="add-btn">+ Agregar Característica</button>
        </div>
      </div>
    </div>

    <div v-if="currentStep === 5" class="form-section fade-in">
      <h2>Categoría y Envío</h2>
      <div class="form-group">
        <label for="category">Categoría Principal*</label>
        <div class="category-selector">
          <select v-model="product.categoria" id="category" required class="form-select">
            <option value="">Selecciona una categoría</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            <option value="new_category">+ Agregar nueva categoría</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="shippingType">Tipo de Envío</label>
        <select v-model="product.shippingType" id="shippingType" class="form-select">
          <option value="free">Envío Gratis</option>
          <option value="calculated">Calculado al pagar</option>
          <option value="fixed">Tarifa Fija</option>
        </select>
      </div>
      
      <div v-if="product.shippingType === 'fixed'" class="form-group fade-in">
        <label for="shippingCost">Costo de Envío Fijo</label>
        <input v-model="product.shippingCost" type="number" step="0.01" id="shippingCost" class="form-input" min="0" placeholder="0.00" />
      </div>
      
      <div class="form-group">
        <label for="availability">Disponibilidad</label>
        <select v-model="product.availability" id="availability" class="form-select">
          <option value="in_stock">En Stock</option>
          <option value="out_of_stock">Agotado</option>
          <option value="preorder">Preventa</option>
          <option value="backorder">Pedido Especial</option>
        </select>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" @click="prevStep" v-if="currentStep > 1" class="nav-btn prev-btn">
        <i class="arrow-icon left"></i> Anterior
      </button>
      <button type="button" @click="nextStep" v-if="currentStep < 5" class="nav-btn next-btn">
        Siguiente <i class="arrow-icon right"></i>
      </button>
      <button type="submit" :disabled="isSubmitting" v-if="currentStep === 5" class="submit-btn">
        {{ isSubmitting ? 'Guardando Producto...' : 'Guardar Producto' }}
      </button>
      <button type="button" @click="resetForm" class="cancel-btn">Limpiar Formulario</button>
      <router-link :to="`/admin/products`" class="cancel-btn link-btn">Cancelar</router-link>
    </div>

    <div v-if="showCategoryModal" class="modal-overlay" @click="closeCategoryModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Agregar Nueva Categoría</h3>
          <button type="button" @click="closeCategoryModal" class="modal-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="newCategoryName">Nombre de la categoría*</label>
            <input 
              v-model="newCategory.name" 
              id="newCategoryName" 
              class="form-input" 
              placeholder="Ingresa el nombre de la categoría"
              ref="categoryNameInput"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="newCategoryImage">Imagen de la categoría <small>(Opcional)</small></label>
            <input 
              type="file" 
              id="newCategoryImage" 
              @change="handleCategoryImageUpload" 
              accept="image/*" 
              class="form-input" 
            />
            <small class="upload-hint">Imagen representativa de la categoría (JPG, PNG, WEBP - Máx. 5MB)</small>
          </div>
          
          <div v-if="categoryImagePreview" class="image-preview">
            <img :src="categoryImagePreview" alt="Preview de categoría" class="category-image-preview" />
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            @click="saveCategoryAndClose" 
            :disabled="!newCategory.name.trim() || isSavingCategory"
            class="submit-btn"
          >
            {{ isSavingCategory ? 'Guardando...' : 'Guardar Categoría' }}
          </button>
          <button type="button" @click="closeCategoryModal" class="cancel-btn">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import { getCategories, addCategory } from '@/api/products';
import cloudinary from '@/services/cloudinary'; // Asegúrate de que esta ruta sea correcta

export default {
  props: {
    initialProduct: {
      type: Object,
      default: () => ({
        name: '',
        wholesaleMin: 0,
        wholesalePrice: 0,
        createdBy: '', // Si manejas usuarios, podrías pre-llenar esto
        createdAt: '',
        description: '',
        sku: '',
        price: 0,
        comparePrice: 0, // Campo no usado en el template, pero mantenido por si acaso
        cost: 0,
        stock: 0,
        brand: '',
        model: '',
        weight: 0,
        dimensions: '',
        features: [],
        categoria: '', // Cambiado de category a categoria para consistencia
        tags: '', // Asume que es un string separado por comas
        shippingType: 'free',
        shippingCost: 0,
        availability: 'in_stock',
        images: [] // URLs de imágenes ya subidas si es edición
      })
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      product: JSON.parse(JSON.stringify(this.initialProduct)),
      categories: [],
      uploadedImages: [], // Para archivos File y sus previews temporales
      isSubmitting: false,
      isDragging: false,
      currentStep: 1, // Controla el paso actual del formulario
      
      // Modal de categorías
      showCategoryModal: false,
      isSavingCategory: false,
      newCategory: {
        name: '',
        image: null // Archivo File de la imagen de la nueva categoría
      },
      categoryImagePreview: null // URL de preview para la imagen de la nueva categoría
    };
  },
  watch: {
    // Escucha el cambio en la selección de categoría para abrir el modal
    'product.categoria'(newVal) {
      if (newVal === 'new_category') {
        this.openCategoryModal();
      }
    },
    // Si estás editando, inicializa las imágenes ya subidas
    initialProduct: {
      immediate: true,
      handler(newVal) {
        if (this.isEditing && newVal.images && newVal.images.length > 0) {
          this.uploadedImages = newVal.images.map((url, index) => ({
            file: null, // No hay archivo File para imágenes ya en el servidor
            preview: url,
            isMain: index === 0 // Asume la primera es la principal
          }));
        }
      }
    }
  },
  async created() {
    // Carga las categorías existentes al iniciar el componente
    try {
      this.categories = await getCategories();
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      this.$emit('error', 'No se pudieron cargar las categorías. Intenta recargar.');
    }
  },
  methods: {
    // --- Métodos de Navegación por Pasos ---
    async nextStep() {
      // Validación básica antes de avanzar
      let isValid = true;
      let errorMessage = '';

      if (this.currentStep === 1) { // Información Básica
        if (!this.product.name.trim()) {
          errorMessage = 'El nombre del producto es obligatorio.';
          isValid = false;
        } else if (!this.product.description.trim()) {
          errorMessage = 'La descripción es obligatoria.';
          isValid = false;
        }
      } else if (this.currentStep === 2) { // Precios y Stock
        if (this.product.price === null || this.product.price <= 0) {
          errorMessage = 'El precio debe ser un número positivo.';
          isValid = false;
        } else if (this.product.stock === null || this.product.stock < 0) {
          errorMessage = 'El stock debe ser un número válido.';
          isValid = false;
        }
        if (this.product.wholesaleMin > 0 && this.product.wholesalePrice <= 0) {
          errorMessage = 'Si defines un mínimo mayorista, debes especificar un precio mayorista válido.';
          isValid = false;
        }
      } else if (this.currentStep === 3) { // Imágenes
        if (this.uploadedImages.length === 0 && !this.isEditing) { // Si es un producto nuevo, requiere al menos una imagen
          errorMessage = 'Por favor, sube al menos una imagen para el producto.';
          isValid = false;
        }
      } else if (this.currentStep === 5) { // Categoría y Envío (último paso antes de enviar)
        if (!this.product.categoria) {
          errorMessage = 'Debes seleccionar una categoría para el producto.';
          isValid = false;
        }
        if (this.product.shippingType === 'fixed' && (this.product.shippingCost === null || this.product.shippingCost < 0)) {
          errorMessage = 'El costo de envío fijo debe ser un número válido.';
          isValid = false;
        }
      }
      
      if (!isValid) {
        this.$emit('error', errorMessage);
        return;
      }

      if (this.currentStep < 5) {
        this.currentStep++;
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazarse al inicio del formulario
      }
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazarse al inicio del formulario
      }
    },

    // --- Métodos del Modal de Categorías ---
    openCategoryModal() {
      this.showCategoryModal = true;
      this.resetCategoryForm();
      // Asegurarse de que el input tenga foco una vez que el modal sea visible
      this.$nextTick(() => {
        if (this.$refs.categoryNameInput) {
          this.$refs.categoryNameInput.focus();
        }
      });
    },
    
    closeCategoryModal() {
      this.showCategoryModal = false;
      this.product.categoria = ''; // Restablecer la selección si el usuario cancela
      this.resetCategoryForm();
    },
    
    resetCategoryForm() {
      this.newCategory = {
        name: '',
        image: null
      };
      if (this.categoryImagePreview) {
        URL.revokeObjectURL(this.categoryImagePreview); // Libera la URL del preview
      }
      this.categoryImagePreview = null;
    },
    
    handleCategoryImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.$emit('error', 'Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
        event.target.value = ''; // Limpiar el input para permitir una nueva selección
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5 MB
      if (file.size > maxSize) {
        this.$emit('error', 'La imagen no puede ser mayor a 5MB.');
        event.target.value = '';
        return;
      }
      
      this.newCategory.image = file;
      
      // Crear URL de objeto para la previsualización
      if (this.categoryImagePreview) {
        URL.revokeObjectURL(this.categoryImagePreview); // Libera la URL anterior si existe
      }
      this.categoryImagePreview = URL.createObjectURL(file);
    },
    
    async saveCategoryAndClose() {
      if (!this.newCategory.name.trim()) {
        this.$emit('error', 'El nombre de la categoría es requerido.');
        return;
      }
      
      this.isSavingCategory = true;
      
      try {
        let imageUrl = null;
        
        // Subir imagen si existe
        if (this.newCategory.image) {
          try {
            imageUrl = await cloudinary.uploadImage(this.newCategory.image);
            if (!imageUrl) {
               console.warn('Cloudinary no devolvió URL para la imagen de categoría.');
            }
          } catch (error) {
            console.warn('Error al subir imagen de categoría:', error);
            this.$emit('error', `Error al subir la imagen de la categoría: ${error.message}`);
            // Continuar sin imagen si falla la subida
          }
        }
        
        // Crear objeto de categoría
        const categoryData = {
          name: this.newCategory.name.trim(),
          image: imageUrl || '' // Guarda la URL de la imagen o una cadena vacía
        };
        
        // Llamar a la API para guardar la categoría
        const savedCategory = await addCategory(categoryData);
        
        // Agregar a la lista local de categorías y seleccionar la nueva
        this.categories.push(savedCategory);
        this.product.categoria = savedCategory.id;
        
        // Cerrar modal y limpiar formulario
        this.showCategoryModal = false;
        this.resetCategoryForm();
        
        this.$emit('info', 'Categoría creada exitosamente.');
        
      } catch (error) {
        console.error('Error al guardar categoría:', error);
        this.$emit('error', `Error al guardar la categoría: ${error.message || 'Error desconocido'}`);
      } finally {
        this.isSavingCategory = false;
      }
    },

    // --- Métodos para Subida de Imágenes del Producto ---
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    async handleImageUpload(event) {
      const files = event.target.files;
      if (!files.length) return;
      
      await this.processFiles(files);
      event.target.value = ''; // Limpiar el input de archivo para poder subir los mismos archivos de nuevo
    },
    
    handleDrop(event) {
      this.isDragging = false;
      const files = event.dataTransfer.files;
      if (!files.length) return;
      
      this.processFiles(files);
    },
    
    dragOver() {
      this.isDragging = true;
    },
    dragLeave() {
      this.isDragging = false;
    },
    
    processFiles(files) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5 MB

      const newFiles = Array.from(files).filter(file => {
        const isValidType = allowedTypes.includes(file.type);
        const isValidSize = file.size <= maxSize;
        if (!isValidType) {
          this.$emit('error', `El archivo ${file.name} no es una imagen válida (JPG, PNG, WEBP).`);
        }
        if (!isValidSize) {
          this.$emit('error', `El archivo ${file.name} es demasiado grande (máx. 5MB).`);
        }
        return isValidType && isValidSize;
      });
      
      const remainingSlots = 10 - this.uploadedImages.length;
      const filesToProcess = newFiles.slice(0, remainingSlots);

      if (filesToProcess.length < newFiles.length) {
        this.$emit('info', `Se omitieron ${newFiles.length - filesToProcess.length} archivos para no exceder el límite de 10 imágenes.`);
      }
      
      filesToProcess.forEach(file => {
        const preview = URL.createObjectURL(file);
        // Aquí no asumimos isMain, se maneja con el radio button
        this.uploadedImages.push({ file, preview, isMain: false });
      });

      // Si no hay ninguna imagen principal, la primera subida se convierte en la principal
      if (!this.uploadedImages.some(img => img.isMain)) {
        if (this.uploadedImages.length > 0) {
          this.setMainImage(0); // Establece la primera imagen como principal
        }
      }
    },
    
    removeImage(index) {
      // Revocar la URL del objeto antes de eliminar para liberar memoria
      URL.revokeObjectURL(this.uploadedImages[index].preview);
      this.uploadedImages.splice(index, 1);

      // Si se eliminó la imagen principal, la nueva primera se convierte en principal
      if (this.uploadedImages.length > 0 && !this.uploadedImages.some(img => img.isMain)) {
        this.setMainImage(0);
      }
    },
    
    setMainImage(index) {
      // Asegura que solo una imagen sea principal
      this.uploadedImages.forEach((img, i) => {
        img.isMain = i === index;
      });
      // Mueve la imagen principal al inicio del array para que sea la primera
      const mainImg = this.uploadedImages.splice(index, 1)[0];
      this.uploadedImages.unshift(mainImg);
    },
    
    // --- Métodos para Características Especiales ---
    addFeature() {
      this.product.features.push({ name: '', value: '' });
    },
    
    removeFeature(index) {
      this.product.features.splice(index, 1);
    },
    
    // --- Métodos Generales del Formulario ---
    generateSKU() {
      // Generación de SKU más robusta
      const namePart = this.product.name.replace(/\s/g, '').substring(0, 4).toUpperCase();
      const brandPart = this.product.brand ? this.product.brand.replace(/\s/g, '').substring(0, 3).toUpperCase() : '';
      const categoryPart = this.product.categoria 
        ? this.categories.find(c => c.id === this.product.categoria)?.name.replace(/\s/g, '').substring(0, 3).toUpperCase() 
        : '';
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 caracteres alfanuméricos

      return `${namePart}${brandPart}${categoryPart}-${randomPart}`.replace(/[^A-Z0-9-]/g, '').slice(0, 20); // Limitar a 20 chars
    },
    
    resetForm() {
      // Restablece el producto a su estado inicial
      this.product = JSON.parse(JSON.stringify(this.initialProduct));
      // Libera las URLs de objetos para las imágenes para evitar fugas de memoria
      this.uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
      this.uploadedImages = [];
      this.currentStep = 1; // Vuelve al primer paso
      this.$emit('info', 'Formulario reiniciado.');
    },
    
    async uploadImages() {
      const uploadedUrls = [];
      let uploadErrors = [];
      
      for (const img of this.uploadedImages) {
        // Solo sube archivos si son nuevos (es decir, tienen un objeto File)
        if (img.file) { 
          try {
            const url = await cloudinary.uploadImage(img.file);
            if (url) {
              uploadedUrls.push(url);
            } else {
              uploadErrors.push(`No se recibió URL para la imagen: ${img.file.name}`);
            }
          } catch (error) {
            uploadErrors.push(`Error al subir ${img.file.name}: ${error.message}`);
            console.error('Error al subir imagen específica:', error);
          }
        } else {
          // Si no tiene file, asume que ya es una URL existente (en modo edición)
          uploadedUrls.push(img.preview); 
        }
      }
      
      if (uploadErrors.length > 0) {
        const errorMsg = 'Algunas imágenes no se pudieron subir: ' + uploadErrors.join('; ');
        this.$emit('error', errorMsg);
        // Si no se subió ninguna imagen nueva, pero había URLs existentes, se usan las existentes
        if (uploadedUrls.length === 0 && this.uploadedImages.some(img => !img.file)) {
          return this.uploadedImages.filter(img => !img.file).map(img => img.preview);
        } else if (uploadedUrls.length === 0) {
          throw new Error('No se pudo subir ninguna imagen nueva.');
        }
      }
      
      return uploadedUrls;
    },
    
    async submitProduct() {
      // Validar el último paso antes de enviar
      let isValidFinal = true;
      let errorMessageFinal = '';
      if (!this.product.categoria) {
        errorMessageFinal = 'Debes seleccionar una categoría para el producto.';
        isValidFinal = false;
      }
      if (this.product.shippingType === 'fixed' && (this.product.shippingCost === null || this.product.shippingCost < 0)) {
        errorMessageFinal = 'El costo de envío fijo debe ser un número válido.';
        isValidFinal = false;
      }

      if (!isValidFinal) {
        this.$emit('error', errorMessageFinal);
        this.currentStep = 5; // Mueve al usuario al último paso si hay un error allí
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }


      this.isSubmitting = true;
      try {
        // Asegurarse de que el SKU se genere si está vacío
        if (!this.product.sku) {
          this.product.sku = this.generateSKU();
        }
        
        let imageUrls = [];
        if (this.uploadedImages.length > 0) {
          try {
            imageUrls = await this.uploadImages();
          } catch (error) {
            // Este error ya debería emitirse en uploadImages
            throw new Error(`Error fatal al subir las imágenes: ${error.message}`);
          }
        } else if (!this.isEditing) {
          // Si es un producto nuevo y no hay imágenes, lanzar error
          throw new Error('Debe subir al menos una imagen para el producto nuevo.');
        }

        // Determinar la imagen principal final
        const mainImageFinal = imageUrls.length > 0 ? imageUrls[0] : null;
        
        // MODIFICACIÓN CLAVE AQUÍ PARA MANEJAR `tags` COMO ARRAY O STRING
        let processedTags = this.product.tags;
        if (Array.isArray(processedTags)) {
          // Si ya es un array, lo unimos en un string separado por comas
          processedTags = processedTags.join(', ');
        }
        // Ahora, nos aseguramos de que sea un string (o vacío si es null/undefined) y lo dividimos
        const finalTags = (String(processedTags || '')).split(',').map(tag => tag.trim()).filter(tag => tag);

        const productData = {
          ...this.product,
          price: parseFloat(this.product.price),
          cost: parseFloat(this.product.cost),
          wholesaleMin: parseInt(this.product.wholesaleMin),
          wholesalePrice: parseFloat(this.product.wholesalePrice),
          stock: parseInt(this.product.stock),
          weight: parseFloat(this.product.weight),
          shippingCost: parseFloat(this.product.shippingCost),
          
          features: this.product.features.filter(f => f.name.trim() && f.value.trim()),
          tags: finalTags, // Usamos los tags ya procesados
          images: imageUrls, // Lista de todas las URLs de imágenes
          mainImage: mainImageFinal, // La URL de la imagen principal
          createdAt: this.product.createdAt || new Date().toISOString(), // Mantener si existe, sino crear
          updatedAt: new Date().toISOString()
        };
        
        this.$emit('product-submitted', productData);
        // Opcional: reiniciar formulario después de un envío exitoso
        // this.resetForm(); 

      } catch (error) {
        console.error("Error en el formulario de envío:", error);
        this.$emit('error', error.message || 'Ocurrió un error al guardar el producto.');
      } finally {
        this.isSubmitting = false;
      }
    }
  },
  
  beforeUnmount() {
    // Limpiar URLs de objetos para evitar fugas de memoria cuando el componente se destruye
    this.uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
    if (this.categoryImagePreview) {
      URL.revokeObjectURL(this.categoryImagePreview);
    }
  }
};
</script>

<style scoped>
/* Estilos Base del Formulario */
.product-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Inter', sans-serif;
}

.form-section {
  margin-bottom: 30px;
  padding: 25px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fcfcfc;
  transition: all 0.4s ease-in-out;
}

.form-section h2 {
  font-size: 1.6rem;
  color: #2c3e50;
  margin-bottom: 25px;
  border-bottom: 2px solid #42b983;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  color: #34495e;
  font-size: 0.95rem;
}

.form-group small {
  color: #7f8c8d;
  font-size: 0.85rem;
  margin-top: 5px;
  display: block;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #c9d2da;
  border-radius: 6px;
  font-size: 1rem;
  color: #333;
  transition: all 0.3s ease;
  box-sizing: border-box; /* Asegura que padding no aumente el ancho total */
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
  outline: none;
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

/* Grids para mejor organización */
.price-grid, .specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

/* Sección de Carga de Imágenes */
.image-uploader {
  margin-top: 20px;
}

.upload-area {
  border: 3px dashed #aed581;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fff6;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.upload-area.is-dragging {
  border-color: #42b983;
  background: #e6ffe6;
  box-shadow: 0 0 0 4px rgba(66, 185, 131, 0.3);
}

.upload-prompt {
  color: #6c7a89;
}

.upload-icon {
  font-size: 3.5rem;
  margin-bottom: 15px;
  color: #79a66d; /* Un tono de verde más oscuro */
}

.upload-hint {
  display: block;
  margin-top: 10px;
  color: #666;
  font-size: 0.88rem;
}

.image-preview-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 15px;
  width: 100%;
}

.image-preview-item {
  position: relative;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.preview-image {
  width: 100%;
  height: 130px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(255, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.remove-image-btn:hover {
  background: #e74c3c;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 6px;
  text-align: center;
  color: white;
  font-size: 0.85rem;
}

.image-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
}

.image-checkbox input[type="radio"] {
  accent-color: #42b983; /* Color para el radio button */
}

/* Características Especiales */
.features-list {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background-color: #fff;
}

.feature-item {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-item input {
  flex: 1;
}

.remove-btn, .add-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.remove-btn {
  background: #e74c3c;
  color: white;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #c0392b;
}

.add-btn {
  background: #42b983;
  color: white;
  margin-top: 15px;
  display: block;
  width: auto;
  min-width: 180px;
  text-align: center;
}

.add-btn:hover {
  background: #369f6e;
}

/* Acciones del Formulario */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.submit-btn, .nav-btn, .cancel-btn {
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none; /* Para router-link */
}

.submit-btn {
  background: #42b983;
  color: white;
}

.submit-btn:hover {
  background: #369f6e;
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.nav-btn {
  background: #3498db;
  color: white;
}

.nav-btn:hover {
  background: #2980b9;
}

.cancel-btn {
  background: #e0e0e0;
  color: #555;
}

.cancel-btn:hover {
  background: #c9c9c9;
  color: #333;
}

.link-btn {
  padding: 12px 25px; /* Asegura que el router-link tenga el mismo padding */
  display: flex; /* Para alinear íconos si se añaden */
  align-items: center;
}


.hidden-input {
  display: none;
}

/* --- Estilos del Indicador de Progreso --- */
.progress-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 10px 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  flex-wrap: wrap; /* Permite que los pasos se envuelvan en pantallas pequeñas */
}

.step-item {
  padding: 12px 20px;
  border-radius: 8px;
  background-color: #e9ecef;
  color: #6c7a89;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  flex: 1; /* Distribuye el espacio equitativamente */
  text-align: center;
  margin: 0 5px; /* Espacio entre los pasos */
  white-space: nowrap; /* Evita que el texto se rompa */
}

.step-item.active {
  background-color: #42b983;
  color: white;
  box-shadow: 0 3px 10px rgba(66, 185, 131, 0.3);
  transform: translateY(-2px); /* Pequeño efecto de elevación */
}

.step-item.completed {
  background-color: #8bc34a; /* Un verde intermedio para completado */
  color: white;
}

/* Flechas entre pasos */
.step-item:not(:last-child)::after {
  content: '→'; /* Flecha */
  position: absolute;
  right: -18px; /* Ajusta la posición de la flecha */
  top: 50%;
  transform: translateY(-50%);
  color: #c0c7d0;
  font-size: 1.2rem;
  font-weight: bold;
}

.step-item.completed:not(:last-child)::after {
  color: #689f38; /* Flecha verde si el paso anterior está completado */
}

/* Animación de entrada para los pasos */
.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --- Estilos del Modal --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeInOverlay 0.3s ease-out;
}

@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 10px;
  min-width: 550px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.35);
  animation: slideInFromTop 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.4rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #999;
  padding: 5px;
  line-height: 1;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: #555;
  transform: rotate(90deg);
}

.modal-body {
  padding: 25px;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: #f8f9fa;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.category-image-preview {
  max-width: 200px;
  max-height: 150px;
  object-fit: contain; /* Cambiado a 'contain' para ver la imagen completa */
  border-radius: 6px;
  border: 1px solid #ddd;
  margin-top: 15px;
}

/* Iconos de flecha para botones de navegación */
.arrow-icon {
  display: inline-block;
  width: 0;
  height: 0;
  border-style: solid;
  vertical-align: middle;
}

.arrow-icon.left {
  border-width: 6px 8px 6px 0;
  border-color: transparent #fff transparent transparent;
}

.arrow-icon.right {
  border-width: 6px 0 6px 8px;
  border-color: transparent transparent transparent #fff;
}

/* Media Queries para responsividad */
@media (max-width: 768px) {
  .product-form {
    padding: 15px;
  }

  .price-grid, .specs-grid {
    grid-template-columns: 1fr; /* Una columna en móviles */
  }

  .progress-indicator {
    padding: 8px;
    flex-wrap: wrap;
    gap: 5px;
  }

  .step-item {
    padding: 10px 12px;
    font-size: 0.85rem;
    flex: auto; /* Permite que los elementos se ajusten al contenido */
    margin: 3px;
  }

  .step-item:not(:last-child)::after {
    right: -10px;
    font-size: 1rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .submit-btn, .nav-btn, .cancel-btn, .link-btn {
    width: 100%;
    text-align: center;
    padding: 10px 15px;
    font-size: 0.95rem;
  }

  .modal-content {
    min-width: unset;
    width: 95vw;
  }
  
  .upload-area {
    padding: 20px;
  }

  .upload-icon {
    font-size: 2.5rem;
  }

  .image-preview-container {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>