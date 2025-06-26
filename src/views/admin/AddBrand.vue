<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-soft via-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Header mejorado con diseño moderno -->
      <div class="mb-8 bg-white rounded-2xl shadow-elegant p-8 hover:shadow-elevated transition-all duration-300">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-primary to-blue-secondary rounded-xl flex items-center justify-center mr-4 shadow-md">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-text-primary mb-2">Agregar Nueva Marca</h1>
            <p class="text-gray-600 text-lg">Complete los detalles de la nueva marca para agregarla al catálogo</p>
          </div>
        </div>
      </div>
      
      <!-- Formulario con diseño de tarjeta moderna -->
      <form @submit.prevent="submitForm" class="bg-white rounded-2xl shadow-elegant overflow-hidden hover:shadow-elevated transition-all duration-300">
        <div class="p-8 sm:p-10">
          <!-- Nombre de la Marca -->
          <div class="mb-8">
            <label class="block text-text-primary font-semibold mb-4 text-lg" for="name">
              <span class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-primary to-blue-secondary rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                  </svg>
                </div>
                Nombre de la Marca *
              </span>
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-primary/20 focus:border-blue-primary transition-all duration-300 text-lg bg-gray-50 hover:bg-white hover:border-gray-300"
              :class="errors.name ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : ''"
              placeholder="Ej: Nike, Adidas, Puma..."
              required
            >
            <p v-if="errors.name" class="mt-3 text-sm text-red-600 flex items-center bg-red-50 px-4 py-2 rounded-xl">
              <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {{ errors.name }}
            </p>
          </div>

          <!-- Descripción -->
          <div class="mb-8">
            <label class="block text-text-primary font-semibold mb-4 text-lg" for="description">
              <span class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-primary to-blue-secondary rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                  </svg>
                </div>
                Descripción
              </span>
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              class="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-primary/20 focus:border-blue-primary transition-all duration-300 text-lg bg-gray-50 hover:bg-white hover:border-gray-300 resize-none"
              placeholder="Breve descripción de la marca (opcional)"
            ></textarea>
          </div>

          <!-- Imagen con diseño mejorado -->
          <div class="mb-8">
            <label class="block text-text-primary font-semibold mb-4 text-lg" for="image">
              <span class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-primary to-blue-secondary rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                Logo de la Marca *
                <span class="ml-3 px-3 py-1 text-xs font-medium text-blue-primary bg-blue-primary/10 rounded-full">JPG, PNG, GIF - Máx. 2MB</span>
              </span>
            </label>
            
            <div class="upload-area">
              <label for="image" class="upload-label">
                <div class="upload-content">
                  <div class="upload-icon">
                    <svg class="w-8 h-8 text-blue-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                  </div>
                  <div class="upload-text">
                    <p class="text-lg font-semibold text-text-primary mb-1">
                      {{ imageFile ? 'Cambiar imagen' : 'Seleccionar imagen' }}
                    </p>
                    <p class="text-gray-500">Arrastra y suelta o haz clic para seleccionar</p>
                  </div>
                </div>
                <input
                  id="image"
                  type="file"
                  accept="image/jpeg, image/png, image/gif"
                  @change="handleImageUpload"
                  class="hidden"
                  required
                >
              </label>
              
              <div v-if="imageFile" class="selected-file">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-text-primary font-medium">{{ imageFile.name }}</span>
              </div>
            </div>
            
            <p v-if="errors.image" class="mt-3 text-sm text-red-600 flex items-center bg-red-50 px-4 py-2 rounded-xl">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {{ errors.image }}
            </p>
            
            <div v-if="imagePreview" class="image-preview-container">
              <p class="text-sm text-gray-600 mb-3 font-medium">Vista previa:</p>
              <div class="image-preview">
                <img :src="imagePreview" alt="Preview del logo" class="preview-image">
              </div>
            </div>
          </div>

          <!-- Enlace al Proveedor -->
          <div class="mb-10">
            <label class="block text-text-primary font-semibold mb-4 text-lg" for="providerLink">
              <span class="flex items-center">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-primary to-blue-secondary rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                </div>
                Enlace al sitio web del proveedor
              </span>
            </label>
            <input
              id="providerLink"
              v-model="form.providerLink"
              type="url"
              class="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-primary/20 focus:border-blue-primary transition-all duration-300 text-lg bg-gray-50 hover:bg-white hover:border-gray-300"
              placeholder="https://www.ejemplo.com"
            >
            <p class="mt-3 text-sm text-gray-500 flex items-center bg-blue-50 px-4 py-2 rounded-xl">
              <svg class="w-4 h-4 mr-2 text-blue-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Opcional - Debe comenzar con http:// o https://
            </p>
          </div>

          <!-- Botones mejorados -->
          <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-100">
           
            <a class="button-primary">
            <button
              type="submit"
              :disabled="loading"
              class="button-secondary"
            >
              <template v-if="!loading">
                <svg class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                </svg>
                Guardar Marca
              </template>
              <template v-else>
                <div class="loading-spinner"></div>
                Procesando...
              </template>
            </button>
            </a>
            <br>
             <router-link
              to="/brands"
              class="button-secondary"
            >
              <svg class="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Cancelar
            </router-link>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { db } from '@/services/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { uploadImageToCloudinary } from '@/services/cloudinary'
import { useToast } from 'vue-toastification'

export default {
  name: 'AddBrand',
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      form: {
        name: '',
        description: '',
        imageUrl: '',
        providerLink: ''
      },
      errors: {
        name: '',
        image: ''
      },
      imageFile: null,
      imagePreview: null,
      loading: false
    }
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/png', 'image/gif']
        if (!validTypes.includes(file.type)) {
          this.errors.image = 'Formato de imagen no válido. Use JPG, PNG o GIF.'
          return
        }
        
        // Validar tamaño
        if (file.size > 2 * 1024 * 1024) {
          this.errors.image = 'La imagen no debe superar los 2MB'
          return
        }
        
        // Si pasa validaciones
        this.errors.image = ''
        this.imageFile = file
        
        // Crear vista previa
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    validateForm() {
      let isValid = true
      
      // Resetear errores
      this.errors = { name: '', image: '' }
      
      // Validar nombre
      if (!this.form.name.trim()) {
        this.errors.name = 'El nombre de la marca es obligatorio'
        isValid = false
      } else if (this.form.name.length > 50) {
        this.errors.name = 'El nombre no debe exceder 50 caracteres'
        isValid = false
      }
      
      // Validar imagen
      if (!this.imageFile) {
        this.errors.image = 'Debe seleccionar una imagen para la marca'
        isValid = false
      }
      
      return isValid
    },
    async submitForm() {
      // Validar formulario
      if (!this.validateForm()) {
        this.toast.error('Por favor complete todos los campos requeridos correctamente')
        return
      }
      
      this.loading = true
      
      try {
        // Subir imagen a Cloudinary
        this.toast.info('Subiendo imagen...', { timeout: 2000 })
        this.form.imageUrl = await uploadImageToCloudinary(this.imageFile)
        
        // Guardar en Firestore
        this.toast.info('Guardando marca...', { timeout: 2000 })
        await addDoc(collection(db, 'brands'), this.form)
        
        // Notificación de éxito
        this.toast.success('Marca agregada correctamente', {
          timeout: 3000,
          icon: '✅'
        })
        
        // Redirigir después de 1 segundo
        setTimeout(() => {
          this.$router.push('/brands')
        }, 1000)
        
      } catch (error) {
        console.error('Error:', error)
        
        let errorMessage = 'Error al guardar la marca'
        if (error.message.includes('Cloudinary')) {
          errorMessage = 'Error al subir la imagen. Intente con otra.'
        }
        
        this.toast.error(errorMessage, {
          timeout: 4000,
          icon: '❌'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* Variables CSS para la nueva paleta de colores */
:root {
  --gray-soft: #F2F2F2;
  --blue-primary: #1F3A93;
  --blue-secondary: #002B5B;
  --white-pure: #FFFFFF;
  --text-primary: #1C1C1C;
}

/* Clases de utilidad para colores */
.bg-gray-soft { background-color: var(--gray-soft); }
.bg-blue-primary { background-color: var(--blue-primary); }
.bg-blue-secondary { background-color: var(--blue-secondary); }
.text-blue-primary { color: var(--blue-primary); }
.text-text-primary { color: var(--text-primary); }
.border-blue-primary { border-color: var(--blue-primary); }

/* Sombras elegantes */
.shadow-elegant {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.shadow-elevated {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

/* Estilos para el área de carga de archivos */
.upload-area {
  margin-top: 1rem;
}

.upload-label {
  display: block;
  cursor: pointer;
  padding: 2rem;
  border: 2px dashed #e5e7eb;
  border-radius: 1rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.upload-label::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(31, 58, 147, 0.1), transparent);
  transition: left 0.5s;
}

.upload-label:hover::before {
  left: 100%;
}

.upload-label:hover {
  border-color: var(--blue-primary);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(31, 58, 147, 0.15);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.upload-icon {
  margin-bottom: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, var(--blue-primary), var(--blue-secondary));
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(31, 58, 147, 0.3);
}

.upload-text p:first-child {
  margin-bottom: 0.5rem;
}

.selected-file {
  display: flex;
  align-items: center;
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 1rem;
  border: 1px solid #0ea5e9;
}

/* Vista previa de imagen mejorada */
.image-preview-container {
  margin-top: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
}

.image-preview {
  position: relative;
  display: inline-block;
  overflow: hidden;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.image-preview:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.preview-image {
  max-height: 200px;
  width: auto;
  border-radius: 1rem;
  transition: all 0.3s ease;
}

/* Botones modernos */
.button-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  background: white;
  color: var(--text-primary);
  
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  
}

.button-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.button-primary:hover::before {
  left: 100%;
}

.button-primary:hover {
  transform: translateY(-2px);
  
}

.button-primary:active {
  transform: translateY(0);
}

.button-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  background: white;
  color: var(--text-primary);
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.button-secondary:hover {
  background: #f8fafc;
  border-color: var(--blue-primary);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  color: var(--blue-primary);
}

/* Spinner de carga personalizado */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Efectos hover para inputs */
input:focus, textarea:focus {
  box-shadow: 0 0 0 4px rgba(31, 58, 147, 0.1);
  transform: translateY(-1px);
}

/* Transiciones suaves globales */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsive design mejorado */
@media (max-width: 640px) {
  .upload-label {
    padding: 1.5rem 1rem;
  }
  
  .upload-content {
    flex-direction: column;
  }
  
  .upload-icon {
    margin-bottom: 0.75rem;
    padding: 0.75rem;
  }
  
  .button-primary,
  .button-secondary {
    width: 100%;
    justify-content: center;
  }
}

/* Animaciones de entrada */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.min-h-screen > div {
  animation: fadeInUp 0.6s ease-out;
}

/* Mejoras adicionales */
label {
  cursor: pointer;
}

input::placeholder,
textarea::placeholder {
  color: #9ca3af;
  font-style: italic;
}
svg {
  width: 1em !important;
  height: 1em !important;
}
.group:hover svg {
  color: var(--blue-primary);
}
</style>