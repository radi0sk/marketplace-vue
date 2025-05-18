<template>
  <form @submit.prevent="submitProduct" class="product-form">
    <div class="form-section">
      <h2>Información Básica</h2>
      <div class="form-group">
        <label for="name">Nombre del Producto*</label>
        <input v-model="product.name" id="name" required class="form-input" />
      </div>
      
      <div class="form-group">
        <label for="description">Descripción Detallada*</label>
        <textarea v-model="product.description" id="description" required class="form-textarea"></textarea>
      </div>
      
      <div class="form-group">
    <label for="sku">SKU/Código del Producto <small>(opcional - se generará automáticamente)</small></label>
    <input v-model="product.sku" id="sku" class="form-input" placeholder="Dejar vacío para generación automática" />
  </div>
    </div>

    <div class="form-section">
      <h2>Precios y Stock</h2>
      <div class="price-grid">
        <div class="form-group">
          <label for="price">Precio*</label>
          <input v-model="product.price" type="number" step="0.01" id="price" required class="form-input" />
        </div>
        
        <div class="form-group">
        <label for="wholesaleMin">Mínimo para compra mayorista</label>
        <input 
          v-model="product.wholesaleMin" 
          type="number" 
          id="wholesaleMin" 
          class="form-input" 
          min="0"
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
        />
      </div>
        
        <div class="form-group">
          <label for="cost">Costo por Unidad</label>
          <input v-model="product.cost" type="number" step="0.01" id="cost" class="form-input" />
        </div>
      </div>
      
      <div class="form-group">
        <label for="stock">Stock Disponible*</label>
        <input v-model="product.stock" type="number" id="stock" required class="form-input" />
      </div>
    </div>

    <div class="form-section">
      <h2>Imágenes del Producto</h2>
      <div class="image-uploader">
        <div class="upload-area" @click="triggerFileInput" @dragover.prevent="dragOver" @drop.prevent="handleDrop">
          <input type="file" ref="fileInput" @change="handleImageUpload" multiple accept="image/*" class="hidden-input" />
          <div v-if="!uploadedImages.length" class="upload-prompt">
            <i class="upload-icon">📁</i>
            <p>Arrastra y suelta imágenes aquí o haz clic para seleccionar</p>
          </div>
          <div v-else class="image-preview-container">
            <div v-for="(img, index) in uploadedImages" :key="index" class="image-preview-item">
              <img :src="img.preview" :alt="'Preview ' + (index + 1)" class="preview-image" />
              <button type="button" @click.stop="removeImage(index)" class="remove-image-btn">×</button>
              <div class="image-actions">
                <label class="image-checkbox">
                  <input type="radio" name="mainImage" :checked="index === 0" @change="setMainImage(index)" />
                  Principal
                </label>
              </div>
            </div>
          </div>
        </div>
        <small class="upload-hint">La primera imagen será la principal. Máximo 10 imágenes.</small>
      </div>
    </div>

    <div class="form-section">
      <h2>Características y Especificaciones</h2>
      <div class="specs-grid">
        <div class="form-group">
          <label for="brand">Marca</label>
          <input v-model="product.brand" id="brand" class="form-input" />
        </div>
        
        <div class="form-group">
          <label for="model">Modelo</label>
          <input v-model="product.model" id="model" class="form-input" />
        </div>
        
        <div class="form-group">
          <label for="weight">Peso (kg)</label>
          <input v-model="product.weight" type="number" step="0.01" id="weight" class="form-input" />
        </div>
        
        <div class="form-group">
          <label for="dimensions">Dimensiones (LxAxA cm)</label>
          <input v-model="product.dimensions" id="dimensions" class="form-input" />
        </div>
      </div>
      
      <div class="form-group">
        <label>Características Especiales</label>
        <div class="features-list">
          <div v-for="(feature, index) in product.features" :key="index" class="feature-item">
            <input v-model="feature.name" placeholder="Nombre de la característica" class="form-input" />
            <input v-model="feature.value" placeholder="Valor" class="form-input" />
            <button type="button" @click="removeFeature(index)" class="remove-btn">−</button>
          </div>
          <button type="button" @click="addFeature" class="add-btn">+ Agregar Característica</button>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h2>Categorización</h2>
      <div class="form-group">
        <label for="category">Categoría Principal*</label>
        <select v-model="product.category" id="category" required class="form-select">
          <option value="">Selecciona una categoría</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="tags">Etiquetas (separadas por comas)</label>
        <input v-model="product.tags" id="tags" class="form-input" />
      </div>
    </div>

    <div class="form-section">
      <h2>Envío y Disponibilidad</h2>
      <div class="form-group">
        <label for="shippingType">Tipo de Envío</label>
        <select v-model="product.shippingType" id="shippingType" class="form-select">
          <option value="free">Envío Gratis</option>
          <option value="calculated">Calculado al pagar</option>
          <option value="fixed">Tarifa Fija</option>
        </select>
      </div>
      
      <div v-if="product.shippingType === 'fixed'" class="form-group">
        <label for="shippingCost">Costo de Envío Fijo</label>
        <input v-model="product.shippingCost" type="number" step="0.01" id="shippingCost" class="form-input" />
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
      <button type="submit" :disabled="isSubmitting" class="submit-btn">
        {{ isSubmitting ? 'Guardando...' : 'Guardar Producto' }}
      </button>
      <button type="button" @click="resetForm" class="cancel-btn">Cancelar</button>
    </div>
  </form>
</template>

<script>
import { getCategories } from '@/api/products';
import cloudinary from '@/services/cloudinary';

export default {
  props: {
    initialProduct: {
      type: Object,
      default: () => ({
        name: '',
        wholesaleMin: 0,
        wholesalePrice: 0,
        createdBy: '',
        createdAt: '',
        description: '',
        sku: '',
        price: 0,
        comparePrice: 0,
        cost: 0,
        stock: 0,
        brand: '',
        model: '',
        weight: 0,
        dimensions: '',
        features: [],
        category: '',
        tags: '',
        shippingType: 'free',
        shippingCost: 0,
        availability: 'in_stock',
        images: []
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
      uploadedImages: [],
      isSubmitting: false,
      isDragging: false
    };
  },
  async created() {
    try {
      this.categories = await getCategories();
    } catch (error) {
      console.error('Error loading categories:', error);
      this.$emit('error', 'No se pudieron cargar las categorías');
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    async handleImageUpload(event) {
      const files = event.target.files;
      if (!files.length) return;
      
      await this.processFiles(files);
      this.$refs.fileInput.value = ''; // Reset input
    },
    async handleDrop(event) {
      this.isDragging = false;
      const files = event.dataTransfer.files;
      if (!files.length) return;
      
      await this.processFiles(files);
    },
    dragOver() {
      this.isDragging = true;
    },
    async processFiles(files) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const validFiles = Array.from(files).filter(file => 
        allowedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024
      );
      
      if (validFiles.length !== files.length) {
        this.$emit('error', 'Algunos archivos no son imágenes válidas o son demasiado grandes (máx. 5MB)');
      }
      
      // Limitar a 10 imágenes
      const remainingSlots = 10 - this.uploadedImages.length;
      const filesToProcess = validFiles.slice(0, remainingSlots);
      
      for (const file of filesToProcess) {
        const preview = URL.createObjectURL(file);
        this.uploadedImages.push({ file, preview, isMain: false });
      }
    },
    removeImage(index) {
      URL.revokeObjectURL(this.uploadedImages[index].preview);
      this.uploadedImages.splice(index, 1);
    },
    setMainImage(index) {
      this.uploadedImages.forEach((img, i) => {
        img.isMain = i === index;
      });
      // Move main image to first position
      const mainImg = this.uploadedImages.splice(index, 1)[0];
      this.uploadedImages.unshift(mainImg);
    },
    addFeature() {
      this.product.features.push({ name: '', value: '' });
    },
    removeFeature(index) {
      this.product.features.splice(index, 1);
    },
    generateSKU() {
      // Genera un SKU basado en la marca, categoría y timestamp
      const brandPrefix = this.product.brand 
        ? this.product.brand.substring(0, 3).toUpperCase() 
        : 'GEN';
      const categoryCode = this.product.category 
        ? this.categories.find(c => c.id === this.product.category)?.name.substring(0, 3).toUpperCase() 
        : 'PROD';
      const timestamp = Date.now().toString().slice(-4);
      
      return `${brandPrefix}-${categoryCode}-${timestamp}`;
    },
    resetForm() {
      this.product = JSON.parse(JSON.stringify(this.initialProduct));
      this.uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
      this.uploadedImages = [];
    },
    async uploadImages() // Método corregido para ProductForm.vue

 {
  const uploadedUrls = [];
  let hasFailures = false;
  
  try {
    for (const img of this.uploadedImages) {
      try {
        const url = await cloudinary.uploadImage(img.file);
        if (url) {
          uploadedUrls.push(url);
        } else {
          hasFailures = true;
          console.error('URL de imagen no recibida');
        }
      } catch (error) {
        hasFailures = true;
        console.error('Error al subir imagen específica:', error);
        this.$emit('error', `Error al subir una imagen: ${error.message}`);
      }
    }
    
    if (hasFailures && uploadedUrls.length === 0) {
      throw new Error('No se pudo subir ninguna imagen');
    }
    
    return uploadedUrls;
  } catch (error) {
    console.error('Error general subiendo imágenes:', error);
    throw error;
  }
},
    // Parte del método submitProduct corregida

// Parte del método submitProduct corregida

async submitProduct() {
  this.isSubmitting = true;
  try {
    // Validación básica
    if (!this.product.name || !this.product.description || !this.product.price || !this.product.category) {
      throw new Error('Por favor complete todos los campos requeridos');
    }
    
    if (!this.product.sku) {
      this.product.sku = this.generateSKU();
    }
    
    // Procesar imágenes
    let imageUrls = [];
    if (this.uploadedImages.length > 0) {
      try {
        imageUrls = await this.uploadImages();
      } catch (error) {
        // Si hay error en la carga de imágenes pero es requerido tener al menos una
        // entonces lanzamos error y detenemos el proceso
        throw new Error(`Error al subir las imágenes: ${error.message}`);
      }
    }
    
    // Preparar datos para enviar
    const productData = {
      ...this.product,
      features: this.product.features.filter(f => f.name && f.value),
      tags: this.product.tags ? this.product.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      images: imageUrls,
      mainImage: imageUrls[0] || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.$emit('product-submitted', productData);
  } catch (error) {
    console.error("Error en el formulario:", error);
    this.$emit('error', error.message);
  } finally {
    this.isSubmitting = false;
  }
}
  },
  beforeUnmount() {
    // Limpiar URLs de previsualización
    this.uploadedImages.forEach(img => URL.revokeObjectURL(img.preview));
  }
};
</script>

<style scoped>
.product-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section h2 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.price-grid, .specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.image-uploader {
  margin-top: 15px;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f9f9f9;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #42b983;
  background: #f0f9f5;
}

.upload-prompt {
  color: #666;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.upload-hint {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 0.85rem;
}

.image-preview-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  width: 100%;
}

.image-preview-item {
  position: relative;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  padding: 5px;
  text-align: center;
}

.image-checkbox {
  color: white;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.features-list {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
}

.feature-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.feature-item input {
  flex: 1;
}

.remove-btn, .add-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.remove-btn {
  background: #ff4444;
  color: white;
  width: 30px;
}

.add-btn {
  background: #42b983;
  color: white;
  margin-top: 10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.submit-btn {
  background: #42b983;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #369f6e;
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: #f1f1f1;
  color: #333;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.cancel-btn:hover {
  background: #ddd;
}

.hidden-input {
  display: none;
}
</style>