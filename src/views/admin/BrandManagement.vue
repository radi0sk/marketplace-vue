<template>
  <div class="brand-management">
    <div class="container">
      <div class="header">
        <div class="header-content">
          <h1 class="main-title">Gestión de Marcas</h1>
          <p class="subtitle">Administra todas las marcas de tu catálogo</p>
        </div>
        <router-link 
          to="/brands/add"
          class="add-brand-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Agregar Nueva Marca
        </router-link>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">Cargando marcas...</p>
      </div>

      <div v-else class="content">
        <div v-if="brands.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-large" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="empty-title">No hay marcas registradas</h3>
          <p class="empty-description">Comienza agregando tu primera marca para gestionar tu catálogo</p>
          <router-link 
            to="/brands/add"
            class="empty-action-btn"
          >
            Agregar Primera Marca
          </router-link>
        </div>

        <div v-else class="brands-grid">
          <div 
            v-for="brand in brands" 
            :key="brand.id"
            class="brand-card"
          >
            <div class="card-image-container">
              <img 
                v-if="brand.imageUrl" 
                :src="brand.imageUrl" 
                :alt="brand.name"
                class="brand-image"
              >
              <div v-else class="no-image">
                <svg xmlns="http://www.w3.org/2000/svg" class="no-image-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="no-image-text">Sin imagen</span>
              </div>
              
              <div class="card-actions">
                <router-link 
                  :to="{ name: 'EditBrand', params: { id: brand.id } }"
                  class="action-btn edit-btn"
                  title="Editar marca"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </router-link>
                <button 
                  @click="confirmDelete(brand.id)"
                  class="action-btn delete-btn"
                  title="Eliminar marca"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="action-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="card-content">
              <div class="card-header">
                <h3 class="brand-name">{{ brand.name }}</h3>
                <span v-if="brand.providerLink" class="provider-badge">
                  Proveedor
                </span>
              </div>
              
              <p v-if="brand.description" class="brand-description">{{ brand.description }}</p>
              
              <div v-if="brand.subBrands && brand.subBrands.length > 0" class="sub-brands">
                <span class="sub-brands-label">Sub-marcas</span>
                <div class="sub-brands-list">
                  <span 
                    v-for="subBrand in brand.subBrands" 
                    :key="subBrand.name"
                    class="sub-brand-tag"
                  >
                    {{ subBrand.name }}
                  </span>
                </div>
              </div>
              
              <div class="card-footer">
                <a 
                  v-if="brand.providerLink" 
                  :href="brand.providerLink" 
                  target="_blank"
                  class="provider-link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="link-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Ver sitio web
                </a>
                <div class="brand-id">
                  ID: {{ brand.id.substring(0, 8) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/services/firebase'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { useToast } from 'vue-toastification'

export default {
  name: 'BrandManagement',
  setup() {
    const toast = useToast()
    return { toast }
  },
  data() {
    return {
      brands: [],
      loading: true
    }
  },
  async created() {
    await this.fetchBrands()
  },
  methods: {
    async fetchBrands() {
      try {
        const querySnapshot = await getDocs(collection(db, 'brands'))
        this.brands = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        this.toast.success(`${this.brands.length} marcas cargadas correctamente`, {
          timeout: 2000,
          icon: '✅'
        })
      } catch (error) {
        this.toast.error('Error al cargar las marcas', {
          timeout: 3000,
          icon: '❌'
        })
        console.error('Error fetching brands:', error)
      } finally {
        this.loading = false
      }
    },
    async confirmDelete(brandId) {
      const brandName = this.brands.find(b => b.id === brandId)?.name || 'esta marca'
      
      this.toast.warning(`¿Eliminar "${brandName}"?`, {
        timeout: false,
        closeOnClick: false,
        icon: '⚠️',
        buttons: [
          ['<button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Sí, eliminar</button>', 
           async (_, toastObject) => {
             try {
               await deleteDoc(doc(db, 'brands', brandId))
               this.brands = this.brands.filter(brand => brand.id !== brandId)
               
               toastObject.goAway()
               this.toast.success(`Marca "${brandName}" eliminada correctamente`, {
                 timeout: 3000,
                 icon: '🗑️'
               })
             } catch (error) {
               this.toast.error('Error al eliminar la marca', {
                 timeout: 3000,
                 icon: '❌'
               })
               console.error('Error deleting brand:', error)
             }
           }, true],
          ['<button class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 ml-3 font-medium">Cancelar</button>', 
           (_, toastObject) => {
             toastObject.goAway()
           }]
        ]
      })
    }
  }
}
</script>

<style scoped>
/* Variables de colores */
:root {
  --bg-soft-gray: #F2F2F2;
  --bg-light-gray: #E5E5E5;
  --primary-blue: #1F3A93;
  --secondary-blue: #002B5B;
  --pure-white: #FFFFFF;
  --soft-black: #1C1C1C;
  --text-gray: #666666;
  --border-gray: #D1D5DB;
  --hover-gray: #F8F9FA;
}

/* Estilos generales */
* {
  box-sizing: border-box;
}

.brand-management {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-soft-gray) 0%, var(--bg-light-gray) 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: var(--pure-white);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-content h1.main-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin: 0;
  letter-spacing: -0.025em;
}

.header-content .subtitle {
  color: var(--text-gray);
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
  font-weight: 400;
}

.add-brand-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--primary-blue);
  color: var(--pure-white);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(31, 58, 147, 0.25);
}

.add-brand-btn:hover {
  background: var(--secondary-blue);
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -1px rgba(31, 58, 147, 0.35);
}

.add-brand-btn .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: var(--pure-white);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid var(--bg-light-gray);
  border-top: 4px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 1rem;
  color: var(--text-gray);
  font-size: 1.1rem;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem;
  background: var(--pure-white);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  margin-bottom: 1.5rem;
}

.empty-icon .icon-large {
  width: 4rem;
  height: 4rem;
  color: var(--text-gray);
  margin: 0 auto;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--soft-black);
  margin: 0 0 0.5rem 0;
}

.empty-description {
  color: var(--text-gray);
  font-size: 1rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.empty-action-btn {
  display: inline-flex;
  align-items: center;
  background: var(--primary-blue);
  color: var(--pure-white);
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(31, 58, 147, 0.25);
}

.empty-action-btn:hover {
  background: var(--secondary-blue);
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -1px rgba(31, 58, 147, 0.35);
}

/* Grid de marcas */
.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Tarjetas de marca */
.brand-card {
  background: var(--pure-white);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid var(--border-gray);
}

.brand-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -1px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-blue);
}

/* Imagen de la tarjeta */
.card-image-container {
  position: relative;
  height: 200px;
  background: var(--bg-soft-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.brand-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.brand-card:hover .brand-image {
  transform: scale(1.05);
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-gray);
}

.no-image-icon {
  width: 3rem;
  height: 3rem;
}

.no-image-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Acciones de la tarjeta */
.card-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.brand-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--pure-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  text-decoration: none;
}

.edit-btn {
  color: var(--primary-blue);
}

.edit-btn:hover {
  background: var(--primary-blue);
  color: var(--pure-white);
  transform: scale(1.1);
}

.delete-btn {
  color: #DC2626;
}

.delete-btn:hover {
  background: #DC2626;
  color: var(--pure-white);
  transform: scale(1.1);
}

.action-icon {
  width: 1rem;
  height: 1rem;
}

/* Contenido de la tarjeta */
.card-content {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--soft-black);
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.provider-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--primary-blue);
  color: var(--pure-white);
  white-space: nowrap;
}

.brand-description {
  color: var(--text-gray);
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Sub-marcas */
.sub-brands {
  margin-bottom: 1.5rem;
}

.sub-brands-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-gray);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.sub-brands-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sub-brand-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--bg-light-gray);
  color: var(--soft-black);
}

/* Footer de la tarjeta */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-gray);
}

.provider-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-blue);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.provider-link:hover {
  color: var(--secondary-blue);
}

.link-icon {
  width: 1rem;
  height: 1rem;
}

.brand-id {
  font-size: 0.75rem;
  color: var(--text-gray);
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .header-content h1.main-title {
    font-size: 2rem;
  }
  
  .brands-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 1rem;
  }
  
  .header {
    padding: 1.5rem;
  }
  
  .header-content h1.main-title {
    font-size: 1.75rem;
  }
  
  .add-brand-btn {
    padding: 0.875rem 1.25rem;
    font-size: 0.875rem;
  }
}
</style>