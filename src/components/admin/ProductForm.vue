<template>
  <form @submit.prevent="submitProduct">
    <div>
      <label for="name">Nombre del Producto:</label>
      <input v-model="product.name" id="name" required />
    </div>
    <div>
      <label for="description">Descripción:</label>
      <textarea v-model="product.description" id="description" required></textarea>
    </div>
    <div>
      <label for="price">Precio:</label>
      <input v-model="product.price" type="number" id="price" required />
    </div>
    <div>
      <label for="shippingCost">Costo de envío (0 si ya está incluido):</label>
      <input v-model="product.shippingCost" type="number" id="shippingCost" min="0" required />
    </div>
    <div>
      <label for="discount">Descuento (%):</label>
      <input v-model="product.discount" type="number" id="discount" />
    </div>
    <div>
      <label for="stock">Stock:</label>
      <input v-model="product.stock" type="number" id="stock" required />
    </div>
    <div>
      <label for="minWholesaleQuantity">Cantidad Mínima para Mayorista:</label>
      <input v-model="product.minWholesaleQuantity" type="number" id="minWholesaleQuantity" required />
    </div>
    <div>
      <label for="wholesalePrice">Precio Mayorista:</label>
      <input v-model="product.wholesalePrice" type="number" id="wholesalePrice" required />
    </div>
    <div>
      <label for="categoria">Categoría:</label>
      <select v-model="selectedCategory" id="categoria" required>
        <option value="">Selecciona una categoría</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
        <option value="new">Crear nueva categoría</option>
      </select>
      <div v-if="selectedCategory === 'new'">
        <label for="newCategoryName">Nombre de la nueva categoría:</label>
        <input v-model="newCategoryName" id="newCategoryName" required />
      </div>
    </div>
    <div>
      <label for="image">Imágenes del Producto:</label>
      <input type="file" id="image" @change="handleImageUpload" multiple required />
    </div>
    <button type="submit">Guardar Producto</button>
  </form>
</template>



<script>
import { getCategories } from '@/api/products';
export default {
  props: {
    initialProduct: {
      type: Object,
      default: () => ({})
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      product: { ...this.initialProduct },
      selectedCategory: this.initialProduct.category || '',
      categories: [], // Deberías cargar esto desde tu API
      newCategoryName: '',
      imageFiles: []
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
    handleImageUpload(event) {
      this.imageFiles = Array.from(event.target.files);
    },
    async submitProduct() {
      this.isSubmitting = true;
      try {
        // Validación de imágenes (solo requerida para nuevos productos)
        if (!this.isEditing && (this.imageFiles.length === 0 || !this.imageFiles.every(file => file.type.startsWith('image/')))) {
          this.$root.$emit('show-notification', {
            message: 'Por favor, selecciona archivos de imagen válidos',
            type: 'error'
          });
          this.isSubmitting = false;
          return;
        }

        const productData = {
          ...this.product,
          category: this.selectedCategory === 'new' 
            ? { name: this.newCategoryName } 
            : { id: this.selectedCategory },
          images: this.imageFiles
        };

        this.$emit('product-submitted', productData);
      } catch (error) {
        console.error("Error en el formulario:", error);
        this.$root.$emit('show-notification', {
          message: 'Error: ' + error.message,
          type: 'error'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>



<style scoped>
.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  margin: auto;
}

label {
  font-weight: bold;
}

input, textarea, select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
}

button {
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #369f6e;
}
</style>