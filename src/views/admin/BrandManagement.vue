<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Gestión de Marcas</h1>
      <router-link 
        to="/admin/brands/add"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
      >
        Agregar Nueva Marca
      </router-link>
    </div>

    <div v-if="loading" class="flex justify-center my-8">
      <font-awesome-icon icon="spinner" spin class="text-2xl text-blue-600" />
    </div>

    <div v-else>
      <div v-if="brands.length === 0" class="text-center py-8 text-gray-500">
        No hay marcas registradas aún.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="brand in brands" 
          :key="brand.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
        >
          <div class="h-48 bg-gray-100 flex items-center justify-center">
            <img 
              v-if="brand.imageUrl" 
              :src="brand.imageUrl" 
              :alt="brand.name"
              class="max-h-full max-w-full object-contain"
            >
            <div v-else class="text-gray-400">
              Sin imagen
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800">{{ brand.name }}</h3>
            <p v-if="brand.description" class="text-gray-600 mt-2 text-sm">{{ brand.description }}</p>
            <div v-if="brand.subBrands && brand.subBrands.length > 0" class="mt-2">
              <span class="text-sm font-medium text-gray-500">Sub-marcas:</span>
              <div class="flex flex-wrap gap-1 mt-1">
                <span 
                  v-for="subBrand in brand.subBrands" 
                  :key="subBrand.name"
                  class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {{ subBrand.name }}
                </span>
              </div>
            </div>
            <div class="mt-4 flex justify-between items-center">
              <a 
                v-if="brand.providerLink" 
                :href="brand.providerLink" 
                target="_blank"
                class="text-blue-600 hover:underline text-sm"
              >
                Ver proveedor
              </a>
              <div class="flex space-x-2">
                <router-link 
                  :to="{ name: 'EditBrand', params: { id: brand.id } }"
                  class="text-yellow-600 hover:text-yellow-700"
                >
                  <font-awesome-icon icon="edit" />
                </router-link>
                <button 
                  @click="confirmDelete(brand.id)"
                  class="text-red-600 hover:text-red-700"
                >
                  <font-awesome-icon icon="trash-alt" />
                </button>
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
import { toast } from 'vue-toastification'

export default {
  name: 'BrandManagement',
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
      } catch (error) {
        toast.error('Error al cargar las marcas')
        console.error('Error fetching brands:', error)
      } finally {
        this.loading = false
      }
    },
    async confirmDelete(brandId) {
      if (confirm('¿Estás seguro de que deseas eliminar esta marca?')) {
        try {
          await deleteDoc(doc(db, 'brands', brandId))
          this.brands = this.brands.filter(brand => brand.id !== brandId)
          toast.success('Marca eliminada correctamente')
        } catch (error) {
          toast.error('Error al eliminar la marca')
          console.error('Error deleting brand:', error)
        }
      }
    }
  }
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>