<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Agregar Nueva Marca</h1>
    
    <form @submit.prevent="submitForm" class="bg-white p-6 rounded-lg shadow-md">
      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2" for="name">Nombre de la Marca</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2" for="description">Descripción</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2" for="image">Imagen de la Marca</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
        <div v-if="imagePreview" class="mt-2">
          <img :src="imagePreview" alt="Preview" class="max-h-32">
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2" for="providerLink">Enlace al Proveedor (opcional)</label>
        <input
          id="providerLink"
          v-model="form.providerLink"
          type="url"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://ejemplo.com"
        >
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 font-medium mb-2">Sub-marcas</label>
        <div v-for="(subBrand, index) in form.subBrands" :key="index" class="flex items-center mb-2">
          <input
            v-model="subBrand.name"
            type="text"
            placeholder="Nombre de sub-marca"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
          <button
            type="button"
            @click="removeSubBrand(index)"
            class="ml-2 text-red-600 hover:text-red-700"
          >
            <font-awesome-icon icon="times" />
          </button>
        </div>
        <button
          type="button"
          @click="addSubBrand"
          class="text-blue-600 hover:text-blue-700 text-sm flex items-center"
        >
          <font-awesome-icon icon="plus" class="mr-1" />
          Agregar sub-marca
        </button>
      </div>

      <div class="flex justify-end space-x-4">
        <router-link
          to="/admin/brands"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
        >
          Cancelar
        </router-link>
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          <span v-if="!loading">Guardar Marca</span>
          <font-awesome-icon v-else icon="spinner" spin />
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { db, storage } from '@/services/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { toast } from 'vue-toastification'

export default {
  name: 'AddBrand',
  data() {
    return {
      form: {
        name: '',
        description: '',
        imageUrl: '',
        providerLink: '',
        subBrands: []
      },
      imageFile: null,
      imagePreview: null,
      loading: false
    }
  },
  methods: {
    addSubBrand() {
      this.form.subBrands.push({ name: '' })
    },
    removeSubBrand(index) {
      this.form.subBrands.splice(index, 1)
    },
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        this.imageFile = file
        const reader = new FileReader()
        reader.onload = (e) => {
          this.imagePreview = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },
    async uploadImage() {
      if (!this.imageFile) return null
      
      const storageRef = ref(storage, `brands/${Date.now()}_${this.imageFile.name}`)
      await uploadBytes(storageRef, this.imageFile)
      return await getDownloadURL(storageRef)
    },
    async submitForm() {
      this.loading = true
      try {
        // Subir imagen si existe
        if (this.imageFile) {
          this.form.imageUrl = await this.uploadImage()
        }

        // Filtrar sub-marcas vacías
        this.form.subBrands = this.form.subBrands.filter(sb => sb.name.trim() !== '')

        // Guardar en Firestore
        await addDoc(collection(db, 'brands'), this.form)
        
        toast.success('Marca agregada correctamente')
        this.$router.push({ name: 'BrandManagement' })
      } catch (error) {
        toast.error('Error al guardar la marca')
        console.error('Error adding brand:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>